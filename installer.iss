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
  SetupBat: String;
  BatContent: String;
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

    // ===== LANGKAH 2: Buat file .env =====
    EnvContent :=
      'DATABASE_URL="file:./database.db"' + #13#10 +
      'JWT_SECRET="posyandu_jwt_secret_2024_aman"' + #13#10 +
      'PORT=3001' + #13#10;
    SaveStringToFile(AppDir + '\backend\.env', EnvContent, False);

    // ===== LANGKAH 3: Tulis bat helper setup =====
    SetupBat := AppDir + '\_setup_install.bat';
    BatContent :=
      '@echo off' + #13#10 +
      'title Setup Posyandu App' + #13#10 +
      'color 0A' + #13#10 +
      ':: Tambahkan Node.js ke PATH untuk sesi ini' + #13#10 +
      'set "PATH=%PATH%;C:\Program Files\nodejs;C:\Program Files (x86)\nodejs"' + #13#10 +
      '' + #13#10 +
      'cd /d "' + AppDir + '\backend"' + #13#10 +
      '' + #13#10 +
      'echo ======================================' + #13#10 +
      'echo   SETUP POSYANDU APP' + #13#10 +
      'echo ======================================' + #13#10 +
      'echo.' + #13#10 +
      'echo [1/3] Menginstall dependensi (1-3 menit)...' + #13#10 +
      'call npm install' + #13#10 +
      'if errorlevel 1 (' + #13#10 +
      '  echo.' + #13#10 +
      '  echo GAGAL: npm install. Tekan tombol apa saja untuk keluar.' + #13#10 +
      '  pause >nul' + #13#10 +
      '  exit /b 1' + #13#10 +
      ')' + #13#10 +
      '' + #13#10 +
      'echo [2/3] Menyiapkan database...' + #13#10 +
      'call npx prisma db push' + #13#10 +
      '' + #13#10 +
      'echo [3/3] Membuat akun admin...' + #13#10 +
      'node src\seed.js' + #13#10 +
      '' + #13#10 +
      'echo.' + #13#10 +
      'echo ======================================' + #13#10 +
      'echo   Setup selesai!' + #13#10 +
      'echo   Tekan sembarang tombol untuk lanjut.' + #13#10 +
      'echo ======================================' + #13#10 +
      'pause >nul' + #13#10;

    SaveStringToFile(SetupBat, BatContent, False);

    // ===== LANGKAH 4: Jalankan bat helper =====
    WizardForm.StatusLabel.Caption := 'Menjalankan setup (lihat jendela yang muncul)...';
    Exec('cmd.exe', '/c "' + SetupBat + '"', AppDir, SW_SHOW, ewWaitUntilTerminated, ResultCode);

    // Hapus bat helper setelah selesai
    DeleteFile(SetupBat);

    WizardForm.StatusLabel.Caption := 'Selesai!';
  end;
end;

[Messages]
WizardReady=Klik Install untuk memulai pemasangan {#AppName}.
FinishedHeadingLabel=Instalasi Selesai!
FinishedLabel=Posyandu App berhasil diinstall.%n%nShortcut sudah dibuat di Desktop.%n%nLogin default: admin / admin123
