import React, { useState, useRef } from "react";
import * as nsfwjs from "nsfwjs";

function App() {
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  let model = null;

  // Load NSFWJS Model
  const loadModel = async () => {
    if (!model) {
      model = await nsfwjs.load();
    }
  };

  // Handle Image Upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      setImagePreview(e.target.result);

      // Load model and classify image
      await loadModel();
      const img = document.createElement("img");
      img.src = e.target.result;
      img.onload = async () => {
        const predictions = await model.classify(img);
        console.log(predictions);

        // Check NSFW score
        const nsfwScore = predictions.find((p) => p.className === "Porn")?.probability || 0;
        if (nsfwScore > 0.7) {
          setMessage("❌ NSFW Content Detected!");
        } else {
          setMessage("✅ Safe Content!");
        }
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>NSFW Image Detector</h2>
      <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} />
      <div>
        {imagePreview && <img src={imagePreview} alt="Uploaded" style={{ width: "300px", marginTop: "10px" }} />}
      </div>
      <h3>{message}</h3>
    </div>
  );
}

export default App;
