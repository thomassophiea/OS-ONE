import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGlobalFilters, getGlobalFilters, setGlobalFilters } from './useGlobalFilters';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Reset the module-level global singleton to defaults between tests.
 * Uses the hook's own resetFilters (which is synchronous — not debounced).
 */
function resetGlobalState() {
  const { result, unmount } = renderHook(() => useGlobalFilters());
  act(() => {
    result.current.resetFilters();
  });
  unmount();
}

/**
 * Flush the 300 ms debounce timer and let React process the resulting
 * state updates, all within a single act() boundary.
 */
async function flushDebounce() {
  await act(async () => {
    vi.advanceTimersByTime(300);
  });
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  resetGlobalState();
  vi.clearAllTimers(); // discard any timer left by resetGlobalState
});

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useGlobalFilters Hook', () => {
  describe('initial state', () => {
    it('should return default filters', () => {
      const { result } = renderHook(() => useGlobalFilters());

      expect(result.current.filters).toEqual({
        site: 'all',
        timeRange: '24h',
        environment: 'all',
      });
    });

    it('should indicate no active filters by default', () => {
      const { result } = renderHook(() => useGlobalFilters());

      expect(result.current.hasActiveFilters).toBe(false);
    });
  });

  describe('updateFilter', () => {
    it('should update a single filter', async () => {
      const { result } = renderHook(() => useGlobalFilters());

      act(() => {
        result.current.updateFilter('site', 'site-123');
      });

      await flushDebounce();

      expect(result.current.filters.site).toBe('site-123');
    });

    it('should update timeRange filter', async () => {
      const { result } = renderHook(() => useGlobalFilters());

      act(() => {
        result.current.updateFilter('timeRange', '7d');
      });

      await flushDebounce();

      expect(result.current.filters.timeRange).toBe('7d');
    });

    it('should update environment filter', async () => {
      const { result } = renderHook(() => useGlobalFilters());

      act(() => {
        result.current.updateFilter('environment', 'lab');
      });

      await flushDebounce();

      expect(result.current.filters.environment).toBe('lab');
    });

    it('should persist to localStorage after debounce', async () => {
      const { result } = renderHook(() => useGlobalFilters());

      act(() => {
        result.current.updateFilter('site', 'new-site');
      });

      await flushDebounce();

      const stored = localStorage.getItem('aura_global_filters');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.site).toBe('new-site');
    });
  });

  describe('updateFilters', () => {
    it('should update multiple filters at once', async () => {
      const { result } = renderHook(() => useGlobalFilters());

      act(() => {
        result.current.updateFilters({
          site: 'multi-site',
          timeRange: '30d',
          environment: 'staging',
        });
      });

      await flushDebounce();

      expect(result.current.filters.site).toBe('multi-site');
      expect(result.current.filters.timeRange).toBe('30d');
      expect(result.current.filters.environment).toBe('staging');
    });

    it('should indicate active filters when set', async () => {
      const { result } = renderHook(() => useGlobalFilters());

      act(() => {
        result.current.updateFilter('site', 'active-site');
      });

      await flushDebounce();

      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  describe('resetFilters', () => {
    it('should reset all filters to defaults', async () => {
      const { result } = renderHook(() => useGlobalFilters());

      act(() => {
        result.current.updateFilters({ site: 'site-1', timeRange: '7d', environment: 'prod' });
      });
      await flushDebounce();

      act(() => {
        result.current.resetFilters(); // synchronous — not debounced
      });

      expect(result.current.filters).toEqual({
        site: 'all',
        timeRange: '24h',
        environment: 'all',
      });
    });

    it('should indicate no active filters after reset', async () => {
      const { result } = renderHook(() => useGlobalFilters());

      act(() => {
        result.current.updateFilter('site', 'some-site');
      });
      await flushDebounce();

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.hasActiveFilters).toBe(false);
    });
  });

  describe('resetFilter', () => {
    it('should reset a specific filter to default while keeping others', async () => {
      const { result } = renderHook(() => useGlobalFilters());

      act(() => {
        result.current.updateFilters({ site: 'site-1', timeRange: '7d' });
      });
      await flushDebounce();

      act(() => {
        result.current.resetFilter('site'); // synchronous
      });

      expect(result.current.filters.site).toBe('all');
      expect(result.current.filters.timeRange).toBe('7d');
    });
  });

  describe('getGlobalFilters', () => {
    it('should return the current filter values', async () => {
      const { result } = renderHook(() => useGlobalFilters());

      act(() => {
        result.current.updateFilter('site', 'test-site');
      });
      // getGlobalFilters reads globalState directly — no need to flush debounce
      expect(getGlobalFilters().site).toBe('test-site');
    });

    it('should return a fresh copy on each call', () => {
      const filters1 = getGlobalFilters();
      const filters2 = getGlobalFilters();

      expect(filters1).toEqual(filters2);
      expect(filters1).not.toBe(filters2);
    });
  });

  describe('setGlobalFilters', () => {
    it('should update filters from outside the hook', async () => {
      const { result } = renderHook(() => useGlobalFilters());

      act(() => {
        setGlobalFilters({ site: 'non-hook-site', timeRange: '30d' });
      });

      await flushDebounce();

      expect(result.current.filters.site).toBe('non-hook-site');
      expect(result.current.filters.timeRange).toBe('30d');
    });
  });

  describe('debouncing', () => {
    it('should not persist to localStorage before debounce expires', () => {
      const { result } = renderHook(() => useGlobalFilters());

      act(() => {
        result.current.updateFilter('site', 'pending-site');
      });

      // Timer hasn't fired — localStorage should still show the pre-update value
      const stored = localStorage.getItem('aura_global_filters');
      const parsed = stored ? JSON.parse(stored) : null;
      expect(parsed?.site ?? 'all').toBe('all');
    });

    it('should coalesce rapid changes and persist the final value', async () => {
      const { result } = renderHook(() => useGlobalFilters());

      act(() => {
        result.current.updateFilter('site', 'site-1');
        result.current.updateFilter('site', 'site-2');
        result.current.updateFilter('site', 'site-3'); // last value wins
      });

      await flushDebounce();

      const stored = localStorage.getItem('aura_global_filters');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!).site).toBe('site-3');
    });
  });

  describe('multiple hook instances', () => {
    it('should share state across instances', async () => {
      const { result: hook1 } = renderHook(() => useGlobalFilters());
      const { result: hook2 } = renderHook(() => useGlobalFilters());

      act(() => {
        hook1.current.updateFilter('site', 'shared-site');
      });

      await flushDebounce();

      expect(hook2.current.filters.site).toBe('shared-site');
    });
  });
});
