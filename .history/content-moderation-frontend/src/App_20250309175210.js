import React, { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");

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
      if (data.moderation_result) {
        setResult(`Moderation Result: ${JSON.stringify(data.moderation_result)}`);
      } else {
        setResult("Error: No response from server");
      }
    } catch (error) {
      setResult("Error: Failed to connect to server");
    }
  };

  return (
    <div className="container">
      <h1>AI Content Moderation</h1>
      
      <div className="upload-box">
        <input type="file" onChange={handleFileChange} id="fileInput" />
        <button onClick={handleUpload}>Upload</button>
      </div>

      {result && <p className="result">{result}</p>}
    </div>
  );
}

export default App;
