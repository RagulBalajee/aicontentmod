// DOM elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadProgress = document.getElementById('uploadProgress');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultsSection = document.getElementById('resultsSection');
const resultCard = document.getElementById('resultCard');
const resultIcon = document.getElementById('resultIcon');
const resultTitle = document.getElementById('resultTitle');
const resultSubtitle = document.getElementById('resultSubtitle');
const statusValue = document.getElementById('statusValue');
const reasonItem = document.getElementById('reasonItem');
const reasonValue = document.getElementById('reasonValue');
const confidenceItem = document.getElementById('confidenceItem');
const confidenceValue = document.getElementById('confidenceValue');
const fileTypeItem = document.getElementById('fileTypeItem');
const fileTypeValue = document.getElementById('fileTypeValue');
const framesItem = document.getElementById('framesItem');
const framesValue = document.getElementById('framesValue');

// API endpoint
const API_URL = 'http://127.0.0.1:5001/upload';

// File validation
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/wmv', 'video/flv'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkServerHealth();
});

function setupEventListeners() {
    // Click to upload
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDragOver(e) {
    preventDefaults(e);
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    preventDefaults(e);
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    preventDefaults(e);
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
        showError(validation.message);
        return;
    }
    
    // Upload file
    uploadFile(file);
}

function validateFile(file) {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            message: `File too large. Maximum size is 50MB. Your file is ${formatFileSize(file.size)}.`
        };
    }
    
    // Check file type
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
    
    if (!isImage && !isVideo) {
        return {
            valid: false,
            message: 'Unsupported file type. Please upload images (PNG, JPG, JPEG, GIF, BMP, WEBP) or videos (MP4, AVI, MOV, MKV, WMV, FLV).'
        };
    }
    
    return { valid: true };
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function uploadFile(file) {
    try {
        // Show progress
        showProgress();
        
        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        
        // Simulate progress for better UX
        simulateProgress();
        
        // Make API request
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        // Hide progress
        hideProgress();
        
        if (response.ok) {
            displayResult(result, file);
        } else {
            showError(result.error || 'Upload failed');
        }
        
    } catch (error) {
        console.error('Upload error:', error);
        hideProgress();
        showError('Network error. Please check your connection and try again.');
    }
}

function showProgress() {
    uploadProgress.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = 'Uploading file...';
}

function hideProgress() {
    uploadProgress.style.display = 'none';
}

function simulateProgress() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) {
            progress = 90;
            clearInterval(interval);
        }
        progressFill.style.width = progress + '%';
        
        if (progress < 30) {
            progressText.textContent = 'Uploading file...';
        } else if (progress < 60) {
            progressText.textContent = 'Processing content...';
        } else {
            progressText.textContent = 'Analyzing with AI...';
        }
    }, 200);
}

function displayResult(result, file) {
    // Show results section
    resultsSection.style.display = 'block';
    resultsSection.classList.add('fade-in');
    
    // Update result icon and colors
    const isSafe = result.status === 'safe';
    const iconElement = resultIcon.querySelector('i');
    
    if (isSafe) {
        resultIcon.className = 'result-icon safe';
        iconElement.className = 'fas fa-check-circle';
        resultTitle.textContent = 'Content is Safe! ✅';
        resultSubtitle.textContent = 'Your content passed all safety checks';
        statusValue.textContent = 'Safe';
        statusValue.className = 'detail-value safe';
    } else {
        resultIcon.className = 'result-icon unsafe';
        iconElement.className = 'fas fa-exclamation-triangle';
        resultTitle.textContent = 'Content Flagged as Unsafe! ⚠️';
        resultSubtitle.textContent = 'Your content contains potentially inappropriate material';
        statusValue.textContent = 'Unsafe';
        statusValue.className = 'detail-value unsafe';
    }
    
    // Update details
    updateDetailItem(reasonItem, reasonValue, result.reason, isSafe ? 'none' : 'block');
    updateDetailItem(confidenceItem, confidenceValue, result.confidence, 'block');
    updateDetailItem(fileTypeItem, fileTypeValue, result.file_type || getFileType(file), 'block');
    updateDetailItem(framesItem, framesValue, result.frames_analyzed || result.frame_analyzed, result.file_type === 'video' ? 'block' : 'none');
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function updateDetailItem(item, value, content, display) {
    if (content) {
        value.textContent = content;
        item.style.display = display;
    } else {
        item.style.display = 'none';
    }
}

function getFileType(file) {
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return 'Image';
    } else if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
        return 'Video';
    }
    return 'Unknown';
}

function showError(message) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            z-index: 1000;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        ">
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

async function checkServerHealth() {
    try {
        const response = await fetch('http://127.0.0.1:5000/health');
        if (!response.ok) {
            showError('Backend server is not responding. Please make sure the Flask server is running.');
        }
    } catch (error) {
        showError('Cannot connect to backend server. Please start the Flask server first.');
    }
}

// Add CSS for error notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Reset functionality
function resetUpload() {
    fileInput.value = '';
    uploadProgress.style.display = 'none';
    resultsSection.style.display = 'none';
    uploadArea.classList.remove('dragover');
}

// Add reset button functionality
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        resetUpload();
    }
});
