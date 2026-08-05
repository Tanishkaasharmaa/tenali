import React from 'react';

/**
 * SpeechBubble Component
 * Renders Speech / Mind Cloud bubble for Tenali and Student avatars
 */
export default function SpeechBubble({
  text,
  isDetective = false,
  roundIndex = 0
}) {
  return (
    <div className={`tenali-mind-cloud ${isDetective ? 'detective-mind-cloud' : ''}`}>
      <div className="mind-cloud-content">
        <p className="mind-cloud-text">{text || "I am thinking of a secret concept..."}</p>
      </div>

      {/* Double Circular Bubble Tail Pointing Down to Avatar Head */}
      <div className="mind-cloud-tail-large" />
      <div className="mind-cloud-tail-small" />
    </div>
  );
}
