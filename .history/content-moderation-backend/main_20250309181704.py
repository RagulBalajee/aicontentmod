from fastapi import FastAPI, File, UploadFile
import requests
import shutil
import os

app = FastAPI()

# SightEngine API Credentials
SIGHTENGINE_API_USER = "917312070"
SIGHTENGINE_API_SECRET = "yrPC6cRnjoudj2b52jUMcVjbziwpLihN"

# Directory to store uploaded images
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.post("/moderate-image/")
async def moderate_image(file: UploadFile = File(...)):
    try:
        # Save the uploaded file
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Call SightEngine API for moderation
        api_url = "https://api.sightengine.com/1.0/check.json"
        payload = {
            "models": "nudity-2.1,weapon,recreational_drug,medical,gore-2.0,tobacco,genai,violence,gambling",
            "api_user": SIGHTENGINE_API_USER,
            "api_secret": SIGHTENGINE_API_SECRET
        }
        files = {"media": open(file_path, "rb")}
        response = requests.post(api_url, data=payload, files=files)
        result = response.json()

        # Remove the file after processing
        os.remove(file_path)

        # Return moderation result
        return {"moderation_result": result}

    except Exception as e:
        return {"error": f"Error processing image: {str(e)}"}
