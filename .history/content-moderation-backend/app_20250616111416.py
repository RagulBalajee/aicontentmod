import os
import cv2
import requests
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import SIGHTENGINE_API_USER, SIGHTENGINE_API_SECRET

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # ✅ Fix CORS issue

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

SIGHTENGINE_URL = "https://api.sightengine.com/1.0/check.json"

# Allowed file extensions
ALLOWED_IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'}
ALLOWED_VIDEO_EXTENSIONS = {'.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv'}

def allowed_file(filename, allowed_extensions):
    """Check if file extension is allowed."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {ext[1:] for ext in allowed_extensions}

def analyze_image(image_path):
    """Send image to SightEngine API and return moderation result."""
    params = {
        "models": "nudity,weapon,violence,gore",
        "api_user": SIGHTENGINE_API_USER,
        "api_secret": SIGHTENGINE_API_SECRET
    }
    
    try:
        with open(image_path, "rb") as f:
            files = {"media": f}
            response = requests.post(SIGHTENGINE_URL, files=files, data=params, timeout=30)
            data = response.json()
    except requests.exceptions.Timeout:
        return {"error": "API request timed out"}
    except requests.exceptions.RequestException as e:
        return {"error": f"API request failed: {str(e)}"}
    except Exception as e:
        return {"error": f"File processing error: {str(e)}"}
    
    if "error" in data:
        print(f"🚨 SightEngine API Error: {data['error']}")
        return {"error": f"SightEngine API failed: {data['error']}"}

    # Extract probabilities
    violence_prob = data.get("violence", {}).get("prob", 0)
    gore_prob = data.get("gore", {}).get("prob", 0)
    weapon_prob = data.get("weapon", {}).get("classes", {}).get("knife", 0)
    nudity_prob = data.get("nudity", {}).get("prob", 0)

    # ✅ Adjusted thresholds for better detection
    if gore_prob > 0.3 or data.get("gore", {}).get("classes", {}).get("very_bloody", 0) > 0.4:
        return {"status": "unsafe", "reason": "Gore Detected", "confidence": f"{gore_prob:.2%}"}
    if violence_prob > 0.3 or data.get("violence", {}).get("classes", {}).get("physical_violence", 0) > 0.4:
        return {"status": "unsafe", "reason": "Violence Detected", "confidence": f"{violence_prob:.2%}"}
    if weapon_prob > 0.3:
        return {"status": "unsafe", "reason": "Weapon Detected", "confidence": f"{weapon_prob:.2%}"}
    if nudity_prob > 0.5:
        return {"status": "unsafe", "reason": "Inappropriate Content Detected", "confidence": f"{nudity_prob:.2%}"}

    return {"status": "safe", "confidence": "100%"}

def extract_video_frames(video_path, max_frames=10):
    """Extract frames from a video and save them."""
    cap = cv2.VideoCapture(video_path)
    frame_count = 0
    frames = []
    
    # Get video properties
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    
    # Calculate frame interval to sample evenly
    if total_frames > max_frames:
        interval = total_frames // max_frames
    else:
        interval = 1
    
    while cap.isOpened() and frame_count < max_frames:
        ret, frame = cap.read()
        if not ret:
            break

        # Sample frames at intervals
        if frame_count % interval == 0:
            frame_path = os.path.join(UPLOAD_FOLDER, f"frame_{frame_count}.jpg")
            cv2.imwrite(frame_path, frame)
            frames.append(frame_path)

        frame_count += 1

    cap.release()
    return frames

@app.route("/upload", methods=["POST"])
def upload_file():
    """Handle file upload and moderation."""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    # Check file extension
    if not allowed_file(file.filename, ALLOWED_IMAGE_EXTENSIONS | ALLOWED_VIDEO_EXTENSIONS):
        return jsonify({"error": "Unsupported file format. Please upload images (PNG, JPG, JPEG, GIF, BMP, WEBP) or videos (MP4, AVI, MOV, MKV, WMV, FLV)"}), 400

    # Check file size (limit to 50MB)
    file.seek(0, 2)  # Seek to end
    file_size = file.tell()
    file.seek(0)  # Reset to beginning
    
    if file_size > 50 * 1024 * 1024:  # 50MB limit
        return jsonify({"error": "File too large. Maximum size is 50MB"}), 400

    filename = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filename)

    try:
        # ✅ Check if file is image or video
        if allowed_file(file.filename, ALLOWED_IMAGE_EXTENSIONS):
            result = analyze_image(filename)
            if "error" not in result:
                result["file_type"] = "image"
            return jsonify(result)
        elif allowed_file(file.filename, ALLOWED_VIDEO_EXTENSIONS):
            frames = extract_video_frames(filename)
            if not frames:
                return jsonify({"error": "Could not extract frames from video"}), 400
                
            for i, frame in enumerate(frames):
                result = analyze_image(frame)
                if "error" in result:
                    return jsonify(result), 500
                if result["status"] == "unsafe":
                    # Clean up frames
                    for frame_path in frames:
                        if os.path.exists(frame_path):
                            os.remove(frame_path)
                    result["file_type"] = "video"
                    result["frame_analyzed"] = i + 1
                    return jsonify(result)  # Return immediately if an unsafe frame is found
            
            # Clean up frames
            for frame_path in frames:
                if os.path.exists(frame_path):
                    os.remove(frame_path)
            return jsonify({"status": "safe", "file_type": "video", "frames_analyzed": len(frames)})

    except Exception as e:
        return jsonify({"error": f"Processing error: {str(e)}"}), 500
    finally:
        # Clean up uploaded file
        if os.path.exists(filename):
            os.remove(filename)

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "healthy", "service": "content-moderation-api"})

@app.errorhandler(Exception)
def handle_exception(e):
    """Handle unexpected errors and return a detailed response."""
    return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
