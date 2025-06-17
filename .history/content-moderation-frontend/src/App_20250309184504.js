import React, { useState } from "react";

function App() {
    const [file, setFile] = useState(null);
    const [moderationResult, setModerationResult] = useState(null);
    const [statusMessage, setStatusMessage] = useState("");
    const [error, setError] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://127.0.0.1:8000/upload/", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to fetch");
            }

            const data = await response.json();
            setModerationResult(data.moderation_result);
            setError(null);

            // ✅ Determine safety status
            const nudityScore = data.moderation_result?.nudity?.none || 0;
            if (nudityScore > 0.95) {
                setStatusMessage("✅ This image is SAFE.");
            } else {
                setStatusMessage("❌ This image is UNSAFE.");
            }

        } catch (err) {
            setError("Error: " + err.message);
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "30px", fontFamily: "Arial, sans-serif" }}>
            <h1 style={{ color: "#ff6600" }}>AI Content Moderation</h1>
            <p>Upload an image and check for unsafe content</p>

            <input type="file" onChange={handleFileChange} accept="image/*" />
            <button
                onClick={handleUpload}
                style={{
                    marginLeft: "10px",
                    padding: "10px 15px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                }}
            >
                Upload & Analyze
            </button>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {statusMessage && (
                <h2 style={{ marginTop: "20px", color: statusMessage.includes("SAFE") ? "green" : "red" }}>
                    {statusMessage}
                </h2>
            )}

            {moderationResult && (
                <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
                    <h3>Moderation Scores:</h3>
                    <ul style={{ textAlign: "left", listStyleType: "none", padding: 0 }}>
                        <li><strong>Nudity Content:</strong> {moderationResult.nudity.none.toFixed(2)}</li>
                        <li><strong>Weapon Content:</strong> {moderationResult.weapon.classes.firearm.toFixed(2)}</li>
                        <li><strong>Drug Content:</strong> {moderationResult.recreational_drug.prob.toFixed(2)}</li>
                        <li><strong>Medical Content:</strong> {moderationResult.medical.prob.toFixed(2)}</li>
                        <li><strong>Gore Content:</strong> {moderationResult.gore.prob.toFixed(2)}</li>
                        <li><strong>Tobacco Content:</strong> {moderationResult.tobacco.prob.toFixed(2)}</li>
                        <li><strong>Violence Content:</strong> {moderationResult.violence.prob.toFixed(2)}</li>
                        <li><strong>Gambling Content:</strong> {moderationResult.gambling.prob.toFixed(2)}</li>
                    </ul>
                </div>
            )}
        </div>
    );
}

export default App;
