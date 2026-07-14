import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory paths in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const audioOutputDir = path.join(__dirname, '..', '..', 'public', 'audio');

// Ensure output directory exists
if (!fs.existsSync(audioOutputDir)) {
  fs.mkdirSync(audioOutputDir, { recursive: true });
}

function createWaveHeader(dataLength, sampleRate = 8000, numChannels = 1, bitsPerSample = 8) {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0); // ChunkID
  header.writeInt32LE(36 + dataLength, 4); // ChunkSize
  header.write('WAVE', 8); // Format
  header.write('fmt ', 12); // Subchunk1ID
  header.writeInt32LE(16, 16); // Subchunk1Size (PCM = 16)
  header.writeInt16LE(1, 20); // AudioFormat (PCM = 1)
  header.writeInt16LE(numChannels, 22); // NumChannels
  header.writeInt32LE(sampleRate, 24); // SampleRate
  header.writeInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28); // ByteRate
  header.writeInt16LE(numChannels * (bitsPerSample / 8), 32); // BlockAlign
  header.writeInt16LE(bitsPerSample, 34); // BitsPerSample
  header.write('data', 36); // Subchunk2ID
  header.writeInt32LE(dataLength, 40); // Subchunk2Size
  return header;
}

function writeSampleWav(filepath, frequency = 440, durationSeconds = 0.4, sampleRate = 8000) {
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const data = Buffer.alloc(numSamples);
  for (let i = 0; i < numSamples; i++) {
    // Generate sine wave
    const val = Math.round(128 + 127 * Math.sin(2 * Math.PI * frequency * (i / sampleRate)));
    data[i] = val;
  }
  const header = createWaveHeader(numSamples, sampleRate, 1, 8);
  fs.writeFileSync(filepath, Buffer.concat([header, data]));
}

// Generate double-tone pleasant chime for correct answers
function writeChimeWav(filepath, freq1 = 523.25, freq2 = 659.25, durationSeconds = 0.5, sampleRate = 8000) {
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const data = Buffer.alloc(numSamples);
  const halfPoint = Math.floor(numSamples / 2);
  for (let i = 0; i < numSamples; i++) {
    const freq = i < halfPoint ? freq1 : freq2;
    const val = Math.round(128 + 127 * Math.sin(2 * Math.PI * freq * (i / sampleRate)));
    data[i] = val;
  }
  const header = createWaveHeader(numSamples, sampleRate, 1, 8);
  fs.writeFileSync(filepath, Buffer.concat([header, data]));
}

// Map files to write
const audioFiles = [
  // Feedback Sounds
  { filename: 'fb_correct.wav', type: 'chime', freq1: 523.25, freq2: 659.25 }, // C5 -> E5 pleasant chime
  { filename: 'fb_incorrect.wav', type: 'tone', freq: 196.00, dur: 0.6 },     // G3 buzz/dull tone
  { filename: 'fb_skipped.wav', type: 'tone', freq: 293.66, dur: 0.35 },      // D4 short tone

  // Operators
  { filename: 'op_plus.wav', type: 'tone', freq: 329.63 },   // E4
  { filename: 'op_minus.wav', type: 'tone', freq: 261.63 },  // C4
  { filename: 'op_times.wav', type: 'tone', freq: 392.00 },  // G4
  { filename: 'op_divide.wav', type: 'tone', freq: 440.00 }, // A4
  { filename: 'op_equals.wav', type: 'tone', freq: 493.88 }, // B4

  // Numbers (0-20 mapped to incrementing frequencies)
  ...Array.from({ length: 21 }, (_, i) => ({
    filename: `num_${i}.wav`,
    type: 'tone',
    freq: 261.63 + i * 20, // Scale upwards from C4
    dur: 0.3
  })),

  // Basic instruction words
  { filename: 'what.wav', type: 'tone', freq: 349.23 },      // F4
  { filename: 'is.wav', type: 'tone', freq: 392.00 },        // G4
  { filename: 'find.wav', type: 'tone', freq: 415.30 },      // G#4
  { filename: 'solve.wav', type: 'tone', freq: 466.16 },     // A#4
  { filename: 'identify.wav', type: 'tone', freq: 440.00 },  // A4
  { filename: 'conic.wav', type: 'tone', freq: 493.88 },     // B4
  { filename: 'circle.wav', type: 'tone', freq: 523.25 },    // C5
  { filename: 'ellipse.wav', type: 'tone', freq: 587.33 },   // D5
  { filename: 'parabola.wav', type: 'tone', freq: 659.25 },  // E5
  { filename: 'hyperbola.wav', type: 'tone', freq: 698.46 }, // F5
  { filename: 'radius.wav', type: 'tone', freq: 440.00 },
  { filename: 'gradient.wav', type: 'tone', freq: 466.00 },
  { filename: 'slope.wav', type: 'tone', freq: 480.00 },
  { filename: 'midpoint.wav', type: 'tone', freq: 400.00 },
  { filename: 'distance.wav', type: 'tone', freq: 420.00 },
  { filename: 'probability.wav', type: 'tone', freq: 430.00 },
  { filename: 'mean.wav', type: 'tone', freq: 350.00 },
  { filename: 'median.wav', type: 'tone', freq: 370.00 },
  { filename: 'mode.wav', type: 'tone', freq: 390.00 },
  { filename: 'range.wav', type: 'tone', freq: 410.00 },
  { filename: 'matrix.wav', type: 'tone', freq: 450.00 },
  { filename: 'vector.wav', type: 'tone', freq: 470.00 },
  { filename: 'trigonometry.wav', type: 'tone', freq: 480.00 },
  { filename: 'degree.wav', type: 'tone', freq: 330.00 },
  { filename: 'order.wav', type: 'tone', freq: 350.00 },
  { filename: 'evaluate.wav', type: 'tone', freq: 360.00 },
  { filename: 'simplify.wav', type: 'tone', freq: 370.00 },
  { filename: 'factor.wav', type: 'tone', freq: 380.00 },
  { filename: 'prime.wav', type: 'tone', freq: 390.00 },
  { filename: 'factors.wav', type: 'tone', freq: 400.00 },
  { filename: 'correct.wav', type: 'tone', freq: 523.25 },
  { filename: 'incorrect.wav', type: 'tone', freq: 196.00 },
  { filename: 'solution.wav', type: 'tone', freq: 440.00 },
  { filename: 'answer.wav', type: 'tone', freq: 460.00 },
  { filename: 'question.wav', type: 'tone', freq: 480.00 },

  // Intros (Quiz Welcome Audio)
  { filename: 'intro_trig.wav', type: 'chime', freq1: 440, freq2: 554.37 },
  { filename: 'intro_ineq.wav', type: 'chime', freq1: 440, freq2: 587.33 },
  { filename: 'intro_coordgeom.wav', type: 'chime', freq1: 440, freq2: 659.25 },
  { filename: 'intro_prob.wav', type: 'chime', freq1: 440, freq2: 698.46 },
  { filename: 'intro_stats.wav', type: 'chime', freq1: 392, freq2: 587.33 },
  { filename: 'intro_matrix.wav', type: 'chime', freq1: 349.23, freq2: 523.25 },
  { filename: 'intro_vectors.wav', type: 'chime', freq1: 329.63, freq2: 493.88 },
  { filename: 'intro_gk.wav', type: 'chime', freq1: 293.66, freq2: 440 },
  { filename: 'intro_addition.wav', type: 'chime', freq1: 261.63, freq2: 392 },
  { filename: 'intro_basicarith.wav', type: 'chime', freq1: 261.63, freq2: 523.25 },
  { filename: 'intro_multiply.wav', type: 'chime', freq1: 329.63, freq2: 659.25 },
  { filename: 'intro_sqrt.wav', type: 'chime', freq1: 392, freq2: 783.99 },
  { filename: 'intro_vocab.wav', type: 'chime', freq1: 440, freq2: 880 },
];

console.log(`Generating ${audioFiles.length} mock WAV audio files in: ${audioOutputDir}`);

audioFiles.forEach(file => {
  const destPath = path.join(audioOutputDir, file.filename);
  if (file.type === 'chime') {
    writeChimeWav(destPath, file.freq1, file.freq2, file.dur || 0.4);
  } else {
    writeSampleWav(destPath, file.freq, file.dur || 0.35);
  }
});

console.log('Audio generation completed successfully!');
