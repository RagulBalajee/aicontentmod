from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
API_KEY = "your_deepai_api_key"  # Replace with your actual API Key

@app.route("/")
def home():
    return jsonify({"message": "Content Moderation Backend Running"}), 200

# Route to handle file uploads
@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    # Check if it's an image or video
    file_ext = file.filename.split(".")[-1].lower()
    if file_ext in ["jpg", "jpeg", "png"]:
        return moderate_image(filepath)
    elif file_ext in ["mp4", "mov", "avi"]:
        return moderate_video(filepath)
    else:
        return jsonify({"error": "Unsupported file format"}), 400

# Function to moderate images using DeepAI
def moderate_image(filepath):
    url = "https://api.deepai.org/api/nsfw-detector"
    with open(filepath, "rb") as file:
        response = requests.post(
            url,
            files={"image": file},
            headers={"api-key": API_KEY}
        )

    if response.status_code == 200:
        result = response.json()
        return jsonify({"message": "Image processed", "result": result})
    else:
        return jsonify({"error": "Failed to process image"}), 500

# Function to moderate videos using DeepAI
def moderate_video(filepath):
    url = "https://api.deepai.org/api/content-moderation"
    with open(filepath, "rb") as file:
        response = requests.post(
            url,
            files={"video": file},
            headers={"api-key": API_KEY}
        )

    if response.status_code == 200:
        result = response.json()
        return jsonify({"message": "Video processed", "result": result})
    else:
        return jsonify({"error": "Failed to process video"}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
