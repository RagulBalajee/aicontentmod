#!/bin/bash

# AI Content Moderation System - Startup Script
# This script starts both the backend and frontend servers

echo "🚀 Starting AI Content Moderation System..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.10 or higher."
    exit 1
fi

# Check if the backend directory exists
if [ ! -d "content-moderation-backend" ]; then
    echo "❌ Backend directory not found. Please ensure you're in the project root directory."
    exit 1
fi

# Check if the frontend directory exists
if [ ! -d "content-moderation-frontend" ]; then
    echo "❌ Frontend directory not found. Please ensure you're in the project root directory."
    exit 1
fi

# Function to cleanup background processes
cleanup() {
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "📦 Setting up backend..."

# Navigate to backend directory
cd content-moderation-backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "🔧 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found in backend directory."
    echo "   Please create a .env file with your SightEngine API credentials:"
    echo "   SIGHTENGINE_API_USER=your_api_user_here"
    echo "   SIGHTENGINE_API_SECRET=your_api_secret_here"
    echo ""
fi

# Start backend server
echo "🚀 Starting backend server on http://localhost:5001..."
python app.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ! curl -s http://localhost:5001/health > /dev/null; then
    echo "❌ Backend failed to start. Please check the logs above."
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend server is running!"

# Navigate to frontend directory
cd ../content-moderation-frontend

# Check if package.json exists and install dependencies
if [ -f "package.json" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start frontend server
echo "🚀 Starting frontend server on http://localhost:3000..."
npm start &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

echo ""
echo "🎉 AI Content Moderation System is running!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5001"
echo "🏥 Health Check: http://localhost:5001/health"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user to stop the servers
wait 