import { useState, useCallback } from 'react';

export default function useHistory<T>(initialState: T) {
    const [state, setCombinedState] = useState<{ history: T[]; index: number }>({
        history: [initialState],
        index: 0
    });

    const currentState = state.history[state.index];

    const setState = useCallback((newState: T | ((prev: T) => T)) => {
        setCombinedState((prev) => {
            const current = prev.history[prev.index];
            const value = typeof newState === 'function' ? (newState as (prev: T) => T)(current) : newState;

            if (JSON.stringify(current) === JSON.stringify(value)) return prev;

            const newHistory = prev.history.slice(0, prev.index + 1);
            const updatedHistory = [...newHistory, value];

            return {
                history: updatedHistory,
                index: updatedHistory.length - 1
            };
        });
    }, []);

    const setTransient = useCallback((newState: T | ((prev: T) => T)) => {
        setCombinedState((prev) => {
            const current = prev.history[prev.index];
            const value = typeof newState === 'function' ? (newState as (prev: T) => T)(current) : newState;

            const newHistory = [...prev.history];
            newHistory[prev.index] = value;

            return {
                ...prev,
                history: newHistory
            };
        });
    }, []);

    const undo = useCallback(() => {
        setCombinedState((prev) => ({
            ...prev,
            index: Math.max(prev.index - 1, 0)
        }));
    }, []);

    const redo = useCallback(() => {
        setCombinedState((prev) => ({
            ...prev,
            index: Math.min(prev.index + 1, prev.history.length - 1)
        }));
    }, []);

    const canUndo = state.index > 0;
    const canRedo = state.index < state.history.length - 1;

    return { state: currentState, setState, setTransient, undo, redo, canUndo, canRedo };
}
