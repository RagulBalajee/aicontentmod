import React, { useState } from "react";
import "./App.css";

function App() {
    const [file, setFile] = useState(null);
    const [moderationResult, setModerationResult] = useState(null);
    const [error, setError] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        setError(null);
        setModerationResult(null);
        
        // Create preview for images and videos
        if (selectedFile) {
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
        }
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

            // Extract key values - handle both image and video responses
            const nudityScore = moderationData.nudity ? (1 - moderationData.nudity.none) : 
                              (moderationData.nudity_prob || 0);
            const weaponScore = moderationData.weapon ? Math.max(...Object.values(moderationData.weapon.classes)) : 
                              (moderationData.weapon_prob || 0);
            const drugScore = moderationData.recreational_drug ? moderationData.recreational_drug.prob : 
                            (moderationData.drug_prob || 0);
            const violenceScore = moderationData.violence ? moderationData.violence.prob : 
                                (moderationData.violence_prob || 0);
            const goreScore = moderationData.gore ? moderationData.gore.prob : 
                            (moderationData.gore_prob || 0);

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
            <p>Upload an image or video and check for unsafe content</p>

            {/* File Input with Custom Button */}
            <label htmlFor="file-upload" className="custom-file-upload">
                Choose File
            </label>
            <input 
                id="file-upload" 
                type="file" 
                onChange={handleFileChange} 
                accept="image/*,video/*" 
            />
            {file && <p style={{ color: "#fff", marginTop: "10px" }}>{file.name}</p>}

            {/* Preview */}
            {previewUrl && (
                <div style={{ margin: "20px 0", maxWidth: "100%" }}>
                    {file.type.startsWith('video/') ? (
                        <video 
                            controls 
                            style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "10px" }}
                        >
                            <source src={previewUrl} type={file.type} />
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <img 
                            src={previewUrl} 
                            alt="Preview" 
                            style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "10px" }} 
                        />
                    )}
                </div>
            )}

            {/* Upload & Analyze Button */}
            <button onClick={handleUpload}>Upload & Analyze</button>

            {/* Error Message */}
            {error && <p className="error-message">{error}</p>}

            {/* Moderation Result */}
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

            {/* Footer */}
            <footer>
                <p>Made by <strong>Ragul Balajee GK</strong></p>
            </footer>
        </div>
    );
}

export default App;