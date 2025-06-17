from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

DEEPAI_API_KEY = "YOUR_DEEPAI_API_KEY"  # Replace with your actual DeepAI API Key

@app.route("/upload", methods=["POST"])
def upload_file():
    if "image" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    image = request.files["image"]

    # Send the image to DeepAI API
    try:
        response = requests.post(
            "https://api.deepai.org/api/nsfw-detector",
            files={"image": image},
            headers={"api-key": DEEPAI_API_KEY}
        )
        result = response.json()

        if "output" not in result:
            return jsonify({"error": "Invalid response from DeepAI"}), 500

        nudity_score = result["output"]["nsfw_score"] * 100  # Convert to percentage

        return jsonify({
            "nudity": nudity_score,
            "safe": nudity_score < 20  # Safe if nudity is < 20%
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
