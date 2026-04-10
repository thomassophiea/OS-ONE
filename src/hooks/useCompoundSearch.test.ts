import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCompoundSearch } from './useCompoundSearch';

type Item = { id: string; name: string; status: string };

const mockItems: Item[] = [
  { id: '1', name: 'Access Point 1', status: 'online' },
  { id: '2', name: 'Access Point 2', status: 'offline' },
  { id: '3', name: 'Device 1', status: 'online' },
];

describe('useCompoundSearch Hook', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('search functionality', () => {
    it('should filter items by name', () => {
      const { result } = renderHook(() =>
        useCompoundSearch<Item>({
          storageKey: 'test-search',
          fields: [(item) => item.name],
        })
      );

      act(() => {
        result.current.setQuery('Access Point');
      });

      expect(result.current.filterRows(mockItems)).toHaveLength(2);
    });

    it('should perform case-insensitive search', () => {
      const { result } = renderHook(() =>
        useCompoundSearch<Item>({
          storageKey: 'test-search-case',
          fields: [(item) => item.name],
        })
      );

      act(() => {
        result.current.setQuery('access point');
      });

      expect(result.current.filterRows(mockItems).length).toBeGreaterThan(0);
    });

    it('should reset search results via clearSearch', () => {
      const { result } = renderHook(() =>
        useCompoundSearch<Item>({
          storageKey: 'test-search-reset',
          fields: [(item) => item.name],
        })
      );

      act(() => {
        result.current.setQuery('Access Point');
      });

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.filterRows(mockItems)).toEqual(mockItems);
    });

    it('should return empty array for no matches', () => {
      const { result } = renderHook(() =>
        useCompoundSearch<Item>({
          storageKey: 'test-search-empty',
          fields: [(item) => item.name],
        })
      );

      act(() => {
        result.current.setQuery('nonexistent');
      });

      expect(result.current.filterRows(mockItems)).toHaveLength(0);
    });
  });

  describe('multi-field search', () => {
    it('should search across multiple fields', () => {
      const { result } = renderHook(() =>
        useCompoundSearch<Item>({
          storageKey: 'test-search-multi',
          fields: [(item) => item.name, (item) => item.status],
        })
      );

      act(() => {
        result.current.setQuery('online');
      });

      expect(result.current.filterRows(mockItems).length).toBeGreaterThanOrEqual(2);
    });

    it('should require all tokens to match (AND logic)', () => {
      const { result } = renderHook(() =>
        useCompoundSearch<Item>({
          storageKey: 'test-search-and',
          fields: [(item) => item.name, (item) => item.status],
        })
      );

      act(() => {
        result.current.setQuery('Access Point online');
      });

      // Only item 1 matches both "Access Point" and "online"
      const filtered = result.current.filterRows(mockItems);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });
  });

  describe('state', () => {
    it('should start with empty query and no active search', () => {
      const { result } = renderHook(() =>
        useCompoundSearch<Item>({
          storageKey: 'test-search-state',
          fields: [(item) => item.name],
        })
      );

      expect(result.current.query).toBe('');
      expect(result.current.hasActiveSearch).toBe(false);
    });

    it('should report hasActiveSearch true when query is non-empty', () => {
      const { result } = renderHook(() =>
        useCompoundSearch<Item>({
          storageKey: 'test-search-active',
          fields: [(item) => item.name],
        })
      );

      act(() => {
        result.current.setQuery('something');
      });

      expect(result.current.hasActiveSearch).toBe(true);
      expect(result.current.tokens).toEqual(['something']);
    });

    it('should expose filterRows that passes all items when no active search', () => {
      const { result } = renderHook(() =>
        useCompoundSearch<Item>({
          storageKey: 'test-search-passthrough',
          fields: [(item) => item.name],
        })
      );

      expect(result.current.filterRows(mockItems)).toHaveLength(mockItems.length);
    });
  });
});
