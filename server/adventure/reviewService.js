/**
 * TENALI ADVENTURE GAME - REVIEW SERVICE
 * ══════════════════════════════════════════════════════════════════════
 * Constructs educational review objects to reinforce learning after level completion.
 */

'use strict';

const kb = require('./adventureKB');

module.exports = {
  /**
   * Generates a comprehensive educational review card for a concept.
   */
  generateReview: (conceptId) => {
    const concept = kb.getConceptById(conceptId);
    if (!concept) {
      return {
        conceptName: 'Unknown Concept',
        definition: 'No detailed review available.',
        whyCluesPointedHere: '',
        workedExample: '',
        commonMistakes: '',
        funFact: '',
        practiceQuestion: '',
        practiceAnswer: '',
        relatedConcepts: []
      };
    }

    const review = concept.educationalReview || {};

    return {
      conceptId: concept.id,
      conceptName: concept.name,
      subject: concept.subject,
      definition: review.definition || concept.description || '',
      whyCluesPointedHere: review.whyCluesPointedHere || 'The clues narrowed down the mathematical properties unique to this concept.',
      workedExample: review.workedExample || 'Review the core definition and apply it to basic practice problems.',
      commonMistakes: review.commonMistakes || 'Be careful not to confuse this concept with related topics in the same realm.',
      funFact: review.funFact || 'Mathematical concepts like this form the foundation of science, technology, and nature!',
      practiceQuestion: review.practiceQuestion || `What is the primary characteristic of ${concept.name}?`,
      practiceAnswer: review.practiceAnswer || review.definition || '',
      relatedConcepts: review.relatedConcepts || []
    };
  }
};
