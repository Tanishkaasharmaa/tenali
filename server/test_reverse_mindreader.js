/**
 * AUTOMATED INTEGRATION TESTS FOR TENALI REVERSE MIND READER
 * ═══════════════════════════════════════════════════════════
 * Spawns the backend server on port 4001, fires requests to start, ask questions,
 * get hints, and guess the concept, verifying the expected outputs and rules.
 *
 * Run with: node server/test_reverse_mindreader.js
 */

'use strict';

const { fork } = require('child_process');
const path = require('path');

// Port to run the test server on
const TEST_PORT = 4001;
const BASE_URL = `http://localhost:${TEST_PORT}`;

// Helper to delay execution
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log('🚀 Starting test Express server...');
  
  // Start server as a child process
  let hasExited = false;
  let exitCode = null;
  let exitSignal = null;

  const serverProc = fork(path.join(__dirname, 'index.js'), [], {
    cwd: __dirname,
    env: { ...process.env, PORT: TEST_PORT, MONGO_URI: 'mongodb://127.0.0.1:27017/tenali_test' },
    silent: false
  });

  serverProc.on('exit', (code, signal) => {
    hasExited = true;
    exitCode = code;
    exitSignal = signal;
    console.log(`[Test Runner] Server process exited with code ${code} and signal ${signal}`);
  });

  // Clean up child process on exit
  const cleanup = () => {
    console.log('🧹 Killing server process...');
    if (!hasExited) {
      serverProc.kill();
    }
  };

  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  try {
    // Wait for server to bind to port and print startup logs
    await sleep(3500);

    if (hasExited) {
      throw new Error(`Server crashed on startup with code ${exitCode} and signal ${exitSignal}`);
    }

    console.log('\n--- 1. Testing /api/game/start ---');
    const startRes = await fetch(`${BASE_URL}/api/game/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!startRes.ok) {
      throw new Error(`Failed to start game: ${startRes.statusText}`);
    }
    
    const startData = await startRes.json();
    console.log('Start Game Response:', startData);
    
    const { gameId, questionsRemaining, hintsRemaining, state } = startData;
    if (!gameId || questionsRemaining !== 10 || hintsRemaining !== 2 || state !== 'PLAYING') {
      throw new Error('Start game response properties are invalid.');
    }
    console.log('✓ Start game checks passed.');

    console.log('\n--- 2. Testing /api/game/question ---');
    // Ask a valid question: q_is_number
    const q1Res = await fetch(`${BASE_URL}/api/game/question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, questionId: 'q_is_number' })
    });
    
    if (!q1Res.ok) {
      throw new Error(`Failed to ask question: ${q1Res.statusText}`);
    }
    
    const q1Data = await q1Res.json();
    console.log('Question 1 Response:', q1Data);
    
    if (!q1Data.dialogue || !['yes', 'no', 'dontknow'].includes(q1Data.answer) || q1Data.questionsRemaining !== 9) {
      throw new Error('Question 1 response properties are invalid.');
    }
    console.log('✓ Question 1 checks passed.');

    console.log('\n--- 3. Testing Question Validation (Double Ask) ---');
    // Ask the same question again -> should fail with 400
    const qDuplicateRes = await fetch(`${BASE_URL}/api/game/question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, questionId: 'q_is_number' })
    });
    
    console.log(`Duplicate Ask status code: ${qDuplicateRes.status}`);
    if (qDuplicateRes.status !== 400) {
      throw new Error('Server allowed duplicate question.');
    }
    const dupData = await qDuplicateRes.json();
    console.log('Duplicate Ask error message:', dupData);
    console.log('✓ Duplicate question prevention checked.');

    console.log('\n--- 4. Testing /api/game/hint ---');
    // Ask for hint 1
    const h1Res = await fetch(`${BASE_URL}/api/game/hint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId })
    });
    
    if (!h1Res.ok) {
      throw new Error(`Failed to get hint 1: ${h1Res.statusText}`);
    }
    
    const h1Data = await h1Res.json();
    console.log('Hint 1 Response:', h1Data);
    if (!h1Data.dialogue || !h1Data.hint || h1Data.hintsRemaining !== 1) {
      throw new Error('Hint 1 response properties are invalid.');
    }
    console.log('✓ Hint 1 checks passed.');

    // Ask for hint 2
    const h2Res = await fetch(`${BASE_URL}/api/game/hint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId })
    });
    
    if (!h2Res.ok) {
      throw new Error(`Failed to get hint 2: ${h2Res.statusText}`);
    }
    
    const h2Data = await h2Res.json();
    console.log('Hint 2 Response:', h2Data);
    if (!h2Data.dialogue || !h2Data.hint || h2Data.hintsRemaining !== 0) {
      throw new Error('Hint 2 response properties are invalid.');
    }
    console.log('✓ Hint 2 checks passed.');

    // Ask for hint 3 -> should fail
    const h3Res = await fetch(`${BASE_URL}/api/game/hint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId })
    });
    
    console.log(`Hint 3 (exceeded) status code: ${h3Res.status}`);
    if (h3Res.status !== 400) {
      throw new Error('Server allowed asking for more hints than limit.');
    }
    console.log('✓ Hint limit checks passed.');

    console.log('\n--- 5. Testing /api/game/guess ---');
    // Let's guess the concept. Since it is chosen randomly, we will guess "Prime Number".
    // If correct, reward calculations will show true. If wrong, correct is false.
    // Both are successful API results.
    const guessRes = await fetch(`${BASE_URL}/api/game/guess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, guess: 'Prime Number' })
    });
    
    if (!guessRes.ok) {
      throw new Error(`Failed to submit guess: ${guessRes.statusText}`);
    }
    
    const guessData = await guessRes.json();
    console.log('Guess Response:', guessData);
    
    if (guessData.correct === undefined || !guessData.reward || !guessData.concept) {
      throw new Error('Guess response properties are invalid.');
    }
    console.log(`✓ Guess completed. Was guess correct? ${guessData.correct}`);
    console.log(`✓ Secret Concept was: ${guessData.concept.name}`);
    console.log(`✓ Description: ${guessData.concept.definition}`);

    // Verify session was cleared
    console.log('\n--- 6. Verify Session Cleanup ---');
    const followUpRes = await fetch(`${BASE_URL}/api/game/guess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, guess: 'Prime Number' })
    });
    
    console.log(`Submitting guess to cleaned-up session status: ${followUpRes.status}`);
    if (followUpRes.status !== 404) {
      throw new Error('Session was not evicted from cache after guess.');
    }
    console.log('✓ Cache cleanup checks passed.');

    console.log('\n🌟 ALL BACKEND TESTS PASSED SUCCESSFULLY! 🌟');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST RUN ENCOUNTERED FAILURE:', err);
    process.exit(1);
  } finally {
    cleanup();
  }
}

runTests();
