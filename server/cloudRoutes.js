/**
 * server/cloudRoutes.js
 * Express router for ExtremeCloud IQ operations.
 *
 * Mount point: /cloud
 * All requests under /cloud/* are forwarded server-side to XIQ.
 *
 * Routing rule: cloud inventory, devices, SSIDs, cloud services → here.
 *
 * Examples:
 *   GET  /cloud/devices           → XIQ GET /xapi/v2/devices
 *   GET  /cloud/devices/12345     → XIQ GET /xapi/v2/devices/12345
 *   POST /cloud/ssids             → XIQ POST /xapi/v2/ssids
 *   GET  /cloud/locations         → XIQ GET /xapi/v2/locations
 */

import express from 'express';
import { xiqRequest } from './xiqClient.js';
import { logger } from './redactLogger.js';

const PREFIX = 'CloudRoutes';
const router = express.Router();

// Generic passthrough: forward any method + path to XIQ
router.all('*', async (req, res) => {
  const xiqPath = req.path || '/';
  const method = req.method;

  logger.info(PREFIX, `${method} /cloud${xiqPath} → XIQ`);

  try {
    const body = ['GET', 'HEAD', 'DELETE'].includes(method) ? null : req.body;
    const query = req.query;

    const { status, data } = await xiqRequest(method, xiqPath, body, query);

    res.status(status).json(data);
  } catch (err) {
    logger.error(PREFIX, `${method} ${xiqPath} failed:`, err.message);
    res.status(502).json({
      error: 'XIQ request failed',
      message: err.message,
      path: xiqPath,
    });
  }
});

export default router;
