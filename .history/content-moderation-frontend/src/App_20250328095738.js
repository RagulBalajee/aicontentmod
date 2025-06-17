import React, { useState, useRef } from "react";
import "./App.css";

function App() {
    const [file, setFile] = useState(null);
    const [text, setText] = useState("");
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("media");

    const handleAnalysis = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const formData = new FormData();
            
            if(activeTab === "media" && file) {
                formData.append("file", file);
            } else if(activeTab === "text" && text) {
                formData.append("text", text);
            }

            const response = await fetch("http://localhost:8000/upload/", {
                method: "POST",
                body: activeTab === "text" ? JSON.stringify({ text }) : formData,
                headers: activeTab === "text" ? {
                    "Content-Type": "application/json"
                } : {}
            });

            const data = await response.json();
            setResults(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container">
            <h1>Multi-Modality Content Moderation</h1>
            
            {/* Tabs */}
            <div className="tabs">
                <button 
                    className={activeTab === "media" ? "active" : ""}
                    onClick={() => setActiveTab("media")}
                >
                    Media Analysis
                </button>
                <button 
                    className={activeTab === "text" ? "active" : ""}
                    onClick={() => setActiveTab("text")}
                >
                    Text Analysis
                </button>
            </div>

            {/* Media Tab */}
            {activeTab === "media" && (
                <div className="media-upload">
                    <input
                        type="file"
                        accept="video/*,audio/*"
                        onChange={(e) => {
                            setFile(e.target.files[0]);
                            setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                        }}
                    />
                    {previewUrl && file?.type.startsWith("video") && (
                        <video controls src={previewUrl} />
                    )}
                    {previewUrl && file?.type.startsWith("audio") && (
                        <audio controls src={previewUrl} />
                    )}
                </div>
            )}

            {/* Text Tab */}
            {activeTab === "text" && (
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text to analyze..."
                    rows="5"
                />
            )}

            <button onClick={handleAnalysis} disabled={isLoading}>
                {isLoading ? "Analyzing..." : "Start Analysis"}
            </button>

            {/* Results Display */}
            {results && (
                <div className="results">
                    {results.media_result && (
                        <div className="media-results">
                            <h3>Visual Analysis</h3>
                            {/* Existing visual results display */}
                            
                            <h3>Audio Analysis</h3>
                            {results.media_result.audio_analysis && (
                                <div className="audio-results">
                                    <p>Transcription: {results.media_result.audio_analysis.text}</p>
                                    <p>Profanity Score: {results.media_result.audio_analysis.profanity}</p>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {results.text_result && (
                        <div className="text-results">
                            <h3>Text Analysis Results</h3>
                            <p>Profanity Level: {results.text_result.profanity}</p>
                            <p>Cyberbullying Score: {results.text_result.cyberbullying}</p>
                        </div>
                    )}
                </div>
            )}
            
            <footer>Made by Ragul Balajee GK</footer>
        </div>
    );
}

export default App;