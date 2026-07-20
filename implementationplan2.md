# Implementation Plan — Guess What's On Tenali's Mind (MVP)

This document details the software architecture, progression rules, database schema updates, API endpoints, frontend sequential state machines, testing patterns, and deployment paths for **Guess What's On Tenali's Mind** (Reverse Mind Reader v2.0).

---

## 1. System Architecture & Scalability Design

To support adding thousands of mathematical concepts later without code modifications, the system is designed around declarative content JSON configuration files loaded at startup, and session-based execution on the backend.

```
server/
  ├── mindReaderKB2.js        # Exports loaded JSON configs & helper functions
  └── data/
      ├── worlds.json         # Kingdom declarations & locking criteria
      ├── levels.json         # Level mapping to concepts
      └── concepts.json       # Mathematical concept clues, hints, & curriculum info
```

### Technical Decisions
*   **Zero AI Costs**: The gameplay utilizes structured mathematical profiles, clues, and responses, avoiding expensive real-time LLM inference.
*   **In-Memory Session Cache**: Active game states are managed in-memory on the server (`server/index.js` using `Map` with a 30-minute eviction interval) to prevent database polling during clue progression.
*   **State Locking**: Progress is validated on the backend at level load and completion times.

---

## 2. Data Models & JSON Schemas

### A. Worlds Configuration (`worlds.json`)
Defines kingdoms, required completion criteria, and metadata.
```json
[
  {
    "worldId": "arithmetic_kingdom",
    "worldName": "Arithmetic Kingdom",
    "requiredUnlockXP": 0,
    "themeColor": "#e8864a",
    "levelRange": [1, 5]
  },
  {
    "worldId": "geometry_kingdom",
    "worldName": "Geometry Kingdom",
    "requiredUnlockXP": 500,
    "themeColor": "#5cb87a",
    "levelRange": [6, 10]
  }
]
```

### B. Levels Mapping (`levels.json`)
Maps individual levels to their respective mathematical concepts.
```json
[
  { "levelNum": 1, "worldId": "arithmetic_kingdom", "conceptId": "prime_number" },
  { "levelNum": 2, "worldId": "arithmetic_kingdom", "conceptId": "factors" },
  { "levelNum": 3, "worldId": "arithmetic_kingdom", "conceptId": "multiples" },
  { "levelNum": 4, "worldId": "arithmetic_kingdom", "conceptId": "lcm" },
  { "levelNum": 5, "worldId": "arithmetic_kingdom", "conceptId": "hcf" }
]
```

### C. Concepts Dictionary (`concepts.json`)
Defines clues, progressive hints, and curricular reinforcement cards.
```json
{
  "prime_number": {
    "conceptId": "prime_number",
    "name": "Prime Number",
    "clues": [
      "I belong to the world of numbers.",
      "I always have exactly two positive divisors.",
      "Cryptography depends heavily on me.",
      "The smallest member of my family is 2.",
      "My opposite is Composite Number."
    ],
    "hints": [
      "I am an Arithmetic category topic.",
      "Typically introduced in Grade 6.",
      "My name starts with the letter 'P'."
    ],
    "educationalInfo": {
      "definition": "A whole number greater than 1 with exactly two positive divisors: 1 and itself.",
      "examples": ["2", "3", "5", "7", "11", "13"],
      "commonMistakes": "Many students confuse prime numbers with odd numbers, thinking 9 or 15 are primes when they are composite. Also, 1 is NOT prime.",
      "funFact": "The number 2 is the only even prime number. All other prime numbers are odd!",
      "relatedLesson": "Factors and Multiples",
      "practiceQuestions": [
        "Identify the prime numbers: 2, 9, 13, 21.",
        "Why is 1 not considered a prime number?"
      ]
    }
  }
}
```

### D. Database Extensions (`server/auth.js`)
We extend the user document schema to capture progression metrics:
```javascript
const UserSchema = new mongoose.Schema({
  // ... existing fields (username, passwordHash, mrr) ...
  xp: { type: Number, default: 0 },
  worldProgress: [{
    worldId: { type: String, required: true },
    unlocked: { type: Boolean, default: false }
  }],
  levelProgress: [{
    levelNum: { type: Number, required: true },
    conceptId: { type: String, required: true },
    starsEarned: { type: Number, default: 0 }, // 0 to 3 stars
    completedAt: { type: Date, default: Date.now }
  }]
});
```

---

## 3. Sequential Game Flow & State Machine

To minimize visual clutter and cognitive overload, the interface avoids side-by-side elements (like showing the notebook, clues list, and guess box simultaneously). Instead, the user transitions through a clean, one-screen-at-a-time sequence:

```
[ INTRO ]  --->  [ WORLD SELECT ]  --->  [ LEVEL SELECT ]  --->  [ GAMEPLAY: CLUE STEP ]
                                                                           |
                                                                           v
[ OUTCOME CARD ]  <---  [ EDUCATIONAL REVIEW ]  <---  [ GUESS DIALOG ]  <--+
```

### Sequential Phases
1.  **`INTRO`**: A clean, distraction-free screen introducing the core prompt. Displays only a short narrative, simple reward thresholds, and an "Enter the Kingdoms" button.
2.  **`WORLD_SELECT`**: A minimal list of Kingdoms. Shows one active Kingdom at a time with horizontal swipe arrows, hiding locked worlds to avoid visual noise.
3.  **`LEVEL_SELECT`**: A simple vertical track showing only the levels of the chosen Kingdom. Unlocked nodes are highlighted; locked levels are grayed out.
4.  **`PLAYING_CLUES`**: A minimal clue dashboard:
    *   *Single Active Clue*: Shows **only** the current clue card center-stage with large typography. Previous clues are hidden to prevent visual clutter.
    *   *Next Clue Button*: Progresses to the next clue card.
    *   *Toggleable Notebook Drawer*: Toggling slide-out sidebar for typing notes. Keeps the main screen clean.
    *   *Progress Dots*: Low-key timeline dots indicating which clue index is currently active.
5.  **`GUESS_SCREEN`**: A dedicated overlay displaying only a fuzzy-search autocomplete search box.
6.  **`RESULT_OUTCOME`**: Minimal completion screen displaying stars earned, XP updates, and a "Review Concept Card" button.
7.  **`EDUCATIONAL_REVIEW`**: Clean full-page reading card showing definitions, examples, mistakes, and practice questions.

---

## 4. Gamification, Progression, & Locking Logic

### A. Level Unlock Checks
*   **Kingdom Unlocks**: A world is unlocked if the user's total XP is $\ge$ `world.requiredUnlockXP`.
*   **Level Unlocks**: Within an unlocked world, level $N$ is unlocked if level $N-1$ has been completed with $\ge 1$ star. Level 1 is unlocked by default.

### B. Reward Calculations
Upon a successful guess:
$$\text{Stars Earned} = \begin{cases} 
3 & \text{guessed at Clue 1 or 2} \\
2 & \text{guessed at Clue 3 or 4} \\
1 & \text{guessed at Clue 5} 
\end{cases}$$

$$\text{MRR Delta} = \max(5, 15 + (5 \times \text{Unused Clues}) - (3 \times \text{Hints Used}))$$
*   Unused Clues = $5 - \text{Current Clue Index}$ (at guess time).
*   Hints Used = $0$ to $3$.
*   Incorrect Guess Penalty: $-5$ MRR (only one final guess allowed per level run).

$$\text{XP Earned} = \begin{cases}
100 \text{ XP} & \text{First level completion} \\
50 \text{ XP} & \text{Perfect Run Bonus (No hints, } \ge 3 \text{ stars)} \\
20 \text{ XP} & \text{Replaying completed level}
\end{cases}$$

---

## 5. API Design & Endpoints

### 1. `GET /api/mindreader/worlds`
Retrieves worlds progress map for the logged-in user.
*   **Response**:
    ```json
    {
      "xp": 620,
      "worlds": [
        { "worldId": "arithmetic_kingdom", "worldName": "Arithmetic Kingdom", "unlocked": true, "stars": 12 },
        { "worldId": "geometry_kingdom", "worldName": "Geometry Kingdom", "unlocked": true, "stars": 4 },
        { "worldId": "algebra_kingdom", "worldName": "Algebra Kingdom", "unlocked": false, "stars": 0 }
      ],
      "levelProgress": { "1": 3, "2": 3, "3": 2, "4": 1, "5": 0 }
    }
    ```

### 2. `POST /api/mindreader/start`
Initializes a new level game session. Hides the target concept name.
*   **Request Body**: `{ "levelNum": 1 }`
*   **Response**:
    ```json
    {
      "gameId": "sess_uuid_98328723",
      "levelNum": 1,
      "clue": "I belong to the world of numbers.",
      "clueIndex": 0,
      "hintsRemaining": 3
    }
    ```

### 3. `POST /api/mindreader/next-clue`
Reveals the next progressive clue.
*   **Request Body**: `{ "gameId": "sess_uuid_98328723" }`
*   **Response**:
    ```json
    {
      "clue": "I always have exactly two positive divisors.",
      "clueIndex": 1,
      "cluesExhausted": false
    }
    ```

### 4. `POST /api/mindreader/use-hint`
Retrieves the next progressive hint.
*   **Request Body**: `{ "gameId": "sess_uuid_98328723" }`
*   **Response**:
    ```json
    {
      "hint": "I am an Arithmetic category topic.",
      "hintsRemaining": 2
    }
    ```

### 5. `POST /api/mindreader/submit-guess`
Evaluates the final guess, commits changes to DB, and returns results.
*   **Request Body**: `{ "gameId": "sess_uuid_98328723", "guess": "Prime Number" }`
*   **Response**:
    ```json
    {
      "correct": true,
      "actualConcept": "Prime Number",
      "starsEarned": 3,
      "mrrChange": 30,
      "xpEarned": 150,
      "educationalInfo": {
        "definition": "...",
        "examples": ["..."],
        "funFact": "...",
        "relatedLesson": "..."
      }
    }
    ```

---

## 6. Frontend Components Schema

We will introduce a separate UI container `GuessMindApp` inside `App.jsx` composed of:
1.  **`WorldSelector`**: Minimal horizontal sliding cards displaying one active world at a time.
2.  **`LevelMap`**: Simple vertical path bubbles linked by clean SVG lines.
3.  **`GameplayDashboard`**: Concentrates the active view onto a single Clue Card. Contains simple options to reveal clues, request a hint, type in a drawer-collapsible notebook, or initiate a guess.
4.  **`ConceptSearchBox`**: Clean full-screen autocomplete input search layout.
5.  **`EducationalReviewCard`**: Clean scrollable card summarizing CBSE syllabus linkages.

---

## 7. Development Roadmap & Milestones

### Milestone 1 — Core Infrastructure
*   **Task 1.1**: Define and structure database models in `auth.js` (worldProgress, levelProgress, xp).
*   **Task 1.2**: Write JSON dataset files (`worlds.json`, `levels.json`, `concepts.json`) under `server/data/`.
*   **Task 1.3**: Set up in-memory session mapping with automatic expiry sweeps inside `index.js`.

### Milestone 2 — Gameplay Loops & Endpoints
*   **Task 2.1**: Implement backend session APIs (`/start`, `/next-clue`, `/use-hint`, `/submit-guess`).
*   **Task 2.2**: Integrate Tenali SVG expressions changing eyes/mouth depending on current clue count and victory states.
*   **Task 2.3**: Build frontend game controller loop switching between Setup, Playing, and Results states.

### Milestone 3 — Gamification & Progression
*   **Task 3.1**: Implement backend XP rewards, star assessments, and MRR point additions.
*   **Task 3.2**: Create the interactive Candy-Crush map SVG component dynamically matching levels layout.
*   **Task 3.3**: Write CSS animations overlaying transition star sparkles and level unlock unlocks.

### Milestone 4 — Analytics Telemetry
*   **Task 4.1**: Create MongoDB `MindReaderAnalytic2` schema logging completion times, wrong guesses, hints used.
*   **Task 4.2**: Feed analytical indicators on successful/unsuccessful guess completions.

### Milestone 5 — Testing
*   **Task 5.1**: Write a script `test_guess_mind.js` validating perfect runs, hint penalties, and incorrect guess locks.
*   **Task 5.2**: Test concurrent session initializations for multi-student safety.

### Milestone 6 — Deployment
*   **Task 6.1**: Run staging compilation `npm run build` and run server checks locally.
*   **Task 6.2**: Deploy to Render and perform remote diagnostics checks.
