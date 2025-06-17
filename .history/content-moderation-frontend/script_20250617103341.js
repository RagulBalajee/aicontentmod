// Configuration - Update this for deployment
const API_URL = 'http://localhost:5001';

// DOM elements
const dropZone = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const resultDiv = document.getElementById('resultsSection');
const loadingDiv = document.getElementById('uploadProgress');
const progressBar = document.getElementById('progressFill');

// Debug DOM elements
console.log('DOM elements found:', {
    dropZone: dropZone,
    fileInput: fileInput,
    resultDiv: resultDiv,
    loadingDiv: loadingDiv,
    progressBar: progressBar
});

// Event listeners
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('drop', handleDrop);
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);

function handleDragOver(e) {
    e.preventDefault();
    dropZone.classList.add('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    console.log('File dropped:', e.dataTransfer.files); // Debug log
    dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        console.log('Files assigned to input:', fileInput.files); // Debug log
        handleFileSelect();
    }
}

function handleFileSelect() {
    const file = fileInput.files[0];
    console.log('File selected:', file); // Debug log
    if (file) {
        console.log('File details:', {
            name: file.name,
            size: file.size,
            type: file.type
        }); // Debug log
        // Show file info and start upload immediately
        showLoading();
        handleUpload();
    }
}

async function handleUpload() {
    const file = fileInput.files[0];
    console.log('Starting upload for file:', file); // Debug log
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
    
    console.log('File type:', file.type, 'Allowed types:', allowedTypes); // Debug log
    
    if (!allowedTypes.includes(file.type)) {
        showError('Unsupported file format. Please upload images (PNG, JPG, JPEG, GIF, BMP, WEBP) or videos (MP4, AVI, MOV, MKV, WMV, FLV)');
        return;
    }

    // Show loading
    showLoading();
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        console.log('FormData created, sending to:', `${API_URL}/upload`); // Debug log

        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });

        console.log('Response received:', response.status, response.statusText); // Debug log

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Result received:', result); // Debug log
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
    dropZone.style.display = 'none';
}

function hideLoading() {
    loadingDiv.style.display = 'none';
    dropZone.style.display = 'block';
}

function showResult(result) {
    resultDiv.style.display = 'block';
    
    if (result.error) {
        showError(result.error);
        return;
    }

    const statusIcon = document.getElementById('resultIcon');
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

    // Update status
    if (result.status === 'safe') {
        statusIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        statusIcon.className = 'result-icon safe';
        resultTitle.textContent = 'Content is Safe';
        resultSubtitle.textContent = 'No inappropriate content detected';
        statusValue.textContent = 'Safe';
        statusValue.className = 'detail-value safe';
    } else {
        statusIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
        statusIcon.className = 'result-icon unsafe';
        resultTitle.textContent = 'Content is Unsafe';
        resultSubtitle.textContent = 'Inappropriate content detected';
        statusValue.textContent = 'Unsafe';
        statusValue.className = 'detail-value unsafe';
    }

    // Show/hide and update details
    if (result.reason) {
        reasonItem.style.display = 'flex';
        reasonValue.textContent = result.reason;
    } else {
        reasonItem.style.display = 'none';
    }

    if (result.confidence) {
        confidenceItem.style.display = 'flex';
        confidenceValue.textContent = result.confidence;
    } else {
        confidenceItem.style.display = 'none';
    }

    if (result.file_type) {
        fileTypeItem.style.display = 'flex';
        fileTypeValue.textContent = result.file_type;
    } else {
        fileTypeItem.style.display = 'none';
    }

    if (result.frames_analyzed || result.frame_analyzed) {
        framesItem.style.display = 'flex';
        framesValue.textContent = result.frames_analyzed || result.frame_analyzed;
    } else {
        framesItem.style.display = 'none';
    }
}

function showError(message) {
    resultDiv.style.display = 'block';
    
    const statusIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    const resultSubtitle = document.getElementById('resultSubtitle');
    const statusValue = document.getElementById('statusValue');
    
    statusIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
    statusIcon.className = 'result-icon error';
    resultTitle.textContent = 'Error';
    resultSubtitle.textContent = message;
    statusValue.textContent = 'Error';
    statusValue.className = 'detail-value error';
}

function resetForm() {
    fileInput.value = '';
    resultDiv.style.display = 'none';
    dropZone.style.display = 'block';
    dropZone.classList.remove('drag-over');
}

function testUpload() {
    console.log('Test upload clicked');
    console.log('API_URL:', API_URL);
    console.log('File input files:', fileInput.files);
    console.log('Drop zone element:', dropZone);
    
    // Test if we can reach the backend
    fetch(`${API_URL}/health`)
        .then(response => response.json())
        .then(data => {
            console.log('Backend health check:', data);
            alert('Backend is reachable: ' + JSON.stringify(data));
        })
        .catch(error => {
            console.error('Backend health check failed:', error);
            alert('Backend is not reachable: ' + error.message);
        });
}

function testFileSelect() {
    const testFile = document.getElementById('testFileInput').files[0];
    console.log('Test file selected:', testFile);
    
    if (testFile) {
        console.log('Test file details:', {
            name: testFile.name,
            size: testFile.size,
            type: testFile.type
        });
        
        // Try to upload this file directly
        const formData = new FormData();
        formData.append('file', testFile);
        
        console.log('Attempting to upload test file...');
        
        fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log('Test upload response:', response.status, response.statusText);
            return response.json();
        })
        .then(result => {
            console.log('Test upload result:', result);
            alert('Test upload result: ' + JSON.stringify(result));
        })
        .catch(error => {
            console.error('Test upload error:', error);
            alert('Test upload failed: ' + error.message);
        });
    }
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
