/**
 * server/controllerClient.js
 * Campus Controller API client via Inlets tunnel.
 *
 * Authenticates with the controller's OAuth2 password-grant endpoint:
 *   POST /management/v1/oauth2/token
 *
 * The token is managed by tokenService.js and cached/auto-refreshed.
 * On 401, the token is invalidated and a single retry is attempted.
 *
 * Usage:
 *   import { controllerRequest } from './controllerClient.js';
 *   const aps = await controllerRequest('GET', '/management/v1/access-points');
 */

import https from 'https';
import { config } from './config.js';
import { logger } from './redactLogger.js';
import { getToken, invalidateToken } from './tokenService.js';

const PREFIX = 'ControllerClient';

// Accept self-signed certs on the Inlets tunnel (same as existing proxy behaviour)
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

/**
 * Make an authenticated request to the Campus Controller via the Inlets endpoint.
 *
 * @param {string} method     HTTP method
 * @param {string} path       API path, e.g. '/management/v1/aps'
 * @param {object} [body]     Optional JSON body
 * @param {object} [query]    Optional query params
 * @returns {Promise<{status: number, data: any}>}
 */
async function controllerRequest(method, path, body = null, query = {}) {
  if (!config.inlets.baseUrl) {
    throw new Error('INLETS_CONTROLLER_BASE_URL is not configured');
  }

  const qs = Object.keys(query).length
    ? '?' + new URLSearchParams(query).toString()
    : '';

  const url = `${config.inlets.baseUrl}${path}${qs}`;
  logger.info(PREFIX, `${method} ${url}`);

  const result = await _doRequest(method, url, body);

  // 401 → invalidate and retry once
  if (result.status === 401) {
    logger.warn(PREFIX, `401 on ${path} — invalidating token and retrying`);
    invalidateToken();
    return _doRequest(method, url, body);
  }

  logger.info(PREFIX, `${method} ${path} → ${result.status}`);
  return result;
}

/**
 * Health probe: attempts to reach the controller's token endpoint.
 * @returns {Promise<{reachable: boolean, status?: number, error?: string}>}
 */
async function controllerHealthCheck() {
  if (!config.inlets.baseUrl) {
    return { reachable: false, error: 'INLETS_CONTROLLER_BASE_URL not configured' };
  }
  try {
    const token = await getToken();
    // Simple GET to the root management path to verify connectivity
    const { status } = await controllerRequest('GET', '/management/v1/info');
    return { reachable: true, status };
  } catch (err) {
    logger.warn(PREFIX, 'Health check failed:', err.message);
    return { reachable: false, error: err.message };
  }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function _doRequest(method, url, body) {
  const token = await getToken();

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const fetchBody = body ? JSON.stringify(body) : undefined;
  if (fetchBody) headers['Content-Length'] = Buffer.byteLength(fetchBody);

  return _fetch(url, method, headers, fetchBody);
}

async function _fetch(url, method, headers, body) {
  if (typeof globalThis.fetch === 'function') {
    const res = await globalThis.fetch(url, {
      method,
      headers,
      body,
      // NODE_TLS_REJECT_UNAUTHORIZED=0 handles self-signed; native fetch has no agent param
    });
    let data;
    const ct = res.headers.get('content-type') || '';
    try {
      data = ct.includes('application/json') ? await res.json() : await res.text();
    } catch {
      data = null;
    }
    return { status: res.status, data };
  }

  // Fallback for older Node — use https module
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname + parsed.search,
      method,
      headers,
      agent: httpsAgent,
    };
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', c => { raw += c; });
      res.on('end', () => {
        let data;
        try { data = JSON.parse(raw); } catch { data = raw; }
        resolve({ status: res.statusCode, data });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

export { controllerRequest, controllerHealthCheck };
