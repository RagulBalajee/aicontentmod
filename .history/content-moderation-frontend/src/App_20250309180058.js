import React, { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [moderationResult, setModerationResult] = useState("No file uploaded yet.");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/moderate-image/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setModerationResult(data.moderation_result || "Error processing image");
    } catch (error) {
      console.error("Error:", error);
      setModerationResult("Failed to process image.");
    }
  };

  return (
    <div className="container">
      <h1>AI Content Moderation</h1>
      <p>Upload an image and check for unsafe content</p>
      
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload & Analyze</button>

      <h3>Moderation Result:</h3>
      <p>{moderationResult}</p>
    </div>
  );
}

export default App;
