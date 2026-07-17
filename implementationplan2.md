# Implementation Plan — Tenali Reverse Mind Reader (MVP)

This document details the multi-phase technical plan for implementing the role-reversed **Tenali Reverse Mind Reader** game. In this version, Tenali selects a secret concept, and the player asks questions to narrow it down and submit a guess.

---

## Technical Overview & Decisions

- **Session Caching**: Session states will be cached in-memory on the Express backend (`server/index.js` using a `Map` structure or a simple TTL cache object). This ensures fast updates and avoids database write operations for active game turns.
- **Deterministic Question System**: Predefined questions (about 40-60 items mapped to specific attributes) will be loaded from a static list in the knowledge base. No LLM processing is used in the MVP, ensuring 100% deterministic, lag-free logic.

---

## Phase 1 — Core Backend & In-Memory Sessions

### Task 1.1: Game Session Schema & Cache
Create an in-memory session manager on the backend.
- Define a `GameSession` object:
  ```javascript
  class GameSession {
    constructor(gameId, selectedConcept, difficulty = 'easy') {
      this.gameId = gameId;
      this.selectedConcept = selectedConcept; // Full concept object
      this.difficulty = difficulty;
      this.questionsRemaining = 10;
      this.hintsRemaining = 2;
      this.askedQuestions = []; // Array of questionIds
      this.guessed = false;
      this.createdAt = new Date();
    }
  }
  ```
- Store session objects in a global server object `const activeSessions = new Map();`. Implement a cleanup interval to clear sessions older than 30 minutes.

### Task 1.2: Endpoint Implementation (`server/index.js`)

Implement the following Express routes:

1. **`POST /api/game/start`**
   - Choose a random concept from the extended concept pool.
   - Generate a unique `gameId` (using `crypto.randomUUID()`).
   - Create a new `GameSession`, store it in `activeSessions`, and return:
     ```json
     { "gameId": "...", "questionsRemaining": 10, "hintsRemaining": 2, "state": "PLAYING" }
     ```

2. **`POST /api/game/question`**
   - Body: `{ gameId, questionId }`
   - Retrieve session. If not found, return 404.
   - Validate that `questionId` is in the predefined Question Library and has not been asked yet.
   - Look up the attribute mapping of `questionId` on `session.selectedConcept.attributes` (e.g. returns `true`, `false`, or `null`).
   - Decrease `questionsRemaining` by 1. Add `questionId` to `askedQuestions`.
   - Pick a random personality response based on the answer value (`yes`, `no`, `dontknow`).
   - Return:
     ```json
     { "dialogue": "...", "answer": "yes|no|dontknow", "questionsRemaining": X }
     ```

3. **`POST /api/game/hint`**
   - Body: `{ gameId }`
   - Retrieve session. Check `hintsRemaining`. If `0`, return error.
   - Return the next hint (`hint1` if `hintsRemaining === 2`, `hint2` if `hintsRemaining === 1`).
   - Decrease `hintsRemaining` by 1.
   - Return:
     ```json
     { "dialogue": "A clue emerges: ...", "hint": "...", "hintsRemaining": Y }
     ```

4. **`POST /api/game/guess`**
   - Body: `{ gameId, guess }`
   - Retrieve session.
   - Normalize names (lowercase, trim spaces) and compare player's `guess` with `session.selectedConcept.name`.
   - Compute rewards:
     - Correct: `+20` MRR points (or more based on remaining questions/hints bonus).
     - Incorrect: `-5` MRR points.
     - Save game analytics to `MindReaderAnalytic` schema in MongoDB.
     - Evict session from `activeSessions` cache.
   - Return outcome details:
     ```json
     { "correct": true|false, "reward": { "mrrChange": X }, "concept": { ... } }
     ```

---

## Phase 2 — Knowledge Base Extension

Modify the KB file or create a separate module (e.g., `mindReaderKB2.js`) to support the new game attributes:

### Task 2.1: Concept Dictionary Expansion
- Expand the current list of 15 concepts to 20–30 curriculum-aligned topics (e.g., adding `FractionsIntro`, `Symmetry`, `PrimeFactorization`, `CompositeNumber`, `Coordinates`, etc.).
- Add keys: `examples` (array), `attributes` (object containing 13 binary/numeric variables), `hints` (object containing `hint1` and `hint2`), `funFact` (string), `relatedLesson` (string), and `commonMistakes` (string).

### Task 2.2: Attribute Dictionary
Define these standard boolean attributes for each concept:
1. `isGeometry`
2. `isAlgebra`
3. `isNumber`
4. `isFormula`
5. `isOperation`
6. `isTheorem`
7. `usesDiagram`
8. `containsVariables`
9. `usesFractions`
10. `hasGraph`
11. `requiresCalculation`
12. `realWorldApplication`
13. `gradeLevel` (number, e.g., 6)

### Task 2.3: Question Library Definitions
Define the 40–60 questions library. Example mappings:
- `q_algebra`: *Does it belong to Algebra?* => maps to `attributes.isAlgebra`
- `q_geometry`: *Does it belong to Geometry?* => maps to `attributes.isGeometry`
- `q_variables`: *Does it use variables?* => maps to `attributes.containsVariables`
- `q_diagrams`: *Does it require diagrams?* => maps to `attributes.usesDiagram`

---

## Phase 3 — Frontend Gameplay Interface (`client/src/App.jsx`)

Replace (or fork) the current `MindReaderApp` component:

### Task 3.1: Lobby & Setup Screen
- Change story narrative text:
  *"I have hidden one mathematical secret. Can you discover it in 10 questions or less?"*
- Display start game button "Start Challenge".

### Task 3.2: Preparing Screen
- Trigger transitional animation displaying: *"Selecting today's challenge..."* while firing the `POST /api/game/start` request.

### Task 3.3: Play Board Layout
- **HUD Row**: Show remaining questions, remaining hints, and player's MRR rating.
- **Tenali Avatar & Speech Bubble**: Renders the SVG avatar with corresponding dynamic expressions. Thought/speech cloud displays Tenali's feedback dialogue.
- **Categories Selector**: Tabs or buttons for: `Definition`, `Category`, `Properties`, `Applications`.
- **Questions Display**: Shows questions belonging to the active selected category. Disable buttons for questions already asked in this session (`session.askedQuestions`).
- **Conversation History**: Scrollable chat-like transcript listing:
  - *Student*: "Does it belong to Algebra?"
  - *Tenali*: "Not at all. No."

### Task 3.4: Guess Dialog Box
- Implement a search box dropdown that displays the list of concepts with autocomplete filter.
- Submit button triggers `/api/game/guess`.

### Task 3.5: Results Screen
- Celebrate correct guesses with confetti effects.
- Display cards explaining:
  - Correct Answer
  - Definition & Examples
  - Prerequisite & Related lessons
  - Fun Fact
- Show MRR changes animated counters.

---

## Phase 4 — Visuals, Rewards & Telemetry

### Task 4.1: Avatar Expressions Integration
Trigger CSS animations and update SVG mouth/eye designs for the expressions:
- `thinking`: Neutral/closed mouth, analytical eyes (during start/pre-question states).
- `happy`: Smirking mouth, glowing eyes (on positive YES attribute lookup).
- `serious`: Narrowed eyes, neutral mouth (on negative NO attribute lookup).
- `hinting`: One eye winking, lips puckered (delivering general/specific hints).
- `impressed`: Large smile, wide eyes (victory guess).
- `proud`: Arm-crossed stance or proud smirk (when player fails to guess).

### Task 4.2: Rewards System Integration
- Base Correct Guess: `+20` MRR points.
- Question Saving Bonus: `+2` MRR per unused question.
- Hint Saving Bonus: `+5` MRR per unused hint.
- Streak Multiplier: Consecutive wins add multipliers up to `1.5x`.
- Equipped titles and unlocked skins remain compatible.

### Task 4.3: Analytics Telemetry
Modify backend end game save to record:
- Concept name
- Number of questions asked
- Order of asked questions
- Number of hints requested
- Incorrect guesses attempted
- Completion time (in seconds)
- Save details to Mongo for analytics dashboard rendering.

---

## Verification & Test Plan

### Backend Unit Tests (`server/test_mindreader.js` or `test_reverse_mindreader.js`)
Create a node script simulating a full session:
1. Start game, fetch `gameId`.
2. Select random question categories and query attribute lookups.
3. Assert remaining questions decrement correctly.
4. Request hints, assert hints decrement and return strings.
5. Guess the concept correctly (assert winning payload).
6. Verify game analytics database insertions.

### Frontend Integration
- Navigate to `/mindreader` and walk through the flow.
- Ensure already-asked questions are disabled and unavailable for double-asking.
- Ensure the autocomplete search box filters the pool of 20-30 concepts correctly.
- Verify rating changes save correctly to MongoDB profiles or guest localStorage.
