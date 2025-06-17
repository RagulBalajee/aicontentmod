// Import React and necessary libraries
import React, { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as nsfwjs from "nsfwjs";

const App = () => {
  const [model, setModel] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState("");

  // Load the NSFW model on component mount
  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await nsfwjs.load();
      setModel(loadedModel);
      console.log("NSFW Model Loaded Successfully!");
    };
    loadModel();
  }, []);

  // Function to handle image upload
  const analyzeImage = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      alert("Please select an image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      setImagePreview(e.target.result);

      // Create an image element
      const img = new Image();
      img.src = e.target.result;
      img.onload = async () => {
        if (model) {
          const predictions = await model.classify(img);
          console.log("Predictions:", predictions);

          // Check NSFW probability
          const nsfwPrediction = predictions.find(
            (p) => p.className === "Porn" || p.className === "Sexy"
          );

          if (nsfwPrediction && nsfwPrediction.probability > 0.5) {
            setResult("NSFW Content Detected!");
          } else {
            setResult("Safe Content");
          }
        }
      };
    };

    reader.readAsDataURL(file);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>NSFW Image Detection</h1>
      <input type="file" accept="image/*" onChange={analyzeImage} />
      {imagePreview && <img src={imagePreview} alt="Uploaded" style={{ width: "300px", marginTop: "20px" }} />}
      {result && <h2 style={{ color: result.includes("NSFW") ? "red" : "green" }}>{result}</h2>}
    </div>
  );
};

export default App;
