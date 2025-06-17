import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setError("");
    setResult("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data.message || "Upload successful!");
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
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
          cursor: "pointer",
          border: "none",
          borderRadius: "5px",
        }}
      >
        {loading ? "Uploading..." : "Upload & Analyze"}
      </button>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      {result && <p style={{ color: "blue", marginTop: "10px" }}>{result}</p>}
    </div>
  );
}

export default App;
