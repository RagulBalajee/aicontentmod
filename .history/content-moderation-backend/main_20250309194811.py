from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app, resources={r"/upload": {"origins": "http://localhost:3000"}})  # Allow frontend access

DEEPAI_API_KEY = "your_deepai_api_key"

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']

    try:
        # Send image to DeepAI NSFW detection API
        response = requests.post(
            "https://api.deepai.org/api/nsfw-detector",
            files={"image": file},
            headers={"api-key": DEEPAI_API_KEY}
        )
        response.raise_for_status()
        result = response.json()
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "DeepAI API request failed", "details": str(e)}), 500

    # Extract NSFW score and convert it to percentage
    nudity_score = result.get('output', {}).get('nsfw_score', 1) * 100
    is_safe = nudity_score < 20

    return jsonify({
        "nudity_score": nudity_score,
        "is_safe": is_safe,
        "message": "Safe Image" if is_safe else "Unsafe Image"
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
