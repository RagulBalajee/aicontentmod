import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        if (data.nudity < 20) {
          setMessage("✅ Safe Image");
        } else {
          setMessage("❌ Unsafe Image");
        }
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage("Error: Failed to connect to server");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2 style={{ color: "orange" }}>AI Content Moderation</h2>
      <p>Upload an image and check for unsafe content</p>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} style={{ marginLeft: "10px", padding: "5px 10px", backgroundColor: "green", color: "white" }}>
        Upload & Analyze
      </button>
      <p style={{ color: "red" }}>{message}</p>
    </div>
  );
}

export default App;
