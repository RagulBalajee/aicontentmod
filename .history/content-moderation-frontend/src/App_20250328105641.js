// Add this image result handling
const renderResult = () => {
  if (!result) return null;

  return (
    <div className="result-card">
      <h3>{result.type.toUpperCase()} Analysis Result</h3>
      
      {result.type === 'image' && (
        <div className="image-results">
          <div className="safety-badge">
            {result.result.analysis.nudity.raw < 0.2 ? '✅ Safe' : '⚠️ Unsafe'}
          </div>
          <div className="score-grid">
            <div className="score-item">
              <span>Nudity:</span>
              <span>{(result.result.analysis.nudity.raw * 100).toFixed(1)}%</span>
            </div>
            <div className="score-item">
              <span>Offensive:</span>
              <span>{(result.result.analysis.offensive.prob * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Existing video/text results */}
    </div>
  );
};