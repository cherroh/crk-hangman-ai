import React from "react";
import type { AIPrediction } from "../types";

interface AIPanelProps {
  prediction: AIPrediction | null;
  isLoading: boolean;
  hasError: boolean;
}

export const AIPanel: React.FC<AIPanelProps> = ({
  prediction,
  isLoading,
  hasError,
}) => {
  if (!prediction && !isLoading && !hasError) {
    return null;
  }

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <span>🤖 AI Analysis</span>
        <span className={`ai-status ${isLoading ? "loading" : hasError ? "error" : "ready"}`}>
          {isLoading && (
            <>
              <div className="loading-spinner"></div>
              Analyzing...
            </>
          )}
          {!isLoading && hasError && <>⚠ Error</>}
          {!isLoading && !hasError && <>✓ Ready</>}
        </span>
      </div>

      {prediction && (
        <>
          <div className="predictions-container">
            {prediction.topPredictions.map((pred, idx) => (
              <div key={idx} className="prediction-item">
                <div className="prediction-letter">{pred.letter.toUpperCase()}</div>
                <div className="prediction-details">
                  <div className="prediction-confidence">
                    <div className="confidence-bar">
                      <div
                        className="confidence-fill"
                        style={{ width: `${pred.confidence}%` }}
                      />
                    </div>
                    <span className="confidence-percent">{pred.confidence}%</span>
                  </div>
                  <div className="prediction-reason">{pred.reason}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="analysis-metrics">
            <div className="metric">
              <div className="metric-value">{prediction.candidatesRemaining}</div>
              <div className="metric-label">Candidates</div>
            </div>
            <div className="metric">
              <div className="metric-value">
                {prediction.analysisDetails.searchSpaceReduction}%
              </div>
              <div className="metric-label">Eliminated</div>
            </div>
            <div className="metric">
              <div className="metric-value">
                {prediction.analysisDetails.commonLetters}
              </div>
              <div className="metric-label">Top Letters</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
