from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import cv2
import numpy as np
import tensorflow as tf

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load NSFW detection model (pre-trained)
model = tf.keras.models.load_model("nsfw_model.h5")  # Load your trained NSFW model

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

# Function to moderate images using a local NSFW model
def moderate_image(filepath):
    img = cv2.imread(filepath)
    img = cv2.resize(img, (224, 224))  # Resize to match model input size
    img = np.expand_dims(img, axis=0) / 255.0  # Normalize

    prediction = model.predict(img)[0][0]  # Get NSFW probability

    if prediction > 0.5:
        return jsonify({"message": "NSFW content detected", "nsfw_score": float(prediction)})
    else:
        return jsonify({"message": "Safe content", "nsfw_score": float(prediction)})

# Function to moderate videos by analyzing frames
def moderate_video(filepath):
    cap = cv2.VideoCapture(filepath)
    frame_count = 0
    nsfw_frames = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.resize(frame, (224, 224))  # Resize
        frame = np.expand_dims(frame, axis=0) / 255.0  # Normalize
        prediction = model.predict(frame)[0][0]  # Predict NSFW

        frame_count += 1
        if prediction > 0.5:
            nsfw_frames += 1

    cap.release()
    nsfw_ratio = nsfw_frames / frame_count if frame_count > 0 else 0

    if nsfw_ratio > 0.2:  # If more than 20% frames are NSFW
        return jsonify({"message": "NSFW video detected", "nsfw_ratio": nsfw_ratio})
    else:
        return jsonify({"message": "Safe video", "nsfw_ratio": nsfw_ratio})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
