# AI Content Moderation System

A full-stack web application for content moderation using AI-powered image and video analysis. This system uses the SightEngine API to detect inappropriate content including violence, gore, weapons, and adult content.

## 🚀 Features

- **Image & Video Analysis**: Supports multiple formats (PNG, JPG, JPEG, GIF, BMP, WEBP, MP4, AVI, MOV, MKV, WMV, FLV)
- **Real-time Processing**: Instant analysis with confidence scores
- **Drag & Drop Interface**: Modern, user-friendly upload interface
- **Detailed Results**: Shows specific reasons for content classification
- **Video Frame Extraction**: Automatically extracts and analyzes video frames
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Technology Stack

### Backend
- **Python 3.10+**
- **Flask** - Web framework
- **OpenCV** - Video frame extraction
- **Requests** - API communication
- **Flask-CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with modern design
- **JavaScript (ES6+)** - Interactive functionality
- **Font Awesome** - Icons

### External APIs
- **SightEngine API** - Content moderation and analysis

## 📋 Prerequisites

- Python 3.10 or higher
- pip (Python package manager)
- Git
- SightEngine API credentials

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd content-moderation-project
```

### 2. Set Up Backend

```bash
# Navigate to backend directory
cd content-moderation-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your SightEngine API credentials
echo "SIGHTENGINE_API_USER=your_api_user_here" > .env
echo "SIGHTENGINE_API_SECRET=your_api_secret_here" >> .env
```

### 3. Set Up Frontend

```bash
# Navigate to frontend directory
cd ../content-moderation-frontend

# Install dependencies (if using npm)
npm install
```

### 4. Run the Application

#### Start Backend Server
```bash
# In content-moderation-backend directory
cd content-moderation-backend
source venv/bin/activate  # On macOS/Linux
python app.py
```

The backend will start on `http://localhost:5001`

#### Start Frontend Server
```bash
# In content-moderation-frontend directory
cd content-moderation-frontend
npm start
```

The frontend will start on `http://localhost:3000`

### 5. Access the Application

Open your browser and go to: **http://localhost:3000**

## 🔧 Configuration

### SightEngine API Setup

1. Sign up at [SightEngine](https://sightengine.com/)
2. Get your API credentials (User ID and Secret)
3. Add them to the `.env` file in the backend directory:

```env
SIGHTENGINE_API_USER=your_api_user_here
SIGHTENGINE_API_SECRET=your_api_secret_here
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SIGHTENGINE_API_USER` | Your SightEngine API User ID | Yes |
| `SIGHTENGINE_API_SECRET` | Your SightEngine API Secret | Yes |

## 📁 Project Structure

```
content-moderation-project/
├── content-moderation-backend/
│   ├── app.py                 # Main Flask application
│   ├── config.py              # Configuration and API setup
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables (create this)
│   └── uploads/               # Temporary file storage
├── content-moderation-frontend/
│   ├── index.html             # Main HTML file
│   ├── styles.css             # CSS styles
│   ├── script.js              # JavaScript functionality
│   └── package.json           # Node.js dependencies
└── README.md                  # This file
```

## 🔍 API Endpoints

### Backend API (Port 5001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check endpoint |
| `/upload` | POST | File upload and analysis |

### Request Format

```bash
POST /upload
Content-Type: multipart/form-data

file: [image or video file]
```

### Response Format

```json
{
  "status": "safe|unsafe",
  "reason": "Detection reason",
  "confidence": "Confidence percentage",
  "file_type": "image|video",
  "frames_analyzed": 10
}
```

## 🎯 Usage

1. **Upload Content**: Drag and drop or click to select an image or video file
2. **Analysis**: The system automatically analyzes the content using AI
3. **Results**: View detailed results including:
   - Content safety status (Safe/Unsafe)
   - Detection reason
   - Confidence level
   - File type and analysis details

## 🔒 Security Features

- File size limits (50MB maximum)
- File type validation
- Automatic file cleanup after processing
- CORS configuration for secure cross-origin requests

## 🐛 Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check if port 5001 is available
   - Ensure virtual environment is activated
   - Verify all dependencies are installed

2. **Frontend can't connect to backend**
   - Ensure backend is running on port 5001
   - Check CORS configuration
   - Verify API_URL in script.js

3. **API errors**
   - Verify SightEngine API credentials in .env file
   - Check API quota and limits
   - Ensure file format is supported

4. **File upload issues**
   - Check file size (max 50MB)
   - Verify file format is supported
   - Ensure uploads/ directory exists and is writable

### Debug Mode

To enable debug logging, modify the backend:

```python
# In app.py, change the last line to:
app.run(debug=True, host="0.0.0.0", port=5001)
```

## 📊 Content Detection

The system detects:

- **Violence**: Physical violence, combat sports
- **Gore**: Graphic violence, blood content
- **Weapons**: Firearms, knives, dangerous objects
- **Adult Content**: Nudity and inappropriate material

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [SightEngine](https://sightengine.com/) for content moderation API
- [Font Awesome](https://fontawesome.com/) for icons
- [OpenCV](https://opencv.org/) for video processing

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the API documentation

---

**Note**: This is a development version. For production use, consider:
- Using a production WSGI server (Gunicorn, uWSGI)
- Implementing proper error handling and logging
- Adding rate limiting and authentication
- Using HTTPS in production 