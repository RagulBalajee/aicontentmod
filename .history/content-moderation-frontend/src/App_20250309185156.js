import React, { useState } from "react";

function App() {
    const [file, setFile] = useState(null);
    const [moderationResult, setModerationResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setErrorMessage("Please select a file.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://127.0.0.1:8000/moderate", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to fetch moderation result");
            }

            const result = await response.json();
            setModerationResult(result.moderation_result);
            setErrorMessage("");
        } catch (error) {
            setErrorMessage(error.message);
            setModerationResult(null);
        }
    };

    return (
        <div style={{ textAlign: "center", fontFamily: "Arial, sans-serif" }}>
            <h2 style={{ color: "#333" }}>AI Content Moderation</h2>
            <p>Upload an image and check for unsafe content</p>
            <input type="file" onChange={handleFileChange} />
            <button
                onClick={handleUpload}
                style={{
                    marginLeft: "10px",
                    padding: "10px",
                    backgroundColor: "#008CBA",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                }}
            >
                Upload & Analyze
            </button>

            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

            {moderationResult && (
                <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ddd", display: "inline-block" }}>
                    <h3>Moderation Scores:</h3>
                    <p><b>Nudity Content:</b> {moderationResult.nudity.toFixed(3)}</p>
                    <p><b>Weapon Content:</b> {moderationResult.weapon.toFixed(3)}</p>
                    <p><b>Drug Content:</b> {moderationResult.drugs.toFixed(3)}</p>
                    <p><b>Medical Content:</b> {moderationResult.medical.toFixed(3)}</p>
                    <p><b>Gore Content:</b> {moderationResult.gore.toFixed(3)}</p>
                    <p><b>Tobacco Content:</b> {moderationResult.tobacco.toFixed(3)}</p>
                    <p><b>Violence Content:</b> {moderationResult.violence.toFixed(3)}</p>
                    <p><b>Gambling Content:</b> {moderationResult.gambling.toFixed(3)}</p>
                </div>
            )}
        </div>
    );
}

export default App;
