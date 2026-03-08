/**
 * server/authRoutes.js
 * Authentication routes — XIQ login proxy.
 *
 * POST /auth/xiq-login
 *   Body: { username, password, region? }
 *   → calls POST {regionUrl}/login on ExtremeCloud IQ
 *   → returns { access_token, token_type } to the client
 */

import express from 'express';
import { logger } from './redactLogger.js';
import { exchangeXiqToken } from './tokenService.js';

const PREFIX = 'AuthRoutes';
const router = express.Router();

// Browser-like UA so Inlets nginx doesn't 403 server-side requests
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

/**
 * Derive the Campus Controller Inlets URL from the XIQ JWT payload.
 *
 * XIQ access tokens contain a `data_center` claim (e.g. "CALR1", "US1", "EU1").
 * The corresponding Inlets tunnel follows the pattern:
 *   https://{data_center.toLowerCase()}-inlets.extremecloudiq.com:5825
 *
 * @param {string} xiqToken  XIQ access_token (JWT)
 * @returns {string} Controller base URL
 */
function controllerUrlFromToken(xiqToken) {
  // JWT payload is the second base64url-encoded segment
  const parts = xiqToken.split('.');
  if (parts.length < 2) throw new Error('xiqToken is not a valid JWT');

  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  logger.info(PREFIX, `XIQ JWT claims: data_center=${payload.data_center} customer_id=${payload.customer_id}`);

  const dc = payload.data_center;
  if (!dc) throw new Error(`XIQ JWT missing data_center claim: ${JSON.stringify(payload)}`);

  return `https://${dc.toLowerCase()}-inlets.extremecloudiq.com:5825`;
}

const REGION_URLS = {
  'Global':     'https://api.extremecloudiq.com',
  'EU':         'https://api-eu.extremecloudiq.com',
  'APAC':       'https://api-apac.extremecloudiq.com',
  'California': 'https://cal-api.extremecloudiq.com',
};

/**
 * POST /auth/xiq-login
 * Validates XIQ credentials and returns the access token to the client.
 */
router.post('/xiq-login', async (req, res) => {
  const { username, password, region = 'California' } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const baseUrl = REGION_URLS[region] || REGION_URLS['California'];
  const loginUrl = `${baseUrl}/login`;

  logger.info(PREFIX, `XIQ login attempt for ${username} → ${loginUrl}`);

  try {
    const upstream = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    let json;
    try { json = await upstream.json(); } catch { json = {}; }

    if (!upstream.ok) {
      logger.warn(PREFIX, `XIQ login failed for ${username}: HTTP ${upstream.status}`);
      return res.status(upstream.status).json({
        error: upstream.status === 401 ? 'Invalid username or password' : 'XIQ login failed',
        details: json,
      });
    }

    if (!json.access_token) {
      return res.status(502).json({ error: 'XIQ returned no access_token', details: json });
    }

    logger.info(PREFIX, `XIQ login successful for ${username}`);

    // Derive controller URL from JWT data_center claim, then exchange token
    let controllerToken = null;
    let controllerUrl = null;
    try {
      controllerUrl = controllerUrlFromToken(json.access_token);
      logger.info(PREFIX, `Derived controller URL from JWT: ${controllerUrl}`);
      controllerToken = await exchangeXiqToken(json.access_token, controllerUrl);
      logger.info(PREFIX, 'Controller token obtained via XIQ token exchange');
    } catch (err) {
      logger.warn(PREFIX, `Controller setup failed (will use XIQ token as fallback): ${err.message}`);
    }

    res.json({
      xiq_access_token: json.access_token,
      xiq_token_type: json.token_type || 'Bearer',
      controller_token: controllerToken,
      controller_url: controllerUrl,
    });
  } catch (err) {
    logger.error(PREFIX, `XIQ login error: ${err.message}`);
    res.status(502).json({ error: 'Could not reach ExtremeCloud IQ', message: err.message });
  }
});

/**
 * GET /auth/diagnose
 * Shows exactly what happens during token exchange — call this after login
 * to see the raw controller response and diagnose auth issues.
 *
 * Requires: Authorization: Bearer <xiq_access_token>
 */
router.get('/diagnose', async (req, res) => {
  const xiqToken = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!xiqToken) {
    return res.status(400).json({ error: 'Send your XIQ token as Authorization: Bearer <token>' });
  }

  const result = { xiq_token_prefix: xiqToken.substring(0, 20) + '...' };

  // Step 1: Decode JWT
  try {
    const parts = xiqToken.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    result.jwt_claims = {
      sub: payload.sub,
      data_center: payload.data_center,
      customer_id: payload.customer_id,
      role: payload.role,
      iss: payload.iss,
      exp: new Date(payload.exp * 1000).toISOString(),
    };
    result.derived_controller_url = `https://${payload.data_center.toLowerCase()}-inlets.extremecloudiq.com:5825`;
  } catch (e) {
    result.jwt_decode_error = e.message;
    return res.json(result);
  }

  const controllerUrl = result.derived_controller_url;
  const tokenUrl = `${controllerUrl}/management/v1/oauth2/token`;

  // Step 2: Try RFC 7523 exchange — capture raw response regardless of status
  try {
    const body = JSON.stringify({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: xiqToken,
    });
    const raw = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'User-Agent': BROWSER_UA },
      body,
    });
    const text = await raw.text().catch(() => '');
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = text; }
    result.token_exchange = { status: raw.status, body: parsed };
  } catch (e) {
    result.token_exchange = { error: e.message };
  }

  // Step 3: Try a test GET to the controller with the XIQ token
  try {
    const raw = await fetch(`${controllerUrl}/management/v1/administrators`, {
      headers: { 'Authorization': `Bearer ${xiqToken}`, 'Accept': 'application/json', 'User-Agent': BROWSER_UA },
    });
    const text = await raw.text().catch(() => '');
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = text.substring(0, 200); }
    result.test_request_xiq_token = { status: raw.status, body: parsed };
  } catch (e) {
    result.test_request_xiq_token = { error: e.message };
  }

  res.json(result);
});

export default router;
