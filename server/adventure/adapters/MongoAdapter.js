/**
 * TENALI ADVENTURE GAME - MONGO STORAGE ADAPTER
 * ══════════════════════════════════════════════════════════════════════
 * Implements progress storage for authenticated MongoDB users.
 */

'use strict';

const mongoose = require('mongoose');
const StorageAdapterInterface = require('./StorageAdapterInterface');

const AdventureProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  xp: { type: Number, default: 0 },
  totalStars: { type: Number, default: 0 },
  completedLevels: { type: [String], default: [] },
  unlockedWorlds: { type: [String], default: ["world_1"] },
  levelStars: { type: Map, of: Number, default: {} },
  highestScore: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

const AdventureProgress = mongoose.models.AdventureProgress || mongoose.model('AdventureProgress', AdventureProgressSchema);

class MongoAdapter extends StorageAdapterInterface {
  async getProgress(userId) {
    if (!userId || mongoose.connection.readyState !== 1) {
      return null;
    }
    try {
      let doc = await AdventureProgress.findOne({ userId });
      if (!doc) {
        doc = await AdventureProgress.create({
          userId,
          xp: 0,
          totalStars: 0,
          completedLevels: [],
          unlockedWorlds: ["world_1"],
          levelStars: {},
          highestScore: 0
        });
      }
      return {
        xp: doc.xp || 0,
        totalStars: doc.totalStars || 0,
        completedLevels: doc.completedLevels || [],
        unlockedWorlds: doc.unlockedWorlds || ["world_1"],
        levelStars: doc.levelStars ? Object.fromEntries(doc.levelStars) : {},
        highestScore: doc.highestScore || 0
      };
    } catch (err) {
      console.error('[MongoAdapter] Error fetching progress:', err);
      return null;
    }
  }

  async saveProgress(userId, progressData) {
    if (!userId || mongoose.connection.readyState !== 1) {
      return false;
    }
    try {
      await AdventureProgress.findOneAndUpdate(
        { userId },
        {
          $set: {
            xp: progressData.xp,
            totalStars: progressData.totalStars,
            completedLevels: progressData.completedLevels,
            unlockedWorlds: progressData.unlockedWorlds,
            levelStars: progressData.levelStars,
            highestScore: progressData.highestScore,
            updatedAt: new Date()
          }
        },
        { upsert: true, new: true }
      );
      return true;
    } catch (err) {
      console.error('[MongoAdapter] Error saving progress:', err);
      return false;
    }
  }
}

module.exports = new MongoAdapter();
