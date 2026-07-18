/**
 * TENALI REVERSE MIND READER — FRONTEND COMPONENT
 * ═════════════════════════════════════════════════
 * Allows the student to guess Tenali's secret mathematical concept
 * by asking questions, requesting hints, and submitting a final guess.
 */

import React, { useState, useEffect, useRef } from 'react';
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

// Predefined 25 math concepts for selection
const CONCEPT_POOL = [
  'Prime Number', 'HCF (Highest Common Factor)', 'LCM (Lowest Common Multiple)',
  'Square Root', 'Equivalent Fractions', 'Percentage', 'Linear Equation',
  'Quadratic Equation', 'Matrix', 'Vector', 'Right Triangle',
  "Pythagoras' Theorem", 'Venn Diagram', 'Mean', 'Probability',
  'Ratio', 'Decimal', 'Integers', 'Polygon', 'Circle',
  'Perimeter', 'Area', 'Exponent', 'Median', 'Mode'
];

const CATEGORIES = ["Definition", "Category", "Properties", "Applications"];

const QUESTIONS_LIBRARY = [
  // --- Definition ---
  { id: "q_is_number", category: "Definition", text: "Is it a type of number (like prime numbers or integers)?" },
  { id: "q_is_theorem", category: "Definition", text: "Is it a mathematical theorem (like Pythagoras' Theorem)?" },
  { id: "q_is_formula", category: "Definition", text: "Is it an equation or formula (like y = mx + c)?" },
  { id: "q_is_operation", category: "Definition", text: "Is it a calculation process (like finding the HCF or LCM)?" },
  { id: "q_is_not_operation", category: "Definition", text: "Is it a concept/idea rather than an operation?" },
  { id: "q_is_not_number", category: "Definition", text: "Is it something other than a type of number?" },
  // --- Category ---
  { id: "q_cat_geometry", category: "Category", text: "Does it belong to Geometry (shapes, lines, area)?" },
  { id: "q_cat_algebra", category: "Category", text: "Does it belong to Algebra (using letters like x and y)?" },
  { id: "q_cat_number_theory", category: "Category", text: "Does it belong to Arithmetic/Number Theory (integers, factors)?" },
  { id: "q_cat_not_geometry", category: "Category", text: "Is it outside the scope of Geometry?" },
  { id: "q_cat_not_algebra", category: "Category", text: "Is it outside the scope of Algebra?" },
  // --- Properties ---
  { id: "q_prop_diagrams", category: "Properties", text: "Do we usually draw a diagram or shape to show it?" },
  { id: "q_prop_variables", category: "Properties", text: "Does it use variables/letters (like x and y)?" },
  { id: "q_prop_fractions", category: "Properties", text: "Does it use fractions, decimals, or ratios?" },
  { id: "q_prop_graphs", category: "Properties", text: "Does it involve coordinates, grids, or graphs?" },
  { id: "q_prop_calculation", category: "Properties", text: "Do we need to do calculations to find it?" },
  { id: "q_prop_no_calculation", category: "Properties", text: "Is it a qualitative concept (not requiring calculations)?" },
  { id: "q_prop_no_variables", category: "Properties", text: "Does it avoid algebraic variables?" },
  { id: "q_grade_elementary", category: "Properties", text: "Is it taught in primary school (Grade 5 or below)?" },
  { id: "q_grade_middle", category: "Properties", text: "Is it taught in middle school (Grade 6 to 8)?" },
  { id: "q_grade_high", category: "Properties", text: "Is it taught in high school (Grade 9 or above)?" },
  // --- Applications ---
  { id: "q_app_real_world", category: "Applications", text: "Does it have common real-world applications?" },
  { id: "q_app_no_real_world", category: "Applications", text: "Is it mostly theoretical or abstract math?" }
];

export default function MindReaderApp2({ onBack }) {
  const [phase, setPhase] = useState('setup'); // 'setup' | 'preparing' | 'playing' | 'gameover'
  const [gameId, setGameId] = useState('');
  const [questionsRemaining, setQuestionsRemaining] = useState(10);
  const [hintsRemaining, setHintsRemaining] = useState(2);
  const [askedQuestions, setAskedQuestions] = useState([]);
  const [history, setHistory] = useState([]); // [{ sender: 'student'|'tenali'|'hint', text: '...' }]
  const [expression, setExpression] = useState('thinking');
  const [tenaliSpeech, setTenaliSpeech] = useState('');
  
  // Game states & profile
  const [mrr, setMrr] = useState(1000);
  const [gamesToday, setGamesToday] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(99999);
  const [authenticated, setAuthenticated] = useState(false);
  const [unlockedSkins, setUnlockedSkins] = useState(['Classic Tenali']);
  const [equippedSkin, setEquippedSkin] = useState('classic');
  const [equippedTitle, setEquippedTitle] = useState('Novice Reader');
  const [showCabinet, setShowCabinet] = useState(false);
  const [winStreak, setWinStreak] = useState(0);
  const [gameDifficulty, setGameDifficulty] = useState('easy');

  // Gameplay panels
  const [activeCategory, setActiveCategory] = useState('Definition');
  const [showGuessDialog, setShowGuessDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConcept, setSelectedConcept] = useState('');
  
  // GameOver variables
  const [isCorrectGuess, setIsCorrectGuess] = useState(false);
  const [mrrChange, setMrrChange] = useState(0);
  const [correctConceptDetails, setCorrectConceptDetails] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const historyEndRef = useRef(null);

  const titlesList = [
    { name: 'Novice Reader', minMrr: 1000 },
    { name: 'Royal Trickster', minMrr: 1100 },
    { name: 'Court Genius', minMrr: 1250 },
    { name: 'Mind Emperor', minMrr: 1400 },
  ];

  const skinsList = [
    { id: 'classic', name: 'Classic Tenali', minMrr: 1000, description: 'Traditional court orange attire.' },
    { id: 'royal', name: 'Royal Robes', minMrr: 1150, description: 'Gold and royal blue garments fitted for the palace.' },
    { id: 'scholar', name: 'Sage Scholar', minMrr: 1300, description: 'White silver robes showing absolute mathematical wisdom.' }
  ];

  // Load profile and configuration
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const configRes = await fetch(`${API}/api/mindreader/config`);
        if (configRes.ok) {
          const configData = await configRes.json();
          if (configData.dailyLimit) setDailyLimit(configData.dailyLimit);
        }

        const token = authGetToken();
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const profileRes = await fetch(`${API}/api/mindreader/profile`, { headers });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.authenticated) {
            setMrr(profileData.mrr);
            setGamesToday(profileData.mindReaderGamesToday);
            setUnlockedSkins(profileData.unlockedSkins || ['Classic Tenali']);
            setEquippedSkin(profileData.equippedSkin || 'classic');
            setEquippedTitle(profileData.equippedTitle || 'Novice Reader');
            setWinStreak(profileData.winStreak || 0);
            setAuthenticated(true);
          } else {
            setAuthenticated(false);
            const localMrr = parseInt(localStorage.getItem('tenali-mindreader-mrr') || '1000', 10);
            setMrr(localMrr);
            setEquippedSkin(localStorage.getItem('tenali-mindreader-skin') || 'classic');
            setEquippedTitle(localStorage.getItem('tenali-mindreader-title') || 'Novice Reader');
            setGamesToday(parseInt(localStorage.getItem('tenali-mindreader-games-today') || '0', 10));
            setWinStreak(parseInt(localStorage.getItem('tenali-mindreader-streak') || '0', 10));
          }
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
      }
    };

    loadProfile();
  }, []);

  // Scroll chat transcript to the bottom on update
  useEffect(() => {
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  // Set Tenali greeting message on lobby setup
  useEffect(() => {
    if (phase === 'setup') {
      setExpression('thinking');
      setTenaliSpeech("Greetings! I have hidden a mathematical secret in my mind.\n\nCan you discover what it is in 10 questions or less? I shall answer your queries truthfully!");
    }
  }, [phase]);

  const handleEquipItem = async (type, val) => {
    if (type === 'skin') {
      setEquippedSkin(val);
      if (authenticated) {
        try {
          const token = authGetToken();
          await fetch(`${API}/api/mindreader/equip`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({ skin: val })
          });
        } catch (err) {
          console.error('Failed to save equipped skin:', err);
        }
      } else {
        localStorage.setItem('tenali-mindreader-skin', val);
      }
    } else if (type === 'title') {
      setEquippedTitle(val);
      if (authenticated) {
        try {
          const token = authGetToken();
          await fetch(`${API}/api/mindreader/equip`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({ title: val })
          });
        } catch (err) {
          console.error('Failed to save equipped title:', err);
        }
      } else {
        localStorage.setItem('tenali-mindreader-title', val);
      }
    }
  };

  const handleStartGame = (difficulty = 'easy') => {
    setPhase('preparing');
    setLoading(true);
    setErrorMsg('');

    // Fetch the start API
    const token = authGetToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    setTimeout(async () => {
      try {
        const res = await fetch(`${API}/api/game/start`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ difficulty })
        });

        if (!res.ok) throw new Error("Failed to start session.");
        const data = await res.json();
        
        setGameId(data.gameId);
        setQuestionsRemaining(data.questionsRemaining);
        setHintsRemaining(data.hintsRemaining);
        setGameDifficulty(data.difficulty || difficulty);
        setAskedQuestions([]);
        setHistory([]);
        setExpression('thinking');
        setTenaliSpeech("I am ready. Ask me any question from the categories below!");
        setPhase('playing');
      } catch (err) {
        setErrorMsg(err.message || "Communication error with Tenali.");
        setPhase('setup');
      } finally {
        setLoading(false);
      }
    }, 2000); // 2-second buffer for the nice selecting animation
  };

  const handleAskQuestion = async (qObj) => {
    if (loading || askedQuestions.includes(qObj.id) || questionsRemaining <= 0) return;
    
    setLoading(true);
    setErrorMsg('');
    setExpression('writing');

    // Add student query to history immediately
    setHistory(prev => [...prev, { sender: 'student', text: qObj.text }]);

    try {
      const res = await fetch(`${API}/api/game/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, questionId: qObj.id })
      });

      if (!res.ok) throw new Error("Failed to get question answer.");
      const data = await res.json();

      setQuestionsRemaining(data.questionsRemaining);
      setAskedQuestions(prev => [...prev, qObj.id]);
      
      // Map answer to corresponding avatar expression
      if (data.answer === 'yes') {
        setExpression('happy');
      } else if (data.answer === 'no') {
        setExpression('serious');
      } else {
        setExpression('confused');
      }

      setTenaliSpeech(data.dialogue);
      setHistory(prev => [...prev, { sender: 'tenali', text: data.dialogue }]);
    } catch (err) {
      setErrorMsg(err.message || "Failed to communicate question.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestHint = async () => {
    if (loading || hintsRemaining <= 0) return;

    setLoading(true);
    setErrorMsg('');
    setExpression('hinting');

    setHistory(prev => [...prev, { sender: 'student', text: "Can you give me a hint?" }]);

    try {
      const res = await fetch(`${API}/api/game/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId })
      });

      if (!res.ok) throw new Error("Failed to get hint.");
      const data = await res.json();

      setHintsRemaining(data.hintsRemaining);
      setTenaliSpeech(data.dialogue);
      setHistory(prev => [...prev, { sender: 'hint', text: data.dialogue }]);
    } catch (err) {
      setErrorMsg(err.message || "Failed to communicate hint request.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuessSubmit = async () => {
    if (!selectedConcept) return;
    
    setLoading(true);
    setErrorMsg('');
    setShowGuessDialog(false);

    const token = authGetToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API}/api/game/guess`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ gameId, guess: selectedConcept, winStreak })
      });

      if (!res.ok) throw new Error("Failed to process guess.");
      const data = await res.json();

      setIsCorrectGuess(data.correct);
      setCorrectConceptDetails(data.concept);
      setMrrChange(data.reward.mrrChange);

      if (data.reward.authenticated) {
        setMrr(data.reward.mrr);
        setGamesToday(data.reward.mindReaderGamesToday);
        setWinStreak(data.reward.winStreak || 0);
      } else {
        const localMrr = parseInt(localStorage.getItem('tenali-mindreader-mrr') || '1000', 10);
        const newMrr = Math.max(1000, localMrr + data.reward.mrrChange);
        setMrr(newMrr);
        localStorage.setItem('tenali-mindreader-mrr', String(newMrr));

        const newGames = gamesToday + 1;
        setGamesToday(newGames);
        localStorage.setItem('tenali-mindreader-games-today', String(newGames));

        const newStreak = data.correct ? winStreak + 1 : 0;
        setWinStreak(newStreak);
        localStorage.setItem('tenali-mindreader-streak', String(newStreak));
      }

      if (data.correct) {
        setExpression('impressed');
        setTenaliSpeech(`Incredible! You correctly guessed "${data.concept.name}"! I bow to your mathematical shield.`);
      } else {
        setExpression('proud');
        setTenaliSpeech(`Aha! My secret remains safe. I was thinking of "${data.concept.name}". Better luck next time!`);
      }

      setPhase('gameover');
    } catch (err) {
      setErrorMsg(err.message || "Failed to send guess.");
      setShowGuessDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const filteredConcepts = CONCEPT_POOL.filter(concept =>
    concept.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="header-row-wrapper" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header with home navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button className="back-button" onClick={onBack}>← Home</button>
        <h1>Read Tenali's Mind</h1>
        <div style={{ width: '80px' }} /> {/* alignment balance */}
      </div>

      <div className="mr2-container">
        
        {/* Top Stats HUD (Only when not in transition screen) */}
        {phase !== 'preparing' && (
          <div className="mr2-card mr2-hud">
            <div className="mr2-hud-pill">🔮 MRR: <strong>{mrr}</strong></div>
            <div className="mr2-hud-pill">🏷️ Title: <strong>{equippedTitle}</strong></div>
            {winStreak > 0 && <div className="mr2-hud-pill" style={{ color: '#e67e22', border: '1px solid #e67e22' }}>🔥 Streak: <strong>{winStreak}</strong></div>}
            {phase === 'playing' ? (
              <>
                <div className="mr2-hud-pill" style={{ textTransform: 'capitalize', color: gameDifficulty === 'easy' ? '#2ecc71' : gameDifficulty === 'medium' ? '#f1c40f' : '#e74c3c', borderColor: gameDifficulty === 'easy' ? '#2ecc71' : gameDifficulty === 'medium' ? '#f1c40f' : '#e74c3c' }}>
                  {gameDifficulty === 'easy' ? '🟢 Easy' : gameDifficulty === 'medium' ? '🟡 Medium' : '🔴 Hard'}
                </div>
                <div className="mr2-hud-pill">💬 Questions: <strong>{questionsRemaining} / {gameDifficulty === 'easy' ? 15 : gameDifficulty === 'medium' ? 10 : 6}</strong></div>
                <div className="mr2-hud-pill">💡 Hints: <strong>{hintsRemaining} / {gameDifficulty === 'easy' ? 3 : gameDifficulty === 'medium' ? 2 : 1}</strong></div>
              </>
            ) : (
              <button 
                className="cabinet-toggle-btn" 
                onClick={() => setShowCabinet(true)} 
                style={{ 
                  background: 'linear-gradient(135deg, var(--clr-accent) 0%, #8e44ad 100%)', 
                  color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', 
                  cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 12px rgba(142, 68, 173, 0.2)' 
                }}
              >
                🎁 Rewards Cabinet
              </button>
            )}
          </div>
        )}

        {/* LOBBY / SETUP SCREEN */}
        {phase === 'setup' && (
          <div className="mr2-card">
            <div className="mr2-char-hub-horizontal">
              <TenaliAvatar expression={expression} skin={equippedSkin} />
              
              <div className="mr2-speech-bubble">
                <div className="mr2-speech-header">
                  <span className="mr2-char-name">Tenali Raman</span>
                  <span className="mr2-char-title">{equippedTitle}</span>
                </div>
                <div className="mr2-dialogue-text">{tenaliSpeech}</div>
              </div>
            </div>

            <h3 style={{ marginTop: '30px', color: 'var(--clr-accent)', letterSpacing: '0.5px' }}>SECRET CONCEPT POOL (V2 MVP)</h3>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem', marginBottom: '12px' }}>
              Tenali will pick one mathematical secret from the list below. Study the topics and prepare your questions!
            </p>
            <div className="mr2-concept-grid">
              {CONCEPT_POOL.map((concept, idx) => (
                <span key={idx} className="mr2-concept-chip">{concept}</span>
              ))}
            </div>

            <h3 style={{ marginTop: '35px', color: 'var(--clr-accent)', letterSpacing: '0.5px' }}>CHOOSE DIFFICULTY LEVEL</h3>
            <div className="difficulty-grid-selector" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '15px', marginBottom: '10px' }}>
              <button 
                onClick={() => handleStartGame('easy')}
                disabled={loading}
                className="difficulty-btn-card"
                style={{
                  background: 'rgba(46, 204, 113, 0.08)', border: '2px solid #2ecc71', borderRadius: '12px', padding: '16px 10px',
                  cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center', color: 'var(--clr-text)'
                }}
              >
                <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '6px' }}>🟢</span>
                <strong style={{ display: 'block', color: '#2ecc71', fontSize: '1.05rem' }}>Easy Level</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-soft)', display: 'block', marginTop: '6px', lineHeight: '1.3' }}>
                  15 Questions | 3 Hints<br/>Grade 5 & below topics
                </span>
              </button>

              <button 
                onClick={() => handleStartGame('medium')}
                disabled={loading}
                className="difficulty-btn-card"
                style={{
                  background: 'rgba(241, 196, 15, 0.08)', border: '2px solid #f1c40f', borderRadius: '12px', padding: '16px 10px',
                  cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center', color: 'var(--clr-text)'
                }}
              >
                <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '6px' }}>🟡</span>
                <strong style={{ display: 'block', color: '#f1c40f', fontSize: '1.05rem' }}>Medium Level</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-soft)', display: 'block', marginTop: '6px', lineHeight: '1.3' }}>
                  10 Questions | 2 Hints<br/>Grade 6-8 (+10 MRR)
                </span>
              </button>

              <button 
                onClick={() => handleStartGame('hard')}
                disabled={loading}
                className="difficulty-btn-card"
                style={{
                  background: 'rgba(231, 76, 60, 0.08)', border: '2px solid #e74c3c', borderRadius: '12px', padding: '16px 10px',
                  cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center', color: 'var(--clr-text)'
                }}
              >
                <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '6px' }}>🔴</span>
                <strong style={{ display: 'block', color: '#e74c3c', fontSize: '1.05rem' }}>Hard Level</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-soft)', display: 'block', marginTop: '6px', lineHeight: '1.3' }}>
                  6 Questions | 1 Hint<br/>Grade 9-10 (+25 MRR)
                </span>
              </button>
            </div>
          </div>
        )}

        {/* PREPARING SCREEN */}
        {phase === 'preparing' && (
          <div className="mr2-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--clr-accent)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Selecting today's challenge...
            </h2>
            <div className="pregame-music-container" style={{ display: 'flex', gap: '6px', height: '40px', alignItems: 'flex-end', margin: '2rem 0' }}>
              <div className="mr2-music-bar bar-1"></div>
              <div className="mr2-music-bar bar-2"></div>
              <div className="mr2-music-bar bar-3"></div>
              <div className="mr2-music-bar bar-4"></div>
              <div className="mr2-music-bar bar-5"></div>
            </div>
            <p style={{ fontStyle: 'italic', color: 'var(--clr-text-soft)', fontSize: '1.05rem', animation: 'pulse-opacity 1.5s infinite' }}>
              🔮 Tenali is closing his eyes... searching the mathematical dictionary...
            </p>
          </div>
        )}

        {/* GAMEPLAY VIEW */}
        {phase === 'playing' && (
          <div className="mr2-gameplay-layout">
            
            {/* Left Column: controls, categories, questions */}
            <div className="mr2-control-panel">
              
              <div className="mr2-card mr2-char-hub-vertical">
                <div className="mr2-speech-bubble">
                  <div className="mr2-speech-header">
                    <span className="mr2-char-name">Tenali Raman</span>
                    <span className="mr2-char-title">{equippedTitle}</span>
                  </div>
                  <div className="mr2-dialogue-text">"{tenaliSpeech}"</div>
                </div>
                <TenaliAvatar expression={expression} skin={equippedSkin} />
              </div>

              {/* Predefined Categories & Questions Panel */}
              <div className="mr2-card" style={{ padding: '16px' }}>
                <div className="mr2-category-tabs">
                  {CATEGORIES.map((cat, idx) => (
                    <button 
                      key={idx} 
                      className={`mr2-tab-btn ${activeCategory === cat ? 'active' : ''}`}
                      onClick={() => setActiveCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="mr2-question-list">
                  {QUESTIONS_LIBRARY.filter(q => q.category === activeCategory).map((qObj) => {
                    const isAsked = askedQuestions.includes(qObj.id);
                    return (
                      <div key={qObj.id} className={`mr2-question-row ${isAsked ? 'disabled' : ''}`}>
                        <span className="mr2-question-text">{qObj.text}</span>
                        <button 
                          className="mr2-ask-btn" 
                          onClick={() => handleAskQuestion(qObj)}
                          disabled={isAsked || loading || questionsRemaining <= 0}
                        >
                          {isAsked ? 'Asked' : 'Ask'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Rows */}
              {errorMsg && <p className="error-text" style={{ margin: '5px 0 0 0', textAlign: 'center' }}>{errorMsg}</p>}
              
              <div className="mr2-action-controls">
                <button 
                  className="mr2-hint-btn" 
                  onClick={handleRequestHint} 
                  disabled={loading || hintsRemaining <= 0}
                >
                  💡 Hint ({hintsRemaining} left)
                </button>
                <button 
                  className="mr2-guess-trigger-btn"
                  onClick={() => { setShowGuessDialog(true); setSelectedConcept(''); setSearchQuery(''); }}
                  disabled={loading}
                >
                  🎯 Make Final Guess
                </button>
              </div>

            </div>

            {/* Right Column: Chat Transcript Transcript */}
            <div className="mr2-transcript-panel">
              <div className="mr2-transcript-title">📜 Conversation History</div>
              <div className="mr2-transcript-history">
                {history.length === 0 ? (
                  <div style={{ color: 'var(--clr-text-soft)', fontStyle: 'italic', fontSize: '0.9rem', textAlign: 'center', marginTop: '40px' }}>
                    No questions asked yet. Choose a question from the categories block!
                  </div>
                ) : (
                  history.map((msg, idx) => {
                    let bubbleClass = 'mr2-chat-tenali';
                    if (msg.sender === 'student') bubbleClass = 'mr2-chat-student';
                    if (msg.sender === 'hint') bubbleClass = 'mr2-chat-hint';
                    return (
                      <div key={idx} className={`mr2-chat-bubble ${bubbleClass}`}>
                        {msg.sender === 'student' ? '🙋‍♂️ Student: ' : msg.sender === 'hint' ? '💡 Clue: ' : '😈 Tenali: '}
                        {msg.text}
                      </div>
                    );
                  })
                )}
                <div ref={historyEndRef} />
              </div>
            </div>

          </div>
        )}

        {/* RESULTS SCREEN */}
        {phase === 'gameover' && (
          <div className="mr2-card" style={{ textAlign: 'center' }}>
            {isCorrectGuess ? (
              <div>
                <h2 className="mr2-result-win">🏆 VICTORY! 🏆</h2>
                <div className="mr2-mrr-up">MRR Rating: {mrr - mrrChange} ➔ {mrr} (+{mrrChange} points)</div>
              </div>
            ) : (
              <div>
                <h2 className="mr2-result-loss">❌ DEFEAT ❌</h2>
                <div className="mr2-mrr-down">MRR Rating: {mrr - mrrChange} ➔ {mrr} ({mrrChange} points)</div>
              </div>
            )}

            <div className="mr2-char-hub-vertical" style={{ margin: '20px 0' }}>
              <div className="mr2-speech-bubble">
                <div className="mr2-speech-header">
                  <span className="mr2-char-name">Tenali Raman</span>
                  <span className="mr2-char-title">{equippedTitle}</span>
                </div>
                <div className="mr2-dialogue-text">"{tenaliSpeech}"</div>
              </div>
              <TenaliAvatar expression={expression} skin={equippedSkin} />
            </div>

            {/* Concept Explanation Card */}
            {correctConceptDetails && (
              <div className="mr2-details-container">
                <h3 style={{ color: 'var(--clr-accent)', margin: '0 0 10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px', fontSize: '1.15rem' }}>
                  📖 Concept Details: {correctConceptDetails.name}
                </h3>
                <div className="mr2-details-item">
                  <strong>Definition:</strong> {correctConceptDetails.definition}
                </div>
                <div className="mr2-details-item">
                  <strong>Examples:</strong>
                  <ul className="mr2-details-list">
                    {correctConceptDetails.examples.map((ex, idx) => (
                      <li key={idx}>{ex}</li>
                    ))}
                  </ul>
                </div>
                <div className="mr2-details-item">
                  <strong>Fun Fact:</strong> {correctConceptDetails.funFact}
                </div>
                <div className="mr2-details-item">
                  <strong>Related Lesson:</strong> {correctConceptDetails.relatedLesson}
                </div>
                <div className="mr2-details-item">
                  <strong>Common Mistakes:</strong> {correctConceptDetails.commonMistakes}
                </div>
              </div>
            )}

            <button 
              className="mr2-guess-trigger-btn" 
              onClick={() => setPhase('setup')}
              style={{ marginTop: '10px', width: '200px' }}
            >
              Play Again
            </button>
          </div>
        )}

        {/* GUESS SEARCH DIALOG MODAL */}
        {showGuessDialog && (
          <div className="mr2-guess-overlay">
            <div className="mr2-guess-modal">
              <div className="mr2-guess-header">
                <h3>Submit Final Guess</h3>
                <button className="mr2-close-btn" onClick={() => setShowGuessDialog(false)}>&times;</button>
              </div>

              <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.85rem', margin: '0' }}>
                You have exactly 1 guess. Filter the concepts below and select your answer!
              </p>

              <input 
                type="text" 
                className="mr2-search-input" 
                placeholder="Type to filter concepts..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <div className="mr2-concept-select-list">
                {filteredConcepts.length === 0 ? (
                  <div style={{ color: 'var(--clr-text-soft)', fontStyle: 'italic', fontSize: '0.9rem', textAlign: 'center', padding: '10px' }}>
                    No concepts match your filter.
                  </div>
                ) : (
                  filteredConcepts.map((concept, idx) => (
                    <div 
                      key={idx} 
                      className={`mr2-concept-select-item ${selectedConcept === concept ? 'selected' : ''}`}
                      onClick={() => setSelectedConcept(concept)}
                    >
                      {concept}
                    </div>
                  ))
                )}
              </div>

              <button 
                className="mr2-submit-guess-btn" 
                onClick={handleGuessSubmit}
                disabled={!selectedConcept || loading}
              >
                {loading ? 'Submitting...' : `Submit Guess: "${selectedConcept || 'None'}"`}
              </button>
            </div>
          </div>
        )}

        {/* REWARDS CABINET sliding drawer */}
        {showCabinet && (
          <div 
            className="cabinet-overlay" 
            onClick={() => setShowCabinet(false)} 
            style={{ 
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
              background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', 
              justifyContent: 'flex-end', backdropFilter: 'blur(4px)' 
            }}
          >
            <div 
              className="cabinet-drawer" 
              onClick={(e) => e.stopPropagation()} 
              style={{ 
                width: '450px', maxWidth: '100%', height: '100%', 
                background: 'var(--clr-surface)', boxShadow: '-10px 0 30px rgba(0,0,0,0.2)', 
                padding: '30px', display: 'flex', flexDirection: 'column', overflowY: 'auto' 
              }}
            >
              <div 
                className="cabinet-header" 
                style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  marginBottom: '24px', borderBottom: '1px solid var(--clr-border)', paddingBottom: '12px' 
                }}
              >
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--clr-text)' }}>🎁 Rewards Cabinet</h2>
                <button onClick={() => setShowCabinet(false)} style={{ background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: 'var(--clr-text-soft)' }}>&times;</button>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '20px', lineHeight: 1.4 }}>
                Earn Mind Reader Rating (MRR) by defeating Tenali in games. Higher MRR unlocks special skins and titles!
              </p>
              
              <div 
                className="cabinet-mrr-display" 
                style={{ 
                  background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(142, 68, 173, 0.1) 100%)', 
                  border: '1px solid var(--clr-border)', borderRadius: '12px', padding: '16px', 
                  textAlign: 'center', marginBottom: '24px' 
                }}
              >
                <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Current Rating</span>
                <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--clr-accent)', display: 'block', margin: '4px 0' }}>🔮 {mrr} MRR</span>
              </div>

              <h3 style={{ borderBottom: '1px solid var(--clr-border)', paddingBottom: '8px', marginBottom: '12px', fontSize: '1.1rem', color: 'var(--clr-text)' }}>Skins</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {skinsList.map((skinItem) => {
                  const isUnlocked = mrr >= skinItem.minMrr;
                  const isEquipped = equippedSkin === skinItem.id;
                  return (
                    <div 
                      key={skinItem.id} 
                      style={{ 
                        border: isEquipped ? '2px solid var(--clr-accent)' : '1px solid var(--clr-border)', 
                        borderRadius: '12px', padding: '14px', background: isEquipped ? 'rgba(74, 144, 226, 0.05)' : 'none', 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                      }}
                    >
                      <div style={{ flex: 1, paddingRight: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <strong style={{ color: 'var(--clr-text)', fontSize: '0.98rem' }}>{skinItem.name}</strong>
                          <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: isUnlocked ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.1)', color: isUnlocked ? '#2ecc71' : 'var(--clr-wrong)', fontWeight: '600' }}>
                            {isUnlocked ? '✓ Unlocked' : `🔒 ${skinItem.minMrr} MRR`}
                          </span>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--clr-text-soft)', lineHeight: 1.3 }}>{skinItem.description}</p>
                      </div>
                      <div>
                        {isEquipped ? (
                          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--clr-accent)' }}>Equipped</span>
                        ) : isUnlocked ? (
                          <button onClick={() => handleEquipItem('skin', skinItem.id)} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--clr-accent)', background: 'none', color: 'var(--clr-accent)', cursor: 'pointer', fontWeight: '600' }}>Equip</button>
                        ) : (
                          <button disabled style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--clr-border)', background: 'none', color: 'var(--clr-text-soft)', opacity: 0.5, cursor: 'not-allowed' }}>Locked</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <h3 style={{ borderBottom: '1px solid var(--clr-border)', paddingBottom: '8px', marginBottom: '12px', fontSize: '1.1rem', color: 'var(--clr-text)' }}>Titles</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {titlesList.map((titleItem) => {
                  const isUnlocked = mrr >= titleItem.minMrr;
                  const isEquipped = equippedTitle === titleItem.name;
                  return (
                    <div 
                      key={titleItem.name} 
                      style={{ 
                        border: isEquipped ? '2px solid var(--clr-accent)' : '1px solid var(--clr-border)', 
                        borderRadius: '12px', padding: '14px', background: isEquipped ? 'rgba(74, 144, 226, 0.05)' : 'none', 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                      }}
                    >
                      <div style={{ flex: 1, paddingRight: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <strong style={{ color: 'var(--clr-text)', fontSize: '0.98rem' }}>{titleItem.name}</strong>
                          <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: isUnlocked ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.1)', color: isUnlocked ? '#2ecc71' : 'var(--clr-wrong)', fontWeight: '600' }}>
                            {isUnlocked ? '✓ Unlocked' : `🔒 ${titleItem.minMrr} MRR`}
                          </span>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--clr-text-soft)' }}>Required Rating: {titleItem.minMrr} MRR</p>
                      </div>
                      <div>
                        {isEquipped ? (
                          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--clr-accent)' }}>Equipped</span>
                        ) : isUnlocked ? (
                          <button onClick={() => handleEquipItem('title', titleItem.name)} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--clr-accent)', background: 'none', color: 'var(--clr-accent)', cursor: 'pointer', fontWeight: '600' }}>Equip</button>
                        ) : (
                          <button disabled style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--clr-border)', background: 'none', color: 'var(--clr-text-soft)', opacity: 0.5, cursor: 'not-allowed' }}>Locked</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
