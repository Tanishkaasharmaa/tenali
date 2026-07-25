let sharedAudioContext = null;

export function getAudioContext() {
  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume();
  }
  return sharedAudioContext;
}

export function playSound(type, enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'correct') {
      const now = ctx.currentTime;
      osc.type = 'triangle'; // Warm, game-like chime tone
      osc.frequency.setValueAtTime(987.77, now); // B5 note
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6 note
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.setValueAtTime(0.12, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'wrong') {
      const now = ctx.currentTime;
      osc.type = 'sawtooth'; // Playful, retro buzzer slide down
      osc.frequency.setValueAtTime(293.66, now); // D4
      osc.frequency.linearRampToValueAtTime(110.00, now + 0.3); // A2 slide
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'plane') {
      const now = ctx.currentTime;
      osc.type = 'triangle'; // Smooth triangle wave for swoosh
      osc.frequency.setValueAtTime(180.00, now); // Start at low pitch (180Hz)
      osc.frequency.exponentialRampToValueAtTime(750.00, now + 1.2); // Sweeps up to 750Hz
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.3); // Swells up
      gain.gain.linearRampToValueAtTime(0.08, now + 0.8); // Fades down slightly later
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5); // Fades completely
      osc.start(now);
      osc.stop(now + 1.5);
    }
  } catch (e) {
    console.warn('AudioContext playback failed:', e);
  }
}
