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

echo  [1/4] Install paket backend...
cd backend
call npm install --silent
echo        Selesai.

echo.
echo  [2/4] Menyiapkan database...
call npx prisma db push
echo        Selesai.

echo.
echo  [3/4] Membuat akun admin...
call node src/seed.js
echo        Selesai.

echo.
echo  [4/4] Build tampilan aplikasi...
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
