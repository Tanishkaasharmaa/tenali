import React, { useState } from 'react';
import CandidateCard from './CandidateCard';

/**
 * SpeechBubble Component
 * Renders Tenali's Mind Cloud (clues) or Student's Interactive Mind Cloud (candidate thought cards)
 */
export default function SpeechBubble({
  text,
  isDetective = false,
  roundIndex = 0,
  options = [],
  getCardState,
  onCardClick
}) {
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = () => {
    if (!text || !window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (isDetective) {
    // Student's Interactive Mind Cloud (Right Container)
    return (
      <div className="tenali-mind-cloud detective-mind-cloud">
        <div className="mind-cloud-header">
          <div className="mind-cloud-title">
            <span className="mind-cloud-emoji">✍️</span>
            <span className="mind-cloud-speaker">Your Thoughts</span>
          </div>
        </div>

        <div className="detective-cloud-options">
          <div className="detective-card-grid">
            {options.slice(0, 4).map((optName, idx) => (
              <CandidateCard
                key={optName || idx}
                conceptName={optName}
                state={getCardState ? getCardState(optName) : 'possible'}
                onClick={() => onCardClick && onCardClick(optName)}
              />
            ))}
          </div>
        </div>

        {/* Double Circular Bubble Tail Pointing Down to Student's Head */}
        <div className="mind-cloud-tail-large" />
        <div className="mind-cloud-tail-small" />
      </div>
    );
  }

  // Tenali's Mind Cloud (Left Container)
  return (
    <div className="tenali-mind-cloud">
      <div className="mind-cloud-header">
        <div className="mind-cloud-title">
          <span className="mind-cloud-emoji">🧠</span>
          <span className="mind-cloud-speaker">Tenali's Mind</span>
        </div>
        <span className="mind-cloud-round-badge">
          Round {roundIndex + 1} / 5
        </span>
      </div>

      <div className="mind-cloud-content">
        <p className="mind-cloud-text">{text || "I am thinking of a secret concept..."}</p>
        <button
          type="button"
          className={`mind-cloud-voice-btn ${speaking ? 'speaking' : ''}`}
          onClick={handleSpeak}
          title="Read Clue Aloud"
        >
          {speaking ? '🔊 Speaking...' : '🔊 Listen'}
        </button>
      </div>

      {/* Double Circular Bubble Tail Pointing Down to Tenali's Head */}
      <div className="mind-cloud-tail-large" />
      <div className="mind-cloud-tail-small" />
    </div>
  );
}
