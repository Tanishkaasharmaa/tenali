import React, { useState } from 'react';
import { useAdventure } from '../context/AdventureContext';

export default function GuessModal() {
  const { state, submitGuess, dispatch } = useAdventure();
  const { concepts, guessModalOpen, loading } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConceptId, setSelectedConceptId] = useState('');

  if (!guessModalOpen) return null;

  const filteredConcepts = concepts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedConceptId) {
      submitGuess(selectedConceptId);
    }
  };

  return (
    <div 
      className="adv-modal-overlay"
      onClick={() => dispatch({ type: 'SET_GUESS_MODAL', payload: false })}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guess-modal-title"
    >
      <div 
        className="adv-card adv-guess-modal-card" 
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="guess-modal-title" className="adv-modal-title">What is on Tenali's Mind?</h3>
        
        <form onSubmit={handleSubmit} className="adv-guess-form">
          <div className="adv-search-box-wrapper">
            <input 
              type="text"
              className="adv-input adv-search-input"
              placeholder="Search or type concept name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedConceptId('');
              }}
              autoFocus
              aria-label="Search concept name"
            />
          </div>

          <div className="adv-concept-results-list" role="listbox">
            {filteredConcepts.map((concept) => (
              <div 
                key={concept.id}
                className={`adv-concept-option ${selectedConceptId === concept.id ? 'selected' : ''}`}
                onClick={() => setSelectedConceptId(concept.id)}
                role="option"
                aria-selected={selectedConceptId === concept.id}
              >
                <span className="adv-concept-option-name">{concept.name}</span>
                <span className="adv-concept-option-sub">{concept.subject}</span>
              </div>
            ))}
            {filteredConcepts.length === 0 && (
              <div className="adv-no-results">No matching concepts found.</div>
            )}
          </div>

          <div className="adv-modal-actions">
            <button 
              type="button" 
              className="adv-btn adv-btn-ghost"
              onClick={() => dispatch({ type: 'SET_GUESS_MODAL', payload: false })}
            >
              Cancel
            </button>
            
            <button 
              type="submit" 
              className="adv-btn adv-btn-primary"
              disabled={!selectedConceptId || loading}
            >
              {loading ? 'Submitting...' : 'Submit Guess →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
