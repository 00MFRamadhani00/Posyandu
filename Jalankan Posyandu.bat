@echo off
title Posyandu App
color 0A
cd /d "%~dp0"

echo.
echo  ====================================
echo        POSYANDU APP - MEMULAI
echo  ====================================
echo.

REM --- Cek MySQL XAMPP sudah jalan ---
echo  [1/3] Memeriksa database...
"C:\xampp\mysql\bin\mysqladmin.exe" -u root status >nul 2>&1
if %errorlevel% neq 0 (
    echo        Database belum aktif, menghidupkan...
    start "" "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone
    timeout /t 4 /nobreak >nul
    echo        Database siap.
) else (
    echo        Database sudah aktif.
)

echo.
echo  [2/3] Menjalankan aplikasi...
cd backend
start /min "" cmd /c "node src/index.js > ..\app.log 2>&1"
timeout /t 2 /nobreak >nul

echo.
echo  [3/3] Membuka browser...
start "" http://localhost:3001
echo.
echo  ====================================
echo   Posyandu App sudah berjalan!
echo   Browser akan terbuka otomatis.
echo.
echo   Jangan tutup jendela ini selama
echo   aplikasi sedang digunakan.
echo.
echo   Tekan tombol apa saja untuk
echo   MEMATIKAN aplikasi.
echo  ====================================
echo.
pause >nul

REM --- Matikan backend saat ditutup ---
echo  Mematikan aplikasi...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
echo  Aplikasi dimatikan. Sampai jumpa!
timeout /t 2 /nobreak >nul
