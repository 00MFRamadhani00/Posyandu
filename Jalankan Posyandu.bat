@echo off
title Posyandu App
color 0A
cd /d "%~dp0"

echo.
echo  ====================================
echo        POSYANDU APP - MEMULAI
echo  ====================================
echo.

echo  [1/2] Menjalankan aplikasi...
cd backend
start /min "" cmd /c "node src/index.js > ..\app.log 2>&1"
timeout /t 2 /nobreak >nul

echo.
echo  [2/2] Membuka browser...
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
