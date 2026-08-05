import React from 'react';

/**
 * CandidateCard Component
 * Displays candidate concept cards in Student's Mind Cloud or Final Choice screen
 * State: 'selected' | 'possible' | 'rejected'
 */
export default function CandidateCard({
  conceptName,
  state = 'possible',
  selectionCount = 0,
  isSingleChoice = false,
  onClick
}) {
  const isSelected = state === 'selected';
  const isRejected = state === 'rejected';

  return (
    <button
      type="button"
      className={`candidate-card card-state-${state} ${isSingleChoice ? 'single-choice-mode' : ''}`}
      onClick={onClick}
      style={{
        background: isSelected ? '#34251b' : isRejected ? '#19120d' : '#241a13',
        border: `2px solid ${isSelected ? '#f97316' : isRejected ? '#7f1d1d' : '#3d281a'}`,
        color: '#ffffff',
        borderRadius: '12px',
        padding: isSingleChoice ? '14px 18px' : '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'all 0.2s ease',
        boxShadow: isSelected ? '0 4px 14px rgba(249, 115, 22, 0.4)' : 'none'
      }}
    >
      <div
        className="candidate-card-badge"
        style={{
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          background: isSelected ? '#f97316' : '#34251b',
          color: isSelected ? '#ffffff' : '#f97316',
          border: `1.5px solid ${isSelected ? '#ea580c' : '#3d281a'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '800',
          fontSize: '0.85rem',
          flexShrink: 0
        }}
      >
        {isSelected ? '✓' : isRejected ? '✕' : '?'}
      </div>
      <div
        className="candidate-card-title"
        style={{
          fontSize: isSingleChoice ? '1rem' : '0.88rem',
          fontWeight: '700',
          textAlign: 'left',
          flexGrow: 1,
          color: isSelected ? '#f97316' : isRejected ? '#9ca3af' : '#ffffff'
        }}
      >
        {conceptName}
      </div>
      {selectionCount > 0 && !isSingleChoice && (
        <span style={{ fontSize: '0.72rem', color: '#f97316', fontWeight: '800' }}>
          ({selectionCount})
        </span>
      )}
    </button>
  );
}
