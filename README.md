# AI-Assisted Interactive Hangman

A browser-based Hangman game with AI-powered letter predictions, confidence scoring, and a responsive UI.

[![Built with React](https://img.shields.io/badge/React-19.2-61dafb)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6)]()
[![Transformers.js](https://img.shields.io/badge/Transformers.js-2.17-orange)]()

## 🎯 Overview

This project is an interactive Hangman game that uses client-side AI to suggest letters in real time. The prediction system analyzes possible words, ranks likely guesses, and explains why each suggestion was chosen.

The goal of the project was to experiment with browser-based ML inference while building a polished frontend application with responsive design, reusable components, and persistent game stats.

## 🚀 Features

### 1. AI Letter Predictions 🤖

* Top 3 suggested letters with confidence percentages
* Confidence scores based on:

  * Letter frequency across remaining candidates
  * Positional coverage
  * English letter frequency weighting
* Real-time filtering of possible words as the game progresses

**Example Output:**

```txt
🤖 AI Analysis  ✓ READY

E  ████████████████████ 100%
   Appears in 143% of remaining words • Fits multiple positions (6 locations) • Reduces search space by ~30%

I  █████████████░░░░░░ 88%
   Appears in 86% of remaining words • Fits multiple positions (6 locations) • Reduces search space by ~30%

A  ██████████░░░░░░░░░ 74%
   Common in 64% of candidates • Fits multiple positions (5 locations) • Reduces search space by ~30%
```

### 2. Difficulty Modes

* **Easy** — Common vocabulary (~50 words)
* **Medium** — Standard vocabulary (~150 words)
* **Expert** — Longer and more difficult words
* **Programming** — Tech and ML-related terminology

### 3. Prediction Explanations 📊

Each prediction includes a short explanation showing:

* How often the letter appears in remaining words
* How many positions the letter could fit
* Estimated reduction of the search space

### 4. Game Statistics 📈

Tracks player stats in localStorage:

* Games played
* Win rate
* Average guesses per game
* AI hints used
* Prediction accuracy

### 5. UI & Design ✨

* Dark theme with glassmorphism styling
* Responsive layout for desktop and mobile
* Smooth animations and transitions
* Keyboard-friendly controls

## 🏗️ Architecture

### Tech Stack

#### Frontend

* React 19.2
* TypeScript 6.0
* Vite

#### AI / ML

* Transformers.js 2.17
* Client-side inference
* Confidence scoring system

#### State & Persistence

* React hooks
* localStorage for saved stats

#### Styling

* Custom CSS
* CSS variables for theming
* Responsive design

## 📁 Project Structure

```txt
App.tsx
├── AIPanel.tsx
├── DifficultySelector.tsx
├── StatsDisplay.tsx
├── GameStatus.tsx
└── Game Board & Controls

Utils/
├── aiPredictions.ts
├── gameLogic.ts
├── gameStats.ts
└── wordsByDifficulty.ts

Types/
└── index.ts
```

## ⚙️ AI Prediction Flow

```txt
User Guess
    ↓
Update Pattern
    ↓
Filter Candidate Words
    ↓
Analyze Frequencies
    ↓
Calculate Confidence Scores
    ↓
Generate Explanations
    ↓
Display Top Predictions
```

## 📊 Performance

* Prediction generation: typically under 50ms
* Average candidate reduction: ~71%
* Cached models after first load
* Works offline once assets are loaded

### Bundle Size

* Main app: ~210KB (67KB gzipped)
* Transformers.js model: ~805KB (189KB gzipped)

## 🛠️ Development Notes

### Why Client-Side Inference?

* No backend required
* Faster response times
* Predictions stay local to the browser
* Offline support after initial load

### Why TypeScript?

* Better type safety
* Easier refactoring
* Improved editor support

### Why Component-Based Design?

* Easier to scale
* Cleaner separation of concerns
* Simpler testing and maintenance

## 🚀 Getting Started

### Prerequisites

* Node.js 18+
* npm 9+
* Modern browser with ES2020 support

### Installation

```bash
# Clone repository
git clone <repository-url>

# Enter project folder
cd crk-hangman

# Install dependencies
npm install

# Start development server
npm run dev
```

Open:

```txt
http://localhost:5173/crk-hangman/
```

### Production Build

```bash
npm run build
npm run preview
```
