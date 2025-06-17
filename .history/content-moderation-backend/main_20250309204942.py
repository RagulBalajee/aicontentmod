from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

# SightEngine API Credentials
SIGHTENGINE_API_USER = "917312070"
SIGHTENGINE_API_SECRET = "yrPC6cRnjoudj2b52jUMcVjbziwpLihN"
SIGHTENGINE_API_URL = "https://api.sightengine.com/1.0/check.json"

@app.route("/upload", methods=["POST"])
def upload_image():
    try:
        # Ensure an image file is uploaded
        if "image" not in request.files:
            return jsonify({"error": "No image file uploaded"}), 400
        
        image = request.files["image"]
        
        # Prepare API request
        files = {"media": image}
        data = {
            "models": "nudity-2.1,weapon,recreational_drug,medical,gore-2.0,tobacco,genai,violence,gambling",
            "api_user": SIGHTENGINE_API_USER,
            "api_secret": SIGHTENGINE_API_SECRET
        }
        
        # Call SightEngine API
        response = requests.post(SIGHTENGINE_API_URL, files=files, data=data)
        result = response.json()

        # Error handling
        if "error" in result:
            return jsonify({"error": result["error"]["message"]}), 400

        # Extract relevant moderation scores
        nudity_score = round(1 - result["nudity"]["none"], 3)  # Modified nudity calculation
        weapon_score = round(sum(result["weapon"]["classes"].values()), 3)
        drug_score = round(result["recreational_drug"]["prob"], 3)
        medical_score = round(result["medical"]["prob"], 3)
        gore_score = round(result["gore"]["prob"], 3)
        tobacco_score = round(result["tobacco"]["prob"], 3)
        violence_score = round(result["violence"]["prob"], 3)
        gambling_score = round(result["gambling"]["prob"], 3)

        # Determine safety status
        is_safe = nudity_score < 0.2 and weapon_score < 0.2 and drug_score < 0.2 and gore_score < 0.2
        safety_status = "✅ Safe" if is_safe else "⚠️ Unsafe"

        # Return response
        return jsonify({
            "status": "success",
            "safety_status": safety_status,
            "scores": {
                "Nudity": nudity_score,
                "Weapon": weapon_score,
                "Drug": drug_score,
                "Medical": medical_score,
                "Gore": gore_score,
                "Tobacco": tobacco_score,
                "Violence": violence_score,
                "Gambling": gambling_score
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
