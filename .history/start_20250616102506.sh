#!/bin/bash

echo "🚀 Starting AI Content Moderation Website..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.7 or higher."
    exit 1
fi

# Check if .env file exists
if [ ! -f "content-moderation-backend/.env" ]; then
    echo "⚠️  Warning: .env file not found in content-moderation-backend/"
    echo "Please create a .env file with your SightEngine API credentials:"
    echo "SIGHTENGINE_API_USER=your_api_user_here"
    echo "SIGHTENGINE_API_SECRET=your_api_secret_here"
    echo ""
    read -p "Do you want to continue without API credentials? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Navigate to backend directory
cd content-moderation-backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Start backend server in background
echo "🌐 Starting backend server on http://127.0.0.1:5000..."
python app.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Navigate to frontend directory
cd ../content-moderation-frontend

# Start frontend server
echo "🎨 Starting frontend server on http://localhost:8000..."
echo "📱 Open your browser and go to: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start frontend server
python3 -m http.server 8000

# This line will only execute if the frontend server is stopped
cleanup 