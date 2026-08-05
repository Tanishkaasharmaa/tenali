import React from 'react';

/**
 * TenaliAvatar SVG Component
 * Renders dynamically based on expression and equipped skin
 */
export function TenaliAvatar({ expression, skin, size }) {
  let turbanColor = '#e67e22'; // Orange default
  let turbanAccent = '#d35400';
  let robeColor = '#c0392b';
  let jewelColor = null;

  if (skin === 'royal') {
    turbanColor = '#f1c40f'; // Golden
    turbanAccent = '#f39c12';
    robeColor = '#2980b9'; // Royal Blue
    jewelColor = '#e74c3c'; // Ruby
  } else if (skin === 'scholar') {
    turbanColor = '#ecf0f1'; // Silver/White
    turbanAccent = '#bdc3c7';
    robeColor = '#7f8c8d'; // Slate grey robe
    jewelColor = '#2ecc71'; // Emerald
  }

  let eyeLeft = <circle cx="40" cy="50" r="5" fill="#2c3e50" />;
  let eyeRight = <circle cx="60" cy="50" r="5" fill="#2c3e50" />;
  let eyebrows = (
    <g stroke="#2c3e50" strokeWidth="2.5" strokeLinecap="round" fill="none">
      <path d="M 33 42 Q 40 40 47 43" />
      <path d="M 53 43 Q 60 40 67 42" />
    </g>
  );
  let mouth = <path d="M 42 68 Q 50 72 58 68" stroke="#2c3e50" strokeWidth="3" fill="none" strokeLinecap="round" />;
  let sweatDrop = null;
  let accessory = null;

  if (expression === 'thinking') {
    eyeLeft = <ellipse cx="40" cy="50" rx="6" ry="3.5" fill="#2c3e50" />;
    eyeRight = <ellipse cx="60" cy="50" rx="6" ry="3.5" fill="#2c3e50" />;
    eyebrows = (
      <g stroke="#2c3e50" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d="M 33 43 Q 40 37 47 43" />
        <path d="M 53 43 Q 60 43 67 43" />
      </g>
    );
    mouth = <line x1="45" y1="67" x2="55" y2="67" stroke="#2c3e50" strokeWidth="3" strokeLinecap="round" />;
  } else if (expression === 'confident') {
    eyeLeft = <circle cx="40" cy="50" r="5.5" fill="#2c3e50" />;
    eyeRight = <path d="M 55 50 Q 60 46 65 50" stroke="#2c3e50" strokeWidth="3" fill="none" strokeLinecap="round" />;
    eyebrows = (
      <g stroke="#2c3e50" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d="M 33 41 Q 40 38 47 42" />
        <path d="M 53 38 Q 60 35 67 40" />
      </g>
    );
    mouth = <path d="M 44 65 Q 52 70 59 62" stroke="#2c3e50" strokeWidth="3.5" fill="none" strokeLinecap="round" />;
  } else if (expression === 'gamble') {
    eyeLeft = (
      <g>
        <circle cx="40" cy="50" r="6" fill="#2c3e50" />
        <circle cx="38" cy="48" r="2" fill="#ffffff" />
      </g>
    );
    eyeRight = (
      <g>
        <circle cx="60" cy="50" r="6" fill="#2c3e50" />
        <circle cx="58" cy="48" r="2" fill="#ffffff" />
      </g>
    );
    mouth = <path d="M 40 64 Q 50 78 60 64" fill="#c0392b" stroke="#2c3e50" strokeWidth="3" strokeLinecap="round" />;
  } else if (expression === 'victory' || expression === 'celebrating') {
    eyeLeft = <circle cx="40" cy="50" r="7" fill="#2c3e50" />;
    eyeRight = <circle cx="60" cy="50" r="7" fill="#2c3e50" />;
    eyebrows = (
      <g stroke="#2c3e50" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d="M 32 38 Q 40 34 48 38" />
        <path d="M 52 38 Q 60 34 68 38" />
      </g>
    );
    mouth = <ellipse cx="50" cy="69" rx="5" ry="7" fill="#2c3e50" />;
    sweatDrop = <path d="M 72 45 C 72 45 76 52 72 55 C 69 57 67 53 72 45" fill="#3498db" className="sweat-drip-anim" />;
  } else if (expression === 'loss') {
    eyeLeft = <path d="M 34 52 Q 40 45 46 52" stroke="#2c3e50" strokeWidth="3.5" fill="none" strokeLinecap="round" />;
    eyeRight = <path d="M 54 52 Q 60 45 66 52" stroke="#2c3e50" strokeWidth="3.5" fill="none" strokeLinecap="round" />;
    mouth = <path d="M 38 62 Q 50 82 62 62 Z" fill="#2c3e50" />;
  } else if (expression === 'cheated') {
    eyeLeft = <ellipse cx="38" cy="50" rx="4" ry="5" fill="#2c3e50" />;
    eyeRight = <ellipse cx="58" cy="50" rx="4" ry="5" fill="#2c3e50" />;
    eyebrows = (
      <g stroke="#2c3e50" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d="M 33 45 Q 40 47 47 49" />
        <path d="M 53 45 Q 60 43 67 41" />
      </g>
    );
    mouth = <path d="M 42 66 Q 50 62 58 66" stroke="#2c3e50" strokeWidth="3" fill="none" strokeLinecap="round" />;
  } else if (expression === 'closed-eyes') {
    eyeLeft = <path d="M 34 50 Q 40 54 46 50" stroke="#2c3e50" strokeWidth="3.5" fill="none" strokeLinecap="round" />;
    eyeRight = <path d="M 54 50 Q 60 54 66 50" stroke="#2c3e50" strokeWidth="3.5" fill="none" strokeLinecap="round" />;
    eyebrows = (
      <g stroke="#2c3e50" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d="M 33 43 Q 40 41 47 43" />
        <path d="M 53 43 Q 60 41 67 43" />
      </g>
    );
    mouth = <path d="M 43 68 Q 50 71 57 68" stroke="#2c3e50" strokeWidth="3" fill="none" strokeLinecap="round" />;
  } else if (expression === 'writing') {
    eyeLeft = <path d="M 35 52 L 45 52" stroke="#2c3e50" strokeWidth="3.5" strokeLinecap="round" />;
    eyeRight = <path d="M 55 52 L 65 52" stroke="#2c3e50" strokeWidth="3.5" strokeLinecap="round" />;
    eyebrows = (
      <g stroke="#2c3e50" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d="M 33 44 L 47 44" strokeLinecap="round" />
        <path d="M 53 44 L 67 44" strokeLinecap="round" />
      </g>
    );
    mouth = <path d="M 43 67 Q 50 69 57 67" stroke="#2c3e50" strokeWidth="2" fill="none" strokeLinecap="round" />;
    accessory = (
      <g>
        <rect x="62" y="75" width="22" height="28" fill="#fcf8e3" rx="2" stroke="#2c3e50" strokeWidth="1.5" />
        <line x1="66" y1="81" x2="80" y2="81" stroke="#2c3e50" strokeWidth="1" opacity="0.4" />
        <line x1="66" y1="86" x2="80" y2="86" stroke="#2c3e50" strokeWidth="1" opacity="0.4" />
        <line x1="66" y1="91" x2="80" y2="91" stroke="#2c3e50" strokeWidth="1" opacity="0.4" />
        <line x1="66" y1="96" x2="80" y2="96" stroke="#2c3e50" strokeWidth="1" opacity="0.4" />
        <path d="M 78 72 L 72 84 L 70 86 L 73 84 Z" fill="#d35400" stroke="#2c3e50" strokeWidth="1" />
      </g>
    );
  } else if (expression === 'smirk' || expression === 'recalculating' || expression === 'talking') {
    eyeLeft = <circle cx="40" cy="50" r="5" fill="#2c3e50" />;
    eyeRight = <path d="M 54 52 Q 60 46 66 52" stroke="#2c3e50" strokeWidth="3.5" fill="none" strokeLinecap="round" />;
    eyebrows = (
      <g stroke="#2c3e50" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d="M 33 42 Q 40 40 47 43" />
        <path d="M 53 37 Q 60 33 67 39" />
      </g>
    );
    mouth = <path d="M 43 68 Q 52 72 61 60" stroke="#2c3e50" strokeWidth="3" fill="none" strokeLinecap="round" />;
  } else if (expression === 'confused' || expression === 'encouraging') {
    eyeLeft = <circle cx="40" cy="48" r="4.5" fill="#2c3e50" />;
    eyeRight = <circle cx="60" cy="52" r="4.5" fill="#2c3e50" />;
    eyebrows = (
      <g stroke="#2c3e50" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d="M 33 45 Q 40 40 47 46" strokeLinecap="round" />
        <path d="M 53 42 Q 60 48 67 44" strokeLinecap="round" />
      </g>
    );
    mouth = <path d="M 42 70 Q 50 64 58 70" stroke="#2c3e50" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
  } else if (expression === 'shocked') {
    eyeLeft = <circle cx="40" cy="50" r="7.5" fill="#2c3e50" />;
    eyeRight = <circle cx="60" cy="50" r="7.5" fill="#2c3e50" />;
    eyebrows = (
      <g stroke="#2c3e50" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d="M 32 36 Q 40 30 48 36" strokeLinecap="round" />
        <path d="M 52 36 Q 60 30 68 36" strokeLinecap="round" />
      </g>
    );
    mouth = <circle cx="50" cy="70" r="8" fill="none" stroke="#2c3e50" strokeWidth="3" />;
    sweatDrop = <path d="M 72 45 C 72 45 76 52 72 55 C 69 57 67 53 72 45" fill="#3498db" className="sweat-drip-anim" />;
  } else if (expression === 'proud' || expression === 'impressed') {
    eyeLeft = <path d="M 34 52 Q 40 44 46 52" stroke="#2c3e50" strokeWidth="3.5" fill="none" strokeLinecap="round" />;
    eyeRight = <path d="M 54 52 Q 60 44 66 52" stroke="#2c3e50" strokeWidth="3.5" fill="none" strokeLinecap="round" />;
    eyebrows = (
      <g stroke="#2c3e50" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d="M 33 41 Q 40 37 47 41" strokeLinecap="round" />
        <path d="M 53 41 Q 60 37 67 41" strokeLinecap="round" />
      </g>
    );
    mouth = <path d="M 40 64 Q 50 78 60 64 Z" fill="#2c3e50" />;
  }

  const widthStyle = size ? `${size}px` : '120px';
  const heightStyle = size ? `${Math.round(size * 1.2)}px` : '144px';

  return (
    <div className={`tenali-avatar-wrapper ${expression}-state`} style={{ width: widthStyle, height: heightStyle, transition: 'transform 0.3s ease' }}>
      <svg
        viewBox="0 0 100 120"
        className="tenali-avatar-svg"
        style={{ width: '100%', height: '100%' }}
      >
        <ellipse cx="50" cy="112" rx="35" ry="6" fill="rgba(0,0,0,0.15)" />
        <rect x="44" y="85" width="12" height="15" fill="#f5cd79" rx="4" />
        <path d="M 20 110 Q 50 95 80 110 L 80 120 L 20 120 Z" fill={robeColor} />
        <path d="M 40 96 Q 50 106 60 96" stroke="#f5cd79" strokeWidth="3.5" fill="none" />
        <rect x="28" y="38" width="44" height="52" rx="20" fill="#f5cd79" />
        <path d="M 48 40 Q 50 48 50 48 Q 50 48 52 40 Z" fill="#e74c3c" />
        <circle cx="50" cy="46" r="2" fill="#f1c40f" />
        {eyebrows}
        {eyeLeft}
        {eyeRight}
        <path d="M 48 56 Q 50 62 52 56" stroke="#2c3e50" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <g fill="#2c3e50">
          <path d="M 49 63 C 44 63 36 60 30 65 C 33 66 38 67 43 65 C 47 64 49 63 49 63 Z" />
          <path d="M 51 63 C 56 63 64 60 70 65 C 67 66 62 67 57 65 C 53 64 51 63 51 63 Z" />
        </g>
        {mouth}
        <circle cx="26" cy="62" r="5" fill="#f5cd79" />
        <circle cx="74" cy="62" r="5" fill="#f5cd79" />
        <path d="M 23 42 C 23 20 77 20 77 42 C 77 42 70 32 50 32 C 30 32 23 42 23 42 Z" fill={turbanColor} />
        <path d="M 22 42 Q 50 35 78 42 Q 50 50 22 42 Z" fill={turbanAccent} />
        <path d="M 26 36 Q 50 28 74 36" stroke={turbanColor} strokeWidth="3" fill="none" />
        <path d="M 32 30 Q 50 22 68 30" stroke={turbanAccent} strokeWidth="3" fill="none" />
        {jewelColor && (
          <g>
            <rect x="47" y="26" width="6" height="8" rx="2" fill={jewelColor} transform="rotate(45 50 30)" />
            <circle cx="50" cy="30" r="1.5" fill="#ffffff" />
          </g>
        )}
        {sweatDrop}
        {accessory}
      </svg>
    </div>
  );
}

export default TenaliAvatar;
