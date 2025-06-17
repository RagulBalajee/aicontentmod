import React, { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");

  const handleUpload = async () => {
    if (!file) {
      alert("Please upload an image.");
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
      setResult(JSON.stringify(data, null, 2)); // Display formatted response
    } catch (error) {
      setResult("Error: Failed to connect to the server");
    }
  };

  return (
    <div className="container">
      <h1>AI Content Moderation</h1>
      <div className="upload-box">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleUpload}>Upload</button>
      </div>
      <div className="result-box">
        <h2>Moderation Result:</h2>
        <pre>{result}</pre>
      </div>
    </div>
  );
}

export default App;
