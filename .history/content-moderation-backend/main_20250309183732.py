from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import requests

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

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    try:
        files = {"media": (file.filename, file.file, file.content_type)}
        data = {
            "api_user": SIGHTENGINE_API_USER,
            "api_secret": SIGHTENGINE_API_SECRET,
            "models": "nudity-2.1,weapon,recreational_drug,medical,gore-2.0,tobacco,genai,violence,gambling",
        }

        response = requests.post(API_URL, files=files, data=data)
        result = response.json()

        return {"moderation_result": result}

    except Exception as e:
        return {"error": str(e)}
