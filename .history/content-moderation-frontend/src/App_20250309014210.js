import React, { useState } from "react";
import "./styles.css";

function App() {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState("");
    const [imagePreview, setImagePreview] = useState("");

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);

        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setResult("Please select an image.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setResult("Analyzing...");

        try {
            const response = await fetch("http://127.0.0.1:8000/moderate-image", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (data.moderation_result) {
                setResult(`Result: ${JSON.stringify(data.moderation_result)}`);
            } else {
                setResult("Error processing image.");
            }
        } catch (error) {
            setResult("Failed to connect to the server.");
        }
    };

    return (
        <div className="container">
            <h1>AI Content Moderation</h1>
            <p className="subtitle">Upload an image and check for unsafe content</p>

            <div className="upload-box">
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <button onClick={handleUpload}>Upload & Analyze</button>
            </div>

            <div className="result-box">
                <h2>Moderation Result:</h2>
                <p>{result}</p>
                {imagePreview && <img src={imagePreview} alt="Uploaded" className="preview" />}
            </div>
        </div>
    );
}

export default App;
