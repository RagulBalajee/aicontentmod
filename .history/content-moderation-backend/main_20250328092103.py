from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import time
from typing import Optional

app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SightEngine API Credentials
SIGHTENGINE_API_USER = "917312070"
SIGHTENGINE_API_SECRET = "yrPC6cRnjoudj2b52jUMcVjbziwpLihN"
IMAGE_API_URL = "https://api.sightengine.com/1.0/check.json"
VIDEO_API_URL = "https://api.sightengine.com/1.0/video/check.json"
VIDEO_FEEDBACK_URL = "https://api.sightengine.com/1.0/video/feedback.json"

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

        if is_video:
            # For videos, we need to poll for results
            response = requests.post(VIDEO_API_URL, files=files, data=data)
            initial_response = response.json()
            
            if 'id' not in initial_response:
                raise HTTPException(status_code=400, detail="Video processing failed to start")
            
            video_id = initial_response['id']
            status_url = f"{VIDEO_API_URL}?id={video_id}&api_user={SIGHTENGINE_API_USER}&api_secret={SIGHTENGINE_API_SECRET}"
            
            # Poll for results (maximum 10 attempts)
            max_attempts = 10
            for attempt in range(max_attempts):
                status_response = requests.get(status_url)
                status_data = status_response.json()
                
                if status_data['status'] == 'finished':
                    # Get the final results
                    result_url = f"{VIDEO_FEEDBACK_URL}?id={video_id}&api_user={SIGHTENGINE_API_USER}&api_secret={SIGHTENGINE_API_SECRET}"
                    final_response = requests.get(result_url)
                    return {"moderation_result": final_response.json()}
                
                elif status_data['status'] == 'error':
                    raise HTTPException(status_code=400, detail="Video processing error")
                
                time.sleep(3)  # Wait 3 seconds between attempts
            
            raise HTTPException(status_code=408, detail="Video processing timeout")
        else:
            # For images, immediate response
            response = requests.post(IMAGE_API_URL, files=files, data=data)
            return {"moderation_result": response.json()}

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))