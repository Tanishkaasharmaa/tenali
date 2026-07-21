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
    "worldId": "number_kingdom",
    "worldName": "Number Kingdom (Beginner)",
    "requiredUnlockXP": 0,
    "themeColor": "#3b82f6",
    "levelRange": [1, 10]
  },
  {
    "worldId": "arithmetic_kingdom",
    "worldName": "Arithmetic Kingdom",
    "requiredUnlockXP": 500,
    "themeColor": "#e8864a",
    "levelRange": [11, 20]
  },
  {
    "worldId": "geometry_kingdom",
    "worldName": "Geometry Kingdom",
    "requiredUnlockXP": 1000,
    "themeColor": "#10b981",
    "levelRange": [21, 30]
  },
  {
    "worldId": "algebra_kingdom",
    "worldName": "Algebra Kingdom",
    "requiredUnlockXP": 1500,
    "themeColor": "#f59e0b",
    "levelRange": [31, 40]
  },
  {
    "worldId": "advanced_math",
    "worldName": "Advanced Mathematics",
    "requiredUnlockXP": 2000,
    "themeColor": "#8b5cf6",
    "levelRange": [41, 50]
  },
  {
    "worldId": "coordinate_calculus",
    "worldName": "Coordinate & Calculus",
    "requiredUnlockXP": 2500,
    "themeColor": "#ec4899",
    "levelRange": [51, 60]
  },
  {
    "worldId": "data_logic",
    "worldName": "Data & Logic",
    "requiredUnlockXP": 3000,
    "themeColor": "#6b7280",
    "levelRange": [61, 66]
  }
]
```

### B. Levels Mapping (`levels.json`)
Maps individual levels to their respective mathematical concepts.
```json
[
  { "levelNum": 1, "worldId": "number_kingdom", "conceptId": "addition" },
  { "levelNum": 2, "worldId": "number_kingdom", "conceptId": "column_addition" },
  { "levelNum": 3, "worldId": "number_kingdom", "conceptId": "subtraction" },
  { "levelNum": 4, "worldId": "number_kingdom", "conceptId": "multiplication" },
  { "levelNum": 5, "number_kingdom", "conceptId": "column_multiplication" },
  { "levelNum": 6, "worldId": "number_kingdom", "conceptId": "decimals" },
  { "levelNum": 7, "worldId": "number_kingdom", "conceptId": "fractions" },
  { "levelNum": 8, "worldId": "number_kingdom", "conceptId": "hcf_lcm" },
  { "levelNum": 9, "worldId": "number_kingdom", "conceptId": "prime_factors" },
  { "levelNum": 10, "worldId": "number_kingdom", "conceptId": "rounding" },

  { "levelNum": 11, "worldId": "arithmetic_kingdom", "conceptId": "arithmetic" },
  { "levelNum": 12, "worldId": "arithmetic_kingdom", "conceptId": "percentages" },
  { "levelNum": 13, "worldId": "arithmetic_kingdom", "conceptId": "ratio" },
  { "levelNum": 14, "worldId": "arithmetic_kingdom", "conceptId": "profit_loss" },
  { "levelNum": 15, "worldId": "arithmetic_kingdom", "conceptId": "gst" },
  { "levelNum": 16, "worldId": "arithmetic_kingdom", "conceptId": "banking_rd" },
  { "levelNum": 17, "worldId": "arithmetic_kingdom", "conceptId": "shares_dividends" },
  { "levelNum": 18, "worldId": "arithmetic_kingdom", "conceptId": "speed_distance_time" },
  { "levelNum": 19, "worldId": "arithmetic_kingdom", "conceptId": "standard_form" },
  { "levelNum": 20, "worldId": "arithmetic_kingdom", "conceptId": "number_bases" },

  { "levelNum": 21, "worldId": "geometry_kingdom", "conceptId": "angles" },
  { "levelNum": 22, "worldId": "geometry_kingdom", "conceptId": "triangles" },
  { "levelNum": 23, "worldId": "geometry_kingdom", "conceptId": "congruence" },
  { "levelNum": 24, "worldId": "geometry_kingdom", "conceptId": "similarity" },
  { "levelNum": 25, "worldId": "geometry_kingdom", "conceptId": "polygons" },
  { "levelNum": 26, "worldId": "geometry_kingdom", "conceptId": "circle_theorems" },
  { "levelNum": 27, "worldId": "geometry_kingdom", "conceptId": "herons_formula" },
  { "levelNum": 28, "worldId": "geometry_kingdom", "conceptId": "pythagoras_theorem" },
  { "levelNum": 29, "worldId": "geometry_kingdom", "conceptId": "circular_measure" },
  { "levelNum": 30, "worldId": "geometry_kingdom", "conceptId": "transformations" },

  { "levelNum": 31, "worldId": "algebra_kingdom", "conceptId": "linear_equations" },
  { "levelNum": 32, "worldId": "algebra_kingdom", "conceptId": "simultaneous_equations" },
  { "levelNum": 33, "worldId": "algebra_kingdom", "conceptId": "inequalities" },
  { "levelNum": 34, "worldId": "algebra_kingdom", "conceptId": "functions" },
  { "levelNum": 35, "worldId": "algebra_kingdom", "conceptId": "indices" },
  { "levelNum": 36, "worldId": "algebra_kingdom", "conceptId": "surds" },
  { "levelNum": 37, "worldId": "algebra_kingdom", "conceptId": "quadratics_formula" },
  { "levelNum": 38, "worldId": "algebra_kingdom", "conceptId": "polynomial_factorization" },
  { "levelNum": 39, "worldId": "algebra_kingdom", "conceptId": "polynomial_multiplication" },
  { "levelNum": 40, "worldId": "algebra_kingdom", "conceptId": "algebraic_fractions" },

  { "levelNum": 41, "worldId": "advanced_math", "conceptId": "matrices" },
  { "levelNum": 42, "worldId": "advanced_math", "conceptId": "vectors" },
  { "levelNum": 43, "worldId": "advanced_math", "conceptId": "dot_products" },
  { "levelNum": 44, "worldId": "advanced_math", "conceptId": "linear_algebra" },
  { "levelNum": 45, "worldId": "advanced_math", "conceptId": "logarithms" },
  { "levelNum": 46, "worldId": "advanced_math", "conceptId": "sequences" },
  { "levelNum": 47, "worldId": "advanced_math", "conceptId": "binomial_theorem" },
  { "levelNum": 48, "worldId": "advanced_math", "conceptId": "complex_numbers" },
  { "levelNum": 49, "worldId": "advanced_math", "conceptId": "permutations_combinations" },
  { "levelNum": 50, "worldId": "advanced_math", "conceptId": "probability" },

  { "levelNum": 51, "worldId": "coordinate_calculus", "conceptId": "coordinate_geometry" },
  { "levelNum": 52, "worldId": "coordinate_calculus", "conceptId": "line_equation" },
  { "levelNum": 53, "worldId": "coordinate_calculus", "conceptId": "section_formula" },
  { "levelNum": 54, "worldId": "coordinate_calculus", "conceptId": "conic_sections" },
  { "levelNum": 55, "worldId": "coordinate_calculus", "conceptId": "limits" },
  { "levelNum": 56, "worldId": "coordinate_calculus", "conceptId": "differentiation" },
  { "levelNum": 57, "worldId": "coordinate_calculus", "conceptId": "integration" },
  { "levelNum": 58, "worldId": "coordinate_calculus", "conceptId": "differential_equations" },
  { "levelNum": 59, "worldId": "coordinate_calculus", "conceptId": "inverse_trigonometry" },
  { "levelNum": 60, "worldId": "coordinate_calculus", "conceptId": "trigonometry" },

  { "levelNum": 61, "worldId": "data_logic", "conceptId": "statistics" },
  { "levelNum": 62, "worldId": "data_logic", "conceptId": "mean" },
  { "levelNum": 63, "worldId": "data_logic", "conceptId": "sets" },
  { "levelNum": 64, "worldId": "data_logic", "conceptId": "venn_diagram" },
  { "levelNum": 65, "worldId": "data_logic", "conceptId": "variation" },
  { "levelNum": 66, "worldId": "data_logic", "conceptId": "vocabulary" }
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

To minimize visual clutter and cognitive overload, the interface avoids side-by-side elements. Instead, the user transitions through a clean, one-screen-at-a-time sequence:

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
    *   *Speech Cloud Clue*: The active clue appears directly inside Tenali's mind speech cloud bubble, eliminating separate boxes.
    *   *Progress Dots*: Low-key timeline dots indicating which clue index is currently active.
    *   *4 Blank Spaces (Thought Boxes)*: 4 inline text input spaces displayed below the bubble for the student to write guessed topics (notes drawer removed).
5.  **`GUESS_SCREEN`**: A dedicated overlay displaying only a free-text input box where the student writes the answer (no autocomplete selection).
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
3.  **`GameplayDashboard`**: Concentrates the active view onto Tenali's Mind Cloud. Displays the current clue text inside the speech bubble. Renders 4 inline inputs for writing scratchpad notes.
4.  **`ConceptSearchBox`**: Clean full-screen free-text entry guess card.
5.  **`EducationalReviewCard`**: Clean scrollable card summarizing CBSE syllabus linkages.

---

## 7. Development Roadmap & Milestones

### Milestone 1 — Core Infrastructure
*   **Task 1.1**: Define and structure database models in `auth.js` (worldProgress, levelProgress, xp). [x]
*   **Task 1.2**: Write JSON dataset files (`worlds.json`, `levels.json`, `concepts.json`) under `server/data/`. [x]
*   **Task 1.3**: Set up in-memory session mapping with automatic expiry sweeps inside `index.js`. [x]

### Milestone 2 — Gameplay Loops & Endpoints
*   **Task 2.1**: Implement backend session APIs (`/start`, `/next-clue`, `/use-hint`, `/submit-guess`). [x]
*   **Task 2.2**: Integrate Tenali SVG expressions changing eyes/mouth depending on current clue count and victory states. [x]
*   **Task 2.3**: Build frontend game controller loop switching between Setup, Playing, and Results states. [x]

### Milestone 3 — Gamification & Progression
*   **Task 3.1**: Implement backend XP rewards, star assessments, and MRR point additions. [x]
*   **Task 3.2**: Create the interactive Candy-Crush map SVG component dynamically matching levels layout. [x]
*   **Task 3.3**: Write CSS animations overlaying transition star sparkles and level unlock unlocks. [x]

### Milestone 4 — Analytics Telemetry
*   **Task 4.1**: Create MongoDB `MindReaderAnalytic2` schema logging completion times, wrong guesses, hints used. [x]
*   **Task 4.2**: Feed analytical indicators on successful/unsuccessful guess completions. [x]

### Milestone 5 — Testing
*   **Task 5.1**: Write a script `test_guess_mind.js` validating perfect runs, hint penalties, and incorrect guess locks. [x]
*   **Task 5.2**: Test concurrent session initializations for multi-student safety. [x]

### Milestone 6 — Deployment
*   **Task 6.1**: Run staging compilation `npm run build` and run server checks locally. [x]
*   **Task 6.2**: Deploy to Render and perform remote diagnostics checks.
