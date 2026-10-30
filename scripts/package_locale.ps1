# 派生分支（日语版）打包用的默认语言，见 ADR-0130。build_windows.ps1 点源本文件。
#
# 前端包的默认语言与托盘菜单的语言用同一个值：显式设了 VITE_DEFAULT_LOCALE 就用它，没设就用日语。
# 仓库里提交的 web/dist 仍以简体中文为默认（浏览器用例按简体中文断言），所以按日语打完包后，
# 要把 web/dist 按源语言重建回去。

$PackageDefaultLocale = 'ja'

function Get-PackageLocale {
    if ($env:VITE_DEFAULT_LOCALE) { return $env:VITE_DEFAULT_LOCALE }
    return $PackageDefaultLocale
}

# 按打包语言构建前端包，返回这个语言。环境变量只在这次构建里生效，不留给调用方的会话。
function Invoke-PackageFrontendBuild([string]$Npm, [string]$FrontendPath) {
    $Explicit = [bool]$env:VITE_DEFAULT_LOCALE
    $Locale = Get-PackageLocale
    $env:VITE_DEFAULT_LOCALE = $Locale
    try {
        & $Npm --prefix $FrontendPath run build | Out-Host
        if ($LASTEXITCODE -ne 0) { throw 'Frontend bundle build failed (frontend/).' }
    } finally {
        if (-not $Explicit) { Remove-Item Env:\VITE_DEFAULT_LOCALE -ErrorAction SilentlyContinue }
    }
    # 显式指定的语言由调用方负责还原（build_ja_installer.ps1 自己还原 web/dist）。
    $script:PackageFrontendRestorePending = (-not $Explicit) -and $Locale -ne 'zh-CN'
    return $Locale
}

# 打完包或中途失败时调用：web/dist 按打包语言构建过，就按源语言重建回去。重复调用只重建一次。
function Restore-SourceFrontendBuild([string]$Npm, [string]$FrontendPath) {
    if (-not $script:PackageFrontendRestorePending) { return }
    $script:PackageFrontendRestorePending = $false
    & $Npm --prefix $FrontendPath run build | Out-Host
    if ($LASTEXITCODE -ne 0) {
        Write-Warning 'web/dist could not be rebuilt in the source locale; run: npm --prefix frontend run build'
    }
}
