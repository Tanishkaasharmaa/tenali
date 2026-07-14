/**
 * AudioCatalog.js
 * Contains the lookup mappings for the pre-recorded voice narration.
 * Converts content IDs or text tokens into paths to static audio files.
 */

// Mapping of specific static content IDs to audio files
export const staticAudioCatalog = {
  // Feedback Messages
  'fb_correct': '/audio/fb_correct.wav',
  'fb_incorrect': '/audio/fb_incorrect.wav',
  'fb_skipped': '/audio/fb_skipped.wav',

  // Welcome / Intro Screens (by quiz type key)
  'intro_trig': '/audio/intro_trig.wav',
  'intro_ineq': '/audio/intro_ineq.wav',
  'intro_coordgeom': '/audio/intro_coordgeom.wav',
  'intro_prob': '/audio/intro_prob.wav',
  'intro_stats': '/audio/intro_stats.wav',
  'intro_matrix': '/audio/intro_matrix.wav',
  'intro_vectors': '/audio/intro_vectors.wav',
  'intro_gk': '/audio/intro_gk.wav',
  'intro_addition': '/audio/intro_addition.wav',
  'intro_basicarith': '/audio/intro_basicarith.wav',
  'intro_multiply': '/audio/intro_multiply.wav',
  'intro_sqrt': '/audio/intro_sqrt.wav',
  'intro_vocab': '/audio/intro_vocab.wav',
};

// Word Bank for dynamic prompt text stitching
// Keyed by lowercase words or math symbols
export const tokenAudioCatalog = {
  // Standard math prompt words
  'what': '/audio/what.wav',
  'is': '/audio/is.wav',
  'find': '/audio/find.wav',
  'solve': '/audio/solve.wav',
  'identify': '/audio/identify.wav',
  'conic': '/audio/conic.wav',
  'circle': '/audio/circle.wav',
  'ellipse': '/audio/ellipse.wav',
  'parabola': '/audio/parabola.wav',
  'hyperbola': '/audio/hyperbola.wav',
  'radius': '/audio/radius.wav',
  'gradient': '/audio/gradient.wav',
  'slope': '/audio/slope.wav',
  'midpoint': '/audio/midpoint.wav',
  'distance': '/audio/distance.wav',
  'probability': '/audio/probability.wav',
  'mean': '/audio/mean.wav',
  'median': '/audio/median.wav',
  'mode': '/audio/mode.wav',
  'range': '/audio/range.wav',
  'matrix': '/audio/matrix.wav',
  'vector': '/audio/vector.wav',
  'trigonometry': '/audio/trigonometry.wav',
  'degree': '/audio/degree.wav',
  'order': '/audio/order.wav',
  'evaluate': '/audio/evaluate.wav',
  'simplify': '/audio/simplify.wav',
  'factor': '/audio/factor.wav',
  'prime': '/audio/prime.wav',
  'factors': '/audio/factors.wav',
  'correct': '/audio/correct.wav',
  'incorrect': '/audio/incorrect.wav',
  'solution': '/audio/solution.wav',
  'answer': '/audio/answer.wav',
  'question': '/audio/question.wav',

  // Numbers (0-20, tens, etc.)
  '0': '/audio/num_0.wav',
  '1': '/audio/num_1.wav',
  '2': '/audio/num_2.wav',
  '3': '/audio/num_3.wav',
  '4': '/audio/num_4.wav',
  '5': '/audio/num_5.wav',
  '6': '/audio/num_6.wav',
  '7': '/audio/num_7.wav',
  '8': '/audio/num_8.wav',
  '9': '/audio/num_9.wav',
  '10': '/audio/num_10.wav',
  '11': '/audio/num_11.wav',
  '12': '/audio/num_12.wav',
  '13': '/audio/num_13.wav',
  '14': '/audio/num_14.wav',
  '15': '/audio/num_15.wav',
  '16': '/audio/num_16.wav',
  '17': '/audio/num_17.wav',
  '18': '/audio/num_18.wav',
  '19': '/audio/num_19.wav',
  '20': '/audio/num_20.wav',

  // Math Operators / Symbols
  '+': '/audio/op_plus.wav',
  '-': '/audio/op_minus.wav',
  '−': '/audio/op_minus.wav', // Unicode minus
  '*': '/audio/op_times.wav',
  'x': '/audio/op_times.wav',
  '×': '/audio/op_times.wav',
  '/': '/audio/op_divide.wav',
  '=': '/audio/op_equals.wav',
};

/**
 * Checks if a static content ID exists in the catalog.
 */
export function hasStaticAudio(contentId) {
  return !!staticAudioCatalog[contentId];
}

/**
 * Returns the audio file path for a static content ID.
 */
export function getStaticAudioPath(contentId) {
  return staticAudioCatalog[contentId] || null;
}

/**
 * Checks if a word token exists in the catalog.
 */
export function hasTokenAudio(token) {
  const cleanToken = token.trim().toLowerCase();
  return !!tokenAudioCatalog[cleanToken];
}

/**
 * Returns the audio file path for a word token.
 */
export function getTokenAudioPath(token) {
  const cleanToken = token.trim().toLowerCase();
  return tokenAudioCatalog[cleanToken] || null;
}
