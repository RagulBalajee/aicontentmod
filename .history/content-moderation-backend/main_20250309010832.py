from fastapi import FastAPI, File, UploadFile
import requests
import shutil
import os

app = FastAPI()

# SightEngine API Credentials
API_USER = "your_api_user"
API_SECRET = "your_api_secret"

@app.get("/")
def home():
    return {"message": "Welcome to the AI Content Moderation API!"}

@app.post("/moderate-image/")
async def moderate_image(file: UploadFile = File(...)):
    file_path = f"uploads/{file.filename}"
    
    # Save uploaded image
    os.makedirs("uploads", exist_ok=True)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Send to SightEngine API
    url = "https://api.sightengine.com/1.0/check.json"
    files = {"media": open(file_path, "rb")}
    data = {
        "models": "nudity-2.1,weapon,recreational_drug,medical,gore-2.0,tobacco,genai,violence,gambling",
        "api_user": API_USER,
        "api_secret": API_SECRET
    }

    response = requests.post(url, files=files, data=data)
    os.remove(file_path)  # Delete file after processing

    if response.status_code == 200:
        return response.json()
    else:
        return {"error": "Failed to process image"}

