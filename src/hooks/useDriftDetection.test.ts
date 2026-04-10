import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDriftDetection } from './useDriftDetection';

vi.mock('../services/driftDetectionService', () => ({
  driftDetectionService: {
    checkAll: vi.fn(),
    checkTemplate: vi.fn(),
  },
}));

const emptyArgs = [[], [], [], [], []] as const;

describe('useDriftDetection Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with no drift data', () => {
    const { result } = renderHook(() => useDriftDetection(...emptyArgs));

    expect(result.current.summary).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should expose checkAll and checkTemplate functions', () => {
    const { result } = renderHook(() => useDriftDetection(...emptyArgs));

    expect(typeof result.current.checkAll).toBe('function');
    expect(typeof result.current.checkTemplate).toBe('function');
  });

  it('should set loading true while checkAll is in progress', async () => {
    const { driftDetectionService } = await import('../services/driftDetectionService');
    let resolve: (v: any) => void;

    (driftDetectionService.checkAll as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      new Promise(r => { resolve = r; })
    );

    const { result } = renderHook(() => useDriftDetection(...emptyArgs));

    act(() => {
      result.current.checkAll();
    });

    expect(result.current.loading).toBe(true);

    // Clean up
    resolve!({
      total: 0, in_sync: 0, drifted: 0, missing: 0, errors: 0,
      results: [], checked_at: new Date().toISOString(),
    });
  });

  it('should populate summary after checkAll completes', async () => {
    const { driftDetectionService } = await import('../services/driftDetectionService');
    const mockSummary = {
      total: 3,
      in_sync: 2,
      drifted: 1,
      missing: 0,
      errors: 0,
      results: [],
      checked_at: new Date().toISOString(),
    };

    (driftDetectionService.checkAll as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockSummary);

    const { result } = renderHook(() => useDriftDetection(...emptyArgs));

    await act(async () => {
      await result.current.checkAll();
    });

    expect(result.current.summary).toEqual(mockSummary);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set error when checkAll throws', async () => {
    const { driftDetectionService } = await import('../services/driftDetectionService');

    (driftDetectionService.checkAll as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Controller unreachable')
    );

    const { result } = renderHook(() => useDriftDetection(...emptyArgs));

    await act(async () => {
      await result.current.checkAll();
    });

    expect(result.current.error).toBe('Controller unreachable');
    expect(result.current.loading).toBe(false);
    expect(result.current.summary).toBeNull();
  });

  it('should populate summary after checkTemplate completes', async () => {
    const { driftDetectionService } = await import('../services/driftDetectionService');
    const mockResults = [
      { template_id: 't1', status: 'in_sync', scope_id: 'sg-1', scope_name: 'Region 1' },
      { template_id: 't1', status: 'drifted', scope_id: 'sg-2', scope_name: 'Region 2' },
    ];

    (driftDetectionService.checkTemplate as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockResults
    );

    const { result } = renderHook(() => useDriftDetection(...emptyArgs));

    await act(async () => {
      await result.current.checkTemplate({ id: 't1', name: 'Test', element_type: 'rf_policy' } as any);
    });

    expect(result.current.summary).not.toBeNull();
    expect(result.current.summary?.total).toBe(2);
    expect(result.current.summary?.in_sync).toBe(1);
    expect(result.current.summary?.drifted).toBe(1);
    expect(result.current.loading).toBe(false);
  });
});
