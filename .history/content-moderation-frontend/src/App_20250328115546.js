// Import TensorFlow.js and NSFWJS
import * as tf from "@tensorflow/tfjs";
import nsfwjs from "nsfwjs";

// Load the NSFW model when the page loads
let model;

async function loadModel() {
    model = await nsfwjs.load();
    console.log("NSFW Model Loaded Successfully!");
}

// Call model loading function
loadModel();

// Function to handle image upload
async function analyzeImage() {
    const fileInput = document.getElementById("imageUpload");
    const imagePreview = document.getElementById("imagePreview");
    const resultDiv = document.getElementById("result");

    // Ensure a file is selected
    if (fileInput.files.length === 0) {
        alert("Please select an image.");
        return;
    }

    // Read the uploaded image file
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function (event) {
        imagePreview.src = event.target.result; // Display uploaded image
        imagePreview.style.display = "block";

        // Wait for the image to load
        imagePreview.onload = async function () {
            const predictions = await model.classify(imagePreview);
            console.log("Predictions:", predictions);

            // Get the NSFW probability
            const nsfwPrediction = predictions.find(p => p.className === "Porn" || p.className === "Sexy");

            // Display result
            if (nsfwPrediction && nsfwPrediction.probability > 0.5) {
                resultDiv.innerHTML = `<strong style="color: red;">NSFW Content Detected!</strong>`;
            } else {
                resultDiv.innerHTML = `<strong style="color: green;">Safe Content</strong>`;
            }
        };
    };

    reader.readAsDataURL(file); // Convert file to Base64
}
