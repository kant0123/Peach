param(
    # 先把上游主线合进当前分支再构建。工作区必须干净。
    [switch]$Sync,
    [string]$Remote = 'origin',
    [string]$UpstreamBranch = 'master',
    # 媒体工具（FFmpeg、untrunc、cloudflared）取自上游发布，缺哪个补哪个；默认取最新发布。
    [string]$ToolsTag = '',
    [string]$Repository = 'peach-mitao/peach',
    # 跳过类型、日语目录与未包裹中文的检查，只在已确认通过时使用。
    [switch]$SkipChecks,
    [string]$OutputDirectory = ''
)

# 构建默认界面语言为日语的 Windows 安装包。流程与取舍见 ADR-0114「日语安装包」。
#   .\scripts\build_ja_installer.ps1 -Sync     上游有更新：合并 → 检查 → 构建
#   .\scripts\build_ja_installer.ps1           只重新构建当前分支
$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$Frontend = Join-Path $ProjectRoot 'frontend'
$Build = Join-Path $ProjectRoot 'build'
if (-not $OutputDirectory) { $OutputDirectory = Join-Path $ProjectRoot 'dist\ja\Peach' }

function Invoke-Git { & git -C $ProjectRoot @args; if ($LASTEXITCODE -ne 0) { throw "git $($args -join ' ') failed." } }
function Invoke-Npm {
    Push-Location $Frontend
    # npm.ps1 垫片会重新解析调用语句，拿不到 @args 展开的参数，所以直接调 npm.cmd。
    try { & npm.cmd @args; if ($LASTEXITCODE -ne 0) { throw "npm $($args -join ' ') failed." } } finally { Pop-Location }
}

if ((& git -C $ProjectRoot status --porcelain)) { throw '工作区不干净。先提交或暂存改动再构建。' }

if ($Sync) {
    Invoke-Git fetch $Remote
    $Before = (& git -C $ProjectRoot rev-parse HEAD).Trim()
    & git -C $ProjectRoot merge --no-edit "$Remote/$UpstreamBranch"
    if ($LASTEXITCODE -ne 0) {
        $Unmerged = @(& git -C $ProjectRoot diff --name-only --diff-filter=U)
        $OnlyDist = $Unmerged.Count -gt 0 -and -not ($Unmerged | Where-Object { $_ -notlike 'web/dist/*' })
        if (-not $OnlyDist) {
            throw "合并冲突，需要手工解决后再运行：`n$($Unmerged -join "`n")`n解决后补译新增中文（ja.ts），提交，再不带 -Sync 运行本脚本。"
        }
        # 打包产物冲突不看内容：取任一侧占位，按合并后的源码重新构建再提交。
        foreach ($File in $Unmerged) { Invoke-Git checkout --ours -- $File }
        Invoke-Npm ci
        Invoke-Npm run build
        Invoke-Git add -- web/dist
        Invoke-Git commit --no-edit
    }
    $After = (& git -C $ProjectRoot rev-parse HEAD).Trim()
    Write-Host ($(if ($Before -eq $After) { '上游没有新提交。' } else { "已合并上游：$Before -> $After" }))
}

if (-not $SkipChecks) {
    Invoke-Npm ci
    Invoke-Npm run typecheck
    Invoke-Npm exec -- vitest run test/i18n-catalog.test.ts
    & node (Join-Path $Frontend 'scripts\scan-untranslated.mjs')
    if ($LASTEXITCODE -ne 0) { throw '有未包裹的新中文。按提示补 t() 与 ja.ts 译文后再构建。' }
}

# 媒体工具：布局与 build_windows.ps1 / media_tool_bundle.py 的期望一致，哈希在那边校验。
$Python = Join-Path $ProjectRoot '.venv\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $Python)) {
    & uv sync --locked --extra build
    if ($LASTEXITCODE -ne 0) { throw 'uv sync 失败。需要 64 位 Python 3.14，可设 UV_PYTHON。' }
}
$Tools = @(
    @{ Zip = 'tools-ffmpeg'; Source = 'ffmpeg-corresponding-source.zip'; Target = 'ffmpeg-windows'; Inner = 'Peach\tools\ffmpeg'; Name = 'ffmpeg' },
    @{ Zip = 'tools-untrunc'; Source = 'untrunc-corresponding-source.zip'; Target = 'untrunc-windows'; Inner = 'Peach\tools\untrunc'; Name = 'untrunc' }
)
$CloudflaredPath = Join-Path $Build 'cloudflared\cloudflared.exe'
$Missing = ($Tools | Where-Object { -not (Test-Path -LiteralPath (Join-Path $Build "$($_.Target)\$($_.Name)\manifest.json")) }) +
    @(if (-not (Test-Path -LiteralPath $CloudflaredPath)) { 'cloudflared' })
if ($Missing) {
    if (-not $ToolsTag) {
        # 发布都是预发布，/releases/latest 不返回它们：取列表第一个。
        $ToolsTag = @(Invoke-RestMethod "https://api.github.com/repos/$Repository/releases?per_page=1" -Headers @{ 'User-Agent' = 'peach-ja-build' })[0].tag_name
    }
    $Version = $ToolsTag.TrimStart('v')
    $BaseUrl = "https://github.com/$Repository/releases/download/$ToolsTag"
    $Download = Join-Path $Build 'ja-tools-download'
    New-Item -ItemType Directory -Path $Download -Force | Out-Null
    function Fetch($Name) {
        $Path = Join-Path $Download $Name
        if (-not (Test-Path -LiteralPath $Path)) { Invoke-WebRequest -Uri "$BaseUrl/$Name" -OutFile $Path -UseBasicParsing }
        return $Path
    }
    foreach ($Tool in $Tools) {
        $Destination = Join-Path $Build "$($Tool.Target)\$($Tool.Name)"
        if (Test-Path -LiteralPath (Join-Path $Destination 'manifest.json')) { continue }
        $Extract = Join-Path $Download "$($Tool.Name)-extract"
        if (Test-Path -LiteralPath $Extract) { Remove-Item -LiteralPath $Extract -Recurse -Force }
        Expand-Archive -LiteralPath (Fetch "Peach-$Version-windows-x64-$($Tool.Zip).zip") -DestinationPath $Extract
        New-Item -ItemType Directory -Path (Split-Path -Parent $Destination) -Force | Out-Null
        if (Test-Path -LiteralPath $Destination) { Remove-Item -LiteralPath $Destination -Recurse -Force }
        Move-Item -LiteralPath (Join-Path $Extract $Tool.Inner) -Destination $Destination
        Copy-Item -LiteralPath (Fetch $Tool.Source) -Destination (Join-Path $Build "$($Tool.Target)\$($Tool.Source)") -Force
    }
    if (-not (Test-Path -LiteralPath $CloudflaredPath)) {
        $Extract = Join-Path $Download 'cloudflared-extract'
        if (Test-Path -LiteralPath $Extract) { Remove-Item -LiteralPath $Extract -Recurse -Force }
        Expand-Archive -LiteralPath (Fetch "Peach-$Version-windows-x64-tools-cloudflared.zip") -DestinationPath $Extract
        New-Item -ItemType Directory -Path (Split-Path -Parent $CloudflaredPath) -Force | Out-Null
        Move-Item -LiteralPath (Join-Path $Extract 'Peach\cloudflared.exe') -Destination $CloudflaredPath
    }
}

# 默认语言在构建时写进前端包；构建完把 web/dist 还原，仓库里提交的包仍以简体中文为默认。
$env:VITE_DEFAULT_LOCALE = 'ja'
try {
    $Result = & (Join-Path $PSScriptRoot 'build_windows.ps1') -Installer -OutputDirectory $OutputDirectory `
        -FFmpegPath (Join-Path $Build 'ffmpeg-windows\ffmpeg') -UntruncPath (Join-Path $Build 'untrunc-windows\untrunc') `
        -CloudflaredPath $CloudflaredPath
} finally {
    Remove-Item Env:\VITE_DEFAULT_LOCALE -ErrorAction SilentlyContinue
    & git -C $ProjectRoot checkout -- web/dist
}

$Installer = $Result.Installer
$Named = Join-Path (Split-Path -Parent $Installer) ((Split-Path -Leaf $Installer) -replace '-windows-x64-setup', '-ja-windows-x64-setup')
Move-Item -LiteralPath $Installer -Destination $Named -Force
Write-Host "日语安装包：$Named"
