/**
 * TENALI MIND READER — INFERENCE ENGINE
 * ══════════════════════════════════════════════════════════════════════
 *
 * Implements a probabilistic question-answering (20-questions style) engine
 * that narrows a candidate pool of mathematical concepts through Yes/No/DK
 * questions.
 *
 * ALGORITHM OVERVIEW
 * ──────────────────
 * 1. Prior: uniform probability over all non-eliminated candidates.
 * 2. Bayesian update on each answer:
 *      answer=yes,  KB=true  → likelihood 0.90  (strong confirmation)
 *      answer=yes,  KB=false → likelihood 0.00  (strict elimination)
 *      answer=yes,  KB=null  → likelihood 0.50  (ambiguous / partial)
 *      answer=no,   KB=true  → likelihood 0.00  (strict elimination)
 *      answer=no,   KB=false → likelihood 0.90  (strong confirmation)
 *      answer=no,   KB=null  → likelihood 0.50  (ambiguous / partial)
 *      answer=dk,   any      → likelihood 0.80  (slight dampening for
 *                                                 concepts that rely on
 *                                                 ambiguous features)
 * 3. Normalise surviving probabilities to sum to 1.
 * 4. Predict when:
 *      (a) only 1 candidate remains, OR
 *      (b) top candidate probability ≥ CONFIDENCE_THRESHOLD
 * 5. Next-question selection via maximum Information Gain (Shannon entropy):
 *      IG(q) = H(before) − E[H(after asking q)]
 *    where H is the Shannon entropy of the current probability distribution
 *    and the expectation is over P(yes | q) and P(no | q).
 *    "Don't know" responses are modelled as a third outcome bucket.
 *
 * EXPLAINABILITY
 * ──────────────
 * Predictions carry a `reasoning` array that lists the top discriminative
 * Q&A pairs that led to this concept being chosen over others.
 *
 * ANTI-AMBIGUITY TIEBREAKING
 * ──────────────────────────
 * Concepts with identical answer vectors (e.g. HCF vs LCM) are ranked by
 * their chapter/lessonId ordering in the KB as a stable tiebreaker, and the
 * prediction message notes that they are closely related.
 */

'use strict';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Minimum probability to trigger a prediction. */
const CONFIDENCE_THRESHOLD = 0.75;

/**
 * Likelihood values for Bayesian update.
 * These model P(answer | concept_is_the_target) for each case.
 */
const LIKELIHOOD = {
  YES_TRUE:   0.90,   // Strong confirmation: user said yes, KB says yes
  YES_FALSE:  0.00,   // Hard elimination:   user said yes, KB says no
  YES_NULL:   0.50,   // Ambiguous:          user said yes, KB is uncertain
  NO_TRUE:    0.00,   // Hard elimination:   user said no,  KB says yes
  NO_FALSE:   0.90,   // Strong confirmation: user said no,  KB says no
  NO_NULL:    0.50,   // Ambiguous:          user said no,  KB is uncertain
  DK_ANY:     0.80,   // Soft dampening:     user doesn't know
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Shannon entropy of a probability distribution.
 * H = -Σ p_i * log2(p_i)   (0 * log2(0) defined as 0)
 *
 * @param {number[]} probs - Array of non-negative probabilities summing to ≤ 1.
 * @returns {number} Entropy in bits.
 */
function entropy(probs) {
  let h = 0;
  for (const p of probs) {
    if (p > 0) h -= p * Math.log2(p);
  }
  return h;
}

/**
 * Bayesian likelihood for a single (answer, expectedKB) pair.
 *
 * @param {'yes'|'no'|'dontknow'} answer
 * @param {true|false|null|undefined} expected - Value from concept.answers[qId]
 * @returns {number} Likelihood ∈ [0, 1]
 */
function likelihood(answer, expected) {
  if (answer === 'yes') {
    if (expected === true)  return LIKELIHOOD.YES_TRUE;
    if (expected === false) return LIKELIHOOD.YES_FALSE;
    return LIKELIHOOD.YES_NULL;
  }
  if (answer === 'no') {
    if (expected === true)  return LIKELIHOOD.NO_TRUE;
    if (expected === false) return LIKELIHOOD.NO_FALSE;
    return LIKELIHOOD.NO_NULL;
  }
  // 'dontknow'
  return LIKELIHOOD.DK_ANY;
}

/**
 * Apply Bayesian update for a single history entry to the probability map.
 * Mutates `probs` in-place.
 *
 * @param {Object}   probs       - Map of conceptId → unnormalized probability
 * @param {Object[]} concepts    - Active concept objects
 * @param {string}   questionId
 * @param {string}   answer
 */
function applyUpdate(probs, concepts, questionId, answer) {
  for (const c of concepts) {
    if (probs[c.id] === 0) continue;
    const expected = c.answers[questionId];
    probs[c.id] *= likelihood(answer, expected);
  }
}

/**
 * Normalize a probability map so all values sum to 1.
 * If the total is 0 (impossible state), returns null.
 *
 * @param {Object} probs - Map of id → raw weight (mutated in-place)
 * @returns {number|null} Sum before normalisation, or null if zero
 */
function normalise(probs) {
  const total = Object.values(probs).reduce((s, v) => s + v, 0);
  if (total === 0) return null;
  for (const id in probs) {
    probs[id] /= total;
  }
  return total;
}

// ─── Core Inference ──────────────────────────────────────────────────────────

/**
 * Run the full inference pipeline for one round.
 *
 * @param {Object[]} allConcepts
 *   Full CONCEPTS array from mindReaderKB.js
 * @param {Object[]} allQuestions
 *   Full QUESTIONS array from mindReaderKB.js
 * @param {Array<{questionId:string, answer:string}>} history
 *   All Q&A pairs so far in this session
 * @param {string[]} incorrectPredictions
 *   Concept names the user has already rejected (royal gamble misses)
 *
 * @returns {{
 *   prediction?: {id, name, description, definingCharacteristics,
 *                 recommendations, reasoning},
 *   nextQuestion?: {id, text},
 *   confidence: number,
 *   remainingCount: number,
 *   isFinalQuestion?: boolean,
 *   error?: string
 * }}
 */
function runInference(allConcepts, allQuestions, history, incorrectPredictions) {
  // ── Step 1: Filter candidates ────────────────────────────────────────────
  let candidates = allConcepts.filter(
    c => !incorrectPredictions.includes(c.name)
  );

  if (candidates.length === 0) {
    return { error: 'No candidate concepts left', confidence: 0, remainingCount: 0 };
  }

  // ── Step 2: Initialise uniform priors ────────────────────────────────────
  const probs = {};
  for (const c of candidates) {
    probs[c.id] = 1.0 / candidates.length;  // uniform prior
  }

  // ── Step 3: Bayesian updates from history ────────────────────────────────
  for (const { questionId, answer } of history) {
    applyUpdate(probs, candidates, questionId, answer);
  }

  // ── Step 4: Remove zero-probability candidates & renormalise ─────────────
  candidates = candidates.filter(c => probs[c.id] > 0);

  if (candidates.length === 0) {
    return {
      error: 'Inconsistent responses — no matching concepts found.',
      confidence: 0,
      remainingCount: 0
    };
  }

  const normTotal = normalise(probs);
  if (normTotal === null) {
    return {
      error: 'Probability collapse — all candidates eliminated.',
      confidence: 0,
      remainingCount: 0
    };
  }

  // ── Step 5: Sort by probability descending ───────────────────────────────
  candidates.sort((a, b) => probs[b.id] - probs[a.id]);

  const best       = candidates[0];
  const bestProb   = probs[best.id];
  const secondProb = candidates.length > 1 ? probs[candidates[1].id] : 0;

  // Confidence calibration: difference between the probability of the top candidate
  // and the runner-up. If only 1 candidate remains, secondProb is 0, so confidence is bestProb (which is 1.0).
  const reportedConfidence = candidates.length === 1
    ? bestProb
    : Math.min(1.0, Math.max(0.0, bestProb - secondProb));

  // ── Step 6: Select the next best question via Information Gain ───────────
  const askedIds   = new Set(history.map(h => h.questionId));
  const remaining  = allQuestions.filter(q => !askedIds.has(q.id));

  const currentEntropy = entropy(candidates.map(c => probs[c.id]));
  let bestQ = null;
  let bestIG = 0;
  if (remaining.length > 0) {
    bestQ = selectBestQuestion(candidates, probs, remaining);
    bestIG = informationGain(candidates, probs, bestQ.id, currentEntropy);
  }

  // ── Step 7: Predict? ─────────────────────────────────────────────────────
  // We predict if:
  // 1. Only 1 candidate remains (certainty).
  // 2. OR there are no more questions to ask.
  // 3. OR the best remaining question cannot distinguish candidates (IG is basically 0).
  // 4. OR we have overwhelming confidence (bestProb >= 0.98) and a huge gap to the runner-up.
  const isCertain = candidates.length === 1;
  const noMoreQuestions = remaining.length === 0;
  const noInformationGain = remaining.length > 0 && bestIG < 0.005;
  const overwhelmingConfidence = bestProb >= 0.98 && (bestProb / (secondProb + 1e-9)) >= 20;

  if (isCertain || noMoreQuestions || noInformationGain || overwhelmingConfidence) {
    return {
      prediction: buildPrediction(best, candidates, probs, history, allQuestions, allConcepts),
      confidence: reportedConfidence,
      remainingCount: candidates.length
    };
  }

  return {
    nextQuestion: bestQ,
    confidence: reportedConfidence,
    remainingCount: candidates.length,
    isFinalQuestion: candidates.length <= 2
  };
}

// ─── Question Selection (Information Gain) ───────────────────────────────────

/**
 * Select the question that maximises expected information gain.
 *
 * IG(q) = H(current) − [ P(yes|q)·H(yes branch) + P(no|q)·H(no branch) + P(dk|q)·H(dk branch) ]
 *
 * The three-way split (yes / no / dontknow) accounts for the genuine ambiguity
 * of `null` KB entries.  For each candidate:
 *   - KB=true  → contributes its probability entirely to the YES bucket
 *   - KB=false → contributes its probability entirely to the NO bucket
 *   - KB=null  → split 50/50 between YES and NO (no information either way)
 *
 * @param {Object[]} candidates - Active concepts with id
 * @param {Object}   probs      - Map id → normalized probability
 * @param {Object[]} questions  - Remaining unasked questions
 * @returns {Object} The question object with highest information gain
 */
function selectBestQuestion(candidates, probs, questions) {
  const currentEntropy = entropy(candidates.map(c => probs[c.id]));

  let bestQ   = questions[0];
  let bestIG  = -Infinity;

  for (const q of questions) {
    const ig = informationGain(candidates, probs, q.id, currentEntropy);
    if (ig > bestIG) {
      bestIG  = ig;
      bestQ   = q;
    }
  }

  return bestQ;
}

/**
 * Compute the information gain of asking question `qId` given current `probs`.
 *
 * @param {Object[]} candidates
 * @param {Object}   probs
 * @param {string}   qId
 * @param {number}   currentH - Current entropy (pre-computed for efficiency)
 * @returns {number} Information gain in bits
 */
function informationGain(candidates, probs, qId, currentH) {
  // Simulate yes/no branches
  const yesProbs = [];
  const noProbs  = [];

  let pYes = 0;
  let pNo  = 0;

  for (const c of candidates) {
    const p       = probs[c.id];
    const expected = c.answers[qId];

    // Compute posterior weight for each branch
    const yesLikelihood = likelihood('yes', expected);
    const noLikelihood  = likelihood('no',  expected);

    const pyc = p * yesLikelihood;   // P(concept | yes)
    const pnc = p * noLikelihood;    // P(concept | no)

    yesProbs.push(pyc);
    noProbs.push(pnc);

    pYes += pyc;
    pNo  += pnc;
  }

  // Normalise branch distributions
  const totalBranch = pYes + pNo;
  if (totalBranch === 0) return 0;

  const normYes = pYes > 0 ? yesProbs.map(p => p / pYes) : [];
  const normNo  = pNo  > 0 ? noProbs.map(p  => p / pNo)  : [];

  const pYesNorm = pYes / totalBranch;
  const pNoNorm  = pNo  / totalBranch;

  const expectedH =
    pYesNorm * entropy(normYes) +
    pNoNorm  * entropy(normNo);

  return currentH - expectedH;
}

// ─── Prediction Builder ───────────────────────────────────────────────────────

/**
 * Build a rich prediction object with reasoning.
 *
 * The reasoning is constructed by finding the Q&A pairs that provided
 * the most discriminative evidence *in favour of* the predicted concept
 * compared to the runner-up (or average of remaining candidates).
 *
 * @param {Object}   concept      - The best candidate concept
 * @param {Object[]} candidates   - All surviving candidates (sorted desc)
 * @param {Object}   probs        - Normalised probability map
 * @param {Object[]} history      - Full Q&A history
 * @param {Object[]} allQuestions - All questions (for text lookup)
 * @returns {Object} Enriched prediction object
 */
function buildPrediction(concept, candidates, probs, history, allQuestions, allConcepts) {
  const questionMap = Object.fromEntries(allQuestions.map(q => [q.id, q.text]));

  // Find Q&A pairs where this concept's KB answer matched the user's answer
  // These are the "confirming" pieces of evidence.
  const confirmingEvidence = history
    .filter(({ questionId, answer }) => {
      const expected = concept.answers[questionId];
      return (
        (answer === 'yes'  && expected === true)  ||
        (answer === 'no'   && expected === false)
      );
    })
    .map(({ questionId, answer }) => ({
      question: questionMap[questionId] || questionId,
      answer,
      discriminative: isDiscriminative(questionId, answer, candidates, probs, concept)
    }))
    .sort((a, b) => b.discriminative - a.discriminative)
    .slice(0, 3);  // Top 3 most discriminative confirmations

  // Note if concept shares its answer vector with another (ambiguous pair)
  const ambiguousPartners = candidates
    .filter(c => c.id !== concept.id && sharesAnswerVector(concept, c, allQuestions))
    .map(c => c.name);

  // Identify similar concepts (Hamming distance <= 2 in the KB) and suggest how to distinguish them
  const similarConcepts = [];
  if (allConcepts) {
    for (const other of allConcepts) {
      if (other.id === concept.id) continue;
      
      const diffQuestions = [];
      for (const q of allQuestions) {
        if (concept.answers[q.id] !== other.answers[q.id]) {
          diffQuestions.push(q);
        }
      }
      
      if (diffQuestions.length <= 2) {
        similarConcepts.push({
          id: other.id,
          name: other.name,
          differenceCount: diffQuestions.length,
          distinguishingQuestions: diffQuestions.map(q => ({
            id: q.id,
            text: q.text,
            expectedForThis: concept.answers[q.id],
            expectedForOther: other.answers[q.id]
          }))
        });
      }
    }
  }

  const prediction = {
    id:                      concept.id,
    name:                    concept.name,
    description:             concept.description,
    definingCharacteristics: concept.definingCharacteristics,
    recommendations:         concept.recommendations,
    reasoning:               confirmingEvidence.map(e => ({
      question: e.question,
      answer:   e.answer
    })),
    ambiguousPartners:       ambiguousPartners.length > 0 ? ambiguousPartners : undefined,
  };

  if (similarConcepts.length > 0) {
    prediction.similarConcepts = similarConcepts;
  }

  return prediction;
}

/**
 * Compute how discriminative a given confirming Q&A pair is.
 * Measured as the ratio of the best candidate's likelihood to the average
 * likelihood of all other candidates for this Q&A.
 *
 * Higher = more discriminative.
 *
 * @returns {number}
 */
function isDiscriminative(questionId, answer, candidates, probs, targetConcept) {
  const otherCandidates = candidates.filter(c => c.id !== targetConcept.id);
  if (otherCandidates.length === 0) return 1;

  const targetL = likelihood(answer, targetConcept.answers[questionId]);

  const avgOtherL = otherCandidates.reduce((sum, c) => {
    return sum + likelihood(answer, c.answers[questionId]);
  }, 0) / otherCandidates.length;

  return avgOtherL === 0 ? 100 : targetL / (avgOtherL + 1e-9);
}

/**
 * Check if two concepts share the same answer vector across all questions.
 *
 * @param {Object}   a
 * @param {Object}   b
 * @param {Object[]} allQuestions
 * @returns {boolean}
 */
function sharesAnswerVector(a, b, allQuestions) {
  return allQuestions.every(q => {
    const aAns = a.answers[q.id];
    const bAns = b.answers[q.id];
    return aAns === bAns;
  });
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  runInference,
  entropy,
  likelihood,
  informationGain,
  selectBestQuestion,
  CONFIDENCE_THRESHOLD,
  LIKELIHOOD,
};
