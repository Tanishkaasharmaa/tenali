import React from 'react';
import { useAdventure } from '../context/AdventureContext';

export default function ReviewView() {
  const { state, startLevel, setView } = useAdventure();
  const { reviewData, resultData } = state;

  if (!reviewData) return null;

  const handleNext = () => {
    if (resultData && resultData.nextLevelId) {
      startLevel(resultData.nextLevelId);
    } else {
      setView('LEVEL_SELECT');
    }
  };

  return (
    <div className="adv-review-container">
      <div className="adv-card adv-review-card">
        <header className="adv-review-header">
          <span className="adv-review-badge">📖 Educational Review</span>
          <h2 className="adv-review-concept">{reviewData.conceptName}</h2>
        </header>

        {/* Section 1: Definition */}
        <section className="adv-review-section">
          <h4 className="adv-review-section-title">📘 Definition</h4>
          <p className="adv-review-text">{reviewData.definition}</p>
        </section>

        {/* Section 2: Why Clues Pointed Here */}
        {reviewData.whyCluesPointedHere && (
          <section className="adv-review-section">
            <h4 className="adv-review-section-title">🔍 Clue Deduction Rationale</h4>
            <p className="adv-review-text">{reviewData.whyCluesPointedHere}</p>
          </section>
        )}

        {/* Section 3: Worked Example */}
        {reviewData.workedExample && (
          <section className="adv-review-section">
            <h4 className="adv-review-section-title">✍️ Worked Example</h4>
            <div className="adv-review-example-box">
              {reviewData.workedExample}
            </div>
          </section>
        )}

        {/* Section 4: Common Mistakes */}
        {reviewData.commonMistakes && (
          <section className="adv-review-section">
            <h4 className="adv-review-section-title">⚠️ Common Pitfalls & Mistakes</h4>
            <p className="adv-review-text">{reviewData.commonMistakes}</p>
          </section>
        )}

        {/* Section 5: Fun Fact */}
        {reviewData.funFact && (
          <section className="adv-review-section">
            <h4 className="adv-review-section-title">💡 Fun Fact</h4>
            <p className="adv-review-text italic">{reviewData.funFact}</p>
          </section>
        )}

        {/* Section 6: Practice Question */}
        {reviewData.practiceQuestion && (
          <section className="adv-review-section">
            <h4 className="adv-review-section-title">❓ Quick Practice Challenge</h4>
            <div className="adv-review-practice-box">
              <p className="adv-practice-q"><strong>Q:</strong> {reviewData.practiceQuestion}</p>
              <p className="adv-practice-a"><strong>A:</strong> {reviewData.practiceAnswer}</p>
            </div>
          </section>
        )}

        {/* Section 7: Related Concepts */}
        {reviewData.relatedConcepts && reviewData.relatedConcepts.length > 0 && (
          <section className="adv-review-section">
            <h4 className="adv-review-section-title">🔗 Related Concepts</h4>
            <div className="adv-review-chips">
              {reviewData.relatedConcepts.map((item, idx) => (
                <span key={idx} className="adv-chip">{item}</span>
              ))}
            </div>
          </section>
        )}

        <div className="adv-review-actions">
          <button 
            className="adv-btn adv-btn-primary adv-full-width"
            onClick={handleNext}
            aria-label="Proceed to Next Level"
          >
            {resultData && resultData.nextLevelId ? 'Next Level →' : 'Return to Journey Path →'}
          </button>
        </div>
      </div>
    </div>
  );
}
