/**
 * server/xiqClient.js
 * ExtremeCloud IQ (XIQ) REST API client.
 *
 * Authenticates via Bearer token (XIQ_BEARER_TOKEN env var).
 * All requests go to https://calr1.extremecloudiq.com/xapi/{version}/...
 *
 * Usage:
 *   import { xiqRequest } from './xiqClient.js';
 *   const devices = await xiqRequest('GET', '/devices');
 */

import https from 'https';
import { config } from './config.js';
import { logger } from './redactLogger.js';
import { getXiqToken, invalidateXiqToken } from './xiqTokenService.js';

const PREFIX = 'XIQClient';

// XIQ uses publicly trusted TLS — enforce cert validation
const httpsAgent = new https.Agent({ rejectUnauthorized: true });

/**
 * Make an authenticated request to ExtremeCloud IQ.
 *
 * @param {string} method   HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @param {string} path     API path, e.g. '/devices' or '/ssids'
 * @param {object} [body]   Optional request body (will be JSON-encoded)
 * @param {object} [query]  Optional query params as a plain object
 * @returns {Promise<{status: number, data: any}>}
 */
async function xiqRequest(method, path, body = null, query = {}) {
  const qs = Object.keys(query).length
    ? '?' + new URLSearchParams(query).toString()
    : '';

  const url = `${config.xiq.baseUrl}/xapi/${config.xiq.apiVersion}${path}${qs}`;
  logger.info(PREFIX, `${method} ${url}`);

  const result = await _doRequest(method, url, body);

  // 401 → invalidate token and retry once
  if (result.status === 401) {
    logger.warn(PREFIX, `401 on ${path} — invalidating token and retrying`);
    invalidateXiqToken();
    return _doRequest(method, url, body);
  }

  logger.info(PREFIX, `${method} ${path} → ${result.status}`);
  return result;
}

async function _doRequest(method, url, body) {
  const token = await getXiqToken();

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const fetchBody = body ? JSON.stringify(body) : undefined;
  if (fetchBody) headers['Content-Length'] = Buffer.byteLength(fetchBody);

  return _fetch(url, method, headers, fetchBody);
}

/**
 * Health probe for XIQ: pings the devices endpoint.
 * @returns {Promise<{reachable: boolean, status?: number, error?: string}>}
 */
async function xiqHealthCheck() {
  try {
    const { status } = await xiqRequest('GET', '/devices', null, { limit: 1 });
    return { reachable: true, status };
  } catch (err) {
    logger.warn(PREFIX, 'Health check failed:', err.message);
    return { reachable: false, error: err.message };
  }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function _fetch(url, method, headers, body) {
  if (typeof globalThis.fetch === 'function') {
    const res = await globalThis.fetch(url, { method, headers, body });
    let data;
    const ct = res.headers.get('content-type') || '';
    try {
      data = ct.includes('application/json') ? await res.json() : await res.text();
    } catch {
      data = null;
    }
    return { status: res.status, data };
  }

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

export { xiqRequest, xiqHealthCheck };
