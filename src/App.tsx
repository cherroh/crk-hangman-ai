import { useEffect, useRef, useState } from "react";
import icon from "./assets/crkicon.png";
import hangmanBase from "./assets/hangmanbase.png";
import hangman1 from "./assets/hangman1.png";
import hangman2 from "./assets/hangman2.png";
import hangman3 from "./assets/hangman3.png";
import hangman4 from "./assets/hangman4.png";
import hangman5 from "./assets/hangman5.png";
import hangman6 from "./assets/hangman6.png";
import "./App.modern.css";
import { WORD_CATEGORIES } from "./data/wordsByDifficulty";
import { getMaskedLetters, isWordGuessed } from "./utils/gameLogic";
import { generateAIPrediction } from "./utils/aiPredictions";
import { loadStats, recordGameResult } from "./utils/gameStats";
import type { Difficulty, AIPrediction, GameStats } from "./types";
import { AIPanel } from "./components/AIPanel";
import { DifficultySelector } from "./components/DifficultySelector";
import { StatsDisplay } from "./components/StatsDisplay";
import { GameStatus } from "./components/GameStatus";

const MAX_WRONG = 6;

function getCandidateWords(
  words: string[],
  maskedLetters: string[],
  guessedLetters: string[]
) {
  const wrongLetters = guessedLetters.filter((letter) => !maskedLetters.includes(letter));

  return words.filter((candidate) => {
    const normalizedCandidate = candidate.toLowerCase();
    if (normalizedCandidate.length !== maskedLetters.length) {
      return false;
    }

    for (let index = 0; index < normalizedCandidate.length; index += 1) {
      const candidateChar = normalizedCandidate[index];
      const maskChar = maskedLetters[index];

      if (maskChar === " ") {
        if (candidateChar !== " ") {
          return false;
        }
        continue;
      }

      if (maskChar !== "_") {
        if (candidateChar !== maskChar) {
          return false;
        }
      } else if (guessedLetters.includes(candidateChar)) {
        return false;
      }
    }

    return wrongLetters.every((letter) => !normalizedCandidate.includes(letter));
  });
}

function App() {
  // Game state
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [word, setWord] = useState(() => {
    const words = WORD_CATEGORIES[difficulty];
    return words[Math.floor(Math.random() * words.length)];
  });
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState(false);
  const [gameStatus, setGameStatus] = useState<"idle" | "correct" | "wrong" | "won" | "lost">(
    "idle"
  );

  // AI state
  const [aiPrediction, setAiPrediction] = useState<AIPrediction | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);
  const aiGenerator = useRef<any>(null);

  // Stats state
  const [stats, setStats] = useState<GameStats>(loadStats());

  // Computed values
  const currentWordList = WORD_CATEGORIES[difficulty];
  const maskedLetters = getMaskedLetters(word, guessedLetters);
  const won = isWordGuessed(word, guessedLetters);
  const lost = wrongGuesses >= MAX_WRONG;
  const availableLetters = "abcdefghijklmnopqrstuvwxyz"
    .split("")
    .filter((letter) => !guessedLetters.includes(letter));
  const candidateWords = getCandidateWords(currentWordList, maskedLetters, guessedLetters);

  // Initialize AI generator
  async function ensureAiGenerator() {
    if (aiGenerator.current) {
      return aiGenerator.current;
    }

    setAiLoading(true);

    try {
      const { pipeline } = await import("@xenova/transformers");
      const generator = await pipeline("text-generation", "Xenova/distilgpt2");
      aiGenerator.current = generator;
      setAiError(false);
      return generator;
    } catch (error) {
      console.error("Failed to load AI model:", error);
      setAiError(true);
      return null;
    } finally {
      setAiLoading(false);
    }
  }

  // Request AI hint
  async function requestAiHint() {
    if (won || lost) {
      return;
    }

    setAiLoading(true);
    setAiError(false);

    try {
      // First, generate predictions based on candidate analysis
      const predictions = generateAIPrediction(
        maskedLetters,
        guessedLetters,
        availableLetters,
        candidateWords,
        currentWordList.length
      );

      setAiPrediction(predictions);

      // Try to use the AI model for validation
      const generator = await ensureAiGenerator();
      if (generator && predictions.topPredictions.length > 0) {
        // AI model is ready, we could use it for additional analysis here
        // For now, we display the confidence-scored predictions
        setAiError(false);
      }
    } catch (error) {
      console.error("Failed to generate AI hint:", error);
      setAiError(true);
    } finally {
      setAiLoading(false);
    }
  }

  // Handle difficulty change
  function handleDifficultyChange(newDifficulty: Difficulty) {
    setDifficulty(newDifficulty);
    resetGame(newDifficulty);
  }

  // Handle guess
  function handleGuess() {
    const normalized = input.toLowerCase().trim().replace(/[^a-z]/g, "");

    if (!normalized) return;
    if (guessedLetters.includes(normalized)) {
      setInputError(true);
      return;
    }

    setInputError(false);
    const nextGuessedLetters = [...guessedLetters, normalized];
    setGuessedLetters(nextGuessedLetters);
    setAiPrediction(null);

    if (word.includes(normalized)) {
      if (isWordGuessed(word, nextGuessedLetters)) {
        setGameStatus("won");
      } else {
        setGameStatus("correct");
      }
    } else {
      const nextWrong = wrongGuesses + 1;
      setWrongGuesses(nextWrong);
      setGameStatus(nextWrong >= MAX_WRONG ? "lost" : "wrong");
    }

    setInput("");
  }

  // Reset game
  function resetGame(newDifficulty?: Difficulty) {
    const diffToUse = newDifficulty || difficulty;
    const words = WORD_CATEGORIES[diffToUse];
    const newWord = words[Math.floor(Math.random() * words.length)];

    setWord(newWord);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setInput("");
    setInputError(false);
    setGameStatus("idle");
    setAiPrediction(null);
  }

  // Clear status after timeout
  useEffect(() => {
    if (gameStatus !== "correct" && gameStatus !== "wrong") {
      return;
    }

    const timeout = window.setTimeout(() => {
      setGameStatus("idle");
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [gameStatus]);

  // Record stats when game ends
  useEffect(() => {
    if (gameStatus !== "won" && gameStatus !== "lost") {
      return;
    }

    const newStats = recordGameResult(gameStatus === "won", guessedLetters.length, 0, 0, 0);
    setStats(newStats);
  }, [gameStatus, guessedLetters.length]);

  // Hangman images
  const hangmanImages = [
    hangmanBase,
    hangman1,
    hangman2,
    hangman3,
    hangman4,
    hangman5,
    hangman6,
  ];
  const currentHangmanImage = hangmanImages[Math.min(wrongGuesses, MAX_WRONG)];

  return (
    <div className="app-shell">
      <header className="app-header">
        <img src={icon} alt="CRK icon" className="app-logo" />
        <div className="app-title-wrapper">
          <p className="app-eyebrow">AI-Assisted Word Guessing</p>
          <h1>Interactive Hangman with Transformer Inference</h1>
        </div>
      </header>

      <GameStatus status={gameStatus} word={word} onClose={() => setGameStatus("idle")} />

      <main className="game-panel">
        <DifficultySelector currentDifficulty={difficulty} onDifficultyChange={handleDifficultyChange} />

        <div className="status-row">
          <div className="status-card">
            <img
              src={currentHangmanImage}
              alt={`Hangman stage ${wrongGuesses} of ${MAX_WRONG}`}
              className="hangman-image"
            />
            <div className="wrong-count">{wrongGuesses} / {MAX_WRONG} Wrong</div>
          </div>

          <div className="status-card">
            <div className="word-display">
              {maskedLetters.map((letter, index) =>
                letter === " " ? (
                  <span key={`space-${index}`} style={{ display: "inline-block", width: "1rem" }} />
                ) : (
                  <span key={`${letter}-${index}`}>{letter}</span>
                )
              )}
            </div>
          </div>
        </div>

        {/* AI Prediction Panel */}
        <AIPanel prediction={aiPrediction} isLoading={aiLoading} hasError={aiError} />

        {/* Input and Controls */}
        <div className="input-section">
          <input
            type="text"
            className={`letter-input ${inputError ? "error" : ""}`}
            value={input}
            onChange={(e) => {
              const val = e.target.value.slice(0, 1).toLowerCase().replace(/[^a-z]/g, "");
              setInput(val);
              if (!val || !guessedLetters.includes(val)) {
                setInputError(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleGuess();
              }
            }}
            placeholder="Enter a letter"
            disabled={won || lost}
            maxLength={1}
          />

          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={handleGuess}
              disabled={won || lost || !input}
            >
              Guess
            </button>
            <button
              className="btn btn-hint"
              onClick={requestAiHint}
              disabled={won || lost || aiLoading}
            >
              {aiLoading ? "Analyzing..." : "AI Hint"}
            </button>
            {(won || lost) && (
              <button className="btn btn-reset" onClick={() => resetGame()}>
                Play Again
              </button>
            )}
          </div>
        </div>

        {/* Stats Display */}
        <StatsDisplay stats={stats} isExpanded={false} onToggle={() => {}} />
      </main>
    </div>
  );
}

export default App;
