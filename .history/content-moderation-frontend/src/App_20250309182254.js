import React, { useState } from "react";
import "./App.css";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setResult(""); // Clear previous result
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/moderate-image/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setLoading(false);

      if (data.moderation_result) {
        setResult(JSON.stringify(data.moderation_result, null, 2));
      } else {
        setResult("Error: No response received.");
      }
    } catch (error) {
      setLoading(false);
      setResult(`Error: ${error.message}`);
    }
  };

  return (
    <div className="container">
      <h1>AI Content Moderation</h1>
      <p>Upload an image and check for unsafe content</p>

      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Analyzing..." : "Upload & Analyze"}
      </button>

      <div className="result-box">
        <h3>Moderation Result:</h3>
        <pre>{result || "No file uploaded yet."}</pre>
      </div>
    </div>
  );
}

export default App;
