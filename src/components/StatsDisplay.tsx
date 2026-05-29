import React from "react";
import type { GameStats } from "../types";

interface StatsDisplayProps {
  stats: GameStats;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({
  stats,
}) => {
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  return (
    <div className="stats-panel">
      <div className="stat-item">
        <div className="stat-value">{stats.gamesPlayed}</div>
        <div className="stat-label">Games Played</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{winRate}%</div>
        <div className="stat-label">Win Rate</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{stats.averageGuesses}</div>
        <div className="stat-label">Avg Guesses</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{stats.totalHintsRequested}</div>
        <div className="stat-label">Total Hints Used</div>
      </div>
    </div>
  );
};
