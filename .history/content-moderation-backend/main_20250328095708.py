from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import time
import os
from typing import Optional

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Credentials
SIGHTENGINE_API_USER = "your-api-user"
SIGHTENGINE_API_SECRET = "your-api-secret"
TEXT_API_URL = "https://api.sightengine.com/1.0/text/check.json"
AUDIO_API_URL = "https://api.sightengine.com/1.0/audio/check.json"

@app.post("/upload/")
async def upload_file(
    file: UploadFile = File(None),
    text: Optional[str] = Form(None)
):
    try:
        # Text Processing
        if text:
            text_params = {
                "api_user": SIGHTENGINE_API_USER,
                "api_secret": SIGHTENGINE_API_SECRET,
                "text": text,
                "categories": "sexual,cyberbullying,profanity"
            }
            text_response = requests.post(TEXT_API_URL, data=text_params)
            return {"text_result": text_response.json()}

        # File Processing
        if not file:
            raise HTTPException(status_code=400, detail="No file or text provided")

        # Audio/Video Processing
        files = {"media": (file.filename, file.file, file.content_type)}
        data = {
            "api_user": SIGHTENGINE_API_USER,
            "api_secret": SIGHTENGINE_API_SECRET,
            "models": "nudity-2.1,weapon,audio-violence,audio-abuse,text-content",
            "audio_analysis": "true"
        }

        response = requests.post(VIDEO_API_URL, files=files, data=data)
        result = response.json()

        # Add audio transcription analysis
        if 'audio' in result:
            audio_analysis = analyze_audio_transcription(result['audio']['transcription'])
            result['audio_analysis'] = audio_analysis

        return {"media_result": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def analyze_audio_transcription(transcript):
    # Analyze text content from audio
    text_params = {
        "api_user": SIGHTENGINE_API_USER,
        "api_secret": SIGHTENGINE_API_SECRET,
        "text": transcript,
        "categories": "sexual,cyberbullying,profanity"
    }
    return requests.post(TEXT_API_URL, data=text_params).json()