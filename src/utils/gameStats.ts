import type { GameStats } from "../types";

const STATS_STORAGE_KEY = "hangman_game_stats";

export function loadStats(): GameStats {
  try {
    const stored = localStorage.getItem(STATS_STORAGE_KEY);
    return stored
      ? JSON.parse(stored)
      : {
          gamesPlayed: 0,
          gamesWon: 0,
          averageGuesses: 0,
          aiHintUsageCount: 0,
          totalHintsRequested: 0,
          predictionAccuracy: 0,
        };
  } catch {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      averageGuesses: 0,
      aiHintUsageCount: 0,
      totalHintsRequested: 0,
      predictionAccuracy: 0,
    };
  }
}

export function saveStats(stats: GameStats): void {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error("Failed to save stats:", error);
  }
}

export function recordGameResult(
  won: boolean,
  guessCount: number,
  hintsUsed: number,
  correctPredictions: number,
  totalPredictions: number
): GameStats {
  const currentStats = loadStats();

  const totalGuesses = currentStats.averageGuesses * currentStats.gamesPlayed + guessCount;
  const newStats: GameStats = {
    gamesPlayed: currentStats.gamesPlayed + 1,
    gamesWon: currentStats.gamesWon + (won ? 1 : 0),
    averageGuesses: Math.round(totalGuesses / (currentStats.gamesPlayed + 1)),
    aiHintUsageCount: currentStats.aiHintUsageCount + (hintsUsed > 0 ? 1 : 0),
    totalHintsRequested: currentStats.totalHintsRequested + hintsUsed,
    predictionAccuracy:
      totalPredictions > 0
        ? Math.round(
            ((currentStats.predictionAccuracy *
              currentStats.gamesPlayed +
              (correctPredictions / totalPredictions) * 100) /
              (currentStats.gamesPlayed + 1)) *
              100
          ) / 100
        : currentStats.predictionAccuracy,
  };

  saveStats(newStats);
  return newStats;
}

export function getWinRate(): number {
  const stats = loadStats();
  return stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;
}

export function resetStats(): void {
  const emptyStats: GameStats = {
    gamesPlayed: 0,
    gamesWon: 0,
    averageGuesses: 0,
    aiHintUsageCount: 0,
    totalHintsRequested: 0,
    predictionAccuracy: 0,
  };
  saveStats(emptyStats);
}
