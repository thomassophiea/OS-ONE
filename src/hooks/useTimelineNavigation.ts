import { useState, useEffect, useCallback, useRef } from 'react';

export type TimelineScope = 'client-insights' | 'ap-insights';

interface TimeWindow {
  start: number | null;
  end: number | null;
}

interface TimelineState {
  currentTime: number | null;
  timeWindow: TimeWindow;
  isLocked: boolean;
  zoomMode: 'highlight' | 'zoom';
  zoomDomain: [number, number] | null;
  pendingRefetch: boolean;
}

const DEFAULT_STATE: Omit<TimelineState, 'currentTime' | 'timeWindow' | 'isLocked'> = {
  zoomMode: 'highlight',
  zoomDomain: null,
  pendingRefetch: false,
};

// Module-level state storage per scope
const scopedState: Record<TimelineScope, TimelineState> = {
  'client-insights': {
    currentTime: null,
    timeWindow: { start: null, end: null },
    isLocked: false,
    ...DEFAULT_STATE,
  },
  'ap-insights': {
    currentTime: null,
    timeWindow: { start: null, end: null },
    isLocked: false,
    ...DEFAULT_STATE,
  },
};

// Listener management per scope
const listeners: Record<TimelineScope, Set<() => void>> = {
  'client-insights': new Set(),
  'ap-insights': new Set(),
};

// Notify all listeners for a specific scope
function notifyListeners(scope: TimelineScope): void {
  listeners[scope].forEach((listener) => listener());
}

// Get current state for a scope
function getState(scope: TimelineScope): TimelineState {
  return scopedState[scope];
}

// Update state for a scope and notify listeners
function setState(scope: TimelineScope, updates: Partial<TimelineState>): void {
  scopedState[scope] = { ...scopedState[scope], ...updates };
  notifyListeners(scope);
}

/**
 * Hook for correlated timeline navigation across charts
 * Provides synchronized cursor, time window selection, and lock functionality
 * State is scoped per page (client-insights vs ap-insights)
 */
export function useTimelineNavigation(scope: TimelineScope) {
  const [state, setLocalState] = useState<TimelineState>(() => getState(scope));
  const rafRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  // Subscribe to state changes
  useEffect(() => {
    const listener = () => {
      setLocalState(getState(scope));
    };

    listeners[scope].add(listener);
    return () => {
      listeners[scope].delete(listener);
    };
  }, [scope]);

  // Set current time (throttled with requestAnimationFrame)
  const setCurrentTime = useCallback(
    (timestamp: number | null) => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const currentState = getState(scope);
        if (!currentState.isLocked) {
          setState(scope, { currentTime: timestamp });
        }
        rafRef.current = null;
      });
    },
    [scope]
  );

  // Toggle lock state
  const toggleLock = useCallback(() => {
    const currentState = getState(scope);
    setState(scope, { isLocked: !currentState.isLocked });
  }, [scope]);

  // Start time window selection
  const startTimeWindow = useCallback(
    (timestamp: number) => {
      isDraggingRef.current = true;
      setState(scope, {
        timeWindow: { start: timestamp, end: timestamp },
      });
    },
    [scope]
  );

  // Update time window end during drag
  const updateTimeWindow = useCallback(
    (timestamp: number) => {
      if (isDraggingRef.current) {
        const currentState = getState(scope);
        if (currentState.timeWindow.start !== null) {
          setState(scope, {
            timeWindow: { ...currentState.timeWindow, end: timestamp },
          });
        }
      }
    },
    [scope]
  );

  // End time window selection
  const endTimeWindow = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  // Clear time window
  const clearTimeWindow = useCallback(() => {
    setState(scope, {
      timeWindow: { start: null, end: null },
    });
  }, [scope]);

  // Reset all timeline state
  const resetTimeline = useCallback(() => {
    setState(scope, {
      currentTime: null,
      timeWindow: { start: null, end: null },
      isLocked: false,
      zoomMode: 'highlight',
      zoomDomain: null,
      pendingRefetch: false,
    });
  }, [scope]);

  // Soft reset - clear time window and zoom, preserve lock and current time
  const softReset = useCallback(() => {
    setState(scope, {
      timeWindow: { start: null, end: null },
      zoomDomain: null,
      pendingRefetch: false,
    });
  }, [scope]);

  // Set zoom mode (highlight or zoom)
  const setZoomMode = useCallback((mode: 'highlight' | 'zoom') => {
    setState(scope, { zoomMode: mode });
  }, [scope]);

  // Commit a drag selection as a zoom domain (clears live preview overlay)
  const applyZoom = useCallback((start: number, end: number) => {
    const [lo, hi] = start < end ? [start, end] : [end, start];
    setState(scope, {
      zoomDomain: [lo, hi],
      pendingRefetch: true,
      timeWindow: { start: null, end: null },
    });
  }, [scope]);

  // Clear zoom domain and pending refetch flag
  const clearZoom = useCallback(() => {
    setState(scope, { zoomDomain: null, pendingRefetch: false });
  }, [scope]);

  // Clear only the pending refetch flag (keep zoom domain visible)
  const clearPendingRefetch = useCallback(() => {
    setState(scope, { pendingRefetch: false });
  }, [scope]);

  // Lock the cursor at a specific timestamp (bypasses isLocked check)
  const lockAt = useCallback((timestamp: number) => {
    setState(scope, { currentTime: timestamp, isLocked: true });
  }, [scope]);

  // Sync timeline from another scope
  const syncFromScope = useCallback((sourceScope: TimelineScope) => {
    const sourceState = getState(sourceScope);
    setState(scope, {
      currentTime: sourceState.currentTime,
      timeWindow: sourceState.timeWindow,
      isLocked: sourceState.isLocked,
    });
  }, [scope]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    // State
    currentTime: state.currentTime,
    timeWindow: state.timeWindow,
    isLocked: state.isLocked,
    zoomMode: state.zoomMode,
    zoomDomain: state.zoomDomain,
    pendingRefetch: state.pendingRefetch,

    // Actions
    setCurrentTime,
    toggleLock,
    startTimeWindow,
    updateTimeWindow,
    endTimeWindow,
    clearTimeWindow,
    resetTimeline,
    softReset,
    syncFromScope,
    setZoomMode,
    applyZoom,
    clearZoom,
    clearPendingRefetch,
    lockAt,
  };
}
