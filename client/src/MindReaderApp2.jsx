/**
 * GUESS WHAT'S ON TENALI'S MIND — COMPACT SEQUENTIAL GAME ENGINE
 * ══════════════════════════════════════════════════════════════
 * Implements a scroll-free, minimal UI matching the Word Creator aesthetic.
 * Uses exact Tenali project CSS variables for themes and colors.
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
  const [unlockedWorlds, setUnlockedWorlds] = useState(['number_kingdom']);
  const [levelProgress, setLevelProgress] = useState({}); // levelNum -> starsEarned

  // Active game navigation states
  const [worlds, setWorlds] = useState([]);
  const [activeWorldIndex, setActiveWorldIndex] = useState(0);
  const [activeWorldId, setActiveWorldId] = useState('number_kingdom');
  const [levelNum, setLevelNum] = useState(1);

  // Active game session playing states
  const [gameId, setGameId] = useState('');
  const [clue, setClue] = useState('');
  const [clueIndex, setClueIndex] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [cluesExhausted, setCluesExhausted] = useState(false);
  const [avatarExpression, setAvatarExpression] = useState('thinking');
  const [tenaliSpeech, setTenaliSpeech] = useState('');

  // Searchable Concept Selector
  const [guessSearchQuery, setGuessSearchQuery] = useState('');
  const [wrongGuessFeedback, setWrongGuessFeedback] = useState('');

  // Hint Overlay Box
  const [showHintOverlay, setShowHintOverlay] = useState(false);
  const [hintText, setHintText] = useState('');

  // Guess Modal Selector
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
        console.log('[MindReaderApp2 Debug] Received worlds from API:', data.worlds?.map(w => ({ worldId: w.worldId, worldName: w.worldName, unlocked: w.unlocked })));
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
    const activeWorld = worlds.find(w => w.worldId === activeWorldId) || worlds[activeWorldIndex] || worlds[0];
    if (!activeWorld) return [];

    // 1. If activeWorld directly contains a levels array
    if (Array.isArray(activeWorld.levels)) {
      return activeWorld.levels.map((lvl) => {
        const num = typeof lvl === 'number' ? lvl : (lvl.levelNum || lvl.id);
        let unlocked = false;
        if (num === 1) {
          unlocked = true;
        } else {
          const prevStars = levelProgress[num - 1];
          unlocked = prevStars !== undefined && prevStars > 0;
        }
        return {
          levelNum: num,
          stars: levelProgress[num] || (typeof lvl === 'object' ? lvl.stars : 0) || 0,
          unlocked: (typeof lvl === 'object' && lvl.unlocked !== undefined) ? lvl.unlocked : unlocked
        };
      });
    }

    // 2. If activeWorld contains levelRange array [start, end] or fallback to default [1, 10]
    const levelRange = Array.isArray(activeWorld.levelRange)
      ? activeWorld.levelRange
      : (typeof activeWorld.levelRange === 'string' && activeWorld.levelRange.includes('-')
          ? activeWorld.levelRange.split('-').map(Number)
          : [1, 10]);

    const [start, end] = levelRange;
    const list = [];
    for (let i = start; i <= end; i++) {
      let unlocked = false;
      if (i === start) {
        unlocked = activeWorld.unlocked !== undefined ? activeWorld.unlocked : true;
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
      const nextIdx = activeWorldIndex + 1;
      setActiveWorldIndex(nextIdx);
      if (worlds[nextIdx]) setActiveWorldId(worlds[nextIdx].worldId);
    }
  };

  const prevWorld = () => {
    if (activeWorldIndex > 0) {
      const prevIdx = activeWorldIndex - 1;
      setActiveWorldIndex(prevIdx);
      if (worlds[prevIdx]) setActiveWorldId(worlds[prevIdx].worldId);
    }
  };

  const handleSelectWorld = (world) => {
    if (!world.unlocked) return;
    setActiveWorldId(world.worldId);
    const idx = worlds.findIndex(w => w.worldId === world.worldId);
    if (idx !== -1) setActiveWorldIndex(idx);
    setPhase('levels');
  };

  // Start Level API
  const handleStartLevel = async (lvl) => {
    setLoading(true);
    setErrorMsg('');
    setWrongGuessFeedback('');
    setGuessSearchQuery('');
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
        if (data.worldId) {
          setActiveWorldId(data.worldId);
          const idx = worlds.findIndex(w => w.worldId === data.worldId);
          if (idx !== -1) setActiveWorldIndex(idx);
        }
        setClue(data.clue);
        setClueIndex(data.clueIndex);
        setRevealedClues([data.clue]);
        setLocalClueIndex(0);
        setHintsRemaining(data.hintsRemaining);
        setCluesExhausted(false);
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
    setWrongGuessFeedback('');
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
  const handleSubmitGuess = async (selectedConceptName) => {
    const guessToSubmit = selectedConceptName || guessQuery;
    if (!guessToSubmit || !guessToSubmit.trim()) return;
    setLoading(true);
    setWrongGuessFeedback('');
    try {
      const token = authGetToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API}/api/mindreader/submit-guess`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ gameId, guess: guessToSubmit })
      });

      if (res.ok) {
        const data = await res.json();
        setIsCorrectGuess(data.correct);
        setStarsEarned(data.starsEarned || 0);
        setXpEarned(data.xpEarned || 0);
        setMrrChange(data.reward ? data.reward.mrrChange : 0);
        setEducationalInfo(data.educationalInfo);
        setShowGuess(false);

        if (data.correct) {
          // Unlock level locally
          setLevelProgress(prev => ({
            ...prev,
            [levelNum]: Math.max(prev[levelNum] || 0, data.starsEarned || 1)
          }));
          if (data.xpEarned) {
            setXp(prev => prev + data.xpEarned);
          }
          setActualConcept(data.actualConcept || guessToSubmit);
          setAvatarExpression('victory');
          setTenaliSpeech(`Outstanding! You correctly guessed "${data.actualConcept || guessToSubmit}"!`);
          setPhase('gameover');
        } else {
          if (data.cluesRemaining) {
            // Keep in playing phase and allow trying next clue / guessing again
            setWrongGuessFeedback("❌ Not quite! That's not the secret concept. Try reading another clue or guessing again!");
          } else {
            // All clues exhausted -> End level & show revision card (without revealing answer name)
            setActualConcept('');
            setAvatarExpression('loss');
            setTenaliSpeech("All 5 clues are completed. Review the educational revision card below!");
            setPhase('gameover');
          }
        }
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
    border: '1px solid var(--clr-border)',
    color: 'var(--clr-text-soft)',
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
    <div className="mr2-container" style={{ background: 'transparent', padding: '10px 15px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* 🔮 Sequential Game Header */}
      {phase !== 'playing' && (
        <div className="mr2-hud" style={{ padding: '8px 16px', borderRadius: '12px', marginBottom: '8px', width: '100%', maxWidth: '500px' }}>
          <div className="mr2-hud-pill" style={{ padding: '6px 12px', fontSize: '0.88rem', color: 'var(--clr-text)' }}>🏆 XP: <strong>{xp}</strong></div>
          <div className="mr2-hud-pill" style={{ padding: '6px 12px', fontSize: '0.88rem', color: 'var(--clr-text)' }}>👑 Level: <strong>{levelNum}</strong></div>
          <div className="mr2-hud-pill" style={{ padding: '6px 12px', fontSize: '0.88rem', color: 'var(--clr-text)' }}>💡 Hints: <strong>{hintsRemaining}/3</strong></div>
        </div>
      )}

      {errorMsg && <div className="feedback wrong" style={{ textAlign: 'center', padding: '6px', margin: '4px 0', fontSize: '0.9rem' }}>{errorMsg}</div>}

      {/* ─── PHASE 1: SETUP LOBBY SCREEN (MINIMAL TEXT) ────────────────────────── */}
      {phase === 'setup' && (
        <div className="gm-container" style={{ minHeight: 'auto', gap: '15px' }}>
          <h2 style={{ margin: '10px 0 0 0', fontFamily: 'var(--font-display)', color: 'var(--clr-text)', fontSize: '2rem' }}>Read Tenali's Mind</h2>
          
          <div className="mr2-char-hub-vertical" style={{ margin: '10px 0', gap: '10px' }}>
            <TenaliAvatar expression={avatarExpression} skin="classic" />
            <div className="mr2-speech-bubble" style={{ maxWidth: '320px', padding: '12px 18px' }}>
              <p className="mr2-dialogue-text" style={{ fontSize: '1rem', margin: 0, color: 'var(--clr-text)' }}>{tenaliSpeech}</p>
            </div>
          </div>

          <button className="btn-primary" style={{ width: '100%', maxWidth: '320px', padding: '12px', marginTop: '10px', background: 'var(--clr-accent)', color: 'var(--clr-text)' }} onClick={() => setPhase('worlds')}>
            Enter the Kingdoms
          </button>
        </div>
      )}

      {/* ─── PHASE 2: WORLD SELECT CAROUSEL ───────────────────────────────────── */}
      {phase === 'worlds' && (
        <div className="gm-container" style={{ minHeight: 'auto', gap: '10px' }}>
          <h3 style={{ margin: '10px 0', color: 'var(--clr-text)' }}>Select a World</h3>
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

              <div className={`gm-world-card ${worlds[activeWorldIndex].unlocked ? 'active-world' : 'locked-world'}`} style={{ padding: '20px 16px', maxWidth: '300px', background: 'var(--clr-card)', border: '1px solid var(--clr-border)' }}>
                <div className="gm-world-header" style={{ color: worlds[activeWorldIndex].themeColor || 'var(--clr-accent)', fontSize: '0.8rem' }}>
                  World {activeWorldIndex + 1} of {worlds.length}
                </div>
                <h4 className="gm-world-title" style={{ fontSize: '1.45rem', margin: '0 0 10px 0', color: 'var(--clr-text)' }}>{worlds[activeWorldIndex].worldName}</h4>
                
                <div className="gm-world-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginBottom: '12px', background: 'var(--clr-badge)', color: 'var(--clr-text)' }}>
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
                    color: worlds[activeWorldIndex].unlocked ? 'var(--clr-text)' : 'var(--clr-text-soft)'
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
          <h4 style={{ margin: '5px 0 15px 0', color: 'var(--clr-text)', fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
            {worlds[activeWorldIndex]?.worldName}
          </h4>

          {/* Coordinate-Mapped Snake Track */}
          <div style={{ position: 'relative', width: '340px', height: '280px', margin: '10px 0' }}>
            {/* SVG Winding Dotted Connector Line */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
              <path 
                d="M 80 30 L 260 90 L 80 150 L 260 210 L 170 260" 
                stroke="var(--clr-accent-soft)" 
                strokeWidth="2" 
                strokeDasharray="5,5" 
                fill="none" 
              />
            </svg>

            {/* Absolutely Positioned Level Nodes */}
            {(() => {
              const coords = [
                { x: 80,  y: 30 },
                { x: 260, y: 90 },
                { x: 80,  y: 150 },
                { x: 260, y: 210 },
                { x: 170, y: 260 }
              ];
              return getLevelsForActiveWorld().map((node, idx) => {
                const pt = coords[idx] || { x: 170, y: 140 };
                const leftPos = pt.x - 23; // Center a 46px bubble
                const topPos = pt.y - 23;
                return (
                  <div 
                    key={node.levelNum} 
                    style={{ 
                      position: 'absolute', 
                      left: `${leftPos}px`, 
                      top: `${topPos}px`, 
                      zIndex: 2, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center' 
                    }}
                  >
                    <button
                      className={`gm-level-node ${node.unlocked ? 'unlocked' : ''} ${node.levelNum === levelNum ? 'active-node' : ''}`}
                      disabled={!node.unlocked}
                      style={{ 
                        width: '46px', 
                        height: '46px', 
                        fontSize: '1.05rem', 
                        borderRadius: '50%',
                        border: node.unlocked ? '1.5px solid var(--clr-accent)' : '1.5px solid var(--clr-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: node.unlocked ? 'pointer' : 'not-allowed'
                      }}
                      onClick={() => handleStartLevel(node.levelNum)}
                    >
                      {node.unlocked ? node.levelNum : '🔒'}
                    </button>
                    {node.stars > 0 && (
                      <div 
                        style={{ 
                          position: 'absolute', 
                          top: '48px', 
                          color: '#f1c40f', 
                          fontSize: '0.7rem', 
                          display: 'flex', 
                          gap: '1.5px', 
                          whiteSpace: 'nowrap' 
                        }}
                      >
                        {Array.from({ length: node.stars }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>

          <button className="btn-outline" style={{ marginTop: '15px', padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setPhase('worlds')}>
            &larr; Worlds
          </button>
        </div>
      )}

      {/* ─── PHASE 4: GAMEPLAY BOARD ────────────────── */}
      {phase === 'playing' && (
        <div className="gm-container" style={{ minHeight: 'auto', gap: '4px', width: '100%', maxWidth: '420px' }}>
          {/* Top Control Header Bar */}
          <div className="gm-top-bar" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--clr-text)', display: 'flex', alignItems: 'center' }}>
              XP: <span style={{ color: 'var(--clr-accent)', marginLeft: '4px' }}>{xp} XP</span>
            </span>
          </div>

          {/* Serif Level Display Header */}
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-text)', fontSize: '2.1rem', margin: '5px 0 2px 0', textAlign: 'center', fontWeight: 'bold' }}>
            Tenali's Mind • Level {levelNum}
          </h2>
          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
            <span className="gm-pill-badge" style={{ background: 'var(--clr-accent-soft)', border: '1px solid var(--clr-border)', borderRadius: '12px', padding: '4px 12px', fontSize: '0.78rem', color: 'var(--clr-text-soft)' }}>
              Clue {localClueIndex + 1} of 5
            </span>
          </div>

          {/* Focused Italic Clue Box */}
          <div style={{ margin: '15px auto 20px auto', maxWidth: '400px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.48rem', lineHeight: '1.45', color: 'var(--clr-text)', margin: 0 }}>
              "{clue || 'I am thinking of a mathematical concept...'}"
            </p>
          </div>

          {/* Clue Hint details popup if requested */}
          {showHintOverlay && (
            <div className="feedback correct" style={{ width: '100%', padding: '8px 12px', margin: '6px 0', textAlign: 'center', fontSize: '0.85rem', borderRadius: '10px' }}>
              💡 Hint: <strong>{hintText}</strong>
            </div>
          )}

          {/* Wrong Guess Feedback Banner */}
          {wrongGuessFeedback && (
            <div style={{ width: '100%', padding: '10px 14px', margin: '8px 0', textAlign: 'center', fontSize: '0.85rem', background: 'rgba(231, 76, 60, 0.15)', border: '1px solid #e74c3c', color: '#e74c3c', borderRadius: '10px', fontWeight: '600' }}>
              {wrongGuessFeedback}
            </div>
          )}

          {/* Primary Action Button (Centered) */}
          <div style={{ textAlign: 'center', margin: '18px 0 12px 0' }}>
            <button 
              className="gm-primary-action-btn" 
              style={{
                background: 'var(--clr-accent-soft)',
                border: '1.5px solid var(--clr-accent)',
                color: 'var(--clr-text)',
                borderRadius: '12px',
                padding: '12px 28px',
                fontSize: '0.95rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: 'none'
              }}
              onClick={() => setShowGuess(true)}
            >
              Verify Guess
            </button>
          </div>

          {/* Footer Navigation Row */}
          <div className="gm-footer-nav" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginTop: '10px', borderTop: '1px solid var(--clr-border)', paddingTop: '10px' }}>
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
                background: 'var(--clr-accent-soft)',
                border: '1.5px solid var(--clr-accent)',
                color: 'var(--clr-text)',
                opacity: cluesExhausted && localClueIndex === revealedClues.length - 1 ? 0.35 : 1,
                cursor: cluesExhausted && localClueIndex === revealedClues.length - 1 ? 'not-allowed' : 'pointer'
              }}
              disabled={cluesExhausted && localClueIndex === revealedClues.length - 1} 
              onClick={handleNextClue}
            >
              Next Clue &rarr;
            </button>
          </div>

          {/* Searchable Concept Selector Modal */}
          {showGuess && (() => {
            const activeWorldObj = worlds.find(w => w.worldId === activeWorldId) || worlds[activeWorldIndex] || worlds[0];
            const activeWorldConcepts = activeWorldObj?.concepts || [];
            const filteredConcepts = activeWorldConcepts.filter(c => c.name.toLowerCase().includes(guessSearchQuery.toLowerCase().trim()));

            return (
              <div className="gm-guess-modal" style={{ padding: '20px', background: 'var(--clr-card)', border: '1px solid var(--clr-border)', borderRadius: '16px', maxWidth: '420px', margin: '0 auto' }}>
                <h3 style={{ margin: '10px 0 6px 0', color: 'var(--clr-text)', textAlign: 'center', fontFamily: 'var(--font-display)' }}>
                  Select Concept
                </h3>
                <p className="subtitle" style={{ fontSize: '0.84rem', margin: '0 0 15px 0', color: 'var(--clr-text-soft)', textAlign: 'center' }}>
                  Which concept from {activeWorldObj?.worldName || 'this world'} is Tenali thinking of?
                </p>

                <input
                  className="gm-search-input"
                  type="text"
                  style={{
                    margin: '0 0 15px 0',
                    padding: '10px 14px',
                    fontSize: '0.9rem',
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'var(--clr-input)',
                    border: '1.5px solid var(--clr-border)',
                    borderRadius: '10px',
                    color: 'var(--clr-text)',
                    outline: 'none'
                  }}
                  placeholder={`Search ${activeWorldObj?.worldName || 'world'} concepts...`}
                  value={guessSearchQuery}
                  onChange={(e) => setGuessSearchQuery(e.target.value)}
                  autoFocus
                />

                <div style={{
                  maxHeight: '220px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  paddingRight: '4px',
                  margin: '10px 0 15px 0'
                }}>
                  {filteredConcepts.map((conceptObj) => (
                    <button
                      key={conceptObj.id}
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--clr-border)',
                        borderRadius: '10px',
                        color: 'var(--clr-text)',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--clr-accent)';
                        e.currentTarget.style.background = 'var(--clr-accent-soft)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--clr-border)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                      onClick={() => handleSubmitGuess(conceptObj.name)}
                    >
                      <span>{conceptObj.name}</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>&rarr;</span>
                    </button>
                  ))}
                  {filteredConcepts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '15px', color: 'var(--clr-text-soft)', fontSize: '0.85rem' }}>
                      No concepts found matching "{guessSearchQuery}"
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '10px' }}>
                  <button className="btn-outline" style={{ flex: 1, padding: '10px', fontSize: '0.88rem' }} onClick={() => {
                    setShowGuess(false);
                    setGuessSearchQuery('');
                  }}>
                    &larr; Cancel
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ─── PHASE 5: GAMEOVER RESULT SCREEN ─── */}
      {phase === 'gameover' && (
        <div className="gm-container" style={{ minHeight: 'auto', gap: '5px', width: '100%', maxWidth: '420px', padding: '10px 15px' }}>
          {/* Centered Serif Heading */}
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-text)', fontSize: '2.2rem', margin: '20px 0 4px 0', textAlign: 'center', fontWeight: 'bold' }}>
            {isCorrectGuess ? '🎉 Correct!' : 'Level Complete'}
          </h2>
          {isCorrectGuess && actualConcept && (
            <p style={{ fontSize: '0.95rem', color: 'var(--clr-text-soft)', margin: '0 0 10px 0', textAlign: 'center' }}>
              The concept was <strong style={{ color: 'var(--clr-text)' }}>"{actualConcept}"</strong>
            </p>
          )}

          {/* Stars Display */}
          {isCorrectGuess && (
            <div style={{ fontSize: '2rem', color: '#f1c40f', margin: '5px 0', textAlign: 'center', letterSpacing: '4px' }}>
              {Array.from({ length: starsEarned }).map((_, idx) => (
                <span key={idx}>★</span>
              ))}
              {Array.from({ length: 3 - starsEarned }).map((_, idx) => (
                <span key={idx} style={{ opacity: 0.15 }}>★</span>
              ))}
            </div>
          )}

          {/* Reward Badges */}
          {isCorrectGuess && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '15px 0' }}>
              <span className="gm-pill-badge" style={{ background: 'var(--clr-accent-soft)', border: '1px solid var(--clr-border)', borderRadius: '12px', padding: '6px 14px', fontSize: '0.82rem', color: 'var(--clr-text-soft)' }}>
                XP: <strong style={{ color: 'var(--clr-accent)' }}>+{xpEarned}</strong>
              </span>
              <span className="gm-pill-badge" style={{ background: 'var(--clr-accent-soft)', border: '1px solid var(--clr-border)', borderRadius: '12px', padding: '6px 14px', fontSize: '0.82rem', color: 'var(--clr-text-soft)' }}>
                Rating: <strong style={{ color: 'var(--clr-accent)' }}>{mrrChange >= 0 ? `+${mrrChange}` : mrrChange}</strong>
              </span>
            </div>
          )}

          {/* Premium Charcoal Revision Card */}
          {educationalInfo && (
            <div style={{
              background: 'var(--clr-card)',
              border: '1.5px solid var(--clr-border)',
              borderRadius: '12px',
              padding: '16px',
              width: '100%',
              margin: '10px 0',
              textAlign: 'left'
            }}>
              <h4 style={{ margin: '0 0 12px 0', fontFamily: 'var(--font-display)', color: 'var(--clr-accent)', borderBottom: '1px solid var(--clr-border)', paddingBottom: '6px', fontSize: '1.05rem', fontWeight: 'bold' }}>
                Revision Card
              </h4>

              {educationalInfo.definition && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--clr-text-soft)', letterSpacing: '0.05em', fontWeight: 'bold' }}>Definition</div>
                  <div style={{ color: 'var(--clr-text)', fontSize: '0.85rem', marginTop: '2px', lineHeight: '1.4' }}>{educationalInfo.definition}</div>
                </div>
              )}

              {educationalInfo.examples && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--clr-text-soft)', letterSpacing: '0.05em', fontWeight: 'bold' }}>Examples</div>
                  <div style={{ color: 'var(--clr-text)', fontSize: '0.85rem', marginTop: '2px', lineHeight: '1.4' }}>{Array.isArray(educationalInfo.examples) ? educationalInfo.examples.join(', ') : educationalInfo.examples}</div>
                </div>
              )}

              {educationalInfo.commonMistakes && (
                <div>
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--clr-text-soft)', letterSpacing: '0.05em', fontWeight: 'bold' }}>Common Mistakes</div>
                  <div style={{ color: 'var(--clr-wrong)', fontSize: '0.85rem', marginTop: '2px', lineHeight: '1.4' }}>{educationalInfo.commonMistakes}</div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px', width: '100%' }}>
            {isCorrectGuess && (
              <button 
                style={{
                  background: 'var(--clr-accent)',
                  color: 'var(--clr-text)',
                  borderRadius: '12px',
                  border: 'none',
                  padding: '12px 32px',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                onClick={() => handleStartLevel(levelNum + 1)}
              >
                Play Next Level &rarr;
              </button>
            )}
            <button 
              style={outlineBtnStyle}
              onClick={() => setPhase('levels')}
            >
              &larr; Back to Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
