from fastapi import FastAPI, File, UploadFile
import requests
import shutil

app = FastAPI()

# Replace with your SightEngine API credentials
API_USER = "your_api_user"
API_SECRET = "your_api_secret"
API_URL = "https://api.sightengine.com/1.0/check.json"

@app.post("/moderate-image/")
async def moderate_image(file: UploadFile = File(...)):
    file_path = f"temp_{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    files = {"media": open(file_path, "rb")}
    data = {
        "models": "nudity-2.1,weapon,recreational_drug,medical,gore-2.0,tobacco,genai,violence,gambling",
        "api_user": API_USER,
        "api_secret": API_SECRET,
    }
    
    response = requests.post(API_URL, files=files, data=data)
    result = response.json()
    
    return {"moderation_result": result}
