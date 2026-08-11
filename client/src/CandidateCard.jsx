import React from 'react';

/**
 * CandidateCard Component
 * Candidate concept button card used inside the center quiz box
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
      className={`candidate-quiz-card card-state-${state}`}
      onClick={onClick}
      style={{
        background: isSelected ? '#36281e' : isRejected ? '#1d1712' : '#292018',
        border: `1.5px solid ${isSelected ? '#d97d38' : isRejected ? '#6b2121' : '#3d3024'}`,
        color: '#ffffff',
        borderRadius: '12px',
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'all 0.18s ease',
        boxShadow: isSelected ? '0 4px 14px rgba(217, 125, 56, 0.35)' : 'none',
        minWidth: 0
      }}
    >
      <div
        className="card-badge-circle"
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: isSelected ? '#d97d38' : isRejected ? '#2a1a1a' : '#35291f',
          color: isSelected ? '#ffffff' : isRejected ? '#f87171' : '#e5a93c',
          border: `1px solid ${isSelected ? '#e08a46' : isRejected ? '#4a2020' : '#4d3b2c'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '800',
          fontSize: '0.82rem',
          flexShrink: 0
        }}
      >
        {isSelected ? '✓' : isRejected ? '✕' : '?'}
      </div>
      <div
        style={{
          fontSize: '0.85rem',
          fontWeight: '700',
          textAlign: 'left',
          flexGrow: 1,
          lineHeight: '1.25',
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
          color: isSelected ? '#ffffff' : isRejected ? '#8c827a' : '#ffffff'
        }}
      >
        {conceptName}
      </div>
      {selectionCount > 0 && !isSingleChoice && (
        <span style={{ fontSize: '0.72rem', color: '#d97d38', fontWeight: '800', flexShrink: 0 }}>
          ({selectionCount})
        </span>
      )}
    </button>
  );
}
