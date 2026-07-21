/**
 * GUESS WHAT'S ON TENALI'S MIND — INTEGRATION TEST SUITE
 * ════════════════════════════════════════════════════════
 *
 * Verifies that the new sequential progressive clues API endpoints
 * work correctly end-to-end.
 *
 * Run with: node test_guess_mind.js
 */

const BASE_URL = 'http://localhost:4000';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓  ${message}`);
    passed++;
  } else {
    console.error(`  ✗  FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('Starting Guess What\'s On Tenali\'s Mind Integration Tests...\n');

  try {
    // Test 1: GET /api/mindreader/worlds
    console.log('--- Test 1: GET /api/mindreader/worlds ---');
    const worldsRes = await fetch(`${BASE_URL}/api/mindreader/worlds`);
    assert(worldsRes.status === 200, 'Worlds endpoint returned status 200');
    const worldsData = await worldsRes.json();
    assert(worldsData.worlds && Array.isArray(worldsData.worlds), 'Worlds response contains worlds array');
    assert(worldsData.worlds.length === 5, 'Should have exactly 5 worlds configured');
    assert(worldsData.worlds[0].unlocked === true, 'Arithmetic Kingdom should be unlocked by default');
    assert(worldsData.worlds[1].unlocked === false, 'Geometry Kingdom should be locked by default (requires 200 XP)');

    // Test 2: POST /api/mindreader/start
    console.log('\n--- Test 2: POST /api/mindreader/start ---');
    const startRes = await fetch(`${BASE_URL}/api/mindreader/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ levelNum: 1 })
    });
    assert(startRes.status === 200, 'Start endpoint returned status 200');
    const startData = await startRes.json();
    assert(startData.gameId, 'Response contains gameId');
    assert(startData.levelNum === 1, 'levelNum matches requested level');
    assert(startData.clue === 'I belong to the world of numbers.', 'First clue matches configuration');
    assert(startData.clueIndex === 0, 'clueIndex is 0');
    assert(startData.hintsRemaining === 3, 'hintsRemaining is 3');

    const gameId = startData.gameId;

    // Test 3: POST /api/mindreader/next-clue
    console.log('\n--- Test 3: POST /api/mindreader/next-clue ---');
    const clueRes = await fetch(`${BASE_URL}/api/mindreader/next-clue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId })
    });
    assert(clueRes.status === 200, 'Next clue endpoint returned status 200');
    const clueData = await clueRes.json();
    assert(clueData.clue === 'I always have exactly two positive divisors.', 'Second clue matches configuration');
    assert(clueData.clueIndex === 1, 'clueIndex incremented to 1');
    assert(clueData.cluesExhausted === false, 'cluesExhausted is false');

    // Test 4: POST /api/mindreader/use-hint
    console.log('\n--- Test 4: POST /api/mindreader/use-hint ---');
    const hintRes = await fetch(`${BASE_URL}/api/mindreader/use-hint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId })
    });
    assert(hintRes.status === 200, 'Use hint endpoint returned status 200');
    const hintData = await hintRes.json();
    assert(hintData.hint === 'Arithmetic category topic.', 'First hint text matches');
    assert(hintData.hintsRemaining === 2, 'hintsRemaining decremented to 2');

    // Test 5: POST /api/mindreader/submit-guess (Correct Guess)
    console.log('\n--- Test 5: POST /api/mindreader/submit-guess (Correct) ---');
    const guessRes = await fetch(`${BASE_URL}/api/mindreader/submit-guess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, guess: 'prime number' })
    });
    assert(guessRes.status === 200, 'Submit guess endpoint returned status 200');
    const guessData = await guessRes.json();
    assert(guessData.correct === true, 'guess is correct');
    assert(guessData.actualConcept === 'Prime Number', 'actualConcept matches');
    assert(guessData.starsEarned === 3, 'Stars earned is 3 (guessed at Clue 2)');
    assert(guessData.xpEarned === 100, 'xpEarned is 100 (Guest first completion, perfect run bonus not given due to hint use)');
    assert(guessData.educationalInfo, 'Response contains educationalInfo');
    assert(guessData.educationalInfo.funFact === 'The number 2 is the only even prime number. All other prime numbers are odd!', 'Educational fun fact matches');

    // Test 6: Verify Session Eviction
    console.log('\n--- Test 6: Verify Session Eviction ---');
    const reUseHintRes = await fetch(`${BASE_URL}/api/mindreader/use-hint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId })
    });
    assert(reUseHintRes.status === 404, 'Using the gameId after guess returns 404 session evicted');

    console.log(`\nTests completed: ${passed} passed, ${failed} failed.`);
    if (failed > 0) {
      process.exit(1);
    } else {
      console.log('All backend integration tests passed successfully!');
    }
  } catch (err) {
    console.error('Test execution failed with error:', err);
    process.exit(1);
  }
}

runTests();
