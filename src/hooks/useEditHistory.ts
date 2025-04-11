
import { useState, useCallback } from 'react';

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

/**
 * Custom hook for managing edit history with undo and redo functionality
 * @param initialPresent The initial state
 * @param maxHistoryLength Maximum number of history states to keep in memory
 * @returns History state and actions (undo, redo, update)
 */
export function useEditHistory<T>(initialPresent: T, maxHistoryLength = 10) {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialPresent,
    future: []
  });

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  // Update the present state and move current present to past
  const update = useCallback((newPresent: T) => {
    setHistory(prevHistory => {
      // Skip if the new state is the same as the current state
      if (JSON.stringify(prevHistory.present) === JSON.stringify(newPresent)) {
        return prevHistory;
      }
      
      return {
        past: [
          ...prevHistory.past.slice(-(maxHistoryLength - 1)), 
          prevHistory.present
        ],
        present: newPresent,
        future: []
      };
    });
  }, [maxHistoryLength]);

  // Undo: move back one step in history
  const undo = useCallback(() => {
    setHistory(prevHistory => {
      if (!canUndo) return prevHistory;

      const previous = prevHistory.past[prevHistory.past.length - 1];
      
      return {
        past: prevHistory.past.slice(0, -1),
        present: previous,
        future: [prevHistory.present, ...prevHistory.future]
      };
    });
  }, [canUndo]);

  // Redo: move forward one step in history
  const redo = useCallback(() => {
    setHistory(prevHistory => {
      if (!canRedo) return prevHistory;

      const next = prevHistory.future[0];
      
      return {
        past: [...prevHistory.past, prevHistory.present],
        present: next,
        future: prevHistory.future.slice(1)
      };
    });
  }, [canRedo]);

  return {
    state: history.present,
    update,
    undo,
    redo,
    canUndo,
    canRedo,
    history
  };
}
