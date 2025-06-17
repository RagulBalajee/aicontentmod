@echo off
REM AI Content Moderation System - Startup Script for Windows
REM This script starts both the backend and frontend servers

echo 🚀 Starting AI Content Moderation System...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH. Please install Python 3.10 or higher.
    pause
    exit /b 1
)

REM Check if the backend directory exists
if not exist "content-moderation-backend" (
    echo ❌ Backend directory not found. Please ensure you're in the project root directory.
    pause
    exit /b 1
)

REM Check if the frontend directory exists
if not exist "content-moderation-frontend" (
    echo ❌ Frontend directory not found. Please ensure you're in the project root directory.
    pause
    exit /b 1
)

echo 📦 Setting up backend...

REM Navigate to backend directory
cd content-moderation-backend

REM Check if virtual environment exists
if not exist "venv" (
    echo 🔧 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies if requirements.txt exists
if exist "requirements.txt" (
    echo 📦 Installing Python dependencies...
    pip install -r requirements.txt
)

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  Warning: .env file not found in backend directory.
    echo    Please create a .env file with your SightEngine API credentials:
    echo    SIGHTENGINE_API_USER=your_api_user_here
    echo    SIGHTENGINE_API_SECRET=your_api_secret_here
    echo.
)

REM Start backend server
echo 🚀 Starting backend server on http://localhost:5001...
start "Backend Server" python app.py

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Navigate to frontend directory
cd ..\content-moderation-frontend

REM Check if package.json exists and install dependencies
if exist "package.json" (
    echo 📦 Installing frontend dependencies...
    npm install
)

REM Start frontend server
echo 🚀 Starting frontend server on http://localhost:3000...
start "Frontend Server" npm start

REM Wait a moment for frontend to start
timeout /t 3 /nobreak >nul

echo.
echo 🎉 AI Content Moderation System is running!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:5001
echo 🏥 Health Check: http://localhost:5001/health
echo.
echo The servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause 