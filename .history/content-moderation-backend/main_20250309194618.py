from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# DeepAI API Key (Replace with your own API key)
DEEPAI_API_KEY = "your_deepai_api_key"

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']

    # Send the file to DeepAI's NSFW detection API
    response = requests.post(
        "https://api.deepai.org/api/nsfw-detector",
        files={"image": file},
        headers={"api-key": DEEPAI_API_KEY}
    )

    if response.status_code != 200:
        return jsonify({"error": "Failed to analyze image"}), 500

    result = response.json()
    nudity_score = result.get('output', {}).get('nsfw_score', 1) * 100  # Convert to percentage

    # Check if the image is safe (Nudity < 20%)
    is_safe = nudity_score < 20

    return jsonify({
        "nudity_score": nudity_score,
        "is_safe": is_safe,
        "message": "Safe Image" if is_safe else "Unsafe Image"
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
