/**
 * server/config.js
 * Validates and exports all environment variables required for XIQ and Inlets integration.
 * Missing required vars are reported clearly at startup; missing optional vars are warned.
 */

const REQUIRED = [
  'INLETS_CONTROLLER_BASE_URL',
];

const OPTIONAL = [
  'XIQ_BASE_URL',             // defaults to 'https://cal-api.extremecloudiq.com'
  'XIQ_API_VERSION',          // defaults to 'v2'
  'XIQ_USERNAME',             // server-side XIQ token (health checks only)
  'XIQ_PASSWORD',             // server-side XIQ token (health checks only)
  'CONTROLLER_USERNAME',      // password-grant fallback for controller token
  'CONTROLLER_PASSWORD',      // password-grant fallback for controller token
  'LOG_LEVEL',                // defaults to 'info'
];

function validateEnv() {
  const missing = REQUIRED.filter(k => !process.env[k]);
  if (missing.length > 0) {
    console.error('[Config] ✗ Missing required environment variables:');
    missing.forEach(k => console.error(`  - ${k}`));
    console.error('[Config] XIQ and Inlets integration will not function until these are set.');
  } else {
    console.log('[Config] ✓ All required XIQ/Inlets environment variables present');
  }

  OPTIONAL.forEach(k => {
    if (!process.env[k]) {
      console.warn(`[Config] ⚠  Optional env var not set: ${k}`);
    }
  });

  return missing.length === 0;
}

const config = {
  // ExtremeCloud IQ
  xiq: {
    baseUrl: (process.env.XIQ_BASE_URL || 'https://cal-api.extremecloudiq.com').replace(/\/$/, ''),
    apiVersion: process.env.XIQ_API_VERSION || 'v2',
    username: process.env.XIQ_USERNAME || '',
    password: process.env.XIQ_PASSWORD || '',
  },

  // Campus Controller via Inlets tunnel
  inlets: {
    baseUrl: (process.env.INLETS_CONTROLLER_BASE_URL || '').replace(/\/$/, ''),
    clientId: process.env.CONTROLLER_CLIENT_ID || '',
    clientSecret: process.env.CONTROLLER_CLIENT_SECRET || '',
    username: process.env.CONTROLLER_USERNAME || '',
    password: process.env.CONTROLLER_PASSWORD || '',
  },

  // General
  logLevel: process.env.LOG_LEVEL || 'info',
  apiGatewayBaseUrl: process.env.API_GATEWAY_BASE_URL || '',
};

validateEnv();

export { config, validateEnv };
