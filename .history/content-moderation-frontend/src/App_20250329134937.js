import React, { useState, useRef } from "react";

const App = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert("Please select a file first!");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await fetch("http://localhost:5000/upload", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                alert("File uploaded successfully!");
            } else {
                alert("File upload failed.");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("An error occurred while uploading.");
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>File Upload</h2>
            
            <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: "none" }} 
                onChange={handleFileChange} 
                accept="image/*,video/*"
            />
            <button onClick={() => fileInputRef.current.click()}>Choose File</button>

            {selectedFile && (
                <div style={{ marginTop: "20px" }}>
                    <p>Selected File: {selectedFile.name}</p>
                    {selectedFile.type.startsWith("image/") && (
                        <img src={previewUrl} alt="Preview" width="200px" />
                    )}
                    {selectedFile.type.startsWith("video/") && (
                        <video src={previewUrl} width="300px" controls />
                    )}
                    <br />
                    <button onClick={handleUpload} style={{ marginTop: "10px" }}>Upload</button>
                </div>
            )}
        </div>
    );
};

export default App;
