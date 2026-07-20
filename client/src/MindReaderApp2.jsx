/**
 * GUESS WHAT'S ON TENALI'S MIND — SEQUENTIAL GAME ENGINE
 * ══════════════════════════════════════════════════════
 * Renders kingdoms, sequential Candy Crush paths, clues in Tenali's speech bubble,
 * 4 inline thought guess inputs, and a free-text final guess screen.
 */

import React, { useState, useEffect } from 'react';
import { TenaliAvatar } from './App';
import './MindReader2.css';

const API = import.meta.env.VITE_API_BASE_URL || '';
const AUTH_TOKEN_KEY = 'tenali-auth-token';

function authGetToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export default function MindReaderApp2({ onBack }) {
  // Game Phase: 'setup' | 'worlds' | 'levels' | 'playing' | 'gameover'
  const [phase, setPhase] = useState('setup');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Player Stats
  const [xp, setXp] = useState(0);
  const [mrr, setMrr] = useState(1000);
  const [unlockedWorlds, setUnlockedWorlds] = useState(['arithmetic_kingdom']);
  const [levelProgress, setLevelProgress] = useState({}); // levelNum -> starsEarned

  // Active game navigation states
  const [worlds, setWorlds] = useState([]);
  const [activeWorldIndex, setActiveWorldIndex] = useState(0);
  const [activeWorldId, setActiveWorldId] = useState('arithmetic_kingdom');
  const [levelNum, setLevelNum] = useState(1);

  // Active game session playing states
  const [gameId, setGameId] = useState('');
  const [clue, setClue] = useState('');
  const [clueIndex, setClueIndex] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [cluesExhausted, setCluesExhausted] = useState(false);
  const [avatarExpression, setAvatarExpression] = useState('thinking');
  const [tenaliSpeech, setTenaliSpeech] = useState('');

  // 4 Blank Thought Boxes for Student's guesses
  const [thoughtGuesses, setThoughtGuesses] = useState(['', '', '', '']);

  // Hint Overlay Box
  const [showHintOverlay, setShowHintOverlay] = useState(false);
  const [hintText, setHintText] = useState('');

  // Guess Modal Free-text Input
  const [showGuess, setShowGuess] = useState(false);
  const [guessQuery, setGuessQuery] = useState('');

  // Results & Educational Data
  const [isCorrectGuess, setIsCorrectGuess] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [mrrChange, setMrrChange] = useState(0);
  const [actualConcept, setActualConcept] = useState('');
  const [educationalInfo, setEducationalInfo] = useState(null);

  // Load user profile, XP, levels stars on load
  const loadWorldsAndProgress = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const token = authGetToken();
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API}/api/mindreader/worlds`, { headers });
      if (res.ok) {
        const data = await res.json();
        setXp(data.xp || 0);
        setWorlds(data.worlds || []);
        setLevelProgress(data.levelProgress || {});
      } else {
        setErrorMsg('Failed to load levels progress.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorldsAndProgress();
  }, [phase]);

  // Set Tenali greeting message on lobby setup
  useEffect(() => {
    if (phase === 'setup') {
      setAvatarExpression('thinking');
      setTenaliSpeech("Greetings! I have hidden a mathematical secret in my mind. Can you discover it before the clues run out?");
    }
  }, [phase]);

  // Level selector maps
  const getLevelsForActiveWorld = () => {
    if (!worlds || worlds.length === 0) return [];
    const worldObj = worlds[activeWorldIndex];
    if (!worldObj) return [];
    const [start, end] = worldObj.levelRange;
    const list = [];
    for (let i = start; i <= end; i++) {
      let unlocked = false;
      if (i === 1) {
        unlocked = true;
      } else {
        const prevStars = levelProgress[i - 1];
        unlocked = prevStars !== undefined && prevStars > 0;
      }
      list.push({
        levelNum: i,
        stars: levelProgress[i] || 0,
        unlocked
      });
    }
    return list;
  };

  // World Carousel Handlers
  const nextWorld = () => {
    if (activeWorldIndex < worlds.length - 1) {
      setActiveWorldIndex(activeWorldIndex + 1);
    }
  };

  const prevWorld = () => {
    if (activeWorldIndex > 0) {
      setActiveWorldIndex(activeWorldIndex - 1);
    }
  };

  // Start Level API
  const handleStartLevel = async (lvl) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const token = authGetToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API}/api/mindreader/start`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ levelNum: lvl })
      });

      if (res.ok) {
        const data = await res.json();
        setGameId(data.gameId);
        setLevelNum(data.levelNum);
        setClue(data.clue);
        setClueIndex(data.clueIndex);
        setHintsRemaining(data.hintsRemaining);
        setCluesExhausted(false);
        setThoughtGuesses(['', '', '', '']);
        setShowHintOverlay(false);
        setHintText('');
        setGuessQuery('');
        setAvatarExpression('thinking');
        setPhase('playing');
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || 'Failed to start level.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  // Next Clue API
  const handleNextClue = async () => {
    if (cluesExhausted) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/mindreader/next-clue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId })
      });

      if (res.ok) {
        const data = await res.json();
        setClue(data.clue);
        setClueIndex(data.clueIndex);
        setCluesExhausted(data.cluesExhausted);
        setAvatarExpression('happy');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Request Hint API
  const handleUseHint = async () => {
    if (hintsRemaining <= 0) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/mindreader/use-hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId })
      });

      if (res.ok) {
        const data = await res.json();
        setHintText(data.hint);
        setHintsRemaining(data.hintsRemaining);
        setShowHintOverlay(true);
        setAvatarExpression('smirk');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Submit Guess API
  const handleSubmitGuess = async () => {
    if (!guessQuery.trim()) return;
    setLoading(true);
    try {
      const token = authGetToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API}/api/mindreader/submit-guess`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ gameId, guess: guessQuery })
      });

      if (res.ok) {
        const data = await res.json();
        setIsCorrectGuess(data.correct);
        setStarsEarned(data.starsEarned);
        setXpEarned(data.xpEarned);
        setMrrChange(data.reward.mrrChange);
        setActualConcept(data.actualConcept);
        setEducationalInfo(data.educationalInfo);
        
        if (data.correct) {
          setAvatarExpression('victory');
          setTenaliSpeech(`Outstanding! You correctly guessed "${data.actualConcept}"!`);
        } else {
          setAvatarExpression('loss');
          setTenaliSpeech(`Alas! The correct concept was "${data.actualConcept}". Let's review it together.`);
        }
        setShowGuess(false);
        setPhase('gameover');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Thought Box Change Handler
  const handleThoughtChange = (index, val) => {
    const updated = [...thoughtGuesses];
    updated[index] = val;
    setThoughtGuesses(updated);
  };

  return (
    <div className="mr2-container">
      {/* 🔮 Sequential Game Header */}
      <div className="mr2-hud">
        <div className="mr2-hud-pill">🏆 Total XP: <strong>{xp}</strong></div>
        <div className="mr2-hud-pill">👑 Level: <strong>{levelNum}</strong></div>
        <div className="mr2-hud-pill">💡 Hints: <strong>{hintsRemaining}/3</strong></div>
      </div>

      {errorMsg && <div className="feedback wrong" style={{ textAlign: 'center', margin: '15px 0' }}>{errorMsg}</div>}

      {/* ─── PHASE 1: SETUP LOBBY SCREEN ──────────────────────────────────────── */}
      {phase === 'setup' && (
        <div className="gm-container">
          <div className="mr2-char-hub-horizontal">
            <TenaliAvatar expression={avatarExpression} skin="classic" />
            <div className="mr2-speech-bubble" style={{ maxWidth: '400px' }}>
              <div className="mr2-speech-header">
                <span className="mr2-char-name">Tenali Raman</span>
                <span className="mr2-char-title">Court Genius</span>
              </div>
              <p className="mr2-dialogue-text">{tenaliSpeech}</p>
            </div>
          </div>

          <div className="mr2-card" style={{ width: '100%', marginTop: '20px' }}>
            <h3 style={{ marginTop: 0, color: 'var(--clr-accent)' }}>Gameplay Rules</h3>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6', color: 'var(--clr-text-soft)' }}>
              <li>Tenali thinks of a concept. Try to guess it using up to <strong>5 progressive clues</strong>.</li>
              <li>Earlier guesses earn more stars:
                <ul style={{ paddingLeft: '15px' }}>
                  <li>⭐ ⭐ ⭐ Stars: Guessed at Clue 1 or 2.</li>
                  <li>⭐ ⭐ Stars: Guessed at Clue 3 or 4.</li>
                  <li>⭐ Star: Guessed at Clue 5.</li>
                </ul>
              </li>
              <li>You have <strong>3 hints</strong> per level. Hint usage reduces your final MRR reward.</li>
              <li>You have exactly <strong>1 guess</strong> attempt. An incorrect guess ends the level run.</li>
            </ul>
            <button className="btn-primary" style={{ width: '100%', padding: '14px', marginTop: '10px' }} onClick={() => setPhase('worlds')}>
              Enter the Kingdoms
            </button>
          </div>
        </div>
      )}

      {/* ─── PHASE 2: WORLD SELECT CAROUSEL ───────────────────────────────────── */}
      {phase === 'worlds' && (
        <div className="gm-container">
          <h2>Select a Learning World</h2>
          {worlds.length > 0 ? (
            <div className="gm-carousel-wrapper">
              <button 
                className="btn-secondary" 
                onClick={prevWorld} 
                disabled={activeWorldIndex === 0}
                style={{ borderRadius: '50%', width: '45px', height: '45px', padding: 0 }}
              >
                &larr;
              </button>

              <div className={`gm-world-card ${worlds[activeWorldIndex].unlocked ? 'active-world' : 'locked-world'}`}>
                <div className="gm-world-header" style={{ color: worlds[activeWorldIndex].themeColor }}>
                  World {activeWorldIndex + 1} of {worlds.length}
                </div>
                <h3 className="gm-world-title">{worlds[activeWorldIndex].worldName}</h3>
                
                <div className="gm-world-badge">
                  ⭐ {worlds[activeWorldIndex].stars} Stars Earned
                </div>

                {!worlds[activeWorldIndex].unlocked ? (
                  <div style={{ color: 'var(--clr-wrong)', marginBottom: '15px', fontWeight: 'bold' }}>
                    🔒 Locked (Requires {worlds[activeWorldIndex].requiredUnlockXP} XP)
                  </div>
                ) : (
                  <div style={{ color: 'var(--clr-correct)', marginBottom: '15px', fontWeight: 'bold' }}>
                    🔓 Unlocked
                  </div>
                )}

                <button 
                  className="gm-world-btn" 
                  style={{
                    background: worlds[activeWorldIndex].unlocked ? 'var(--clr-accent)' : 'var(--clr-input)',
                    color: worlds[activeWorldIndex].unlocked ? '#fff' : 'var(--clr-text-soft)'
                  }}
                  disabled={!worlds[activeWorldIndex].unlocked}
                  onClick={() => {
                    setActiveWorldId(worlds[activeWorldIndex].worldId);
                    setPhase('levels');
                  }}
                >
                  {worlds[activeWorldIndex].unlocked ? 'Enter Kingdom' : 'Locked'}
                </button>
              </div>

              <button 
                className="btn-secondary" 
                onClick={nextWorld} 
                disabled={activeWorldIndex === worlds.length - 1}
                style={{ borderRadius: '50%', width: '45px', height: '45px', padding: 0 }}
              >
                &rarr;
              </button>
            </div>
          ) : (
            <div>Loading worlds...</div>
          )}

          <button className="btn-outline" style={{ marginTop: '20px' }} onClick={() => setPhase('setup')}>
            &larr; Back to Lobby
          </button>
        </div>
      )}

      {/* ─── PHASE 3: LEVEL SELECTION TRACK ───────────────────────────────────── */}
      {phase === 'levels' && (
        <div className="gm-container">
          <h2>{worlds[activeWorldIndex]?.worldName || 'Levels Map'}</h2>
          <p className="subtitle">Complete levels sequentially. Earn stars to unlock the next level.</p>

          <div className="gm-level-track">
            <div className="gm-level-line"></div>
            
            {getLevelsForActiveWorld().reverse().map((node) => (
              <div key={node.levelNum} className="gm-level-node-wrapper">
                <button
                  className={`gm-level-node ${node.unlocked ? 'unlocked' : ''} ${node.levelNum === levelNum ? 'active-node' : ''}`}
                  disabled={!node.unlocked}
                  onClick={() => handleStartLevel(node.levelNum)}
                >
                  {node.unlocked ? node.levelNum : '🔒'}
                </button>
                {node.stars > 0 && (
                  <div className="gm-level-stars">
                    {Array.from({ length: node.stars }).map((_, idx) => (
                      <span key={idx}>★</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="btn-outline" style={{ marginTop: '20px' }} onClick={() => setPhase('worlds')}>
            &larr; Back to Kingdoms
          </button>
        </div>
      )}

      {/* ─── PHASE 4: GAMEPLAY BOARD ──────────────────────────────────────────── */}
      {phase === 'playing' && (
        <div className="gm-container" style={{ position: 'relative' }}>
          <div className="mr2-char-hub-vertical">
            <TenaliAvatar expression={avatarExpression} skin="classic" />
            <div className="mr2-speech-bubble" style={{ minWidth: '280px', maxWidth: '480px' }}>
              <div className="mr2-speech-header">
                <span className="mr2-char-name">Tenali Raman</span>
              </div>
              <p className="mr2-dialogue-text" style={{ fontStyle: 'italic', fontSize: '1.25rem', fontWeight: '500' }}>
                "{clue}"
              </p>
            </div>
            {/* Dots navigation timeline */}
            <div className="gm-dot-timeline" style={{ marginTop: '10px' }}>
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className={`gm-dot ${idx <= clueIndex ? 'active' : ''}`}></div>
              ))}
            </div>
          </div>

          {/* 4 Thought Input Fields for Student's Guessed Topics */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', margin: '20px 0' }}>
            {thoughtGuesses.map((val, idx) => (
              <input
                key={idx}
                type="text"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 16px',
                  background: 'var(--clr-input)',
                  border: '1.5px solid var(--clr-border)',
                  borderRadius: '12px',
                  color: 'var(--clr-text)',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
                placeholder={`Guessed Topic ${idx + 1}...`}
                value={val}
                onChange={(e) => handleThoughtChange(idx, e.target.value)}
              />
            ))}
          </div>

          {/* Clue Hint details popup if requested */}
          {showHintOverlay && (
            <div className="feedback correct" style={{ width: '100%', margin: '10px 0', textAlign: 'center' }}>
              💡 Hint: <strong>{hintText}</strong>
            </div>
          )}

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '10px', width: '100%', flexWrap: 'wrap', marginTop: '10px' }}>
            <button className="btn-outline" style={{ flex: 1, minWidth: '120px' }} onClick={handleUseHint} disabled={hintsRemaining <= 0}>
              💡 Get Hint
            </button>
            <button className="btn-primary" style={{ flex: 1.5, minWidth: '150px' }} onClick={() => setShowGuess(true)}>
              🔎 Make Guess
            </button>
            <button 
              className="btn-secondary" 
              style={{ flex: 1, minWidth: '120px' }} 
              onClick={handleNextClue} 
              disabled={cluesExhausted}
            >
              Next Clue &rarr;
            </button>
          </div>

          {/* Fullscreen Free-text Guess Modal */}
          {showGuess && (
            <div className="gm-guess-modal">
              <h2>Type Your Concept Guess</h2>
              <p className="subtitle">Type the answer below. Warning: Only 1 final guess attempt is allowed!</p>

              <input
                className="gm-search-input"
                type="text"
                placeholder="Type your guess here..."
                value={guessQuery}
                onChange={(e) => setGuessQuery(e.target.value)}
                autoFocus
              />

              <div style={{ display: 'flex', gap: '15px', width: '100%', maxWidth: '500px', marginTop: '30px' }}>
                <button className="btn-outline" style={{ flex: 1 }} onClick={() => {
                  setShowGuess(false);
                  setGuessQuery('');
                }}>
                  &larr; Close Guess Mode
                </button>
                <button 
                  className="btn-primary" 
                  style={{ flex: 1 }} 
                  disabled={!guessQuery.trim()}
                  onClick={handleSubmitGuess}
                >
                  Confirm Guess
                </button>
              </div>
            </div>
          )}

          <button className="btn-outline" style={{ marginTop: '25px', width: '100%' }} onClick={() => setPhase('levels')}>
            Quit Level
          </button>
        </div>
      )}

      {/* ─── PHASE 5: GAMEOVER RESULT SCREEN ───────────────────────────────────── */}
      {phase === 'gameover' && (
        <div className="gm-container">
          <div className="mr2-char-hub-vertical">
            <TenaliAvatar expression={avatarExpression} skin="classic" />
            <div className="mr2-speech-bubble">
              <p className="mr2-dialogue-text">{tenaliSpeech}</p>
            </div>
          </div>

          <div className="mr2-card" style={{ width: '100%', textAlign: 'center', margin: '20px 0' }}>
            <h2 style={{ margin: '0 0 15px 0', color: isCorrectGuess ? 'var(--clr-correct)' : 'var(--clr-wrong)' }}>
              {isCorrectGuess ? '🎉 Correct Guess!' : '❌ Incorrect guess'}
            </h2>

            {isCorrectGuess && (
              <div style={{ fontSize: '2.5rem', color: '#f1c40f', margin: '15px 0' }}>
                {Array.from({ length: starsEarned }).map((_, idx) => (
                  <span key={idx}>★</span>
                ))}
                {Array.from({ length: 3 - starsEarned }).map((_, idx) => (
                  <span key={idx} style={{ opacity: 0.15 }}>★</span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div className="mr2-hud-pill">XP: <strong>+{xpEarned}</strong></div>
              <div className="mr2-hud-pill">Rating: <strong>{mrrChange >= 0 ? `+${mrrChange}` : mrrChange} MRR</strong></div>
            </div>
          </div>

          {/* Educational review sheet */}
          {educationalInfo && (
            <div className="gm-educational-card">
              <h3 style={{ margin: 0, color: 'var(--clr-accent)', borderBottom: '1px solid var(--clr-border)', paddingBottom: '10px' }}>
                Revision Card: {actualConcept}
              </h3>

              <div className="gm-edu-section">
                <span className="gm-edu-label">Definition</span>
                <span className="gm-edu-value">{educationalInfo.definition}</span>
              </div>

              <div className="gm-edu-section">
                <span className="gm-edu-label">Worked Examples</span>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--clr-text)' }}>
                  {educationalInfo.examples.map((ex, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>{ex}</li>
                  ))}
                </ul>
              </div>

              <div className="gm-edu-section">
                <span className="gm-edu-label">Common Mistakes</span>
                <span className="gm-edu-value" style={{ color: 'var(--clr-wrong)' }}>{educationalInfo.commonMistakes}</span>
              </div>

              <div className="gm-edu-section">
                <span className="gm-edu-label">Fun Fact</span>
                <span className="gm-edu-value" style={{ fontStyle: 'italic' }}>{educationalInfo.funFact}</span>
              </div>

              <div className="gm-edu-section">
                <span className="gm-edu-label">Related Lesson</span>
                <span className="gm-edu-value">{educationalInfo.relatedLesson}</span>
              </div>
            </div>
          )}

          <button className="btn-primary" style={{ width: '100%', padding: '14px', marginTop: '20px' }} onClick={() => setPhase('levels')}>
            Next Level Map &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
