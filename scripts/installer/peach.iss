; Peach Windows 安装包。由 scripts/build_windows.ps1 -Installer 调用 ISCC 编译：
;   ISCC /DAppVersion=<版本> /DSourceDir=<独立目录包 Peach\> /DOutputDir=<输出目录> peach.iss
; 装的内容与免安装包逐字节相同，安装器提供目录选择、开始菜单项和「应用和功能」里的登记。
; 自更新、开机自启、桌面图标和应用内卸载仍由 Peach 管，约定见 src/peach/desktop_installer.py。

#ifndef AppVersion
  #error 缺少 /DAppVersion
#endif
#ifndef SourceDir
  #error 缺少 /DSourceDir
#endif
#ifndef OutputDir
  #define OutputDir "."
#endif

[Setup]
; 与 desktop_installer.APP_ID 相同；改了它，已装的机器会并排出现第二份。
AppId={{02D9748A-78F6-4866-AC75-918177194DAB}
AppName=Peach
AppVersion={#AppVersion}
AppVerName=Peach {#AppVersion}
AppPublisher=Peach
AppPublisherURL=https://github.com/peach-mitao/peach
AppSupportURL=https://github.com/peach-mitao/peach/issues
; 只装到当前用户：自更新在程序目录旁边建事务目录再整目录切换，Program Files 不可写。
PrivilegesRequired=lowest
DefaultDirName={userpf}\Peach
DisableDirPage=no
UsePreviousAppDir=yes
UsePreviousTasks=no
DisableProgramGroupPage=yes
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
OutputDir={#OutputDir}
#ifdef LiteInstaller
OutputBaseFilename=Peach-{#AppVersion}-windows-x64-lite-setup
#else
OutputBaseFilename=Peach-{#AppVersion}-windows-x64-setup
#endif
SetupIconFile=..\..\resources\peach.ico
UninstallDisplayIcon={app}\Peach.exe
UninstallDisplayName=Peach
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
CloseApplications=yes
RestartApplications=no

[Languages]
Name: "ja"; MessagesFile: "compiler:Languages\Japanese.isl"

[CustomMessages]
ja.StillRunning=Peach が実行中で、自動的に終了できませんでした。トレイのメニューから Peach を終了してから、もう一度お試しください。
ja.TaskCheckFailed=バックグラウンドタスクの状態を確認できないため、インストールを中止しました。タスクの終了を待ってから、もう一度お試しください。
ja.MigrationFailed=ローカルデータベースを新しいバージョンに更新できませんでした。Peach の起動後にエラーが出る可能性があります。更新前のバックアップは、データフォルダー内の database フォルダーにあり、ファイル名は ledger.pre-migrate- で始まります。
ja.DataKept=Peach をアンインストールしました。設定、ローカルデータベース、視聴履歴は %1 に残っています。不要になったら手動で削除してください。メディアファイルには影響しません。
ja.DirectoryOverlapsData=プログラムフォルダーを Peach のデータフォルダーと重ねることはできません。独立したフォルダーを選択してください。
ja.DirectoryNotDedicated=空のフォルダー、または既存の Peach のインストール先を選択してください。Peach をアンインストールすると、プログラムフォルダー全体が削除されます。
ja.DirectoryNotWritable=現在のユーザーはプログラムフォルダーまたはその親フォルダーに書き込めません。Peach のインストールと更新のため、書き込み権限のある場所を選択してください。
ja.DirectoryLink=プログラムフォルダーとデータフォルダーに、ディレクトリリンクを経由する場所は使えません。通常のフォルダーを選択してください。
ja.DirectoryMove=先に既存の Peach をアンインストール(データは保持)してから、新しいインストール先を選択してください。
ja.ReportingFailed=バージョン統計とエラー診断の選択を保存できませんでした。初回セットアップまたは設定ページで、もう一度選択できます。保存されていない同意ではアップロードは有効になりません。
ja.LibrarySharingFailed=ライブラリと好みのアップロード設定を保存できませんでした。設定ページで選び直せます。

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "reporting"; Description: "バージョン統計とエラー診断を送信する(推奨): バージョン、システム情報、障害の種類、コードの位置、発生回数"; GroupDescription: "データのアップロード(設定ページでオフにできます):"
Name: "librarysharing"; Description: "ライブラリと各種の好みの明細をアップロードする(匿名化されます)"; GroupDescription: "データのアップロード(設定ページでオフにできます):"; Flags: unchecked

[InstallDelete]
; PyInstaller 的依赖都在 _internal 里；覆盖安装留下上一版多出来的库会被新版误加载。
Type: filesandordirs; Name: "{app}\_internal"

[Files]
Source: "{#SourceDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "{#SourceDir}\*"; DestDir: "{tmp}\Peach-preflight"; Flags: dontcopy recursesubdirs createallsubdirs
#ifdef LiteInstaller
Source: "{tmp}\Peach-preflight\tools\*"; DestDir: "{app}\tools"; ExternalSize: 0; Flags: external ignoreversion recursesubdirs createallsubdirs
Source: "{tmp}\Peach-preflight\cloudflared.exe"; DestDir: "{app}"; ExternalSize: 0; Flags: external ignoreversion
Source: "{tmp}\Peach-preflight\cloudflared-manifest.json"; DestDir: "{app}"; ExternalSize: 0; Flags: external ignoreversion
#endif

[Icons]
Name: "{userprograms}\Peach"; Filename: "{app}\Peach.exe"; Parameters: "--show"
Name: "{userdesktop}\Peach"; Filename: "{app}\Peach.exe"; Parameters: "--show"; Tasks: desktopicon

[Run]
Filename: "{app}\Peach.exe"; Parameters: "--show"; Description: "{cm:LaunchProgram,Peach}"; Flags: nowait postinstall skipifsilent
Filename: "https://github.com/peach-mitao/peach"; Description: "Peach のリポジトリを開いてプロジェクトにスターを付ける"; Flags: shellexec postinstall skipifsilent unchecked

[UninstallDelete]
; 自更新整目录换过之后，卸载记录里的文件清单不再完整，按目录整个移除。
Type: filesandordirs; Name: "{app}"

[Code]
var
  GuardPrepared: Boolean;
  LibrarySharingPage: TOutputMsgMemoWizardPage;
#ifdef LiteInstaller
  ToolsPrepared: Boolean;
  ToolsPage: TOutputMarqueeProgressWizardPage;
#endif

function GetCurrentProcessId(): LongWord;
  external 'GetCurrentProcessId@kernel32.dll stdcall';

procedure InitializeWizard();
begin
  LibrarySharingPage := CreateOutputMsgMemoPage(wpSelectTasks,
    'ライブラリと好みの明細のアップロード', 'Peach ユーザー全体のライブラリ構成と好みの傾向の研究に使います。',
    '続行すると、以下の明細を毎週アップロードすることに同意したことになります。参加しない場合は、戻ってチェックを外してください。', '');
  LibrarySharingPage.RichEditViewer.Text :=
    '作品: 重複を除いた作品番号、評価、好き、嫌い、視聴済み、あとで見る、再生回数、視聴割合、手動で付けたタグ。' + #13#10#13#10 +
    '好みの集計: 出演者、クリエイター、レーベル、シリーズ、手動タグ、年代・再生時間の区分ごとのお気に入り、好き、嫌い、視聴数と評価の分布(番号のある作品と番号のない項目は別集計)、および自分で登録したエンティティ名。' + #13#10#13#10 +
    'ライブラリの範囲: ファイル数、番号のある作品数、番号のない項目数。番号のないライブラリはこのパソコン内の集計にのみ使います。' + #13#10#13#10 +
    'バージョンと期間: Peach のバージョン、項目のバージョン、UTC の暦週。' + #13#10#13#10 +
    'アカウント、端末やインストールの識別子、内部の行番号、ファイル名、パス、タイトル、メディア、URL、検索語、個々の閲覧・視聴履歴はアップロードしません。' + #13#10#13#10 +
    '完全な明細にはアダルトコンテンツの好みが反映されます。受信サービスは独立した Sentry プロジェクトで、接続元 IP が見えます。' + #13#10#13#10 +
    '設定ページでこのパソコン上の完全なプレビューを確認したり、オフにしたりできます。オフにすると以後の送信は止まりますが、送信済みのデータはこのスイッチでは取り消せません。';
end;

function ShouldSkipPage(PageID: Integer): Boolean;
begin
  Result := (PageID = LibrarySharingPage.ID) and not WizardIsTaskSelected('librarysharing');
end;

procedure FinishTaskGuard();
var
  ResultCode: Integer;
begin
  if GuardPrepared then
  begin
    if Exec(ExpandConstant('{tmp}\Peach-preflight\Peach.exe'),
      '--installer-finish "' + ExpandConstant('{app}') + '" ' + IntToStr(GetCurrentProcessId()),
      ExpandConstant('{tmp}\Peach-preflight'), SW_HIDE, ewWaitUntilTerminated, ResultCode) and (ResultCode = 0) then
      GuardPrepared := False;
  end;
end;

procedure DeinitializeSetup();
begin
  FinishTaskGuard();
end;

function DataRoot(): String;
begin
  Result := GetEnv('PEACH_DATA_ROOT');
  if Result = '' then
    Result := ExpandConstant('{localappdata}\Peach\peach-data');
end;

#include "directory-validation.iss"

function InstallationDirectoryError(): String;
var
  PreviousDirectory: String;
begin
  PreviousDirectory := '';
  RegQueryStringValue(HKCU,
    'Software\Microsoft\Windows\CurrentVersion\Uninstall\{02D9748A-78F6-4866-AC75-918177194DAB}_is1',
    'Inno Setup: App Path', PreviousDirectory);
  Result := DirectoryError(WizardDirValue(), DataRoot(), PreviousDirectory);
  if Result = '' then
    Result := DirectoryError(WizardDirValue(), ExpandConstant('{localappdata}\Peach\peach-data'), PreviousDirectory);
  if Result <> '' then
    Result := CustomMessage(Result);
end;

function NextButtonClick(CurPageID: Integer): Boolean;
var
  Error: String;
begin
  Result := True;
  if CurPageID = wpSelectDir then
  begin
    Error := InstallationDirectoryError();
    Result := Error = '';
    if not Result then
      SuppressibleMsgBox(Error, mbError, MB_OK, IDOK);
  end;
end;

function PrepareToInstall(var NeedsRestart: Boolean): String;
var
  ResultCode: Integer;
  ErrorText: AnsiString;
begin
  Result := InstallationDirectoryError();
  if Result <> '' then
    Exit;
  if GuardPrepared then
    Exit;
  ExtractTemporaryFiles('{tmp}\Peach-preflight\*');
#ifdef LiteInstaller
  if not ToolsPrepared then
  begin
    if ToolsPage = nil then
      ToolsPage := CreateOutputMarqueeProgressPage('メディアツールの準備', '既存のツールは検証して再利用し、無い場合は自動でダウンロードします。');
    ToolsPage.SetText('メディアツールを確認・ダウンロード・検証しています。しばらくお待ちください。', 'ダウンロードに失敗した場合は再試行できます。既存のインストールは保持されます。');
    ToolsPage.Show;
    ToolsPage.Animate;
    try
      ToolsPrepared := Exec(ExpandConstant('{tmp}\Peach-preflight\Peach.exe'),
        '--installer-tools "' + ExpandConstant('{app}') + '" "' + ExpandConstant('{src}\.') +
        '" "' + ExpandConstant('{tmp}\Peach-preflight\tools-error.txt') + '"',
        ExpandConstant('{tmp}\Peach-preflight'), SW_HIDE, ewWaitUntilTerminated, ResultCode) and (ResultCode = 0);
    finally
      ToolsPage.Hide;
    end;
    if not ToolsPrepared then
    begin
      Result := 'メディアツールの準備が完了しませんでした。ネットワークを確認してから、もう一度お試しください。';
      if LoadStringFromFile(ExpandConstant('{tmp}\Peach-preflight\tools-error.txt'), ErrorText) then
        Result := UTF8Decode(ErrorText);
      Exit;
    end;
  end;
#endif
  if not Exec(ExpandConstant('{tmp}\Peach-preflight\Peach.exe'),
      '--installer-prepare "' + ExpandConstant('{app}') + '" ' + IntToStr(GetCurrentProcessId()) +
      ' "' + ExpandConstant('{tmp}\Peach-preflight\prepare-error.txt') + '"',
      ExpandConstant('{tmp}\Peach-preflight'), SW_HIDE, ewWaitUntilTerminated, ResultCode) or
      (ResultCode <> 0) then
  begin
    Result := CustomMessage('TaskCheckFailed');
    if LoadStringFromFile(ExpandConstant('{tmp}\Peach-preflight\prepare-error.txt'), ErrorText) then
      Result := UTF8Decode(ErrorText);
  end
  else
    GuardPrepared := True;
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ResultCode: Integer;
  ReportingConsent: String;
  LibraryConsent: String;
begin
  if (CurStep = ssPostInstall) and not WizardSilent() then
  begin
    ReportingConsent := '0';
    if WizardIsTaskSelected('reporting') then ReportingConsent := '1';
    if not Exec(ExpandConstant('{app}\Peach.exe'),
      '--installer-reporting ' + ReportingConsent + ' ' + ReportingConsent,
      ExpandConstant('{app}'), SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
      SuppressibleMsgBox(CustomMessage('ReportingFailed'), mbError, MB_OK, IDOK);
    LibraryConsent := '0';
    if WizardIsTaskSelected('librarysharing') then LibraryConsent := '1';
    if not Exec(ExpandConstant('{app}\Peach.exe'),
      '--installer-library-sharing ' + LibraryConsent,
      ExpandConstant('{app}'), SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
      SuppressibleMsgBox(CustomMessage('LibrarySharingFailed'), mbError, MB_OK, IDOK);
  end;
  { 服务启动时不迁移账本；覆盖安装换了程序，要在这里补上。没有账本的新机器不跑，
    否则会凭空建出账本，首次设置页就再也不出现。migrate 自己会先备份。 }
  if CurStep = ssPostInstall then
    if not Exec(ExpandConstant('{tmp}\Peach-preflight\Peach.exe'),
                '--installer-migrate "' + ExpandConstant('{app}') + '"', ExpandConstant('{tmp}\Peach-preflight'),
                SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
      SuppressibleMsgBox(CustomMessage('MigrationFailed'), mbError, MB_OK, IDOK);
  if CurStep = ssPostInstall then
    FinishTaskGuard();
end;

function InitializeUninstall(): Boolean;
var
  ResultCode: Integer;
begin
  Result := True;
  if Exec(ExpandConstant('{app}\Peach.exe'), '--installer-uninstall', ExpandConstant('{app}'),
          SW_HIDE, ewWaitUntilTerminated, ResultCode) and (ResultCode = 1) then
  begin
    SuppressibleMsgBox(CustomMessage('StillRunning'), mbError, MB_OK, IDOK);
    Result := False;
  end;
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  if (CurUninstallStep = usPostUninstall) and DirExists(DataRoot()) then
    SuppressibleMsgBox(FmtMessage(CustomMessage('DataKept'), [DataRoot()]), mbInformation, MB_OK, IDOK);
end;
