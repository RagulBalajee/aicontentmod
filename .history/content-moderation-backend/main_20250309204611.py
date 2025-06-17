from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

SIGHTENGINE_API_USER = "917312070"
SIGHTENGINE_API_SECRET = "yrPC6cRnjoudj2b52jUMcVjbziwpLihN"

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    image = request.files['image']
    
    # Send image to SightEngine API for moderation
    response = requests.post(
        "https://api.sightengine.com/1.0/check.json",
        files={'media': image},
        data={
            'models': 'nudity-2.1,weapon,recreational_drug,medical,gore-2.0,tobacco,genai,violence,gambling',
            'api_user': SIGHTENGINE_API_USER,
            'api_secret': SIGHTENGINE_API_SECRET
        }
    )

    moderation_result = response.json()

    if moderation_result.get('status') != 'success':
        return jsonify({'error': 'Failed to analyze image'}), 500

    # Extract scores
    nudity_score = moderation_result.get("nudity", {}).get("none", 0.99)
    weapon_score = moderation_result.get("weapon", {}).get("classes", {}).get("firearm", 0.00)
    drug_score = moderation_result.get("recreational_drug", {}).get("prob", 0.00)
    medical_score = moderation_result.get("medical", {}).get("prob", 0.00)
    gore_score = moderation_result.get("gore", {}).get("prob", 0.00)
    tobacco_score = moderation_result.get("tobacco", {}).get("prob", 0.00)
    violence_score = moderation_result.get("violence", {}).get("prob", 0.00)
    gambling_score = moderation_result.get("gambling", {}).get("prob", 0.00)

    # **Invert Nudity Score**
    adjusted_nudity_score = 1 - nudity_score

    # Determine if image is safe
    is_safe = (
        adjusted_nudity_score < 0.20 and
        weapon_score < 0.10 and
        drug_score < 0.10 and
        medical_score < 0.10 and
        gore_score < 0.10 and
        tobacco_score < 0.10 and
        violence_score < 0.10 and
        gambling_score < 0.10
    )

    result = {
        "moderation_result": "SAFE" if is_safe else "UNSAFE",
        "nudity_score": round(adjusted_nudity_score, 3),
        "weapon_score": round(weapon_score, 3),
        "drug_score": round(drug_score, 3),
        "medical_score": round(medical_score, 3),
        "gore_score": round(gore_score, 3),
        "tobacco_score": round(tobacco_score, 3),
        "violence_score": round(violence_score, 3),
        "gambling_score": round(gambling_score, 3),
    }

    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
