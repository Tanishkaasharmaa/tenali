import React from 'react';
import { useNarration } from './NarrationContext';

export const NarrationButton = ({ text, contentId = '', style = {} }) => {
  const { playNarration, stopNarration, isPlaying, currentlyPlayingText, currentlyPlayingId } = useNarration();

  // Determine if this specific button's content is playing
  const isThisPlaying = isPlaying && (
    (contentId && currentlyPlayingId === contentId) ||
    (!contentId && currentlyPlayingText === text)
  );

  const handleClick = (e) => {
    e.stopPropagation(); // Avoid triggering any card click events
    if (isThisPlaying) {
      stopNarration();
    } else {
      playNarration(text, contentId);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`narration-btn ${isThisPlaying ? 'playing' : ''}`}
      title={isThisPlaying ? 'Stop narration' : 'Play narration'}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        margin: '0 6px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        color: isThisPlaying ? 'var(--clr-correct, #26de81)' : 'var(--clr-text-soft, #a5b1c2)',
        transition: 'color 0.2s, background-color 0.2s, transform 0.2s',
        verticalAlign: 'middle',
        outline: 'none',
        ...style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.transform = 'scale(1.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'none';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {/* Premium Speaker SVG */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: 'transform 0.2s' }}
      >
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill={isThisPlaying ? 'currentColor' : 'none'} />
        {isThisPlaying ? (
          <>
            {/* Play waves animation */}
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" className="soundwave-1" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" className="soundwave-2" />
          </>
        ) : (
          <>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" opacity="0.4" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" opacity="0.2" />
          </>
        )}
      </svg>
    </button>
  );
};
export default NarrationButton;
