from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import time
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SIGHTENGINE_API_USER = "your-api-user"
SIGHTENGINE_API_SECRET = "your-api-secret"
API_ENDPOINTS = {
    "image": "https://api.sightengine.com/1.0/check.json",
    "video": "https://api.sightengine.com/1.0/video/check.json",
    "text": "https://api.sightengine.com/1.0/text/check.json"
}

async def analyze_file(file: UploadFile, file_type: str):
    try:
        files = {"media": (file.filename, file.file, file.content_type)}
        data = {
            "api_user": SIGHTENGINE_API_USER,
            "api_secret": SIGHTENGINE_API_SECRET,
            "models": "nudity-2.1,weapon,violence,gore-2.0,text-content" if file_type == "video" else "nudity-2.1",
        }

        if file_type == "video":
            response = requests.post(API_ENDPOINTS[file_type], files=files, data=data)
            video_id = response.json().get('id')
            
            if not video_id:
                raise HTTPException(status_code=400, detail="Video processing failed to start")
            
            status_url = f"{API_ENDPOINTS[file_type]}?id={video_id}&api_user={SIGHTENGINE_API_USER}&api_secret={SIGHTENGINE_API_SECRET}"
            
            # Poll for results
            attempts = 0
            while attempts < 10:
                status_response = requests.get(status_url)
                status_data = status_response.json()
                
                if status_data.get('status') == 'finished':
                    return status_data
                elif status_data.get('status') == 'error':
                    raise HTTPException(status_code=400, detail="Video processing error")
                
                time.sleep(3)
                attempts += 1
            
            raise HTTPException(status_code=408, detail="Video processing timeout")

        else:
            response = requests.post(API_ENDPOINTS[file_type], files=files, data=data)
            return response.json()

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/")
async def analyze_content(
    file: UploadFile = File(None),
    text: Optional[str] = None
):
    try:
        if text:
            response = requests.post(API_ENDPOINTS["text"], data={
                "api_user": SIGHTENGINE_API_USER,
                "api_secret": SIGHTENGINE_API_SECRET,
                "text": text,
                "categories": "profanity,violence"
            })
            return {"type": "text", "result": response.json()}

        if file:
            content_type = file.content_type
            if content_type.startswith('image'):
                result = await analyze_file(file, "image")
                return {"type": "image", "result": result}
            elif content_type.startswith('video'):
                result = await analyze_file(file, "video")
                return {"type": "video", "result": result}
            elif content_type == "text/plain":
                text_content = await file.read()
                response = requests.post(API_ENDPOINTS["text"], data={
                    "api_user": SIGHTENGINE_API_USER,
                    "api_secret": SIGHTENGINE_API_SECRET,
                    "text": text_content.decode(),
                    "categories": "profanity,violence"
                })
                return {"type": "text", "result": response.json()}

        raise HTTPException(status_code=400, detail="Unsupported file type")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))