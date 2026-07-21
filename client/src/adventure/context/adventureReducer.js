/**
 * TENALI ADVENTURE GAME - STATE REDUCER
 * ══════════════════════════════════════════════════════════════════════
 * Central reducer handling view transitions and gameplay state machine.
 */

export const initialState = {
  view: 'HOME', // 'HOME' | 'KINGDOM_SELECT' | 'LEVEL_SELECT' | 'GAMEPLAY' | 'RESULT' | 'REVIEW'
  currentWorldId: 'world_1',
  currentLevelId: null,
  worlds: [],
  levels: [],
  concepts: [],
  progress: {
    xp: 0,
    totalStars: 0,
    completedLevels: [],
    unlockedWorlds: ['world_1'],
    levelStars: {},
    highestScore: 0
  },
  session: null,       // { sessionId, levelId, firstClue, currentClue, clueNumber, totalClues, isBoss }
  hintText: null,
  guessModalOpen: false,
  resultData: null,    // { correct, stars, xpGained, nextLevelId }
  reviewData: null,    // Educational review object
  loading: false,
  error: null
};

export function adventureReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'SET_CONFIG':
      return {
        ...state,
        worlds: action.payload.worlds || [],
        levels: action.payload.levels || [],
        concepts: action.payload.concepts || [],
        progress: action.payload.progress || state.progress,
        loading: false
      };

    case 'SET_VIEW':
      return { ...state, view: action.payload, error: null };

    case 'SELECT_WORLD':
      return { ...state, currentWorldId: action.payload, view: 'LEVEL_SELECT', error: null };

    case 'START_SESSION':
      return {
        ...state,
        session: {
          sessionId: action.payload.sessionId,
          levelId: action.payload.levelId,
          worldId: action.payload.worldId,
          levelNumber: action.payload.levelNumber,
          isBoss: action.payload.isBoss,
          currentClue: action.payload.firstClue,
          clueNumber: action.payload.clueNumber || 1,
          totalClues: action.payload.totalClues || 5
        },
        hintText: null,
        guessModalOpen: false,
        resultData: null,
        reviewData: null,
        view: 'GAMEPLAY',
        loading: false,
        error: null
      };

    case 'UPDATE_CLUE':
      return {
        ...state,
        session: {
          ...state.session,
          currentClue: action.payload.clue,
          clueNumber: action.payload.clueNumber
        },
        loading: false
      };

    case 'SET_HINT':
      return { ...state, hintText: action.payload, loading: false };

    case 'SET_GUESS_MODAL':
      return { ...state, guessModalOpen: action.payload };

    case 'HANDLE_GUESS_WIN':
      return {
        ...state,
        resultData: {
          correct: true,
          stars: action.payload.stars,
          xpGained: action.payload.xpGained,
          nextLevelId: action.payload.nextLevelId
        },
        reviewData: action.payload.review,
        progress: action.payload.progress || state.progress,
        guessModalOpen: false,
        view: 'RESULT',
        loading: false
      };

    case 'HANDLE_GUESS_LOSS':
      return {
        ...state,
        resultData: {
          correct: false,
          stars: 0,
          xpGained: 0,
          nextLevelId: null
        },
        reviewData: action.payload.review,
        progress: action.payload.progress || state.progress,
        guessModalOpen: false,
        view: 'RESULT',
        loading: false
      };

    case 'UPDATE_PROGRESS':
      return { ...state, progress: action.payload };

    default:
      return state;
  }
}
