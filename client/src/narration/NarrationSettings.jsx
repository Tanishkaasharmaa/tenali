import React, { useState, useRef, useEffect } from 'react';
import { useNarration } from './NarrationContext';

export const NarrationSettings = () => {
  const { autoPlay, toggleAutoPlay, speed, setSpeed, voices, selectedVoiceName, setSelectedVoiceName } = useNarration();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Settings Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08) rotate(30deg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = isOpen ? 'scale(1)' : 'scale(1) rotate(0deg)';
        }}
        title="Narration Settings"
      >
        <img 
          src="/settings_icon.svg" 
          alt="Settings" 
          style={{ 
            width: '40px', 
            height: '40px',
            display: 'block',
            borderRadius: '9px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
          }} 
        />
      </button>

      {/* Glassmorphic Dropdown Card */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '48px',
            right: '0',
            width: '260px',
            background: 'rgba(30, 39, 46, 0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            fontSize: '0.85rem',
            color: 'var(--clr-text-soft, #a5b1c2)',
            animation: 'fadeInSlide 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px', color: 'var(--clr-accent, #3867d6)' }}>
              Narration Settings
            </span>
          </div>

          {/* Row 1: Auto-Play Narration */}
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontWeight: 500, color: '#fff' }}>
            <span>Auto-Play Narration</span>
            <input 
              type="checkbox" 
              checked={autoPlay} 
              onChange={toggleAutoPlay}
              style={{ 
                cursor: 'pointer', 
                accentColor: 'var(--clr-accent, #3867d6)',
                width: '15px',
                height: '15px'
              }}
            />
          </label>

          {/* Row 2: Voice Selection */}
          {voices.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontWeight: 600, color: '#fff' }}>Narration Voice</span>
              <select
                value={selectedVoiceName}
                onChange={(e) => setSelectedVoiceName(e.target.value)}
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '0.8rem',
                  outline: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  fontWeight: 500,
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--clr-accent, #3867d6)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
              >
                {voices.map(v => (
                  <option key={v.name} value={v.name} style={{ background: '#2c3e50', color: '#fff' }}>
                    {v.name
                      .replace(/Microsoft/g, 'MS')
                      .replace(/Google/g, 'Google')
                      .replace(/English/g, 'EN')
                      .replace(/United States/g, 'US')
                      .replace(/United Kingdom/g, 'UK')
                      .replace(/Natural/g, '✨')
                    }
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Row 3: Playback Speed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontWeight: 600, color: '#fff' }}>Playback Speed</span>
            <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '3px', borderRadius: '10px' }}>
              {[0.75, 1.0, 1.25].map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  style={{
                    flex: 1,
                    background: speed === s ? 'var(--clr-accent, #3867d6)' : 'transparent',
                    color: speed === s ? '#fff' : 'var(--clr-text-soft, #a5b1c2)',
                    border: 'none',
                    padding: '6px 0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Slide-down keyframes defined globally in style block */}
      <style>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default NarrationSettings;
