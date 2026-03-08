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

    // Exchange XIQ token for a Campus Controller token (RFC 7523 JWT Bearer Grant)
    let controllerToken = null;
    try {
      controllerToken = await exchangeXiqToken(json.access_token);
      logger.info(PREFIX, 'Controller token obtained via XIQ token exchange');
    } catch (err) {
      logger.warn(PREFIX, `Controller token exchange failed (will use XIQ token as fallback): ${err.message}`);
    }

    res.json({
      xiq_access_token: json.access_token,
      xiq_token_type: json.token_type || 'Bearer',
      controller_token: controllerToken,
    });
  } catch (err) {
    logger.error(PREFIX, `XIQ login error: ${err.message}`);
    res.status(502).json({ error: 'Could not reach ExtremeCloud IQ', message: err.message });
  }
});

export default router;
