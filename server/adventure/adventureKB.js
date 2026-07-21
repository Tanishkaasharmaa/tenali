/**
 * TENALI ADVENTURE GAME - KNOWLEDGE BASE LOADER
 * ══════════════════════════════════════════════════════════════════════
 * Loads worlds, levels, and concepts dynamically from JSON files.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

let worlds = [];
let levels = [];
let concepts = [];

function loadData() {
  try {
    const worldsPath = path.join(DATA_DIR, 'worlds.json');
    const levelsPath = path.join(DATA_DIR, 'levels.json');
    const conceptsPath = path.join(DATA_DIR, 'concepts.json');

    if (fs.existsSync(worldsPath)) {
      worlds = JSON.parse(fs.readFileSync(worldsPath, 'utf8'));
    }
    if (fs.existsSync(levelsPath)) {
      levels = JSON.parse(fs.readFileSync(levelsPath, 'utf8'));
    }
    if (fs.existsSync(conceptsPath)) {
      concepts = JSON.parse(fs.readFileSync(conceptsPath, 'utf8'));
    }
    console.log(`[adventureKB] Loaded ${worlds.length} worlds, ${levels.length} levels, and ${concepts.length} concepts.`);
  } catch (err) {
    console.error('[adventureKB] Error loading JSON data:', err);
  }
}

// Initial load on require
loadData();

module.exports = {
  reload: loadData,
  getWorlds: () => worlds,
  getLevels: () => levels,
  getConcepts: () => concepts,

  getWorldById: (id) => worlds.find(w => w.id === id) || null,
  getLevelById: (id) => levels.find(l => l.id === id) || null,
  getConceptById: (id) => concepts.find(c => c.id === id) || null,

  getLevelsByWorldId: (worldId) => levels.filter(l => l.worldId === worldId),
  getNextLevel: (currentLevelId) => {
    const idx = levels.findIndex(l => l.id === currentLevelId);
    if (idx !== -1 && idx < levels.length - 1) {
      return levels[idx + 1];
    }
    return null;
  }
};
