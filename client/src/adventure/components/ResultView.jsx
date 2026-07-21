import React from 'react';
import { useAdventure } from '../context/AdventureContext';

export default function ResultView() {
  const { state, setView } = useAdventure();
  const { resultData } = state;

  if (!resultData) return null;

  const isWin = resultData.correct;

  return (
    <div className="adv-result-container">
      <div className="adv-card adv-result-card">
        {/* Large Avatar Illustration */}
        <div className="adv-result-illustration">
          {isWin ? '🏆' : '🦉'}
        </div>

        <h2 className="adv-result-title">
          {isWin ? 'Knowledge Crystal Recovered!' : 'Crystal Sharded...'}
        </h2>

        <p className="adv-result-desc">
          {isWin 
            ? 'Your deduction was sharp! The knowledge of this crystal has been restored to the Crown.'
            : 'Tenali’s secret concept remained hidden this time. Study the Educational Review to master this crystal!'}
        </p>

        {isWin && (
          <div className="adv-result-rewards">
            <div className="adv-result-stars">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className={`adv-result-star ${i < resultData.stars ? 'filled' : 'empty'}`}>
                  ★
                </span>
              ))}
            </div>

            <div className="adv-result-xp-badge">
              ⚡ +{resultData.xpGained} XP
            </div>
          </div>
        )}

        <button 
          className="adv-btn adv-btn-primary adv-result-continue-btn"
          onClick={() => setView('REVIEW')}
          aria-label="Continue to Educational Review"
        >
          Continue to Educational Review →
        </button>
      </div>
    </div>
  );
}
