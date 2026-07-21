/**
 * TENALI ADVENTURE GAME - REACT CONTEXT
 * ══════════════════════════════════════════════════════════════════════
 * Provides centralized adventure game state and dispatcher functions.
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { adventureReducer, initialState } from './adventureReducer';
import { adventureApi } from '../services/adventureApi';

const AdventureContext = createContext();

export function AdventureProvider({ children }) {
  const [state, dispatch] = useReducer(adventureReducer, initialState);

  const loadGameConfig = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await adventureApi.fetchConfig();
      dispatch({ type: 'SET_CONFIG', payload: data });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  };

  useEffect(() => {
    loadGameConfig();
  }, []);

  const value = {
    state,
    dispatch,
    loadGameConfig,
    
    // Actions
    setView: (view) => dispatch({ type: 'SET_VIEW', payload: view }),
    selectWorld: (worldId) => dispatch({ type: 'SELECT_WORLD', payload: worldId }),
    
    continueAdventure: async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const cont = await adventureApi.fetchContinue();
        if (cont && cont.levelId) {
          const sessionData = await adventureApi.startLevel(cont.levelId);
          dispatch({ type: 'START_SESSION', payload: sessionData });
        } else {
          dispatch({ type: 'SET_VIEW', payload: 'KINGDOM_SELECT' });
        }
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    },

    startLevel: async (levelId) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const sessionData = await adventureApi.startLevel(levelId);
        dispatch({ type: 'START_SESSION', payload: sessionData });
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    },

    nextClue: async () => {
      if (!state.session) return;
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const clueData = await adventureApi.fetchNextClue(state.session.sessionId);
        dispatch({ type: 'UPDATE_CLUE', payload: clueData });
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    },

    getHint: async () => {
      if (!state.session) return;
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const hintData = await adventureApi.fetchHint(state.session.sessionId);
        dispatch({ type: 'SET_HINT', payload: hintData.hint });
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    },

    submitGuess: async (guessConceptId) => {
      if (!state.session) return;
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const res = await adventureApi.submitGuess(state.session.sessionId, guessConceptId);
        if (res.correct) {
          dispatch({ type: 'HANDLE_GUESS_WIN', payload: res });
        } else if (res.ended) {
          dispatch({ type: 'HANDLE_GUESS_LOSS', payload: res });
        } else {
          dispatch({ type: 'SET_GUESS_MODAL', payload: false });
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    }
  };

  return (
    <AdventureContext.Provider value={value}>
      {children}
    </AdventureContext.Provider>
  );
}

export function useAdventure() {
  const context = useContext(AdventureContext);
  if (!context) {
    throw new Error('useAdventure must be used within an AdventureProvider');
  }
  return context;
}
