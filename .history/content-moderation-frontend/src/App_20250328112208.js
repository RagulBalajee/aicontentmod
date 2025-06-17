import React, { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    
    if (selectedFile.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(selectedFile));
    } else if (selectedFile.type.startsWith("video/")) {
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const analyzeFile = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>AI Content Moderation</h1>
      <p className="subtitle">Upload an image or video for analysis</p>

      <input type="file" accept="image/*,video/*" onChange={handleFileChange} />

      {preview && (
        <div className="media-preview">
          {file.type.startsWith("image/") ? (
            <img src={preview} alt="Preview" />
          ) : (
            <video controls>
              <source src={preview} type={file.type} />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      )}

      <button className="analyze-btn" onClick={analyzeFile} disabled={!file || loading}>
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {result && (
        <div className="result-card">
          <h3>{result.type.toUpperCase()} Analysis Result</h3>
          <p>{result.message}</p>
        </div>
      )}
    </div>
  );
}

export default App;
