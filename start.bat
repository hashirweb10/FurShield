@echo off
echo ==========================================
echo   FurShield — Starting Development Servers
echo ==========================================
echo.

REM Check PHP
where /q C:\xampp\php\php.exe
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PHP not found at C:\xampp\php\php.exe
    echo Please install XAMPP or update this script with your PHP path.
    pause
    exit /b 1
)

echo [1/2] Starting PHP backend server on port 8000...
start "FurShield PHP Server" /min cmd /c "cd /d "%~dp0" && C:\xampp\php\php.exe -S localhost:8000 backend\router.php"

echo [2/2] Starting Vite dev server on port 5173...
start "FurShield Vite Server" /min cmd /c "cd /d "%~dp0" && npx vite"

echo.
echo ==========================================
echo   Servers starting...
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo ==========================================
echo.
echo Press any key to STOP all servers...
pause >nul

echo Stopping servers...
taskkill /fi "WINDOWTITLE eq FurShield PHP Server*" /f >nul 2>&1
taskkill /fi "WINDOWTITLE eq FurShield Vite Server*" /f >nul 2>&1
echo All servers stopped.
pause
