import React, { useState, useRef } from "react";
import * as nsfwjs from "nsfwjs";

const App = () => {
  const [message, setMessage] = useState("Upload an image to check NSFW content.");
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);

  // Function to handle file selection
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const imgURL = URL.createObjectURL(file);
    setImageSrc(imgURL); // Display the uploaded image

    const img = new Image();
    img.src = imgURL;
    img.onload = async () => {
      const model = await nsfwjs.load();
      const predictions = await model.classify(img);

      console.log(predictions);

      const nsfwProb = predictions.find(p => p.className === "Porn" || p.className === "Hentai");
      if (nsfwProb && nsfwProb.probability > 0.5) {
        setMessage("❌ NSFW Content Detected! Probability: " + (nsfwProb.probability * 100).toFixed(2) + "%");
      } else {
        setMessage("✅ Safe Content! Probability: " + ((1 - nsfwProb?.probability) * 100).toFixed(2) + "%");
      }
    };
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>NSFW Content Moderator</h1>
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
      <p>{message}</p>
      {imageSrc && <img ref={imgRef} src={imageSrc} alt="Uploaded" style={{ maxWidth: "400px", marginTop: "20px" }} />}
    </div>
  );
};

export default App;
