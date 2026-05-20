#define AppName "Posyandu App"
#define AppVersion "1.0"
#define NodeInstaller "node-v20.11.1-x64.msi"
#define NodePath "C:\Program Files\nodejs"

[Setup]
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher=Posyandu
DefaultDirName={localappdata}\PosyanduApp
DefaultGroupName={#AppName}
DisableProgramGroupPage=yes
OutputBaseFilename=Setup Posyandu
SetupIconFile=Icon\favicon.ico
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
UninstallDisplayName={#AppName}
UninstallDisplayIcon={app}\icon.ico

[Languages]
Name: "default"; MessagesFile: "compiler:Default.isl"

[Files]
; Node.js installer — dihapus otomatis setelah dipakai
Source: "{#NodeInstaller}"; DestDir: "{tmp}"; Flags: deleteafterinstall

; Backend source (tanpa node_modules)
Source: "backend\src\*"; DestDir: "{app}\backend\src"; Flags: recursesubdirs createallsubdirs
Source: "backend\prisma\*"; DestDir: "{app}\backend\prisma"; Flags: recursesubdirs createallsubdirs
Source: "backend\package.json"; DestDir: "{app}\backend"
Source: "backend\package-lock.json"; DestDir: "{app}\backend"; Flags: skipifsourcedoesntexist

; Frontend — pakai hasil build yang sudah ada (tidak perlu npm build ulang)
Source: "frontend\dist\*"; DestDir: "{app}\frontend\dist"; Flags: recursesubdirs createallsubdirs

; Launcher
Source: "Jalankan Posyandu.bat"; DestDir: "{app}"
; Icon
Source: "Icon\favicon.ico"; DestDir: "{app}"; DestName: "icon.ico"

[Icons]
; Shortcut di Desktop
Name: "{userdesktop}\Posyandu App"; Filename: "{app}\Jalankan Posyandu.bat"; WorkingDir: "{app}"; IconFilename: "{app}\icon.ico"
; Shortcut di Start Menu
Name: "{userprograms}\{#AppName}\{#AppName}"; Filename: "{app}\Jalankan Posyandu.bat"; WorkingDir: "{app}"; IconFilename: "{app}\icon.ico"
Name: "{userprograms}\{#AppName}\Uninstall"; Filename: "{uninstallexe}"

[Code]

// Cek apakah Node.js sudah terinstall
function NodeInstalled(): Boolean;
var
  NodePath: String;
begin
  Result := False;

  // Cek via registry
  if RegQueryStringValue(HKLM, 'SOFTWARE\Node.js', 'InstallPath', NodePath) then begin
    Result := FileExists(NodePath + '\node.exe');
    Exit;
  end;

  // Cek path default
  if FileExists('C:\Program Files\nodejs\node.exe') then begin
    Result := True;
    Exit;
  end;
  if FileExists('C:\Program Files (x86)\nodejs\node.exe') then begin
    Result := True;
    Exit;
  end;
end;

// Jalankan perintah cmd dan tunggu selesai
function RunCmd(Cmd: String; Dir: String): Integer;
var
  ResultCode: Integer;
begin
  Exec('cmd.exe', '/c ' + Cmd, Dir, SW_HIDE, ewWaitUntilTerminated, ResultCode);
  Result := ResultCode;
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  AppDir: String;
  ResultCode: Integer;
  EnvContent: String;
  NodeExe: String;
  NpmCmd: String;
begin
  if CurStep = ssPostInstall then
  begin
    AppDir := ExpandConstant('{app}');

    // ===== LANGKAH 1: Install Node.js jika belum ada =====
    if not NodeInstalled() then
    begin
      WizardForm.StatusLabel.Caption := 'Menginstall Node.js (harap tunggu)...';
      Exec(ExpandConstant('{tmp}\{#NodeInstaller}'),
           '/quiet /norestart ADDTOPATH=1',
           '', SW_SHOW, ewWaitUntilTerminated, ResultCode);
    end;

    // Tentukan path node/npm (pakai full path agar aman setelah install baru)
    if FileExists('C:\Program Files\nodejs\npm.cmd') then
      NpmCmd := '"C:\Program Files\nodejs\npm.cmd"'
    else if FileExists('C:\Program Files (x86)\nodejs\npm.cmd') then
      NpmCmd := '"C:\Program Files (x86)\nodejs\npm.cmd"'
    else
      NpmCmd := 'npm';  // fallback: pakai PATH

    // ===== LANGKAH 2: Buat file .env =====
    EnvContent :=
      'DATABASE_URL="file:./database.db"' + #13#10 +
      'JWT_SECRET="posyandu_jwt_secret_2024_aman"' + #13#10 +
      'PORT=3001' + #13#10;
    SaveStringToFile(AppDir + '\backend\.env', EnvContent, False);

    // ===== LANGKAH 3: npm install backend =====
    WizardForm.StatusLabel.Caption := 'Menginstall dependensi backend (1-3 menit pertama kali)...';
    RunCmd('"' + NpmCmd + '" install --silent', AppDir + '\backend');

    // ===== LANGKAH 4: Prisma db push (buat database) =====
    WizardForm.StatusLabel.Caption := 'Menyiapkan database...';
    RunCmd('"' + AppDir + '\backend\node_modules\.bin\prisma.cmd" db push', AppDir + '\backend');

    // ===== LANGKAH 5: Seed (buat akun admin) =====
    WizardForm.StatusLabel.Caption := 'Membuat akun admin...';
    if FileExists('C:\Program Files\nodejs\node.exe') then
      NodeExe := '"C:\Program Files\nodejs\node.exe"'
    else
      NodeExe := 'node';
    RunCmd(NodeExe + ' src/seed.js', AppDir + '\backend');

    WizardForm.StatusLabel.Caption := 'Selesai!';
  end;
end;

[Messages]
WizardReady=Klik Install untuk memulai pemasangan {#AppName}.
FinishedHeadingLabel=Instalasi Selesai!
FinishedLabel=Posyandu App berhasil diinstall.%n%nShortcut sudah dibuat di Desktop.%n%nLogin default: admin / admin123
