import React from 'react';

/**
 * SpeechBubble Component
 * Renders an exact scalloped cloud speech bubble with thought circles for Tenali and Student avatars
 */
export default function SpeechBubble({
  text,
  isDetective = false
}) {
  return (
    <div className={`scalloped-cloud-container ${isDetective ? 'detective-cloud' : ''}`}>
      {/* Scalloped Cloud SVG Background Box */}
      <div className="cloud-bubble-box">
        <svg
          className="cloud-svg-bg"
          viewBox="0 0 200 130"
          preserveAspectRatio="none"
        >
          <path
            d="M 35,45
               A 22,22 0 0,1 70,22
               A 28,28 0 0,1 130,22
               A 22,22 0 0,1 165,45
               A 22,22 0 0,1 178,78
               A 22,22 0 0,1 148,108
               A 28,28 0 0,1 62,108
               A 22,22 0 0,1 22,78
               A 22,22 0 0,1 35,45 Z"
            fill="#282018"
            stroke="#443527"
            strokeWidth="2.5"
          />
        </svg>

        <div className="cloud-text-overlay">
          <p className="cloud-text-p">
            {text || "I am thinking of a secret concept..."}
          </p>
        </div>
      </div>

      {/* 2 Thought Circles leading down to avatar head */}
      <div className="thought-circle-container">
        <div className="thought-circle-top" />
        <div className="thought-circle-bottom" />
      </div>
    </div>
  );
}
