import React from 'react';
import { useAdventure } from '../context/AdventureContext';

export default function HomeView() {
  const { state, continueAdventure, setView } = useAdventure();
  const { progress, loading } = state;

  return (
    <div className="adv-home-container">
      <header className="adv-home-header">
        <h1 className="adv-title">Crown of Knowledge</h1>
        <p className="adv-subtitle">Knowledge Crystals Adventure</p>
      </header>

      <main className="adv-card adv-story-card">
        <div className="adv-story-badge">📜 Royal Quest</div>
        <p className="adv-story-text">
          The magical Crown of Knowledge has shattered into Knowledge Crystals. 
          Each crystal holds a mathematical concept known only to Tenali Raman. 
          Uncover the clues, recover the crystals, and restore the Crown!
        </p>

        <div className="adv-stats-strip">
          <div className="adv-stat-item">
            <span className="adv-stat-icon">⭐</span>
            <span className="adv-stat-val">{progress.totalStars} Stars</span>
          </div>
          <div className="adv-stat-item">
            <span className="adv-stat-icon">⚡</span>
            <span className="adv-stat-val">{progress.xp} XP</span>
          </div>
        </div>

        <div className="adv-home-actions">
          <button 
            className="adv-btn adv-btn-primary" 
            onClick={continueAdventure}
            disabled={loading}
            aria-label="Continue Adventure"
          >
            {loading ? 'Entering...' : 'Continue Adventure →'}
          </button>
          
          <button 
            className="adv-btn adv-btn-secondary" 
            onClick={() => setView('KINGDOM_SELECT')}
            aria-label="Choose Kingdom"
          >
            Choose Kingdom
          </button>
        </div>
      </main>
    </div>
  );
}
