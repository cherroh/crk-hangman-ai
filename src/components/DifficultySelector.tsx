import React from "react";
import type { Difficulty } from "../types";

interface DifficultySelectorProps {
  currentDifficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
}

const difficulties: { value: Difficulty; label: string; description: string }[] = [
  { value: "easy", label: "Easy", description: "Common words" },
  { value: "medium", label: "Medium", description: "Regular vocab" },
  { value: "expert", label: "Expert", description: "Difficult words" },
  { value: "programming", label: "Programming", description: "Tech terms" },
];

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  currentDifficulty,
  onDifficultyChange,
}) => {
  return (
    <div className="difficulty-selector">
      {difficulties.map(({ value, label }) => (
        <button
          key={value}
          className={`difficulty-btn ${currentDifficulty === value ? "active" : ""}`}
          onClick={() => onDifficultyChange(value)}
          title={`Select ${label} difficulty`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
