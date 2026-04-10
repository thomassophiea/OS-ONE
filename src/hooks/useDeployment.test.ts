import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDeployTemplate, useDeploymentHistory } from './useDeployment';

vi.mock('../services/deploymentService', () => ({
  deploymentService: {
    deployTemplate: vi.fn(),
    saveRecord: vi.fn().mockResolvedValue(undefined),
    getHistory: vi.fn(),
  },
}));

describe('useDeployTemplate Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with idle state', () => {
    const { result } = renderHook(() => useDeployTemplate());

    expect(result.current.isDeploying).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should expose a deploy function', () => {
    const { result } = renderHook(() => useDeployTemplate());

    expect(typeof result.current.deploy).toBe('function');
  });

  it('should set isDeploying true during deployment', async () => {
    const { deploymentService } = await import('../services/deploymentService');
    let resolve: (value: any) => void;

    (deploymentService.deployTemplate as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      new Promise(r => {
        resolve = r;
      })
    );

    const { result } = renderHook(() => useDeployTemplate());

    act(() => {
      result.current.deploy(
        { id: 't1', name: 'Test', element_type: 'rf_policy' } as any,
        [],
        [],
        {} as any,
        {} as any,
        'org-1'
      );
    });

    expect(result.current.isDeploying).toBe(true);

    // Clean up: resolve the promise
    resolve!({
      status: 'success',
      scope_type: 'site_group',
      scope_id: 'sg-1',
      scope_name: 'Region 1',
      completed_at: new Date().toISOString(),
    });
  });

  it('should populate result after successful deployment', async () => {
    const { deploymentService } = await import('../services/deploymentService');
    const mockResult = {
      status: 'success',
      scope_type: 'site_group',
      scope_id: 'sg-1',
      scope_name: 'Region 1',
      completed_at: new Date().toISOString(),
    };

    (deploymentService.deployTemplate as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResult);

    const { result } = renderHook(() => useDeployTemplate());

    await act(async () => {
      await result.current.deploy(
        { id: 't1', name: 'Test', element_type: 'rf_policy' } as any,
        [],
        [],
        {} as any,
        {} as any,
        'org-1'
      );
    });

    expect(result.current.isDeploying).toBe(false);
    expect(result.current.result).toEqual(mockResult);
    expect(result.current.error).toBeNull();
  });

  it('should set error on failed deployment', async () => {
    const { deploymentService } = await import('../services/deploymentService');

    (deploymentService.deployTemplate as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => useDeployTemplate());

    await act(async () => {
      try {
        await result.current.deploy(
          { id: 't1', name: 'Test', element_type: 'rf_policy' } as any,
          [],
          [],
          {} as any,
          {} as any,
          'org-1'
        );
      } catch {
        // expected throw
      }
    });

    expect(result.current.isDeploying).toBe(false);
    expect(result.current.error).toBe('Network error');
  });
});

describe('useDeploymentHistory Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty records and not loading when no orgId', () => {
    const { result } = renderHook(() => useDeploymentHistory(undefined));

    expect(result.current.records).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('should fetch history when orgId is provided', async () => {
    const { deploymentService } = await import('../services/deploymentService');
    const mockRecords = [
      { id: '1', template_name: 'Test Template', status: 'success', deployed_at: new Date().toISOString() },
    ];

    (deploymentService.getHistory as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockRecords);

    const { result } = renderHook(() => useDeploymentHistory('org-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(deploymentService.getHistory).toHaveBeenCalledWith('org-1');
    expect(result.current.records).toEqual(mockRecords);
  });

  it('should expose a refresh function', () => {
    const { result } = renderHook(() => useDeploymentHistory('org-1'));

    expect(typeof result.current.refresh).toBe('function');
  });

  it('should handle history fetch errors gracefully', async () => {
    const { deploymentService } = await import('../services/deploymentService');
    (deploymentService.getHistory as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Fetch failed')
    );

    const { result } = renderHook(() => useDeploymentHistory('org-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should fail silently — records remain empty
    expect(result.current.records).toEqual([]);
  });
});
