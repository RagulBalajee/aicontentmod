import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setError("");
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
        headers: {
          // "Content-Type": "multipart/form-data", // Don't set this manually for FormData
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await response.json();
      setResult(data);
      setError("");
    } catch (err) {
      setError("Error: Failed to connect to the server.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1 style={{ color: "orange" }}>AI Content Moderation</h1>
      <p>Upload an image and check for unsafe content</p>

      <input type="file" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        style={{
          backgroundColor: "green",
          color: "white",
          padding: "10px 15px",
          marginLeft: "10px",
          border: "none",
          cursor: "pointer",
        }}
      >
        Upload & Analyze
      </button>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      {result && <p style={{ color: "blue", marginTop: "10px" }}>Result: {JSON.stringify(result)}</p>}
    </div>
  );
}

export default App;
