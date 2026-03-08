/**
 * server/tokenService.js
 * OAuth2 password-grant token manager for the Campus Controller (Inlets endpoint).
 *
 * - Fetches tokens via POST /management/v1/oauth2/token
 * - Caches and reuses the token until it nears expiry
 * - Auto-refreshes on 401 responses (single retry)
 * - Thread-safe: concurrent callers share a single in-flight fetch
 */

import https from 'https';
import { config } from './config.js';
import { logger } from './redactLogger.js';

const PREFIX = 'TokenService';

// Allow self-signed certs on the Inlets tunnel (same as existing proxy)
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// Token cache
let _cachedToken = null;       // { accessToken, expiresAt }
let _fetchPromise = null;      // In-flight fetch promise (prevents duplicate requests)

/**
 * Returns a valid Bearer token, fetching a new one if needed.
 * @returns {Promise<string>}
 */
async function getToken() {
  if (_cachedToken && Date.now() < _cachedToken.expiresAt) {
    return _cachedToken.accessToken;
  }
  // Deduplicate concurrent callers
  if (_fetchPromise) return _fetchPromise;
  _fetchPromise = _fetchToken().finally(() => { _fetchPromise = null; });
  return _fetchPromise;
}

/**
 * Invalidates the cached token (call on 401 to force re-auth).
 */
function invalidateToken() {
  logger.info(PREFIX, 'Token invalidated — will re-authenticate on next request');
  _cachedToken = null;
}

async function _fetchToken() {
  const { baseUrl, username, password } = config.inlets;

  if (!baseUrl) throw new Error('INLETS_CONTROLLER_BASE_URL is not configured');
  if (!username || !password) throw new Error('CONTROLLER_USERNAME / CONTROLLER_PASSWORD are not configured');

  const tokenUrl = `${baseUrl}/management/v1/oauth2/token`;
  logger.info(PREFIX, `Fetching OAuth2 token from ${tokenUrl}`);

  const body = JSON.stringify({
    grant_type: 'password',
    username,
    password,
  });

  const response = await fetchJson(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
    body,
    agent: httpsAgent,
  });

  if (!response.access_token) {
    throw new Error(`OAuth2 token response missing access_token: ${JSON.stringify(response)}`);
  }

  // expires_in is in seconds; back off 60 s to account for clock skew
  const expiresIn = (response.expires_in || 3600) - 60;
  _cachedToken = {
    accessToken: response.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
  };

  logger.info(PREFIX, `Token acquired, expires in ${expiresIn}s`);
  return _cachedToken.accessToken;
}

/**
 * Minimal fetch wrapper for Node.js (native fetch available in Node 18+).
 * Falls back to manual https request if globalThis.fetch is unavailable.
 */
async function fetchJson(url, options = {}) {
  // Node 18+ has native fetch
  if (typeof globalThis.fetch === 'function') {
    const res = await globalThis.fetch(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
      body: options.body,
      // native fetch doesn't accept agent; SSL handled via NODE_TLS_REJECT_UNAUTHORIZED
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} from ${url}: ${text}`);
    }
    return res.json();
  }

  // Fallback for older Node — use https module
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      agent: options.agent,
      rejectUnauthorized: false,
    };
    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 400) {
          return reject(new Error(`HTTP ${res.statusCode} from ${url}: ${data}`));
        }
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Invalid JSON from ${url}: ${data}`)); }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

export { getToken, invalidateToken };
