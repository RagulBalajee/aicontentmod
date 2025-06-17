from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
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

SIGHTENGINE_API_USER = "917312070"
SIGHTENGINE_API_SECRET = "yrPC6cRnjoudj2b52jUMcVjbziwpLihN"
IMAGE_API_URL = "https://api.sightengine.com/1.0/check.json"

async def analyze_image(file: UploadFile):
    try:
        # Reset file pointer to ensure full read
        file.file.seek(0)
        
        files = {"media": (file.filename, file.file, file.content_type)}
        data = {
            "api_user": SIGHTENGINE_API_USER,
            "api_secret": SIGHTENGINE_API_SECRET,
            "models": "nudity-2.1,offensive,face-attributes",
            "workflow": "image",
        }

        logger.info(f"Processing image: {file.filename}")
        response = requests.post(IMAGE_API_URL, files=files, data=data)
        response.raise_for_status()
        
        result = response.json()
        logger.info(f"Image analysis result: {result}")
        
        if result.get('status') == 'failure':
            raise HTTPException(
                status_code=400,
                detail=result.get('error', {}).get('message', 'Image processing failed')
            )
            
        return result

    except requests.exceptions.RequestException as e:
        logger.error(f"Image API error: {str(e)}")
        raise HTTPException(
            status_code=502,
            detail=f"Image processing service unavailable: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Image processing error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Image analysis failed: {str(e)}"
        )

@app.post("/analyze/")
async def analyze_content(file: UploadFile = File(...)):
    try:
        logger.info(f"Received file: {file.filename} ({file.content_type})")
        
        if file.content_type.startswith('image/'):
            result = await analyze_image(file)
            return {
                "type": "image",
                "result": {
                    "status": "success",
                    "analysis": result
                }
            }
            
        elif file.content_type.startswith('video/'):
            # Existing video handling code
            pass
            
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type"
            )

    except HTTPException as he:
        raise
    except Exception as e:
        logger.error(f"General processing error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Processing failed: {str(e)}"
        )