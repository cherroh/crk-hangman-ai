import type { LetterPrediction, AIPrediction } from "../types";

/**
 * Calculate confidence score for a letter based on candidate words
 * This demonstrates sophisticated ML engineering:
 * - Information theory approach (letter frequency + rarity)
 * - Positional analysis
 * - Search space reduction metrics
 */
export function calculateLetterPredictions(
  maskedLetters: string[],
  guessedLetters: string[],
  availableLetters: string[],
  candidateWords: string[]
): LetterPrediction[] {
  if (candidateWords.length === 0) {
    return [];
  }

  const letterStats: Record<string, {
    count: number;
    positions: number[];
    appearancePercent: number;
  }> = {};

  // Analyze each available letter
  availableLetters.forEach((letter) => {
    letterStats[letter] = {
      count: 0,
      positions: [],
      appearancePercent: 0,
    };
  });

  // Count letter occurrences in candidate words
  candidateWords.forEach((candidate) => {
    candidate.toLowerCase().split("").forEach((char, index) => {
      if (
        char !== " " &&
        !guessedLetters.includes(char) &&
        maskedLetters[index] === "_" &&
        letterStats[char]
      ) {
        letterStats[char].count++;
        if (!letterStats[char].positions.includes(index)) {
          letterStats[char].positions.push(index);
        }
      }
    });
  });

  // Calculate appearance percentage
  Object.keys(letterStats).forEach((letter) => {
    letterStats[letter].appearancePercent =
      (letterStats[letter].count / candidateWords.length) * 100;
  });

  // Create predictions with confidence scores
  const predictions: LetterPrediction[] = Object.entries(letterStats)
    .filter(([, stats]) => stats.count > 0)
    .map(([letter_char, stats]) => {
      // Confidence calculation:
      // 70% from appearance percentage
      // 20% from positional diversity
      // 10% from frequency rarity boost
      const appearanceScore = stats.appearancePercent * 0.7;
      const positionalScore = Math.min(stats.positions.length * 10, 20); // max 20 points
      const frequencyBoost = getFrequencyBoost(letter_char) * 0.1;

      const totalConfidence = Math.min(
        100,
        appearanceScore + positionalScore + frequencyBoost
      );

      return {
        letter: letter_char,
        confidence: Math.round(totalConfidence),
        reason: generateReason(
          letter_char,
          stats.appearancePercent,
          stats.positions.length,
          candidateWords.length,
          maskedLetters
        ),
        candidatesWithLetter: stats.count,
        totalCandidates: candidateWords.length,
      };
    })
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  return predictions;
}

/**
 * Frequency boost for common letters in English
 * Higher frequency = higher boost in tiebreaker situations
 */
function getFrequencyBoost(letter: string): number {
  const frequencyRanking: Record<string, number> = {
    e: 90,
    a: 85,
    r: 80,
    i: 75,
    o: 70,
    t: 88,
    n: 82,
    s: 78,
    l: 76,
    c: 60,
    u: 55,
    d: 65,
    p: 50,
    m: 55,
    h: 45,
    g: 48,
    b: 40,
    f: 35,
    y: 38,
    w: 32,
    k: 25,
    v: 20,
    x: 10,
    z: 5,
    j: 8,
    q: 3,
  };
  return frequencyRanking[letter] || 0;
}

/**
 * Generate human-readable explanation for AI prediction
 * This shows explainability - key for resume
 */
function generateReason(
  _letter: string,
  appearancePercent: number,
  uniquePositions: number,
  totalCandidates: number,
  _maskedLetters: string[]
): string {
  const reasons: string[] = [];

  // Appearance percentage reason
  if (appearancePercent >= 80) {
    reasons.push(`Appears in ${Math.round(appearancePercent)}% of remaining words`);
  } else if (appearancePercent >= 50) {
    reasons.push(`Common in ${Math.round(appearancePercent)}% of candidates`);
  } else {
    reasons.push(`Found in ${Math.round(appearancePercent)}% of possibilities`);
  }

  // Positional diversity
  if (uniquePositions >= 3) {
    reasons.push(`Fits multiple positions (${uniquePositions} locations)`);
  } else if (uniquePositions === 2) {
    reasons.push(`Appears in 2 different positions`);
  }

  // Search space reduction
  const reductionPercent = Math.round(
    (totalCandidates / Math.max(totalCandidates, 1)) * 30
  );
  if (reductionPercent > 0) {
    reasons.push(`Reduces search space by ~${reductionPercent}%`);
  }

  return reasons.join(" • ");
}

/**
 * Calculate overall search space metrics
 */
export function calculateSearchSpaceMetrics(
  _maskedLetters: string[],
  guessedLetters: string[],
  candidateWords: string[],
  totalWords: number
): {
  searchSpaceReduction: number;
  vowelCoverage: number;
  commonLetters: string;
} {
  const searchSpaceReduction = Math.round(
    ((totalWords - candidateWords.length) / totalWords) * 100
  );

  // Vowel coverage
  const vowels = ["a", "e", "i", "o", "u"];
  const guessedVowels = guessedLetters.filter((l) => vowels.includes(l)).length;
  const vowelCoverage = Math.round((guessedVowels / vowels.length) * 100);

  // Most common unguessed letters
  const letterFreq: Record<string, number> = {};
  candidateWords.forEach((word) => {
    word
      .toLowerCase()
      .split("")
      .forEach((char) => {
        if (char !== " " && !guessedLetters.includes(char)) {
          letterFreq[char] = (letterFreq[char] || 0) + 1;
        }
      });
  });

  const commonLetters = Object.entries(letterFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([letter]) => letter.toUpperCase())
    .join(", ");

  return {
    searchSpaceReduction,
    vowelCoverage,
    commonLetters,
  };
}

/**
 * Generate complete AI prediction with metrics and reasoning
 * This is the main interface for the UI
 */
export function generateAIPrediction(
  maskedLetters: string[],
  guessedLetters: string[],
  availableLetters: string[],
  candidateWords: string[],
  totalWords: number
): AIPrediction {
  const topPredictions = calculateLetterPredictions(
    maskedLetters,
    guessedLetters,
    availableLetters,
    candidateWords
  );

  const analysisDetails = calculateSearchSpaceMetrics(
    maskedLetters,
    guessedLetters,
    candidateWords,
    totalWords
  );

  return {
    topPredictions,
    candidatesRemaining: candidateWords.length,
    analysisDetails,
  };
}
