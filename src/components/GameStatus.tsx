import React, { useEffect } from "react";

interface GameStatusProps {
  status: "idle" | "correct" | "wrong" | "won" | "lost";
  word?: string;
  onClose: () => void;
}

export const GameStatus: React.FC<GameStatusProps> = ({ status, word, onClose }) => {
  useEffect(() => {
    if (status !== "idle" && status !== "correct" && status !== "wrong") {
      return;
    }

    const timer = window.setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [status, onClose]);

  if (status === "idle") {
    return null;
  }

  let message = "";
  let icon = "";

  switch (status) {
    case "correct":
      message = "Correct!";
      icon = "✓";
      break;
    case "wrong":
      message = "Wrong guess";
      icon = "✗";
      break;
    case "won":
      message = `You Won! The word was "${word}"`;
      icon = "🎉";
      break;
    case "lost":
      message = `Game Over! The word was "${word}"`;
      icon = "💀";
      break;
  }

  const statusClass = status === "won" ? "won" : status === "lost" ? "lost" : "";

  return (
    <div className={`game-status ${statusClass}`}>
      <span className="status-icon">{icon}</span>
      <span>{message}</span>
    </div>
  );
};
