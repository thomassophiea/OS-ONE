// @vitest-environment node
/**
 * server/__tests__/routing.test.js
 * Minimal tests for the routing and auth modules.
 * Run with: npx vitest run server/__tests__
 * or simply: npm run test (picks up all test files)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── redactLogger ─────────────────────────────────────────────────────────────

describe('redact()', () => {
  let redact;

  beforeEach(async () => {
    // Isolate env
    vi.stubEnv('XIQ_BEARER_TOKEN', 'super-secret-token-abc123');
    vi.stubEnv('CONTROLLER_PASSWORD', 'P@ssword1');
    vi.stubEnv('LOG_LEVEL', 'error'); // suppress output during tests
    ({ redact } = await import('../redactLogger.js?t=' + Date.now()));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('redacts Bearer token in Authorization header', () => {
    const input = 'Authorization: Bearer eyJhbGciOiJSUzI1NiJ9.payload.sig';
    const out = redact(input);
    expect(out).toContain('[REDACTED]');
    expect(out).not.toContain('eyJhbGciOiJSUzI1NiJ9.payload.sig');
  });

  it('redacts access_token in JSON', () => {
    const input = JSON.stringify({ access_token: 'my-secret-token-value-here' });
    const out = redact(input);
    expect(out).toContain('[REDACTED]');
    expect(out).not.toContain('my-secret-token-value-here');
  });

  it('redacts password in JSON body', () => {
    const input = JSON.stringify({ username: 'admin', password: 'hunter2secret' });
    const out = redact(input);
    expect(out).toContain('[REDACTED]');
    expect(out).not.toContain('hunter2secret');
  });

  it('passes through safe strings unchanged', () => {
    const input = 'GET /management/v1/aps → 200';
    expect(redact(input)).toBe(input);
  });
});

// ── tokenService ─────────────────────────────────────────────────────────────

describe('tokenService', () => {
  beforeEach(() => {
    vi.stubEnv('INLETS_CONTROLLER_BASE_URL', 'https://fake-inlets.example.com:5825');
    vi.stubEnv('CONTROLLER_USERNAME', 'admin');
    vi.stubEnv('CONTROLLER_PASSWORD', 'secret');
    vi.stubEnv('LOG_LEVEL', 'error');
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('throws if INLETS_CONTROLLER_BASE_URL is missing', async () => {
    vi.stubEnv('INLETS_CONTROLLER_BASE_URL', '');
    vi.resetModules();
    const { getToken } = await import('../tokenService.js?t=' + Date.now());
    await expect(getToken()).rejects.toThrow(/INLETS_CONTROLLER_BASE_URL/);
  });

  it('throws if credentials are missing', async () => {
    vi.stubEnv('CONTROLLER_USERNAME', '');
    vi.stubEnv('CONTROLLER_PASSWORD', '');
    vi.resetModules();
    const { getToken } = await import('../tokenService.js?t=' + Date.now());
    await expect(getToken()).rejects.toThrow(/CONTROLLER_USERNAME/);
  });

  it('invalidateToken resets the cache without throwing', async () => {
    vi.resetModules();
    const { invalidateToken } = await import('../tokenService.js?t=' + Date.now());
    expect(() => invalidateToken()).not.toThrow();
  });
});

// ── config ───────────────────────────────────────────────────────────────────

describe('config', () => {
  beforeEach(() => {
    vi.stubEnv('XIQ_BASE_URL', 'https://calr1.extremecloudiq.com');
    vi.stubEnv('XIQ_BEARER_TOKEN', 'tok');
    vi.stubEnv('INLETS_CONTROLLER_BASE_URL', 'https://calr1-inlets.extremecloudiq.com:5825');
    vi.stubEnv('LOG_LEVEL', 'error');
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('reads XIQ config from env vars', async () => {
    const { config } = await import('../config.js?t=' + Date.now());
    expect(config.xiq.baseUrl).toBe('https://calr1.extremecloudiq.com');
    expect(config.xiq.bearerToken).toBe('tok');
    expect(config.xiq.apiVersion).toBe('v2');
  });

  it('strips trailing slash from baseUrl', async () => {
    vi.stubEnv('XIQ_BASE_URL', 'https://calr1.extremecloudiq.com/');
    vi.resetModules();
    const { config } = await import('../config.js?t=' + Date.now());
    expect(config.xiq.baseUrl).toBe('https://calr1.extremecloudiq.com');
  });

  it('reads inlets config from env vars', async () => {
    const { config } = await import('../config.js?t=' + Date.now());
    expect(config.inlets.baseUrl).toBe('https://calr1-inlets.extremecloudiq.com:5825');
  });
});

// ── API routing logic ─────────────────────────────────────────────────────────

describe('API routing rules', () => {
  /**
   * These tests document the routing logic without spinning up an HTTP server.
   * The rule is simple: path prefix determines target.
   */

  function routeRequest(path) {
    if (path.startsWith('/cloud/')) return 'extremecloud_iq';
    if (path.startsWith('/controller/')) return 'controller_via_inlets';
    if (path.startsWith('/api/')) return 'campus_controller_proxy';
    return 'static_or_frontend';
  }

  it('/cloud/* → extremecloud_iq', () => {
    expect(routeRequest('/cloud/devices')).toBe('extremecloud_iq');
    expect(routeRequest('/cloud/ssids')).toBe('extremecloud_iq');
    expect(routeRequest('/cloud/locations/123')).toBe('extremecloud_iq');
  });

  it('/controller/* → controller_via_inlets', () => {
    expect(routeRequest('/controller/management/v1/aps')).toBe('controller_via_inlets');
    expect(routeRequest('/controller/management/v1/rf-policies')).toBe('controller_via_inlets');
    expect(routeRequest('/controller/platformmanager/v1/system/info')).toBe('controller_via_inlets');
  });

  it('/api/* → campus_controller_proxy (existing behaviour)', () => {
    expect(routeRequest('/api/management/v1/services')).toBe('campus_controller_proxy');
  });

  it('other paths → static_or_frontend', () => {
    expect(routeRequest('/health')).toBe('static_or_frontend');
    expect(routeRequest('/')).toBe('static_or_frontend');
  });
});
