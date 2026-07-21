import React from 'react';
import { useAdventure } from '../context/AdventureContext';

export default function LevelPathView() {
  const { state, startLevel, setView } = useAdventure();
  const { currentWorldId, worlds, levels, progress, loading } = state;

  const currentWorld = worlds.find(w => w.id === currentWorldId) || worlds[0];
  const worldLevels = levels.filter(l => l.worldId === currentWorldId);

  // Helper to determine if level is unlocked
  const isLevelUnlocked = (level) => {
    if (level.levelNumber === 1) return true;
    const prevLevelId = `lvl_${currentWorldId.split('_')[1]}_${level.levelNumber - 1}`;
    return progress.completedLevels.includes(prevLevelId);
  };

  return (
    <div className="adv-level-container">
      <div className="adv-top-nav">
        <button 
          className="adv-back-btn" 
          onClick={() => setView('KINGDOM_SELECT')}
          aria-label="Back to Kingdoms"
        >
          ← Kingdoms
        </button>
        <h2 className="adv-view-title">{currentWorld ? currentWorld.name : 'Level Journey'}</h2>
      </div>

      <div className="adv-level-path">
        {worldLevels.map((lvl, index) => {
          const unlocked = isLevelUnlocked(lvl);
          const completed = progress.completedLevels.includes(lvl.id);
          const stars = progress.levelStars[lvl.id] || 0;

          return (
            <div key={lvl.id} className="adv-level-node-wrapper">
              {index > 0 && <div className={`adv-path-line ${completed ? 'active' : ''}`} />}

              <div 
                className={`adv-level-node ${lvl.isBoss ? 'boss-node' : ''} ${completed ? 'completed' : unlocked ? 'unlocked' : 'locked'}`}
                onClick={() => unlocked && !loading && startLevel(lvl.id)}
                role="button"
                tabIndex={unlocked ? 0 : -1}
                onKeyDown={(e) => {
                  if (unlocked && !loading && (e.key === 'Enter' || e.key === ' ')) {
                    startLevel(lvl.id);
                  }
                }}
                aria-label={`Level ${lvl.levelNumber}: ${lvl.isBoss ? 'Boss Level' : 'Standard Level'}`}
              >
                <div className="adv-node-circle">
                  {lvl.isBoss ? (
                    <span className="adv-boss-icon">⚔️</span>
                  ) : completed ? (
                    <span className="adv-check-icon">✓</span>
                  ) : (
                    <span className="adv-node-num">{lvl.levelNumber}</span>
                  )}
                </div>

                <div className="adv-node-details">
                  <div className="adv-node-header">
                    <span className="adv-node-title">Level {lvl.levelNumber}</span>
                    {lvl.isBoss && <span className="adv-boss-tag">BOSS</span>}
                  </div>

                  {unlocked ? (
                    <div className="adv-node-stars">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={`adv-star ${i < stars ? 'filled' : 'empty'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="adv-node-locked-label">🔒 Locked</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
