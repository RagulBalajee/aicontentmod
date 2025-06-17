import React, { useState, useCallback } from 'react';
import './App.css';
import { useDropzone } from 'react-dropzone';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [textInput, setTextInput] = useState('');

  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      handleAnalysis(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg'],
      'video/*': ['.mp4', '.mov'],
      'text/plain': ['.txt']
    }
  });

  const handleAnalysis = async (file) => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      if (file) formData.append('file', file);
      if (textInput) formData.append('text', textInput);

      const response = await fetch('http://localhost:8000/analyze/', {
        method: 'POST',
        body: file ? formData : JSON.stringify({ text: textInput }),
        headers: file ? {} : { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error(await response.text());
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = () => {
    if (!preview) return null;
    
    if (preview.startsWith('data:text') || preview.endsWith('.txt')) {
      return <div className="text-preview">Text File Uploaded</div>;
    }

    const type = preview.includes('video') ? 'video' : 'image';
    return (
      <div className="media-preview">
        {type === 'video' ? (
          <video controls src={preview} />
        ) : (
          <img src={preview} alt="Preview" />
        )}
      </div>
    );
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <div className="result-card">
        <h3>{result.type.toUpperCase()} Analysis Result</h3>
        
        {result.type === 'text' && (
          <div className="text-results">
            <p>Profanity Score: {result.result.profanity?.toFixed(2)}</p>
            <p>Violence Score: {result.result.violence?.toFixed(2)}</p>
          </div>
        )}

        {(result.type === 'image' || result.type === 'video') && (
          <div className="media-results">
            <div className="score-meter">
              <div className="meter-label">Safety Score</div>
              <div className="meter-bar" style={{ width: `${(1 - result.result.summary?.risk) * 100}%` }}>
                {Math.round((1 - result.result.summary?.risk) * 100)}%
              </div>
            </div>
            
            <div className="detail-scores">
              <div className="score-item">
                <span>Nudity</span>
                <progress value={result.result.nudity?.raw} max="1" />
              </div>
              <div className="score-item">
                <span>Violence</span>
                <progress value={result.result.violence?.score} max="1" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container">
      <h1 className="title">AI Content Analyzer</h1>
      <p className="subtitle">Upload any file for content moderation</p>

      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop files here</p>
        ) : (
          <p>Drag & drop files, or click to select</p>
        )}
      </div>

      <div className="text-input">
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Or paste text here..."
        />
      </div>

      <button 
        className="analyze-btn"
        onClick={() => handleAnalysis()}
        disabled={loading}
      >
        {loading ? 'Analyzing...' : 'Start Analysis'}
      </button>

      {preview && renderPreview()}
      {error && <div className="error">{error}</div>}
      {result && renderResult()}

      <div className="supported-files">
        Supported formats: JPG, PNG, MP4, TXT
      </div>
    </div>
  );
}

export default App;