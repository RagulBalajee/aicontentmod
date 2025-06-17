// Configuration - Update this for deployment
const API_URL = process.env.BACKEND_URL || 'http://localhost:5001';

// DOM elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const resultDiv = document.getElementById('result');
const loadingDiv = document.getElementById('loading');
const progressBar = document.getElementById('progressBar');

// Event listeners
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('drop', handleDrop);
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
uploadBtn.addEventListener('click', handleUpload);

function handleDragOver(e) {
    e.preventDefault();
    dropZone.classList.add('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        handleFileSelect();
    }
}

function handleFileSelect() {
    const file = fileInput.files[0];
    if (file) {
        // Show file info
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        fileInfo.innerHTML = `
            <p><strong>Selected File:</strong> ${file.name}</p>
            <p><strong>Size:</strong> ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <p><strong>Type:</strong> ${file.type || 'Unknown'}</p>
        `;
        
        // Clear previous results
        resultDiv.innerHTML = '';
        resultDiv.appendChild(fileInfo);
        
        // Show upload button
        uploadBtn.style.display = 'block';
    }
}

async function handleUpload() {
    const file = fileInput.files[0];
    if (!file) {
        showError('Please select a file first');
        return;
    }

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
        showError('File too large. Maximum size is 50MB');
        return;
    }

    // Check file type
    const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp',
        'video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/wmv', 'video/flv'
    ];
    
    if (!allowedTypes.includes(file.type)) {
        showError('Unsupported file format. Please upload images (PNG, JPG, JPEG, GIF, BMP, WEBP) or videos (MP4, AVI, MOV, MKV, WMV, FLV)');
        return;
    }

    // Show loading
    showLoading();
    
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        showResult(result);
        
    } catch (error) {
        console.error('Upload error:', error);
        showError(`Upload failed: ${error.message}. Please check if the backend server is running.`);
    } finally {
        hideLoading();
    }
}

function showLoading() {
    loadingDiv.style.display = 'block';
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Analyzing...';
}

function hideLoading() {
    loadingDiv.style.display = 'none';
    uploadBtn.disabled = false;
    uploadBtn.textContent = 'Upload & Analyze';
}

function showResult(result) {
    resultDiv.innerHTML = '';
    
    if (result.error) {
        showError(result.error);
        return;
    }

    const resultCard = document.createElement('div');
    resultCard.className = `result-card ${result.status}`;
    
    const statusIcon = result.status === 'safe' ? '✅' : '🚨';
    const statusText = result.status === 'safe' ? 'Safe Content' : 'Unsafe Content';
    
    resultCard.innerHTML = `
        <div class="result-header">
            <h3>${statusIcon} ${statusText}</h3>
            <span class="file-type">${result.file_type || 'Unknown'}</span>
        </div>
        <div class="result-details">
            ${result.reason ? `<p><strong>Reason:</strong> ${result.reason}</p>` : ''}
            ${result.confidence ? `<p><strong>Confidence:</strong> ${result.confidence}</p>` : ''}
            ${result.frame_analyzed ? `<p><strong>Frame Analyzed:</strong> ${result.frame_analyzed}</p>` : ''}
            ${result.frames_analyzed ? `<p><strong>Frames Analyzed:</strong> ${result.frames_analyzed}</p>` : ''}
        </div>
        <div class="result-actions">
            <button onclick="resetForm()" class="btn btn-secondary">Analyze Another File</button>
        </div>
    `;
    
    resultDiv.appendChild(resultCard);
}

function showError(message) {
    resultDiv.innerHTML = `
        <div class="result-card error">
            <div class="result-header">
                <h3>❌ Error</h3>
            </div>
            <div class="result-details">
                <p>${message}</p>
            </div>
            <div class="result-actions">
                <button onclick="resetForm()" class="btn btn-secondary">Try Again</button>
            </div>
        </div>
    `;
}

function resetForm() {
    fileInput.value = '';
    resultDiv.innerHTML = '';
    uploadBtn.style.display = 'none';
    dropZone.classList.remove('drag-over');
}

// Add some visual feedback for drag and drop
dropZone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    if (!dropZone.contains(e.relatedTarget)) {
        dropZone.classList.remove('drag-over');
    }
});

// Auto-hide drag-over class after drop
dropZone.addEventListener('drop', () => {
    setTimeout(() => {
        dropZone.classList.remove('drag-over');
    }, 100);
});
