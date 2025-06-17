import React, { useState, useRef } from "react";
import "./App.css";

function App() {
    const [file, setFile] = useState(null);
    const [moderationResult, setModerationResult] = useState(null);
    const [error, setError] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
        if (!validTypes.includes(selectedFile.type)) {
            setError("Please upload an image (JPEG, PNG, GIF) or video (MP4) file");
            return;
        }

        // Validate file size (20MB max)
        if (selectedFile.size > 20 * 1024 * 1024) {
            setError("File size too large (max 20MB)");
            return;
        }

        setFile(selectedFile);
        setError(null);
        setModerationResult(null);
        setPreviewUrl(URL.createObjectURL(selectedFile));
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first!");
            return;
        }

        setIsLoading(true);
        setProgress(0);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://127.0.0.1:8000/upload/", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to analyze content");
            }

            const data = await response.json();
            const moderationData = data.moderation_result;

            // Process both image and video responses
            let result = {};
            if (moderationData.summary) {
                // Video response
                result = {
                    status: moderationData.summary.decision === 'allowed' ? 'Safe' : 'Unsafe',
                    nudityScore: moderationData.summary.nudity,
                    weaponScore: moderationData.summary.weapon,
                    drugScore: moderationData.summary.drug,
                    violenceScore: moderationData.summary.violence,
                    goreScore: moderationData.summary.gore,
                    frames: moderationData.frames || []
                };
            } else {
                // Image response
                const nudityScore = 1 - (moderationData.nudity?.none || 1);
                const weaponScore = Math.max(...Object.values(moderationData.weapon?.classes || {}));
                result = {
                    status: (
                        nudityScore < 0.2 &&
                        weaponScore < 0.5 &&
                        (moderationData.recreational_drug?.prob || 0) < 0.5 &&
                        (moderationData.violence?.prob || 0) < 0.5 &&
                        (moderationData.gore?.prob || 0) < 0.5
                    ) ? 'Safe' : 'Unsafe',
                    nudityScore,
                    weaponScore,
                    drugScore: moderationData.recreational_drug?.prob || 0,
                    violenceScore: moderationData.violence?.prob || 0,
                    goreScore: moderationData.gore?.prob || 0,
                    frames: []
                };
            }

            setModerationResult(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
            setProgress(0);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="container">
            <h1>AI Content Moderation</h1>
            <p>Upload an image or video (MP4) to analyze for unsafe content</p>

            {/* File Input with Custom Button */}
            <div className="file-upload-container">
                <button className="custom-file-upload" onClick={triggerFileInput}>
                    Choose File
                </button>
                <input 
                    id="file-upload" 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange} 
                    accept="image/*,video/mp4,video/quicktime" 
                    style={{ display: 'none' }}
                />
                {file && (
                    <div className="file-info">
                        <span>{file.name}</span>
                        <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                )}
            </div>

            {/* Preview */}
            {previewUrl && (
                <div className="preview-container">
                    {file.type.startsWith('video') ? (
                        <video controls>
                            <source src={previewUrl} type={file.type} />
                            Your browser does not support videos.
                        </video>
                    ) : (
                        <img src={previewUrl} alt="Preview" />
                    )}
                </div>
            )}

            {/* Upload & Analyze Button */}
            <button 
                onClick={handleUpload} 
                disabled={!file || isLoading}
                className={isLoading ? 'loading' : ''}
            >
                {isLoading ? `Analyzing... ${progress}%` : 'Upload & Analyze'}
            </button>

            {/* Error Message */}
            {error && <p className="error-message">{error}</p>}

            {/* Loading Indicator */}
            {isLoading && (
                <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
            )}

            {/* Moderation Result */}
            {moderationResult && (
                <div className="result-box">
                    <h3>
                        Moderation Result:{" "}
                        <span className={moderationResult.status.toLowerCase()}>
                            {moderationResult.status}
                        </span>
                    </h3>
                    <div className="scores-grid">
                        <div className="score-item">
                            <label>Nudity Score:</label>
                            <span>{moderationResult.nudityScore.toFixed(3)}</span>
                        </div>
                        <div className="score-item">
                            <label>Weapon Score:</label>
                            <span>{moderationResult.weaponScore.toFixed(3)}</span>
                        </div>
                        <div className="score-item">
                            <label>Drug Score:</label>
                            <span>{moderationResult.drugScore.toFixed(3)}</span>
                        </div>
                        <div className="score-item">
                            <label>Violence Score:</label>
                            <span>{moderationResult.violenceScore.toFixed(3)}</span>
                        </div>
                        <div className="score-item">
                            <label>Gore Score:</label>
                            <span>{moderationResult.goreScore.toFixed(3)}</span>
                        </div>
                    </div>
                    
                    {moderationResult.frames.length > 0 && (
                        <div className="video-frames">
                            <h4>Key Frames Analysis:</h4>
                            <div className="frames-grid">
                                {moderationResult.frames.map((frame, index) => (
                                    <div key={index} className="frame-item">
                                        <p>Time: {frame.time}s</p>
                                        <p>Decision: <span className={frame.decision}>{frame.decision}</span></p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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