from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import requests
import shutil
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SIGHTENGINE_API_USER = "917312070"
SIGHTENGINE_API_SECRET = "yrPC6cRnjoudj2b52jUMcVjbziwpLihN"

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.post("/moderate")
async def moderate_image(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    # Save the uploaded file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Send request to SightEngine API
    response = requests.post(
        "https://api.sightengine.com/1.0/check.json",
        files={"media": open(file_path, "rb")},
        data={
            "models": "nudity-2.1,weapon,recreational_drug,medical,gore-2.0,tobacco,violence,gambling",
            "api_user": SIGHTENGINE_API_USER,
            "api_secret": SIGHTENGINE_API_SECRET,
        },
    )

    # Remove the image after processing
    os.remove(file_path)

    result = response.json()
    if result.get("status") != "success":
        return JSONResponse(content={"error": "Error processing image"}, status_code=500)

    # Extract relevant moderation scores
    moderation_scores = {
        "nudity": result["nudity"]["none"],  # Probability of no nudity
        "weapon": result["weapon"]["classes"]["firearm"],
        "drugs": result["recreational_drug"]["prob"],
        "medical": result["medical"]["prob"],
        "gore": result["gore"]["prob"],
        "tobacco": result["tobacco"]["prob"],
        "violence": result["violence"]["prob"],
        "gambling": result["gambling"]["prob"],
    }

    return JSONResponse(content={"moderation_result": moderation_scores})
