import React, { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import * as nsfwjs from "nsfwjs";

const App = () => {
  const [model, setModel] = useState(null);
  const [fileType, setFileType] = useState(""); // "image" or "video"
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [result, setResult] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Load the NSFW model on component mount
  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await nsfwjs.load();
      setModel(loadedModel);
      console.log("NSFW Model Loaded Successfully!");
    };
    loadModel();
  }, []);

  // Function to analyze images
  const analyzeImage = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      alert("Please select an image or video.");
      return;
    }

    const fileType = file.type.startsWith("image") ? "image" : "video";
    setFileType(fileType);

    if (fileType === "image") {
      // Process Image
      const reader = new FileReader();
      reader.onload = async (e) => {
        setImagePreview(e.target.result);
        setVideoPreview(null); // Remove previous video preview

        // Create an image element
        const img = new Image();
        img.src = e.target.result;
        img.onload = async () => {
          if (model) {
            const predictions = await model.classify(img);
            console.log("Predictions:", predictions);

            // Check NSFW probability
            const nsfwPrediction = predictions.find(
              (p) => p.className === "Porn" || p.className === "Sexy"
            );

            if (nsfwPrediction && nsfwPrediction.probability > 0.5) {
              setResult("🚨 NSFW Content Detected!");
            } else {
              setResult("✅ Safe Content");
            }
          }
        };
      };
      reader.readAsDataURL(file);
    } else {
      // Process Video
      const videoURL = URL.createObjectURL(file);
      setVideoPreview(videoURL);
      setImagePreview(null); // Remove previous image preview

      setResult("Analyzing video... (Processing Frames)");

      // Wait for video to load and start frame processing
      setTimeout(() => analyzeVideoFrames(videoURL), 1000);
    }
  };

  // Function to analyze video frames
  const analyzeVideoFrames = async (videoURL) => {
    const video = videoRef.current;
    video.src = videoURL;
    video.play();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    video.onloadeddata = async () => {
      const interval = setInterval(async () => {
        if (video.paused || video.ended) {
          clearInterval(interval);
          return;
        }

        // Capture frame from video
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/jpeg");
        
        // Create an image element
        const img = new Image();
        img.src = imageData;
        img.onload = async () => {
          if (model) {
            const predictions = await model.classify(img);
            console.log("Frame Predictions:", predictions);

            const nsfwPrediction = predictions.find(
              (p) => p.className === "Porn" || p.className === "Sexy"
            );

            if (nsfwPrediction && nsfwPrediction.probability > 0.5) {
              setResult("🚨 NSFW Video Detected!");
              clearInterval(interval); // Stop further analysis
              video.pause();
            }
          }
        };
      }, 1000); // Process a frame every second
    };
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>NSFW Content Moderation Tool</h1>
      <input type="file" accept="image/*,video/*" onChange={analyzeImage} />
      
      {fileType === "image" && imagePreview && (
        <img src={imagePreview} alt="Uploaded" style={{ width: "300px", marginTop: "20px" }} />
      )}

      {fileType === "video" && videoPreview && (
        <>
          <video ref={videoRef} src={videoPreview} controls width="400"></video>
          <canvas ref={canvasRef} width="400" height="300" style={{ display: "none" }}></canvas>
        </>
      )}

      {result && <h2 style={{ color: result.includes("NSFW") ? "red" : "green" }}>{result}</h2>}
    </div>
  );
};

export default App;
