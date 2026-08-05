import React from 'react';

/**
 * StudentAvatar Component
 * Expressions supported: 'attentive' | 'pondering' | 'confident' | 'curious' | 'triumphant' | 'puzzled'
 */
export default function StudentAvatar({ expression = 'attentive', styleVariant = 5, size = 110 }) {
  const expr = expression.toLowerCase();

  return (
    <div
      className="student-avatar-wrapper"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 6px 16px rgba(0, 0, 0, 0.4))' }}
      >
        {/* Outer Glow Halo */}
        <circle cx="60" cy="60" r="54" fill="#241a13" stroke="#ea580c" strokeWidth="3" />

        {/* Shoulders & Detective Coat */}
        <path d="M 28 102 C 28 85, 42 75, 60 75 C 78 75, 92 85, 92 102 Z" fill="#38271c" stroke="#ea580c" strokeWidth="2" />
        {/* Collar / Tie */}
        <path d="M 52 75 L 60 88 L 68 75 Z" fill="#f97316" />

        {/* Head */}
        <ellipse cx="60" cy="52" rx="26" ry="28" fill="#fbd5b5" />

        {/* Hair / Detective Cap */}
        <path d="M 32 46 C 32 30, 44 20, 60 20 C 76 20, 88 30, 88 46 C 82 40, 72 38, 60 38 C 48 38, 38 40, 32 46 Z" fill="#4a301e" />
        <path d="M 24 44 C 36 38, 84 38, 96 44 L 92 48 C 80 44, 40 44, 28 48 Z" fill="#ea580c" />

        {/* Expressions Logic */}
        {expr === 'attentive' && (
          <g>
            {/* Neutral Focused Eyes */}
            <circle cx="50" cy="50" r="3.5" fill="#261b14" />
            <circle cx="70" cy="50" r="3.5" fill="#261b14" />
            {/* Smile */}
            <path d="M 52 64 Q 60 70, 68 64" fill="none" stroke="#261b14" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {expr === 'pondering' && (
          <g>
            {/* Pondering Eyes looking up */}
            <circle cx="50" cy="48" r="3.5" fill="#261b14" />
            <circle cx="70" cy="48" r="3.5" fill="#261b14" />
            {/* Eyebrow tilted */}
            <path d="M 45 42 Q 50 40, 55 44" fill="none" stroke="#4a301e" strokeWidth="2" strokeLinecap="round" />
            <path d="M 65 44 Q 70 40, 75 42" fill="none" stroke="#4a301e" strokeWidth="2" strokeLinecap="round" />
            {/* Thoughtful Mouth */}
            <path d="M 54 65 L 66 63" fill="none" stroke="#261b14" strokeWidth="2.5" strokeLinecap="round" />
            {/* Hand on Chin Icon */}
            <circle cx="72" cy="72" r="7" fill="#fbd5b5" stroke="#ea580c" strokeWidth="1.5" />
          </g>
        )}

        {expr === 'confident' && (
          <g>
            {/* Confident Eyes */}
            <path d="M 45 48 Q 50 45, 55 48" fill="none" stroke="#261b14" strokeWidth="3" strokeLinecap="round" />
            <path d="M 65 48 Q 70 45, 75 48" fill="none" stroke="#261b14" strokeWidth="3" strokeLinecap="round" />
            {/* Smirk */}
            <path d="M 52 62 Q 62 68, 70 60" fill="none" stroke="#261b14" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {expr === 'curious' && (
          <g>
            {/* Wide Curious Eyes */}
            <circle cx="50" cy="50" r="5" fill="#ffffff" stroke="#261b14" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="2.5" fill="#261b14" />
            <circle cx="70" cy="50" r="5" fill="#ffffff" stroke="#261b14" strokeWidth="1.5" />
            <circle cx="70" cy="50" r="2.5" fill="#261b14" />
            {/* Raised Eyebrows */}
            <path d="M 44 42 Q 50 38, 56 42" fill="none" stroke="#4a301e" strokeWidth="2" strokeLinecap="round" />
            <path d="M 64 42 Q 70 38, 76 42" fill="none" stroke="#4a301e" strokeWidth="2" strokeLinecap="round" />
            {/* O-mouth */}
            <ellipse cx="60" cy="65" rx="4" ry="5" fill="#261b14" />
          </g>
        )}

        {expr === 'triumphant' && (
          <g>
            {/* Happy Closed Eyes ^ ^ */}
            <path d="M 45 52 L 50 46 L 55 52" fill="none" stroke="#261b14" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 65 52 L 70 46 L 75 52" fill="none" stroke="#261b14" strokeWidth="2.5" strokeLinecap="round" />
            {/* Cheerful Open Mouth */}
            <path d="M 50 62 Q 60 74, 70 62 Z" fill="#ea580c" />
            {/* Cheeks */}
            <circle cx="42" cy="56" r="4" fill="#f87171" opacity="0.6" />
            <circle cx="78" cy="56" r="4" fill="#f87171" opacity="0.6" />
          </g>
        )}

        {expr === 'puzzled' && (
          <g>
            {/* Puzzled Eyes (One big, one small) */}
            <circle cx="49" cy="50" r="4.5" fill="#261b14" />
            <circle cx="71" cy="50" r="2.5" fill="#261b14" />
            {/* Question mark eyebrow */}
            <path d="M 44 44 Q 50 40, 55 46" fill="none" stroke="#4a301e" strokeWidth="2" strokeLinecap="round" />
            <path d="M 66 42 Q 72 40, 76 44" fill="none" stroke="#4a301e" strokeWidth="2" strokeLinecap="round" />
            {/* Wavy Puzzled Mouth */}
            <path d="M 52 64 Q 56 67, 60 63 Q 64 59, 68 64" fill="none" stroke="#261b14" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
}
