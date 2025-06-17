import React, { useState } from "react";
import "./App.css";

function App() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;

        console.log("File selected:", selectedFile.name);
        console.log("File type:", selectedFile.type);
        setFile(selectedFile);
    };

    const analyzeFile = async () => {
        if (!file) {
            alert("Please select a file first.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            console.log("Sending file:", file.name);
            console.log("File type:", file.type);

            const response = await fetch("http://127.0.0.1:5000/analyze", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            console.log("Response received:", data);
            setResult(data);
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong. Check the console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="App">
            <h2>Content Moderation Tool</h2>
            <input type="file" onChange={handleFileChange} />
            <button onClick={analyzeFile} disabled={loading}>
                {loading ? "Analyzing..." : "Analyze"}
            </button>

            {result && (
                <div className="result">
                    <h3>Analysis Result:</h3>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default App;
