from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import time
import logging

app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SIGHTENGINE_API_USER = "your-api-user"
SIGHTENGINE_API_SECRET = "your-api-secret"
VIDEO_API_URL = "https://api.sightengine.com/1.0/video/check.json"

async def analyze_video(file: UploadFile):
    try:
        # Reset file pointer to ensure full read
        file.file.seek(0)
        
        files = {"media": (file.filename, file.file, file.content_type)}
        data = {
            "api_user": SIGHTENGINE_API_USER,
            "api_secret": SIGHTENGINE_API_SECRET,
            "models": "nudity-2.1,weapon,violence,gore-2.0",
            "callback_url": None,
            "workflow": "video",
            "language": "en"
        }

        logger.info(f"Starting video processing for {file.filename}")
        response = requests.post(VIDEO_API_URL, files=files, data=data)
        response.raise_for_status()
        
        result = response.json()
        logger.info(f"Initial video response: {result}")

        if 'id' not in result:
            error_msg = result.get('error', {}).get('message', 'Unknown video processing error')
            raise HTTPException(
                status_code=400,
                detail=f"Video processing failed: {error_msg}"
            )

        video_id = result['id']
        status_url = f"{VIDEO_API_URL}?id={video_id}&api_user={SIGHTENGINE_API_USER}&api_secret={SIGHTENGINE_API_SECRET}"

        # Improved polling with timeout and retries
        max_attempts = 20  # Increased from 10
        poll_interval = 5  # Increased from 3 seconds
        for attempt in range(max_attempts):
            try:
                status_response = requests.get(status_url, timeout=30)
                status_response.raise_for_status()
                status_data = status_response.json()
                logger.info(f"Polling attempt {attempt+1}: {status_data}")

                if status_data.get('status') == 'finished':
                    return status_data
                elif status_data.get('status') == 'error':
                    error_msg = status_data.get('error', 'Unknown processing error')
                    raise HTTPException(
                        status_code=400,
                        detail=f"Video processing error: {error_msg}"
                    )
                
                time.sleep(poll_interval)
            
            except requests.exceptions.RequestException as e:
                logger.error(f"Polling error: {str(e)}")
                if attempt >= max_attempts - 1:
                    raise HTTPException(
                        status_code=408,
                        detail="Video processing timeout after multiple retries"
                    )
                time.sleep(poll_interval * 2)  # Backoff for failed requests

        raise HTTPException(
            status_code=408,
            detail="Video processing timeout"
        )

    except HTTPException as he:
        raise
    except requests.exceptions.RequestException as e:
        logger.error(f"API request failed: {str(e)}")
        raise HTTPException(
            status_code=502,
            detail=f"Video processing service unavailable: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.post("/analyze/")
async def analyze_content(file: UploadFile = File(None)):
    try:
        if not file:
            raise HTTPException(status_code=400, detail="No file provided")
        
        if file.content_type.startswith('video/'):
            result = await analyze_video(file)
            return {"type": "video", "result": result}
        
        # Rest of your image/text handling...
        
    except HTTPException as he:
        raise
    except Exception as e:
        logger.error(f"General processing error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Processing failed: {str(e)}"
        )