@echo off
REM Quick Start Script untuk Admin Login System
REM Jalankan script ini di root folder project

echo.
echo ====================================
echo  Admin Login System - Quick Start
echo ====================================
echo.

REM Check MongoDB
echo [1/4] Checking MongoDB connection...
mongo --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] MongoDB not installed or not in PATH
    echo Please install MongoDB first
    pause
    exit /b 1
)
echo [OK] MongoDB found

REM Install backend dependencies
echo.
echo [2/4] Installing backend dependencies...
cd Capstone\backend
npm install >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed

REM Create admin account
echo.
echo [3/4] Creating admin account...
node seeder.js -admin
if %errorlevel% neq 0 (
    echo [WARNING] Failed to create admin account
    echo Please run manually: node seeder.js -admin
) else (
    echo [OK] Admin account created successfully
)

REM Install frontend dependencies
echo.
echo [4/4] Installing frontend dependencies...
cd ..\frontend
npm install >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Failed to install frontend dependencies
) else (
    echo [OK] Frontend dependencies installed
)

REM Done
echo.
echo ====================================
echo  Setup Complete!
echo ====================================
echo.
echo Next steps:
echo 1. Open two terminals
echo.
echo Terminal 1 - Run Backend:
echo    cd Capstone\backend
echo    npm start
echo.
echo Terminal 2 - Run Frontend:
echo    cd Capstone\frontend
echo    npm run dev
echo.
echo Then open: http://localhost:3000/login
echo Email: admin@graphology.com
echo Password: admin123456
echo.
echo ====================================
echo.
pause
