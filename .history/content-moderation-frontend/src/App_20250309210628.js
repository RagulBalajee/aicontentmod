import React, { useState } from "react";
import "./App.css";

function App() {
    const [file, setFile] = useState(null);
    const [moderationResult, setModerationResult] = useState(null);
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
            const moderationData = data.moderation_result;

            // Extract key values
            const nudityScore = 1 - moderationData.nudity.none;
            const weaponScore = Math.max(...Object.values(moderationData.weapon.classes));
            const drugScore = moderationData.recreational_drug.prob;
            const violenceScore = moderationData.violence.prob;
            const goreScore = moderationData.gore.prob;

            // Determine Safe/Unsafe (Threshold = 0.5)
            const isSafe =
                nudityScore < 0.2 &&
                weaponScore < 0.5 &&
                drugScore < 0.5 &&
                violenceScore < 0.5 &&
                goreScore < 0.5;

            const status = isSafe ? "Safe" : "Unsafe";

            setModerationResult({
                status,
                nudityScore,
                weaponScore,
                drugScore,
                violenceScore,
                goreScore,
            });

            setError(null);
        } catch (err) {
            setError("Error: " + err.message);
        }
    };

    return (
        <div className="container">
            <h1>AI Content Moderation</h1>
            <p>Upload an image and check for unsafe content</p>

            <label htmlFor="file-upload" className="custom-file-upload">
                Choose File
            </label>
            <input id="file-upload" type="file" onChange={handleFileChange} accept="image/*" />

            <button onClick={handleUpload}>Upload & Analyze</button>

            {error && <p className="error-message">{error}</p>}

            {moderationResult && (
                <div className="result-box">
                    <h3>
                        Moderation Result:{" "}
                        <span style={{ color: moderationResult.status === "Safe" ? "green" : "red" }}>
                            {moderationResult.status}
                        </span>
                    </h3>
                    <p>
                        <strong>Nudity Score:</strong> {moderationResult.nudityScore.toFixed(3)}
                    </p>
                    <p>
                        <strong>Weapon Score:</strong> {moderationResult.weaponScore.toFixed(3)}
                    </p>
                    <p>
                        <strong>Drug Score:</strong> {moderationResult.drugScore.toFixed(3)}
                    </p>
                    <p>
                        <strong>Violence Score:</strong> {moderationResult.violenceScore.toFixed(3)}
                    </p>
                    <p>
                        <strong>Gore Score:</strong> {moderationResult.goreScore.toFixed(3)}
                    </p>
                </div>
            )}
        </div>
    );
}

export default App;