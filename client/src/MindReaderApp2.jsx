/**
 * GUESS WHAT'S ON TENALI'S MIND — COMPACT SEQUENTIAL GAME ENGINE
 * ══════════════════════════════════════════════════════════════
 * Implements a scroll-free, minimal UI matching the Word Creator aesthetic.
 * Uses inline styling for absolute specificity and safety against CSS overrides.
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

  // 4 Blank Thought Boxes (2x2 Grid Layout)
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

  // Clues history navigation
  const [revealedClues, setRevealedClues] = useState([]);
  const [localClueIndex, setLocalClueIndex] = useState(0);

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
      setTenaliSpeech("I have hidden a mathematical concept inside my mind. Can you guess it in 5 clues?");
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
        setRevealedClues([data.clue]);
        setLocalClueIndex(0);
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
    if (localClueIndex < revealedClues.length - 1) {
      setLocalClueIndex(localClueIndex + 1);
      setClue(revealedClues[localClueIndex + 1]);
      return;
    }

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
        setRevealedClues([...revealedClues, data.clue]);
        setLocalClueIndex(localClueIndex + 1);
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
          setTenaliSpeech(`Alas! The correct concept was "${data.actualConcept}".`);
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

  const handlePrevLocalClue = () => {
    if (localClueIndex > 0) {
      setLocalClueIndex(localClueIndex - 1);
      setClue(revealedClues[localClueIndex - 1]);
    }
  };

  // Clean outline button style
  const outlineBtnStyle = {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#d1c7bd',
    borderRadius: '20px',
    padding: '6px 16px',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
    outline: 'none',
    boxShadow: 'none',
    margin: 0
  };

  return (
    <div className="mr2-container gm-dark-theme" style={{ padding: '10px 15px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* 🔮 Sequential Game Header */}
      {phase !== 'playing' && (
        <div className="mr2-hud" style={{ padding: '8px 16px', borderRadius: '12px', marginBottom: '8px', width: '100%', maxWidth: '500px' }}>
          <div className="mr2-hud-pill" style={{ padding: '6px 12px', fontSize: '0.88rem' }}>🏆 XP: <strong>{xp}</strong></div>
          <div className="mr2-hud-pill" style={{ padding: '6px 12px', fontSize: '0.88rem' }}>👑 Level: <strong>{levelNum}</strong></div>
          <div className="mr2-hud-pill" style={{ padding: '6px 12px', fontSize: '0.88rem' }}>💡 Hints: <strong>{hintsRemaining}/3</strong></div>
        </div>
      )}

      {errorMsg && <div className="feedback wrong" style={{ textAlign: 'center', padding: '6px', margin: '4px 0', fontSize: '0.9rem' }}>{errorMsg}</div>}

      {/* ─── PHASE 1: SETUP LOBBY SCREEN (MINIMAL TEXT) ────────────────────────── */}
      {phase === 'setup' && (
        <div className="gm-container" style={{ minHeight: 'auto', gap: '15px' }}>
          <h2 style={{ margin: '10px 0 0 0', fontFamily: 'Georgia, serif', color: '#fff', fontSize: '2rem' }}>Read Tenali's Mind</h2>
          
          <div className="mr2-char-hub-vertical" style={{ margin: '10px 0', gap: '10px' }}>
            <TenaliAvatar expression={avatarExpression} skin="classic" />
            <div className="mr2-speech-bubble" style={{ maxWidth: '320px', padding: '12px 18px' }}>
              <p className="mr2-dialogue-text" style={{ fontSize: '1rem', margin: 0 }}>{tenaliSpeech}</p>
            </div>
          </div>

          <button className="btn-primary" style={{ width: '100%', maxWidth: '320px', padding: '12px', marginTop: '10px' }} onClick={() => setPhase('worlds')}>
            Enter the Kingdoms
          </button>
        </div>
      )}

      {/* ─── PHASE 2: WORLD SELECT CAROUSEL ───────────────────────────────────── */}
      {phase === 'worlds' && (
        <div className="gm-container" style={{ minHeight: 'auto', gap: '10px' }}>
          <h3 style={{ margin: '10px 0', color: '#fff' }}>Select a World</h3>
          {worlds.length > 0 ? (
            <div className="gm-carousel-wrapper" style={{ margin: '15px 0', gap: '10px' }}>
              <button 
                className="btn-secondary" 
                onClick={prevWorld} 
                disabled={activeWorldIndex === 0}
                style={{ borderRadius: '50%', width: '38px', height: '38px', padding: 0 }}
              >
                &larr;
              </button>

              <div className={`gm-world-card ${worlds[activeWorldIndex].unlocked ? 'active-world' : 'locked-world'}`} style={{ padding: '20px 16px', maxWidth: '300px' }}>
                <div className="gm-world-header" style={{ color: worlds[activeWorldIndex].themeColor, fontSize: '0.8rem' }}>
                  World {activeWorldIndex + 1} of {worlds.length}
                </div>
                <h4 className="gm-world-title" style={{ fontSize: '1.45rem', margin: '0 0 10px 0', color: '#fff' }}>{worlds[activeWorldIndex].worldName}</h4>
                
                <div className="gm-world-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginBottom: '12px' }}>
                  ⭐ {worlds[activeWorldIndex].stars} Stars
                </div>

                {!worlds[activeWorldIndex].unlocked ? (
                  <div style={{ color: 'var(--clr-wrong)', marginBottom: '10px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    🔒 Locked ({worlds[activeWorldIndex].requiredUnlockXP} XP)
                  </div>
                ) : (
                  <div style={{ color: 'var(--clr-correct)', marginBottom: '10px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    🔓 Unlocked
                  </div>
                )}

                <button 
                  className="gm-world-btn" 
                  style={{
                    padding: '10px',
                    fontSize: '0.9rem',
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
                style={{ borderRadius: '50%', width: '38px', height: '38px', padding: 0 }}
              >
                &rarr;
              </button>
            </div>
          ) : (
            <div>Loading worlds...</div>
          )}

          <button className="btn-outline" style={{ marginTop: '10px', padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setPhase('setup')}>
            &larr; Lobby
          </button>
        </div>
      )}

      {/* ─── PHASE 3: LEVEL SELECTION MAP (SCROLL-FREE PATH) ──────────────────── */}
      {phase === 'levels' && (
        <div className="gm-container" style={{ minHeight: 'auto', gap: '5px' }}>
          <h4 style={{ margin: '5px 0', color: '#fff' }}>{worlds[activeWorldIndex]?.worldName}</h4>

          <div className="gm-level-track" style={{ padding: '15px 0', maxHeight: '320px', overflowY: 'auto', width: '100%', maxWidth: '280px' }}>
            <div className="gm-level-line" style={{ top: '35px', bottom: '35px' }}></div>
            
            {getLevelsForActiveWorld().reverse().map((node) => (
              <div key={node.levelNum} className="gm-level-node-wrapper" style={{ margin: '12px 0' }}>
                <button
                  className={`gm-level-node ${node.unlocked ? 'unlocked' : ''} ${node.levelNum === levelNum ? 'active-node' : ''}`}
                  disabled={!node.unlocked}
                  style={{ width: '46px', height: '46px', fontSize: '1.05rem' }}
                  onClick={() => handleStartLevel(node.levelNum)}
                >
                  {node.unlocked ? node.levelNum : '🔒'}
                </button>
                {node.stars > 0 && (
                  <div className="gm-level-stars" style={{ marginTop: '3px', fontSize: '0.7rem' }}>
                    {Array.from({ length: node.stars }).map((_, idx) => (
                      <span key={idx}>★</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="btn-outline" style={{ marginTop: '10px', padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setPhase('worlds')}>
            &larr; Worlds
          </button>
        </div>
      )}

      {/* ─── PHASE 4: GAMEPLAY BOARD (WORD CREATOR INSPIRATION) ────────────────── */}
      {phase === 'playing' && (
        <div className="gm-container" style={{ minHeight: 'auto', gap: '4px', width: '100%', maxWidth: '450px' }}>
          {/* Top Control Header Bar */}
          <div className="gm-top-bar" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                style={outlineBtnStyle}
                onClick={() => setPhase('levels')}
              >
                &larr; Map
              </button>
              <button 
                style={outlineBtnStyle}
                onClick={handleUseHint} 
                disabled={hintsRemaining <= 0}
              >
                💡 Hint ({hintsRemaining}/3)
              </button>
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>
              XP: <span style={{ color: '#d9783e' }}>{xp} XP</span>
            </span>
          </div>

          {/* Serif Level Display Header */}
          <h2 style={{ fontFamily: 'Georgia, serif', color: '#fff', fontSize: '2.1rem', margin: '15px 0 2px 0', textAlign: 'center', fontWeight: 'bold' }}>
            Tenali's Mind • Level {levelNum}
          </h2>
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <span className="gm-pill-badge" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '4px 12px', fontSize: '0.78rem', color: '#a89f95' }}>
              Clue {localClueIndex + 1} of 5
            </span>
          </div>

          {/* Focused Italic Clue Box */}
          <div style={{ margin: '12px auto', maxWidth: '420px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1.48rem', lineHeight: '1.45', color: '#ffffff', margin: 0 }}>
              "{clue}"
            </p>
            <p style={{ fontSize: '0.78rem', color: '#a89f95', margin: '8px 0 0 0', fontStyle: 'italic' }}>
              💡 Tip: Fill the topic box(es) below with your candidates
            </p>
          </div>

          {/* 4 Thought Input Fields in a Compact 2x2 Grid Layout */}
          <div style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            margin: '10px 0'
          }}>
            {thoughtGuesses.map((val, idx) => (
              <input
                key={idx}
                type="text"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 14px',
                  background: '#2b2624',
                  border: '1.5px solid #443c39',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
                placeholder={`Topic ${idx + 1}...`}
                value={val}
                onChange={(e) => handleThoughtChange(idx, e.target.value)}
              />
            ))}
          </div>

          {/* Clue Hint details popup if requested */}
          {showHintOverlay && (
            <div className="feedback correct" style={{ width: '100%', padding: '6px', margin: '4px 0', textAlign: 'center', fontSize: '0.85rem' }}>
              💡 Hint: <strong>{hintText}</strong>
            </div>
          )}

          {/* Primary Action Button (Centered) */}
          <div style={{ textAlign: 'center', margin: '14px 0 8px 0' }}>
            <button 
              className="gm-primary-action-btn" 
              style={{
                background: 'rgba(217, 120, 62, 0.25)',
                border: '1.5px solid #d9783e',
                color: '#ffd8c2',
                borderRadius: '12px',
                padding: '12px 28px',
                fontSize: '0.95rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(217, 120, 62, 0.1)'
              }}
              onClick={() => setShowGuess(true)}
            >
              Verify Guess
            </button>
          </div>

          {/* Footer Navigation Row */}
          <div className="gm-footer-nav" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <button 
              style={{
                ...outlineBtnStyle,
                opacity: localClueIndex === 0 ? 0.35 : 1,
                cursor: localClueIndex === 0 ? 'not-allowed' : 'pointer'
              }}
              disabled={localClueIndex === 0} 
              onClick={handlePrevLocalClue}
            >
              &larr; Prev Clue
            </button>
            <button 
              style={{
                ...outlineBtnStyle,
                background: 'rgba(217, 120, 62, 0.25)',
                border: '1.5px solid #d9783e',
                color: '#ffd8c2',
                opacity: cluesExhausted && localClueIndex === revealedClues.length - 1 ? 0.35 : 1,
                cursor: cluesExhausted && localClueIndex === revealedClues.length - 1 ? 'not-allowed' : 'pointer'
              }}
              disabled={cluesExhausted && localClueIndex === revealedClues.length - 1} 
              onClick={handleNextClue}
            >
              Next Clue &rarr;
            </button>
          </div>

          {/* Fullscreen Free-text Guess Modal (Compact) */}
          {showGuess && (
            <div className="gm-guess-modal" style={{ padding: '20px' }}>
              <h3 style={{ margin: '20px 0 10px 0', color: '#fff' }}>Type Your Guess</h3>
              <p className="subtitle" style={{ fontSize: '0.88rem', margin: 0 }}>Warning: Only 1 final attempt allowed!</p>

              <input
                className="gm-search-input"
                type="text"
                style={{ margin: '20px 0 15px 0', padding: '12px 16px', fontSize: '1rem', width: '100%', maxWidth: '400px' }}
                placeholder="Type your guess here..."
                value={guessQuery}
                onChange={(e) => setGuessQuery(e.target.value)}
                autoFocus
              />

              <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '400px', marginTop: '20px' }}>
                <button className="btn-outline" style={{ flex: 1, padding: '10px', fontSize: '0.9rem' }} onClick={() => {
                  setShowGuess(false);
                  setGuessQuery('');
                }}>
                  &larr; Close
                </button>
                <button 
                  className="btn-primary" 
                  style={{ flex: 1, padding: '10px', fontSize: '0.9rem' }} 
                  disabled={!guessQuery.trim()}
                  onClick={handleSubmitGuess}
                >
                  Confirm Guess
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── PHASE 5: GAMEOVER RESULT SCREEN (SCROLL-FREE OVERVIEW + REVIEW) ──── */}
      {phase === 'gameover' && (
        <div className="gm-container" style={{ minHeight: 'auto', gap: '5px', maxHeight: '80vh', overflowY: 'auto', paddingRight: '5px' }}>
          <div className="mr2-char-hub-vertical" style={{ margin: '5px 0', gap: '6px' }}>
            <TenaliAvatar expression={avatarExpression} skin="classic" />
            <div className="mr2-speech-bubble" style={{ padding: '8px 16px' }}>
              <p className="mr2-dialogue-text" style={{ margin: 0, fontSize: '0.95rem' }}>{tenaliSpeech}</p>
            </div>
          </div>

          <div className="mr2-card" style={{ width: '100%', textAlign: 'center', padding: '12px', margin: '10px 0' }}>
            <h3 style={{ margin: '0 0 8px 0', color: isCorrectGuess ? 'var(--clr-correct)' : 'var(--clr-wrong)', fontSize: '1.25rem' }}>
              {isCorrectGuess ? '🎉 Correct!' : '❌ Game Over'}
            </h3>

            {isCorrectGuess && (
              <div style={{ fontSize: '1.85rem', color: '#f1c40f', margin: '8px 0' }}>
                {Array.from({ length: starsEarned }).map((_, idx) => (
                  <span key={idx}>★</span>
                ))}
                {Array.from({ length: 3 - starsEarned }).map((_, idx) => (
                  <span key={idx} style={{ opacity: 0.15 }}>★</span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <div className="mr2-hud-pill" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>XP: <strong>+{xpEarned}</strong></div>
              <div className="mr2-hud-pill" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>Rating: <strong>{mrrChange >= 0 ? `+${mrrChange}` : mrrChange}</strong></div>
            </div>
          </div>

          {/* Compact Educational Revision Card */}
          {educationalInfo && (
            <div className="gm-educational-card" style={{ padding: '16px', margin: 0, gap: '10px', fontSize: '0.88rem' }}>
              <h4 style={{ margin: 0, color: 'var(--clr-accent)', borderBottom: '1px solid var(--clr-border)', paddingBottom: '6px' }}>
                Revision Card: {actualConcept}
              </h4>

              <div className="gm-edu-section" style={{ gap: '2px' }}>
                <span className="gm-edu-label" style={{ fontSize: '0.72rem' }}>Definition</span>
                <span className="gm-edu-value">{educationalInfo.definition}</span>
              </div>

              <div className="gm-edu-section" style={{ gap: '2px' }}>
                <span className="gm-edu-label" style={{ fontSize: '0.72rem' }}>Examples</span>
                <span className="gm-edu-value">{educationalInfo.examples.join(', ')}</span>
              </div>

              <div className="gm-edu-section" style={{ gap: '2px' }}>
                <span className="gm-edu-label" style={{ fontSize: '0.72rem' }}>Common Mistakes</span>
                <span className="gm-edu-value" style={{ color: 'var(--clr-wrong)' }}>{educationalInfo.commonMistakes}</span>
              </div>
            </div>
          )}

          <button className="btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }} onClick={() => setPhase('levels')}>
            Next Level Map &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
