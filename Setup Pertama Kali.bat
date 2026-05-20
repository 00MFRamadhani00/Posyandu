@echo off
title Setup Posyandu App
color 0E
cd /d "%~dp0"

echo.
echo  ====================================
echo     SETUP AWAL POSYANDU APP
echo     (Hanya perlu dijalankan sekali)
echo  ====================================
echo.

REM --- Pastikan MySQL jalan ---
echo  [1/5] Menghidupkan database...
"C:\xampp\mysql\bin\mysqladmin.exe" -u root status >nul 2>&1
if %errorlevel% neq 0 (
    start "" "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone
    timeout /t 4 /nobreak >nul
)
echo        Selesai.

echo.
echo  [2/5] Install paket backend...
cd backend
call npm install --silent
echo        Selesai.

echo.
echo  [3/5] Menyiapkan database...
call npx prisma db push
echo        Selesai.

echo.
echo  [4/5] Membuat akun admin...
call node src/seed.js
echo        Selesai.

echo.
echo  [5/5] Build tampilan aplikasi...
cd ..\frontend
call npm install --silent
call npm run build
echo        Selesai.

echo.
echo  ====================================
echo   Setup selesai!
echo.
echo   Login default:
echo     Username : admin
echo     Password : admin123
echo.
echo   Selanjutnya, gunakan file:
echo   "Jalankan Posyandu.bat"
echo   untuk membuka aplikasi.
echo  ====================================
echo.
pause
