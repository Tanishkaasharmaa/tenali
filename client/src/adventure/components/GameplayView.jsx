import React from 'react';
import { useAdventure } from '../context/AdventureContext';

export default function GameplayView() {
  const { state, nextClue, getHint, dispatch } = useAdventure();
  const { session, hintText, loading } = state;

  if (!session) return null;

  return (
    <div className="adv-gameplay-container">
      {/* Tenali Avatar */}
      <div className="adv-avatar-wrapper">
        <div className="adv-avatar-graphic">🧙‍♂️</div>
        <div className="adv-avatar-name">Tenali Raman</div>
      </div>

      {/* Single Speech Bubble / Clue Card */}
      <div className="adv-card adv-clue-card" aria-live="polite">
        <div className="adv-clue-header">
          <span className="adv-clue-badge">
            {session.isBoss ? '⚔️ Boss Clue' : 'Knowledge Clue'}
          </span>
          <span className="adv-clue-counter">
            Clue {session.clueNumber} of {session.totalClues}
          </span>
        </div>

        <p className="adv-clue-text">"{session.currentClue}"</p>

        {hintText && (
          <div className="adv-hint-box">
            💡 <strong>Hint:</strong> {hintText}
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="adv-gameplay-actions">
        <button 
          className="adv-btn adv-btn-accent"
          onClick={() => dispatch({ type: 'SET_GUESS_MODAL', payload: true })}
          disabled={loading}
          aria-label="Guess concept"
        >
          🔮 Guess
        </button>

        <button 
          className="adv-btn adv-btn-secondary"
          onClick={nextClue}
          disabled={loading || session.clueNumber >= session.totalClues}
          aria-label="Next clue"
        >
          Next Clue →
        </button>

        <button 
          className="adv-btn adv-btn-ghost"
          onClick={getHint}
          disabled={loading || !!hintText}
          aria-label="Use hint"
        >
          💡 Hint
        </button>
      </div>
    </div>
  );
}
