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

/**
 * Exchange a XIQ access token for a Campus Controller OAuth2 token.
 * The controller validates the XIQ JWT and issues its own token.
 *
 * @param {string} xiqToken  Valid XIQ access_token from /login
 * @returns {Promise<string>} Controller access_token
 */
/**
 * Raw HTTP POST — captures body on any status code (unlike fetchJson which throws on 4xx).
 */
async function _rawPost(url, body, contentType) {
  if (typeof globalThis.fetch === 'function') {
    const res = await globalThis.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': contentType, 'Accept': 'application/json' },
      body,
    });
    const text = await res.text().catch(() => '');
    let json;
    try { json = JSON.parse(text); } catch { json = { _raw: text }; }
    return { status: res.status, json };
  }
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request({
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname,
      method: 'POST',
      headers: { 'Content-Type': contentType, 'Accept': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      rejectUnauthorized: false,
    }, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        let json;
        try { json = JSON.parse(data); } catch { json = { _raw: data }; }
        resolve({ status: res.statusCode, json });
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function exchangeXiqToken(xiqToken, controllerBaseUrl) {
  const baseUrl = controllerBaseUrl || config.inlets.baseUrl;
  if (!baseUrl) throw new Error('No controller URL provided and INLETS_CONTROLLER_BASE_URL is not configured');

  const tokenUrl = `${baseUrl}/management/v1/oauth2/token`;

  // Try 1: RFC 7523 JWT Bearer Grant (form-encoded — OAuth2 spec uses form encoding)
  logger.info(PREFIX, `Trying RFC 7523 form-encoded exchange at ${tokenUrl}`);
  const formBody = `grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')}&assertion=${encodeURIComponent(xiqToken)}`;
  let result = await _rawPost(tokenUrl, formBody, 'application/x-www-form-urlencoded');
  logger.info(PREFIX, `RFC 7523 form response: ${result.status} ${JSON.stringify(result.json)}`);

  if (result.status === 200 && result.json.access_token) {
    const expiresIn = (result.json.expires_in || 3600) - 60;
    _cachedToken = { accessToken: result.json.access_token, expiresAt: Date.now() + expiresIn * 1000 };
    logger.info(PREFIX, `Controller token via RFC 7523 form, expires in ${expiresIn}s`);
    return _cachedToken.accessToken;
  }

  // Try 2: RFC 7523 JSON body (some controllers prefer JSON)
  logger.info(PREFIX, `Trying RFC 7523 JSON exchange at ${tokenUrl}`);
  const jsonBody = JSON.stringify({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: xiqToken });
  result = await _rawPost(tokenUrl, jsonBody, 'application/json');
  logger.info(PREFIX, `RFC 7523 JSON response: ${result.status} ${JSON.stringify(result.json)}`);

  if (result.status === 200 && result.json.access_token) {
    const expiresIn = (result.json.expires_in || 3600) - 60;
    _cachedToken = { accessToken: result.json.access_token, expiresAt: Date.now() + expiresIn * 1000 };
    logger.info(PREFIX, `Controller token via RFC 7523 JSON, expires in ${expiresIn}s`);
    return _cachedToken.accessToken;
  }

  // Try 3: Password grant using CONTROLLER_USERNAME / CONTROLLER_PASSWORD env vars
  const { username, password } = config.inlets;
  if (username && password) {
    logger.info(PREFIX, `Trying password grant for ${username} at ${tokenUrl}`);
    const pwBody = JSON.stringify({ grant_type: 'password', username, password });
    result = await _rawPost(tokenUrl, pwBody, 'application/json');
    logger.info(PREFIX, `Password grant response: ${result.status} ${JSON.stringify(result.json)}`);

    if (result.status === 200 && result.json.access_token) {
      const expiresIn = (result.json.expires_in || 3600) - 60;
      _cachedToken = { accessToken: result.json.access_token, expiresAt: Date.now() + expiresIn * 1000 };
      logger.info(PREFIX, `Controller token via password grant, expires in ${expiresIn}s`);
      return _cachedToken.accessToken;
    }
  }

  throw new Error(`All token exchange methods failed. Last response: ${result.status} ${JSON.stringify(result.json)}`);
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

export { getToken, invalidateToken, exchangeXiqToken };
