from fastapi import FastAPI, File, UploadFile
import requests
import shutil
import os

# Initialize FastAPI
app = FastAPI()

# Replace with your **correct** SightEngine API credentials
SIGHTENGINE_API_USER = "your_api_user"
SIGHTENGINE_API_SECRET = "your_api_secret"
SIGHTENGINE_API_URL = "https://api.sightengine.com/1.0/check.json"

# Folder to temporarily store uploaded images
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.post("/moderate-image/")
async def moderate_image(file: UploadFile = File(...)):
    try:
        # Save the uploaded file locally
        file_location = f"{UPLOAD_FOLDER}/{file.filename}"
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Send the image to SightEngine API
        with open(file_location, "rb") as image_file:
            response = requests.post(
                SIGHTENGINE_API_URL,
                files={"media": image_file},
                data={
                    "models": "nudity-2.1,weapon,recreational_drug,medical,gore-2.0,tobacco,genai,violence,gambling",
                    "api_user": 917312070,
                    "api_secret": yrPC6cRnjoudj2b52jUMcVjbziwpLihN
                }
            )

        result = response.json()

        # Delete the image after processing
        os.remove(file_location)

        # Check for errors
        if "error" in result:
            return {"error": result["error"]["message"]}

        # Extract moderation results
        return {"moderation_result": result}

    except Exception as e:
        return {"error": f"Error processing image: {str(e)}"}
