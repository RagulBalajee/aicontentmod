@echo off
echo 🚀 Starting AI Content Moderation Website...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.7 or higher.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist "content-moderation-backend\.env" (
    echo ⚠️  Warning: .env file not found in content-moderation-backend\
    echo Please create a .env file with your SightEngine API credentials:
    echo SIGHTENGINE_API_USER=your_api_user_here
    echo SIGHTENGINE_API_SECRET=your_api_secret_here
    echo.
    set /p continue="Do you want to continue without API credentials? (y/n): "
    if /i not "%continue%"=="y" (
        pause
        exit /b 1
    )
)

REM Navigate to backend directory
cd content-moderation-backend

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing dependencies...
pip install -r requirements.txt

REM Start backend server in background
echo 🌐 Starting backend server on http://127.0.0.1:5000...
start /B python app.py

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Navigate to frontend directory
cd ..\content-moderation-frontend

REM Start frontend server
echo 🎨 Starting frontend server on http://localhost:8000...
echo 📱 Open your browser and go to: http://localhost:8000
echo.
echo Press Ctrl+C to stop both servers

REM Start frontend server
python -m http.server 8000

pause 