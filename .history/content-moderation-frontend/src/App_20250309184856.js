import React, { useState } from "react";

function App() {
    const [file, setFile] = useState(null);
    const [moderationResult, setModerationResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file first!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://127.0.0.1:8000/moderate", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.moderation_result.status === "success") {
                setModerationResult(data.moderation_result);
                setError(null);
            } else {
                setError("Error processing image");
                setModerationResult(null);
            }
        } catch (err) {
            setError("Failed to fetch moderation result");
            setModerationResult(null);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>AI Content Moderation</h1>
            <p>Upload an image and check for unsafe content</p>

            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload} style={styles.button}>
                Upload & Analyze
            </button>

            {error && <p style={styles.error}>{error}</p>}

            {moderationResult && (
                <div style={styles.resultContainer}>
                    <h3>Moderation Result:</h3>
                    <p style={{ color: "green", fontWeight: "bold" }}>✅ This image is SAFE.</p>

                    <h3>Moderation Scores:</h3>
                    <ul style={styles.list}>
                        <li>
                            <strong>Nudity Detected:</strong>{" "}
                            <span style={getColorStyle(1 - moderationResult.nudity.none)}>
                                {(1 - moderationResult.nudity.none).toFixed(2)}
                            </span>
                        </li>
                        <li>
                            <strong>Weapon Content:</strong>{" "}
                            <span style={getColorStyle(moderationResult.weapon.classes.firearm)}>
                                {moderationResult.weapon.classes.firearm.toFixed(2)}
                            </span>
                        </li>
                        <li>
                            <strong>Drug Content:</strong>{" "}
                            <span style={getColorStyle(moderationResult.recreational_drug.prob)}>
                                {moderationResult.recreational_drug.prob.toFixed(2)}
                            </span>
                        </li>
                        <li>
                            <strong>Medical Content:</strong>{" "}
                            <span style={getColorStyle(moderationResult.medical.prob)}>
                                {moderationResult.medical.prob.toFixed(2)}
                            </span>
                        </li>
                        <li>
                            <strong>Gore Content:</strong>{" "}
                            <span style={getColorStyle(moderationResult.gore.prob)}>
                                {moderationResult.gore.prob.toFixed(2)}
                            </span>
                        </li>
                        <li>
                            <strong>Tobacco Content:</strong>{" "}
                            <span style={getColorStyle(moderationResult.tobacco.prob)}>
                                {moderationResult.tobacco.prob.toFixed(2)}
                            </span>
                        </li>
                        <li>
                            <strong>Violence Content:</strong>{" "}
                            <span style={getColorStyle(moderationResult.violence.prob)}>
                                {moderationResult.violence.prob.toFixed(2)}
                            </span>
                        </li>
                        <li>
                            <strong>Gambling Content:</strong>{" "}
                            <span style={getColorStyle(moderationResult.gambling.prob)}>
                                {moderationResult.gambling.prob.toFixed(2)}
                            </span>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}

// 🟢🔴 **Function to Set Colors for Different Levels of Content**
const getColorStyle = (value) => ({
    color: value > 0.2 ? "red" : "green",
    fontWeight: "bold",
});

// 🎨 **CSS Styles for Modern Look**
const styles = {
    container: {
        textAlign: "center",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f4f4f4",
        minHeight: "100vh",
    },
    title: {
        color: "#333",
        fontSize: "28px",
    },
    button: {
        marginTop: "10px",
        padding: "10px 20px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        cursor: "pointer",
        borderRadius: "5px",
    },
    resultContainer: {
        marginTop: "20px",
        padding: "15px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        display: "inline-block",
        textAlign: "left",
    },
    list: {
        listStyleType: "none",
        padding: 0,
    },
    error: {
        color: "red",
        fontWeight: "bold",
    },
};

export default App;
