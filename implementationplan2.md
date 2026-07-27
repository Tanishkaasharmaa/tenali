# Implementation Plan — Guess What's On Tenali's Mind (v2.0 5-Round Deduction Engine)

This document details the game design specification, educational deduction framework, software architecture, data models, API endpoints, frontend state machines, and implementation roadmap for **Guess What's On Tenali's Mind**.

---

## 1. Executive Summary & Design Philosophy

"Guess What's On Tenali's Mind" is a 5-round gamified educational deduction engine designed for students aged 4–18. Rather than presenting standard textbook Multiple Choice Questions (MCQs) or asking for immediate definitions, the game trains students to think like **detectives** using concept discrimination and progressive uncertainty reduction.

### Core Principles
* **Concept Discrimination over Memorization**: Every level consists of a family of 4 closely related concepts (e.g., *Whole Numbers, Integers, Fractions, Decimal Numbers*). Students must identify what makes the target concept distinct from its close relatives.
* **5-Round Detective Progression**: Tenali secretly chooses 1 of the 4 options. Across 5 rounds, Tenali reveals clues designed according to strict pedagogical rules to reduce uncertainty step-by-step.
* **Multi-Selection Confidence Building**: In rounds 1 through 5, students select **one or more candidate options** they believe are still possible. They can update their thinking each round as evidence mounts.
* **End-of-Level Reflection & Final Guess**: After Round 5, students view a summary histogram of how many times they selected each option across all 5 rounds, building confidence before submitting their **one final guess**.
* **Zero-Inference Latency & Cost**: Uses declarative JSON question banks loaded into memory on server startup rather than real-time LLM calls.

---

## 2. 5-Round Clue Progression Framework

Every level follows a standardized 5-round evidence progression designed to guide student reasoning without revealing the answer prematurely:

| Round | Evidence Type | Objective & Clue Characteristics | Target Uncertainty State |
| :--- | :--- | :--- | :--- |
| **Round 1** | **Observation** | Visuals, examples, patterns, or real objects to observe. Tenali speaks in intriguing, simple terms. | **3–4 options** seem possible. |
| **Round 2** | **Property** | Reveals a key characteristic or property without giving a full textbook definition. | **1 option** becomes unlikely (3 remain). |
| **Round 3** | **Elimination** | Tests edge cases, rule exceptions, or negative constraints ("Which example breaks my rule?"). | **1 option eliminated** (2 remain). |
| **Round 4** | **Real-Life Application** | Practical scenario (e.g., temperature, money, pizza slices, measurement, distance, sports). | **2 options** realistically remain under consideration. |
| **Round 5** | **Final Defining Clue** | Key discriminator feature that uniquely identifies the secret concept. | **Only 1 option** fits perfectly. |

---

## 3. Game Mechanics & User Experience Flow

```
[ LEVEL SELECT ]
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│                    ROUND 1 to 5 LOOP                    │
│ 1. Tenali presents Round N Clue                         │
│ 2. Student selects candidate options (☐ Whole ☐ Integers)│
│ 3. Selections recorded → Advance to Round N+1           │
└──────────────────────────┬──────────────────────────────┘
                           │ (After Round 5)
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   END OF LEVEL SUMMARY                  │
│ Histogram: Selection count across all 5 rounds          │
│ Example: Whole Numbers ████ (4), Integers ██ (2)...     │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    ONE FINAL GUESS                      │
│ Student submits their final chosen concept              │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 OUTCOME & WISDOM SCROLL                 │
│ Victory/Defeat screen, Stars, XP, and Educational Card  │
└─────────────────────────────────────────────────────────┘
```

### Round-by-Round Interaction Rules
1. **Clue Display**: Tenali's clue is displayed inside Tenali's Mind speech bubble.
2. **Candidate Checkboxes**: The 4 level options are rendered with toggleable checkboxes. In rounds 1–4, students can check any number of options ($1$ to $4$).
3. **No Lock-In**: Student selections are recorded per round. Students are free to modify their selections in subsequent rounds as new clues arrive.
4. **Summary & Final Selection**: After Round 5, a visual bar chart shows their candidate picks across all 5 rounds. The student then taps **one single option** as their final answer.

---

## 4. Data Models & JSON Schemas

The system uses three declarative configuration files in `server/data/`:
1. `worlds.json` - Kingdom boundaries and XP requirements.
2. `levels.json` - Level mappings, titles, and candidate option sets.
3. `question_banks.json` (or integrated in `concepts.json`) - Complete 5-round clue banks for all 4 concepts per level.

### A. Level Schema (`levels.json`)
```json
[
  {
    "levelNum": 1,
    "worldId": "number_kingdom",
    "levelName": "Number Sets",
    "options": [
      "Whole Numbers",
      "Integers",
      "Fractions",
      "Decimal Numbers"
    ]
  }
]
```

### B. Number Kingdom Curriculum Division (Levels 1–15)

| Level | Family / Level Name | Options (Candidate Concepts) |
| :--- | :--- | :--- |
| **1** | Number Sets | Whole Numbers, Integers, Fractions, Decimal Numbers |
| **2** | Number Properties | Even Numbers, Odd Numbers, Prime Numbers, Composite Numbers |
| **3** | Factors & Multiples | Factor, Multiple, HCF (GCD), LCM |
| **4** | Divisibility | Divisible by 2, Divisible by 3, Divisible by 5, Divisible by 9 |
| **5** | Place Value | Ones, Tens, Hundreds, Thousands |
| **6** | Number Comparison | Greater Than (>), Less Than (<), Equal To (=), Ascending Order |
| **7** | Fractions | Proper Fraction, Improper Fraction, Mixed Fraction, Equivalent Fraction |
| **8** | Decimal Concepts | Tenths, Hundredths, Thousandths, Decimal Number |
| **9** | Fraction Forms | Fraction, Decimal, Percentage, Ratio |
| **10** | Number Patterns | Arithmetic Pattern, Geometric Pattern, Square Numbers, Cube Numbers |
| **11** | Number Operations | Addition, Subtraction, Multiplication, Division |
| **12** | Estimation & Rounding | Round to Nearest 10, Round to Nearest 100, Estimate Sum, Estimate Difference |
| **13** | Powers & Roots | Square, Cube, Square Root, Cube Root |
| **14** | Number Representation | Roman Numerals, Hindu-Arabic Numerals, Expanded Form, Standard Form |
| **15** | Number Kingdom Boss | Prime Number, HCF, Equivalent Fraction, Decimal Number *(Mixed Boss Challenge)* |

### C. Concept Question Bank Schema (`concepts.json`)
```json
{
  "whole_numbers": {
    "conceptId": "whole_numbers",
    "name": "Whole Numbers",
    "levelName": "Number Sets",
    "clues": [
      {
        "round": 1,
        "evidenceType": "Observation",
        "tenaliClue": "I love counting apples, sheep, and stars in the night sky using 0, 1, 2, 3...",
        "whyItHelps": "Establishes a starting set of discrete positive counting values including zero, ruling out complex structures."
      },
      {
        "round": 2,
        "evidenceType": "Property",
        "tenaliClue": "I never allow negative numbers or pieces of numbers into my family.",
        "whyItHelps": "Eliminates Integers (which allow negatives) and makes partial numbers unlikely."
      },
      {
        "round": 3,
        "evidenceType": "Elimination",
        "tenaliClue": "If you cut a birthday cake into 4 slices and take 1 slice, that slice CANNOT join my family.",
        "whyItHelps": "Strictly eliminates Fractions and Decimals."
      },
      {
        "round": 4,
        "evidenceType": "Real-life",
        "tenaliClue": "I count how many students are sitting in a classroom.",
        "whyItHelps": "Reinforces discrete counting of whole units."
      },
      {
        "round": 5,
        "evidenceType": "Final Clue",
        "tenaliClue": "I am the set of all non-negative counting numbers starting from 0 with no fractional parts.",
        "whyItHelps": "Definitive property pointing uniquely to Whole Numbers."
      }
    ],
    "educationalInfo": {
      "definition": "Whole numbers are non-negative numbers without fractional or decimal parts: 0, 1, 2, 3...",
      "examples": ["0", "5", "42", "100"],
      "commonMistakes": "Confusing whole numbers with natural numbers (whole numbers include 0, natural numbers start at 1).",
      "funFact": "Zero was added to counting numbers to form Whole Numbers!"
    }
  }
}
```

### D. Sample Level Question Bank: Number Sets
Below is a complete simplified question bank for all 4 concepts in **Level 1: Number Sets**:

#### 1. Target Concept: Whole Numbers
| Round | Evidence Type | Tenali's Clue | Expected Student Reasoning |
|:---:|:---:|:--- |:--- |
| 1 | Observe | I like counting full items around me: 0 toys, 1 teddy bear, 2 chocolates, 3 balloons... | Simple positive counting numbers. Whole Numbers, Integers, Fractions, and Decimals are all possible. |
| 2 | Property | I am super friendly with zero and positive numbers. I NEVER use minus signs! | Eliminates negative numbers. Integers become unlikely. Whole Numbers, Fractions, and Decimals remain plausible. |
| 3 | Elimination | If you break a cookie into pieces, that broken piece CANNOT enter my club! | Eliminates broken or partial numbers. Fractions (1/2) and Decimals (0.5) are eliminated. Whole Numbers remains strong. |
| 4 | Real-life | I count how many fingers you have on your hands (1, 2, 3, 4, 5, 6, 7, 8, 9, 10). | You count full fingers without negative numbers or broken parts. Whole Numbers is the best fit. |
| 5 | Final Clue | I am the family of simple counting numbers starting from 0 (0, 1, 2, 3...) with no minus signs and no broken parts! | Clear definition of Whole Numbers. |

#### 2. Target Concept: Integers
| Round | Evidence Type | Tenali's Clue | Expected Student Reasoning |
|:---:|:---:|:--- |:--- |
| 1 | Observe | Look at the numbers on my ruler: ... -3, -2, -1, 0, 1, 2, 3 ... | Shows numbers going both left and right from zero. Integers, Decimals, and Fractions could all fit. |
| 2 | Property | I walk both ways from zero—forward into positive and backward into negative—but always taking full complete steps! | Hints at positive and negative full numbers. Eliminates Whole Numbers (which cannot go negative). |
| 3 | Elimination | The negative number -4 plays happily in my house, but 2.5 and 1/2 are strictly stopped at the door! | Includes negative whole numbers like -4, but excludes broken numbers. Eliminates Fractions and Decimal Numbers. |
| 4 | Real-life | I am used when the weather gets super freezing cold below 0°C, like -5°C! | Real-life freezing temperature (-5°C). Integers is the clear choice. |
| 5 | Final Clue | I am the complete family of all positive full numbers, negative full numbers, and zero! | Clear definition of Integers. |

#### 3. Target Concept: Fractions
| Round | Evidence Type | Tenali's Clue | Expected Student Reasoning |
|:---:|:---:|:--- |:--- |
| 1 | Observe | Look at my afternoon snack: 1/2 of an apple and 3/4 of a pizza slice! | Shows parts of food items. Fractions and Decimal Numbers both show parts of a whole. |
| 2 | Property | I am made by sharing a whole thing into equal parts. I have one number on top and one number on the bottom! | Top and bottom number structure. Eliminates Whole Numbers and Integers. |
| 3 | Elimination | I use a straight horizontal line between my two numbers, NOT a tiny dot! | Eliminates Decimal Numbers (which use a dot like 0.5). Only Fractions remains. |
| 4 | Real-life | When 4 friends share 1 birthday cake equally, each friend gets 1/4 of the cake! | Real-life cake sharing scenario using top/bottom numbers. |
| 5 | Final Clue | I show parts of a whole unit written with a number on top (numerator) and a number on bottom (denominator)! | Clear definition of Fractions. |

#### 4. Target Concept: Decimal Numbers
| Round | Evidence Type | Tenali's Clue | Expected Student Reasoning |
|:---:|:---:|:--- |:--- |
| 1 | Observe | Look at these shop items: 0.5 kg of sugar, ₹12.50 for juice, and 2.5 meters of ribbon! | Shows measurements with a dot. Decimal Numbers and Fractions both show partial amounts. |
| 2 | Property | I always have a special tiny dot point that sits right between my numbers! | Identifies the dot point separator. Eliminates Whole Numbers and Integers. |
| 3 | Elimination | I write small parts using a dot like 0.5, but I NEVER use a slash line like 1/2! | Rejects slash line notation, eliminating Fractions. |
| 4 | Real-life | You see me every time you buy an ice cream for ₹25.50 at the store! | Real-life money price tag with a dot point. |
| 5 | Final Clue | I am a number that uses a dot (decimal point) to show parts smaller than 1! | Clear definition of Decimal Numbers. |

---

## 5. API Reference & Endpoints

### 1. `POST /api/mindreader/start`
Initializes a 5-round level session and selects the secret concept.
* **Request**: `{ "levelNum": 1 }`
* **Response**:
  ```json
  {
    "gameId": "sess_9823471",
    "levelNum": 1,
    "levelName": "Number Sets",
    "options": ["Whole Numbers", "Integers", "Fractions", "Decimal Numbers"],
    "currentRound": 1,
    "clue": {
      "round": 1,
      "evidenceType": "Observation",
      "tenaliClue": "I love counting apples, sheep, and stars in the night sky using 0, 1, 2, 3..."
    }
  }
  ```

### 2. `POST /api/mindreader/record-round`
Submits student candidate selections for the current round and retrieves the next round's clue.
* **Request**:
  ```json
  {
    "gameId": "sess_9823471",
    "round": 1,
    "selectedOptions": ["Whole Numbers", "Integers"]
  }
  ```
* **Response**:
  ```json
  {
    "gameId": "sess_9823471",
    "nextRound": 2,
    "isFinalRound": false,
    "clue": {
      "round": 2,
      "evidenceType": "Property",
      "tenaliClue": "I never allow negative numbers into my family."
    }
  }
  ```

### 3. `POST /api/mindreader/submit-final-guess`
Submits candidate selections for Round 5 and the student's single final guess.
* **Request**:
  ```json
  {
    "gameId": "sess_9823471",
    "round5Selections": ["Whole Numbers"],
    "finalGuess": "Whole Numbers"
  }
  ```
* **Response**:
  ```json
  {
    "correct": true,
    "secretConcept": "Whole Numbers",
    "starsEarned": 3,
    "xpEarned": 150,
    "selectionHistogram": {
      "Whole Numbers": 5,
      "Integers": 3,
      "Fractions": 1,
      "Decimal Numbers": 1
    },
    "educationalInfo": {
      "definition": "Whole numbers are non-negative numbers starting from 0 without fractions...",
      "examples": ["0", "5", "42"],
      "commonMistakes": "Confusing whole numbers with natural numbers.",
      "funFact": "Zero was added to counting numbers to form Whole Numbers!"
    }
  }
  ```

---

## 6. Telemetry & Misconception Analytics

We record round-by-round candidate selections in MongoDB (`MindReaderAnalytic2` collection):
* `gameId`: Session UUID.
* `userId`: Student ID.
* `levelNum`: Level number.
* `secretConcept`: Target concept.
* `roundSelections`: `[{ round: 1, options: [...] }, ..., { round: 5, options: [...] }]`
* `finalGuess`: Final guess submitted.
* `isCorrect`: Boolean victory flag.
* `timeTakenMs`: Total time spent across 5 rounds.

This analytics log allows teachers and game designers to identify which clues caused confusion and which incorrect options persisted until late rounds.

---

## 7. Development Roadmap

* **Phase 1**: Update `server/data/levels.json` and `server/data/concepts.json` with 4-option family structures and 5-round clue matrices. [x]
* **Phase 2**: Update backend session state in `server/index.js` to track `roundSelections` history across 5 rounds. [x]
* **Phase 3**: Update frontend UI components in `client/src/App.jsx` to render:
  - 5-round step progression indicator.
  - Checkbox option multi-selector per round.
  - End-of-level histogram summary card.
  - Single final guess confirmation screen.
* **Phase 4**: Automated testing (`test_guess_mind.js`) for multi-round recording, selection persistence, and final scoring. [x]
