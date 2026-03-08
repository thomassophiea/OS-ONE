/**
 * server/xiqTokenService.js
 * ExtremeCloud IQ token manager.
 *
 * Authenticates via POST /login on cal-api.extremecloudiq.com:
 *   { username, password } → { access_token, expires_in }
 *
 * - Caches and reuses the token until it nears expiry
 * - Concurrent callers share a single in-flight fetch (no duplicate logins)
 */

import { config } from './config.js';
import { logger } from './redactLogger.js';

const PREFIX = 'XIQTokenService';

let _cachedToken = null;   // { accessToken, expiresAt }
let _fetchPromise = null;  // In-flight login promise

/**
 * Returns a valid XIQ Bearer token, logging in if needed.
 * @returns {Promise<string>}
 */
async function getXiqToken() {
  if (_cachedToken && Date.now() < _cachedToken.expiresAt) {
    return _cachedToken.accessToken;
  }
  if (_fetchPromise) return _fetchPromise;
  _fetchPromise = _login().finally(() => { _fetchPromise = null; });
  return _fetchPromise;
}

/**
 * Invalidates the cached token (call on 401 to force re-login).
 */
function invalidateXiqToken() {
  logger.info(PREFIX, 'Token invalidated — will re-login on next request');
  _cachedToken = null;
}

async function _login() {
  const { baseUrl, username, password } = config.xiq;

  if (!username || !password) {
    throw new Error('XIQ_USERNAME / XIQ_PASSWORD are not configured');
  }

  const loginUrl = `${baseUrl}/login`;
  logger.info(PREFIX, `Logging in to ${loginUrl}`);

  const body = JSON.stringify({ username, password });

  const res = await fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body,
  });

  let json;
  try { json = await res.json(); } catch { json = {}; }

  if (!res.ok || !json.access_token) {
    throw new Error(`XIQ login failed (HTTP ${res.status}): ${JSON.stringify(json)}`);
  }

  // XIQ does not always return expires_in — default to 1 hour with 60 s buffer
  const expiresIn = (json.expires_in ?? 3600) - 60;
  _cachedToken = {
    accessToken: json.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
  };

  logger.info(PREFIX, `Logged in, token expires in ${expiresIn}s`);
  return _cachedToken.accessToken;
}

export { getXiqToken, invalidateXiqToken };
