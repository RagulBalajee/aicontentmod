from flask import Flask, request, jsonify
import requests
import os

app = Flask(__name__)

DEEPAI_API_KEY = "your_deepai_api_key"  # Replace with your DeepAI API Key

@app.route("/analyze", methods=["POST"])
def analyze_content():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    file_ext = file.filename.split(".")[-1].lower()
    
    # Save the file temporarily
    file_path = f"temp.{file_ext}"
    file.save(file_path)

    # Decide API endpoint based on file type
    if file_ext in ["jpg", "jpeg", "png", "gif"]:
        deepai_url = "https://api.deepai.org/api/nsfw-detector"
    elif file_ext in ["mp4", "mov", "avi"]:
        deepai_url = "https://api.deepai.org/api/content-moderation"
    else:
        return jsonify({"error": "Unsupported file format"}), 400

    try:
        response = requests.post(
            deepai_url,
            files={"image": open(file_path, "rb")},
            headers={"api-key": DEEPAI_API_KEY}
        )
        os.remove(file_path)  # Clean up temporary file

        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({"error": "Failed to process file"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
