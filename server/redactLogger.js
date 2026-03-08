/**
 * server/redactLogger.js
 * Server-side logger with automatic secret redaction.
 * Redacts Bearer tokens, passwords, client secrets, and generic credential patterns
 * from any log output before it reaches stdout/stderr.
 */

// Patterns to redact — order matters (most specific first)
const REDACT_PATTERNS = [
  // Authorization headers (Bearer, Basic, etc.)
  { re: /(Authorization:\s*Bearer\s+)[A-Za-z0-9\-_=.+/]{8,}/gi, replace: '$1[REDACTED]' },
  { re: /(Authorization:\s*Basic\s+)[A-Za-z0-9+/=]{4,}/gi,      replace: '$1[REDACTED]' },
  // Bearer token in JSON/query
  { re: /("access_token"\s*:\s*")[^"]{8,}"/gi,                   replace: '$1[REDACTED]"' },
  { re: /("refresh_token"\s*:\s*")[^"]{8,}"/gi,                  replace: '$1[REDACTED]"' },
  { re: /(bearer\s+)[A-Za-z0-9\-_=.+/]{8,}/gi,                  replace: '$1[REDACTED]' },
  // Passwords in JSON bodies
  { re: /("password"\s*:\s*")[^"]{1,}"/gi,                       replace: '$1[REDACTED]"' },
  { re: /("client_secret"\s*:\s*")[^"]{1,}"/gi,                  replace: '$1[REDACTED]"' },
  // XIQ_BEARER_TOKEN value (if accidentally logged)
  ...(process.env.XIQ_BEARER_TOKEN && process.env.XIQ_BEARER_TOKEN.length > 8
    ? [{ re: new RegExp(escapeRegex(process.env.XIQ_BEARER_TOKEN), 'g'), replace: '[XIQ_TOKEN_REDACTED]' }]
    : []),
  // CONTROLLER_PASSWORD value
  ...(process.env.CONTROLLER_PASSWORD && process.env.CONTROLLER_PASSWORD.length > 3
    ? [{ re: new RegExp(escapeRegex(process.env.CONTROLLER_PASSWORD), 'g'), replace: '[CTRL_PASSWORD_REDACTED]' }]
    : []),
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function redact(value) {
  if (typeof value !== 'string') {
    try { value = JSON.stringify(value); } catch { value = String(value); }
  }
  for (const { re, replace } of REDACT_PATTERNS) {
    value = value.replace(re, replace);
  }
  return value;
}

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const configuredLevel = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info;

function shouldLog(level) {
  return (LEVELS[level] ?? 0) >= configuredLevel;
}

function fmt(level, prefix, ...args) {
  const ts = new Date().toISOString();
  return `[${ts}] [${level.toUpperCase()}] [${prefix}] ${args.map(redact).join(' ')}`;
}

const logger = {
  debug: (prefix, ...args) => { if (shouldLog('debug')) console.debug(fmt('debug', prefix, ...args)); },
  info:  (prefix, ...args) => { if (shouldLog('info'))  console.info(fmt('info',  prefix, ...args)); },
  warn:  (prefix, ...args) => { if (shouldLog('warn'))  console.warn(fmt('warn',  prefix, ...args)); },
  error: (prefix, ...args) => { if (shouldLog('error')) console.error(fmt('error', prefix, ...args)); },
};

export { logger, redact };
