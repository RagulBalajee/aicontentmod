import React, { useState } from "react";

function App() {
    const [image, setImage] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (event) => {
        setImage(event.target.files[0]);
        setError(null);
        setResult(null);
    };

    const handleUpload = async () => {
        if (!image) {
            setError("Please select an image.");
            return;
        }

        const formData = new FormData();
        formData.append("image", image);

        try {
            const response = await fetch("http://localhost:5000/upload", {
                method: "POST",
                body: formData,
                headers: {
                    "Accept": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to analyze image.");
            }

            const data = await response.json();
            setResult(data);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1 style={{ color: "orange" }}>AI Content Moderation</h1>
            <p>Upload an image and check for unsafe content</p>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload} style={{ marginLeft: "10px", background: "green", color: "white", padding: "10px" }}>
                Upload & Analyze
            </button>

            {error && <p style={{ color: "red" }}>Error: {error}</p>}

            {result && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Analysis Result:</h3>
                    <p>Nudity Score: {result.nudity.toFixed(2)}%</p>
                    <p>Safe: {result.safe ? "✅ Yes" : "❌ No"}</p>
                </div>
            )}
        </div>
    );
}

export default App;
