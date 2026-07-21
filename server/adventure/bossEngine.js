/**
 * TENALI ADVENTURE GAME - BOSS ENGINE
 * ══════════════════════════════════════════════════════════════════════
 * Independent module handling Boss Level mechanics: composite clues,
 * restricted hint rules, bonus XP multipliers, and custom reward calculations.
 */

'use strict';

const config = require('./adventureConfig');
const kb = require('./adventureKB');

module.exports = {
  /**
   * Generates synthesis clues for a Boss Level using its related bossConcepts.
   */
  generateBossClues: (level) => {
    const mainConcept = kb.getConceptById(level.conceptId);
    if (!mainConcept) return [];

    const baseClues = [...(mainConcept.clues || [])];
    
    // Enrich with composite clues from sibling concepts in bossConcepts list
    const siblingClues = [];
    if (Array.isArray(level.bossConcepts)) {
      for (const cId of level.bossConcepts) {
        if (cId === level.conceptId) continue;
        const sibling = kb.getConceptById(cId);
        if (sibling && sibling.clues && sibling.clues[0]) {
          siblingClues.push(`[Realm Echo] A related concept in this kingdom notes: "${sibling.clues[0]}"`);
        }
      }
    }

    // Merge main clues with sibling hints for a challenging synthesis
    const finalClues = [
      `⚔️ BOSS CHALLENGE: ${baseClues[0] || 'I am the ultimate Knowledge Crystal of this realm.'}`,
      baseClues[1] || 'Analyze my mathematical properties carefully.',
      siblingClues[0] || baseClues[2] || 'I share structural bonds with earlier crystals.',
      baseClues[3] || 'Look deep into the definition.',
      baseClues[4] || 'Recall all your learnings from this kingdom.'
    ];

    return finalClues.slice(0, level.maxClues || config.MAX_CLUES);
  },

  /**
   * Validates a Boss guess.
   */
  validateBossGuess: (targetConceptId, guessConceptId) => {
    const target = kb.getConceptById(targetConceptId);
    const guess = kb.getConceptById(guessConceptId);
    if (!target || !guess) return false;
    
    // Direct match or exact name match
    return target.id === guess.id || target.name.toLowerCase() === guess.name.toLowerCase();
  },

  /**
   * Computes bonus XP and stars for a Boss level victory.
   */
  calculateBossRewards: (cluesRevealed, hintsUsedCount) => {
    const baseXP = config.BASE_LEVEL_XP * config.BOSS_XP_MULTIPLIER;
    let stars = 1;

    if (cluesRevealed <= 2 && hintsUsedCount === 0) {
      stars = 3;
    } else if (cluesRevealed <= 4) {
      stars = 2;
    }

    return {
      xpGained: baseXP,
      stars,
      bossBadgeAwarded: "Royal Scholar Crystal"
    };
  }
};
