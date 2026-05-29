export type Difficulty = "easy" | "medium" | "expert" | "programming";
export type AIStrategy = "conservative" | "balanced" | "aggressive";

export interface LetterPrediction {
  letter: string;
  confidence: number;
  reason: string;
  candidatesWithLetter: number;
  totalCandidates: number;
}

export interface AIPrediction {
  topPredictions: LetterPrediction[];
  candidatesRemaining: number;
  analysisDetails: {
    searchSpaceReduction: number;
    vowelCoverage: number;
    commonLetters: string;
  };
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  averageGuesses: number;
  aiHintUsageCount: number;
  totalHintsRequested: number;
  predictionAccuracy: number;
}
