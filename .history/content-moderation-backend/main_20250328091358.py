from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from typing import Optional

app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (adjust as needed)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SightEngine API Credentials
SIGHTENGINE_API_USER = "917312070"  # Replace with your API User
SIGHTENGINE_API_SECRET = "yrPC6cRnjoudj2b52jUMcVjbziwpLihN"  # Replace with your API Secret
API_URL = "https://api.sightengine.com/1.0/check.json"
VIDEO_API_URL = "https://api.sightengine.com/1.0/video/check.json"

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Determine if it's a video file
        is_video = file.content_type.startswith('video/')
        
        files = {"media": (file.filename, file.file, file.content_type)}
        data = {
            "api_user": SIGHTENGINE_API_USER,
            "api_secret": SIGHTENGINE_API_SECRET,
            "models": "nudity-2.1,weapon,recreational_drug,medical,gore-2.0,tobacco,genai,violence,gambling",
        }

        # Use the appropriate API endpoint
        api_url = VIDEO_API_URL if is_video else API_URL
        response = requests.post(api_url, files=files, data=data)
        result = response.json()

        # Process video response differently if needed
        if is_video:
            # For videos, we might want to extract summary or frame-by-frame results
            if 'summary' in result:
                return {"moderation_result": result['summary']}
            else:
                return {"moderation_result": result}
        else:
            return {"moderation_result": result}

    except Exception as e:
        return {"error": str(e)}