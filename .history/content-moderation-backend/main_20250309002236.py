import requests
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os

app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Your DeepAI API Key (Replace with your actual API key)
DEEPAI_API_KEY = "your_deepai_api_key_here"

def analyze_image(file_path):
    try:
        with open(file_path, "rb") as image_file:
            response = requests.post(
                "https://api.deepai.org/api/nsfw-detector",
                files={"image": image_file},
                headers={"Api-Key": DEEPAI_API_KEY},
            )
            result = response.json()

        print("🔍 DeepAI API Response:", result)

        # If DeepAI returns an error
        if "err" in result:
            print("❌ DeepAI Error:", result["err"])
            return f"Error from DeepAI: {result['err']}"

        # If valid response, return NSFW score
        if "output" in result and "nsfw_score" in result["output"]:
            nsfw_score = result["output"]["nsfw_score"]
            return "Unsafe" if nsfw_score > 0.5 else "Safe"

        return "Error: Unexpected response format"

    except Exception as e:
        print(f"❌ Exception Error: {str(e)}")
        return f"Error: {str(e)}"

@app.post("/moderate/")
async def moderate_image(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    moderation_result = analyze_image(file_path)

    return {"moderation_result": moderation_result}
