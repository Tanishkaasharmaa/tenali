const { QUESTIONS, CONCEPTS } = require('./mindReaderKB');

// Simulates the API probability updates locally
function runInference(history, incorrectPredictions) {
  let activeConcepts = CONCEPTS.filter(c => !incorrectPredictions.includes(c.name));

  if (activeConcepts.length === 0) {
    return { error: 'No active concepts' };
  }

  const probabilities = {};
  activeConcepts.forEach(c => {
    probabilities[c.id] = 1.0;
  });

  history.forEach(h => {
    const qId = h.questionId;
    const ans = h.answer;

    activeConcepts.forEach(c => {
      if (probabilities[c.id] === 0) return;
      const expected = c.answers[qId];

      if (ans === 'yes') {
        if (expected === true) {
          probabilities[c.id] *= 0.98;
        } else if (expected === false) {
          probabilities[c.id] = 0;
        } else {
          probabilities[c.id] *= 0.5;
        }
      } else if (ans === 'no') {
        if (expected === true) {
          probabilities[c.id] = 0;
        } else if (expected === false) {
          probabilities[c.id] *= 0.98;
        } else {
          probabilities[c.id] *= 0.5;
        }
      } else {
        probabilities[c.id] *= 1.0;
      }
    });
  });

  activeConcepts = activeConcepts.filter(c => probabilities[c.id] > 0);

  if (activeConcepts.length === 0) {
    return { error: 'Inconsistent' };
  }

  let sum = 0;
  activeConcepts.forEach(c => {
    sum += probabilities[c.id];
  });
  activeConcepts.forEach(c => {
    probabilities[c.id] /= sum;
  });

  activeConcepts.sort((a, b) => probabilities[b.id] - probabilities[a.id]);

  const maxProb = probabilities[activeConcepts[0].id];
  const bestConcept = activeConcepts[0];

  if (activeConcepts.length === 1 || maxProb >= 0.75) {
    return { prediction: bestConcept, confidence: maxProb, remaining: activeConcepts.length };
  }

  // Find next question
  const askedQIds = history.map(h => h.questionId);
  const remainingQuestions = QUESTIONS.filter(q => !askedQIds.includes(q.id));

  if (remainingQuestions.length === 0) {
    return { prediction: bestConcept, confidence: maxProb, remaining: activeConcepts.length };
  }

  let bestQ = null;
  let minDiff = Infinity;

  remainingQuestions.forEach(q => {
    let yesWeight = 0;
    let noWeight = 0;

    activeConcepts.forEach(c => {
      const cAns = c.answers[q.id];
      if (cAns === true) {
        yesWeight += probabilities[c.id];
      } else if (cAns === false) {
        noWeight += probabilities[c.id];
      } else {
        yesWeight += probabilities[c.id] * 0.5;
        noWeight += probabilities[c.id] * 0.5;
      }
    });

    const diff = Math.abs(yesWeight - noWeight);
    if (diff < minDiff) {
      minDiff = diff;
      bestQ = q;
    }
  });

  return { nextQuestion: bestQ, confidence: maxProb, remaining: activeConcepts.length };
}

// SIMULATE TEST 1: Think of "Prime Number"
console.log('--- Simulation 1: Target is "Prime Number" ---');
let history = [];
let incorrectPredictions = [];
let steps = 0;

while (steps < 20) {
  const result = runInference(history, incorrectPredictions);
  if (result.error) {
    console.error('Error:', result.error);
    process.exit(1);
  }

  if (result.prediction) {
    console.log(`Success! Predicted: "${result.prediction.name}" with confidence ${(result.confidence * 100).toFixed(1)}% (Target: Prime Number)`);
    if (result.prediction.id !== 'prime_number') {
      console.error('FAIL: Guessed wrong concept!');
      process.exit(1);
    }
    break;
  }

  const q = result.nextQuestion;
  const answers = {
    q_geometry: 'no',
    q_algebra: 'no',
    q_statistics: 'no',
    q_number: 'yes',
    q_applied: 'no',
    q_triangle: 'no',
    q_circle: 'no',
    q_equation: 'no',
    q_operation: 'no',
    q_fraction_percent: 'no',
    q_graph: 'no',
    q_prime_factor: 'yes',
    q_vector_matrix: 'no',
    q_sets_logic: 'no',
    q_interest_finance: 'no',
    q_measure_bold: 'no'
  };

  const userAns = answers[q.id] || 'dontknow';
  console.log(`Question: "${q.text}" -> Answer: ${userAns}`);
  history.push({ questionId: q.id, answer: userAns });
  steps++;
}

// SIMULATE TEST 2: Think of "Pythagoras' Theorem"
console.log('\n--- Simulation 2: Target is "Pythagoras\' Theorem" ---');
history = [];
incorrectPredictions = [];
steps = 0;

while (steps < 20) {
  const result = runInference(history, incorrectPredictions);
  if (result.error) {
    console.error('Error:', result.error);
    process.exit(1);
  }

  if (result.prediction) {
    console.log(`Success! Predicted: "${result.prediction.name}" with confidence ${(result.confidence * 100).toFixed(1)}% (Target: Pythagoras' Theorem)`);
    if (result.prediction.id !== 'pythagoras_theorem') {
      console.error('FAIL: Guessed wrong concept!');
      process.exit(1);
    }
    break;
  }

  const q = result.nextQuestion;
  const answers = {
    q_geometry: 'yes',
    q_algebra: 'no',
    q_statistics: 'no',
    q_number: 'no',
    q_applied: 'no',
    q_triangle: 'yes',
    q_circle: 'no',
    q_equation: 'yes',
    q_operation: 'yes',
    q_fraction_percent: 'no',
    q_graph: 'no',
    q_prime_factor: 'no',
    q_vector_matrix: 'no',
    q_sets_logic: 'no',
    q_interest_finance: 'no',
    q_measure_bound: 'no'
  };

  const userAns = answers[q.id] || 'dontknow';
  console.log(`Question: "${q.text}" -> Answer: ${userAns}`);
  history.push({ questionId: q.id, answer: userAns });
  steps++;
}

console.log('\nAll simulations completed successfully!');
