/**
 * server/controllerRoutes.js
 * Express router for Campus Controller operations via Inlets tunnel.
 *
 * Mount point: /controller
 * All requests under /controller/* are forwarded server-side through Inlets.
 *
 * Routing rule: controller configuration, RF profiles, WLANs, runtime state → here.
 *
 * Examples:
 *   GET  /controller/management/v1/aps              → Controller GET /management/v1/aps
 *   POST /controller/management/v1/wlans            → Controller POST /management/v1/wlans
 *   GET  /controller/management/v1/rf-policies      → Controller GET /management/v1/rf-policies
 *   GET  /controller/platformmanager/v1/system/info → Controller GET /platformmanager/v1/system/info
 */

import express from 'express';
import { controllerRequest } from './controllerClient.js';
import { logger } from './redactLogger.js';

const PREFIX = 'ControllerRoutes';
const router = express.Router();

// Generic passthrough: forward any method + path to the controller via Inlets
router.all('*', async (req, res) => {
  const controllerPath = req.path || '/';
  const method = req.method;

  logger.info(PREFIX, `${method} /controller${controllerPath} → Inlets`);

  try {
    const body = ['GET', 'HEAD', 'DELETE'].includes(method) ? null : req.body;
    const query = req.query;

    const { status, data } = await controllerRequest(method, controllerPath, body, query);

    res.status(status).json(data);
  } catch (err) {
    logger.error(PREFIX, `${method} ${controllerPath} failed:`, err.message);
    res.status(502).json({
      error: 'Controller request failed',
      message: err.message,
      path: controllerPath,
    });
  }
});

export default router;
