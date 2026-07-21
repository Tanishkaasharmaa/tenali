/**
 * TENALI ADVENTURE GAME - LOCAL STORAGE ADAPTER (CLIENT)
 * ══════════════════════════════════════════════════════════════════════
 * Handles reading and saving guest progress in browser localStorage.
 */

const STORAGE_KEY = 'tenali-adventure-guest-progress';

const DEFAULT_GUEST_PROGRESS = {
  xp: 0,
  totalStars: 0,
  completedLevels: [],
  unlockedWorlds: ['world_1'],
  levelStars: {},
  highestScore: 0
};

export const LocalStorageAdapter = {
  getProgress: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_GUEST_PROGRESS };
      const parsed = JSON.parse(raw);
      return {
        xp: parsed.xp || 0,
        totalStars: parsed.totalStars || 0,
        completedLevels: Array.isArray(parsed.completedLevels) ? parsed.completedLevels : [],
        unlockedWorlds: Array.isArray(parsed.unlockedWorlds) && parsed.unlockedWorlds.length > 0 ? parsed.unlockedWorlds : ['world_1'],
        levelStars: parsed.levelStars || {},
        highestScore: parsed.highestScore || 0
      };
    } catch (_e) {
      return { ...DEFAULT_GUEST_PROGRESS };
    }
  },

  saveProgress: (progress) => {
    try {
      const normalized = {
        xp: progress.xp || 0,
        totalStars: progress.totalStars || 0,
        completedLevels: progress.completedLevels || [],
        unlockedWorlds: progress.unlockedWorlds || ['world_1'],
        levelStars: progress.levelStars || {},
        highestScore: progress.highestScore || 0
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return normalized;
    } catch (_e) {
      return progress;
    }
  }
};
