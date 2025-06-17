from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

DEEPAI_API_KEY = "your_deepai_api_key"  # Replace with your actual DeepAI API key

@app.route("/analyze", methods=["POST"])
def analyze_content():
    print("Request received.")

    # Check if file is included
    if "file" not in request.files:
        print("No file found in request.")
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    file_ext = file.filename.split(".")[-1].lower()
    file_path = f"temp.{file_ext}"
    file.save(file_path)

    print(f"Saved file: {file_path}")

    # Verify the file exists
    if not os.path.exists(file_path):
        print("File saving failed.")
        return jsonify({"error": "File not saved"}), 500

    # Choose API based on file type
    if file_ext in ["jpg", "jpeg", "png", "gif"]:
        deepai_url = "https://api.deepai.org/api/nsfw-detector"
        file_key = "image"
    elif file_ext in ["mp4", "mov", "avi"]:
        deepai_url = "https://api.deepai.org/api/content-moderation"
        file_key = "image"
    else:
        print("Unsupported file format:", file_ext)
        return jsonify({"error": "Unsupported file format"}), 400

    try:
        with open(file_path, "rb") as f:
            response = requests.post(
                deepai_url,
                files={file_key: f},
                headers={"api-key": DEEPAI_API_KEY},
            )

        os.remove(file_path)  # Delete temp file

        if response.status_code == 200:
            print("DeepAI Response:", response.json())
            return jsonify(response.json())
        else:
            print("DeepAI Error:", response.text)
            return jsonify({"error": "Failed to process file"}), 500
    except Exception as e:
        print("Exception:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
