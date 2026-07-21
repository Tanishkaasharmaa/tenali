/**
 * TENALI ADVENTURE GAME - SERVICE
 * ══════════════════════════════════════════════════════════════════════
 * Core service coordinator for level sessions, clues, hints, guesses,
 * progress updates, and kingdom unlocking.
 */

'use strict';

const config = require('./adventureConfig');
const kb = require('./adventureKB');
const sessionManager = require('./adventureSessionManager');
const progressService = require('./adventureProgressService');
const bossEngine = require('./bossEngine');
const reviewService = require('./reviewService');

class AdventureService {
  /**
   * Returns current game worlds, levels, and user progress summary.
   */
  async getGameData(userContext, guestProgressPayload) {
    const progress = await progressService.getProgress(userContext, guestProgressPayload);
    const worlds = kb.getWorlds();
    const levels = kb.getLevels();
    const concepts = kb.getConcepts();

    // Map worlds with lock status and progress percentage
    const enrichedWorlds = worlds.map(w => {
      const worldLevels = levels.filter(l => l.worldId === w.id);
      const completedCount = worldLevels.filter(l => progress.completedLevels.includes(l.id)).length;
      const isUnlocked = progress.unlockedWorlds.includes(w.id);

      return {
        ...w,
        isUnlocked,
        totalLevels: worldLevels.length,
        completedLevelsCount: completedCount,
        progressPercent: worldLevels.length > 0 ? Math.round((completedCount / worldLevels.length) * 100) : 0
      };
    });

    return {
      worlds: enrichedWorlds,
      levels,
      concepts: concepts.map(c => ({ id: c.id, name: c.name, subject: c.subject })),
      progress
    };
  }

  /**
   * Starts a level gameplay session.
   */
  async startLevel(userContext, levelId) {
    const level = kb.getLevelById(levelId);
    if (!level) {
      const error = new Error(`Level with ID '${levelId}' not found.`);
      error.statusCode = 404;
      throw error;
    }

    const concept = kb.getConceptById(level.conceptId);
    if (!concept) {
      const error = new Error(`Concept for level '${levelId}' not found.`);
      error.statusCode = 404;
      throw error;
    }

    const session = sessionManager.createSession({
      userId: userContext ? userContext._id : null,
      levelId: level.id,
      conceptId: concept.id,
      isBoss: level.isBoss
    });

    const clues = level.isBoss
      ? bossEngine.generateBossClues(level)
      : (concept.clues && concept.clues.length > 0 ? concept.clues : [`I am ${concept.name}.`]);

    // Store generated clues in session for audit
    sessionManager.updateSession(session.sessionId, {
      allClues: clues,
      revealedClues: [clues[0]],
      currentClueIndex: 0
    });

    return {
      sessionId: session.sessionId,
      levelId: level.id,
      worldId: level.worldId,
      levelNumber: level.levelNumber,
      isBoss: level.isBoss,
      firstClue: clues[0],
      clueNumber: 1,
      totalClues: clues.length
    };
  }

  /**
   * Advances to and returns the next clue for an active session.
   */
  async getNextClue(sessionId) {
    const session = sessionManager.getSession(sessionId);
    if (!session) {
      const error = new Error('Invalid or expired gameplay session.');
      error.statusCode = 404;
      throw error;
    }

    if (session.completed) {
      const error = new Error('This gameplay session has already ended.');
      error.statusCode = 400;
      throw error;
    }

    const nextIndex = session.currentClueIndex + 1;
    if (nextIndex >= session.allClues.length) {
      return {
        hasMoreClues: false,
        clue: session.allClues[session.currentClueIndex],
        clueNumber: session.currentClueIndex + 1,
        totalClues: session.allClues.length
      };
    }

    const nextClueText = session.allClues[nextIndex];
    const updatedRevealed = [...session.revealedClues, nextClueText];

    sessionManager.updateSession(sessionId, {
      currentClueIndex: nextIndex,
      revealedClues: updatedRevealed
    });

    return {
      hasMoreClues: nextIndex < session.allClues.length - 1,
      clue: nextClueText,
      clueNumber: nextIndex + 1,
      totalClues: session.allClues.length
    };
  }

  /**
   * Retrieves hint for active session.
   */
  async getHint(sessionId) {
    const session = sessionManager.getSession(sessionId);
    if (!session) {
      const error = new Error('Invalid or expired gameplay session.');
      error.statusCode = 404;
      throw error;
    }

    const concept = kb.getConceptById(session.conceptId);
    const hintText = concept ? concept.hint || 'Analyze the characteristics of the concept.' : 'No hint available.';

    if (!session.hintsUsed.includes(hintText)) {
      sessionManager.updateSession(sessionId, {
        hintsUsed: [...session.hintsUsed, hintText]
      });
    }

    return { hint: hintText };
  }

  /**
   * Validates user's concept guess and updates progression.
   */
  async submitGuess(sessionId, guessConceptId, userContext, guestProgressPayload) {
    const session = sessionManager.getSession(sessionId);
    if (!session) {
      const error = new Error('Invalid or expired gameplay session.');
      error.statusCode = 404;
      throw error;
    }

    if (session.completed) {
      const error = new Error('This gameplay session has already concluded.');
      error.statusCode = 400;
      throw error;
    }

    const targetConcept = kb.getConceptById(session.conceptId);
    const isCorrect = session.isBoss
      ? bossEngine.validateBossGuess(session.conceptId, guessConceptId)
      : (targetConcept && (targetConcept.id === guessConceptId || targetConcept.name.toLowerCase() === String(guessConceptId).toLowerCase()));

    const currentProgress = await progressService.getProgress(userContext, guestProgressPayload);

    if (isCorrect) {
      sessionManager.endSession(sessionId, 'win');

      // Calculate Stars and XP
      let stars = 1;
      let xpGained = config.BASE_LEVEL_XP;

      if (session.isBoss) {
        const bossRewards = bossEngine.calculateBossRewards(session.currentClueIndex + 1, session.hintsUsed.length);
        stars = bossRewards.stars;
        xpGained = bossRewards.xpGained;
      } else {
        const clueCount = session.currentClueIndex + 1;
        const hintCount = session.hintsUsed.length;
        if (clueCount <= config.STARS_RULES.THREE_STARS_MAX_CLUES && hintCount === 0) {
          stars = 3;
        } else if (clueCount <= config.STARS_RULES.TWO_STARS_MAX_CLUES) {
          stars = 2;
        }
      }

      // Update progress datastructure
      const levelId = session.levelId;
      const completedLevelsSet = new Set(currentProgress.completedLevels);
      completedLevelsSet.add(levelId);

      const levelStarsMap = { ...currentProgress.levelStars };
      const prevStars = levelStarsMap[levelId] || 0;
      levelStarsMap[levelId] = Math.max(prevStars, stars);

      // Recalculate total stars
      const newTotalStars = Object.values(levelStarsMap).reduce((sum, val) => sum + val, 0);

      // Check for World Unlocks if Boss level completed
      const currentLevel = kb.getLevelById(levelId);
      const unlockedWorldsSet = new Set(currentProgress.unlockedWorlds);

      if (currentLevel && currentLevel.isBoss) {
        const allWorlds = kb.getWorlds();
        const currentWorldIdx = allWorlds.findIndex(w => w.id === currentLevel.worldId);
        if (currentWorldIdx !== -1 && currentWorldIdx < allWorlds.length - 1) {
          unlockedWorldsSet.add(allWorlds[currentWorldIdx + 1].id);
        }
      }

      const updatedProgress = {
        xp: currentProgress.xp + xpGained,
        totalStars: newTotalStars,
        completedLevels: Array.from(completedLevelsSet),
        unlockedWorlds: Array.from(unlockedWorldsSet),
        levelStars: levelStarsMap,
        highestScore: Math.max(currentProgress.highestScore, (currentProgress.xp + xpGained))
      };

      const savedProgress = await progressService.saveProgress(userContext, updatedProgress);
      const review = reviewService.generateReview(session.conceptId);
      const nextLevel = kb.getNextLevel(levelId);

      return {
        correct: true,
        ended: true,
        stars,
        xpGained,
        correctConcept: targetConcept,
        review,
        progress: savedProgress,
        nextLevelId: nextLevel ? nextLevel.id : null
      };
    }

    // Incorrect guess handling
    const isFinalClue = session.currentClueIndex >= session.allClues.length - 1;
    if (isFinalClue) {
      sessionManager.endSession(sessionId, 'loss');
      const review = reviewService.generateReview(session.conceptId);
      return {
        correct: false,
        ended: true,
        correctConcept: targetConcept,
        review,
        progress: currentProgress
      };
    }

    return {
      correct: false,
      ended: false,
      message: 'Incorrect guess. Try taking another clue!'
    };
  }

  /**
   * Automatically resolves the "Continue Adventure" level for a player.
   */
  async getContinueLevel(userContext, guestProgressPayload) {
    const progress = await progressService.getProgress(userContext, guestProgressPayload);
    const levels = kb.getLevels();

    for (const level of levels) {
      if (!progress.completedLevels.includes(level.id)) {
        return {
          levelId: level.id,
          worldId: level.worldId,
          levelNumber: level.levelNumber
        };
      }
    }

    // If all levels are completed, return the final level
    const lastLevel = levels[levels.length - 1];
    return lastLevel ? { levelId: lastLevel.id, worldId: lastLevel.worldId, levelNumber: lastLevel.levelNumber } : null;
  }
}

module.exports = new AdventureService();
