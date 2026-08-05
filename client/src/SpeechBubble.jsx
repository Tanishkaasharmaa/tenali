import React from 'react';
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

  if (isDetective) {
    // Student's Interactive Mind Cloud (Right Container)
    return (
      <div className="tenali-mind-cloud detective-mind-cloud">

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
      <div className="mind-cloud-content">
        <p className="mind-cloud-text">{text || "I am thinking of a secret concept..."}</p>
      </div>

      {/* Double Circular Bubble Tail Pointing Down to Tenali's Head */}
      <div className="mind-cloud-tail-large" />
      <div className="mind-cloud-tail-small" />
    </div>
  );
}
