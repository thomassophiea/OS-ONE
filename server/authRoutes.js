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

/**
 * Discover the Campus Controller Inlets URL for a given XIQ account.
 * Calls XIQ's virtual-controllers API using the user's own token.
 *
 * @param {string} xiqToken   Valid XIQ access_token
 * @param {string} xiqBaseUrl e.g. 'https://cal-api.extremecloudiq.com'
 * @returns {Promise<string>} Controller base URL, e.g. 'https://calr1-inlets.extremecloudiq.com:5825'
 */
async function discoverControllerUrl(xiqToken, xiqBaseUrl) {
  const url = `${xiqBaseUrl}/xapi/v2/administration/virtualControllers`;
  logger.info(PREFIX, `Discovering controller URL from ${url}`);

  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${xiqToken}`, 'Accept': 'application/json' },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} from ${url}: ${text}`);
  }

  const data = await res.json();
  logger.info(PREFIX, `XIQ virtualControllers response: ${JSON.stringify(data)}`);

  // XIQ may wrap results in .data or return an array directly
  const controllers = Array.isArray(data) ? data : (data.data || data.virtualControllers || []);
  if (controllers.length === 0) {
    throw new Error('XIQ returned no virtual controllers for this account');
  }

  // Prefer a connected controller; fall back to the first entry
  const entry = controllers.find(c => c.status === 'CONNECTED' || c.connection_status === 'CONNECTED')
    || controllers[0];

  // Try multiple field names that XIQ might use for the management/tunnel URL
  const controllerUrl = entry.management_url || entry.mgmt_url || entry.tunnel_url
    || entry.portal_url || entry.sso_url || entry.url || entry.access_url;

  if (!controllerUrl) {
    throw new Error(`Could not find controller URL in entry: ${JSON.stringify(entry)}`);
  }

  return controllerUrl.replace(/\/$/, '');
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

    // Discover this customer's Campus Controller URL via XIQ, then exchange token
    let controllerToken = null;
    let controllerUrl = null;
    try {
      controllerUrl = await discoverControllerUrl(json.access_token, baseUrl);
      logger.info(PREFIX, `Discovered controller URL: ${controllerUrl}`);
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

export default router;
