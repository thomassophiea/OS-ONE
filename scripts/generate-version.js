#!/usr/bin/env node

/**
 * Generate version.json from git information
 * This script is run before and after the build to update version information
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function exec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8' }).trim();
  } catch (e) {
    return '';
  }
}

function generateVersion() {
  const commit = exec('git rev-parse --short HEAD') || 'unknown';
  const commitFull = exec('git rev-parse HEAD') || 'unknown';
  const commitCount = exec('git rev-list --count HEAD') || '0';
  const branch = exec('git rev-parse --abbrev-ref HEAD') || 'unknown';
  const commitDate = exec('git log -1 --format=%ci') || new Date().toISOString();
  const message = exec('git log -1 --format=%s') || 'No commit message';

  // Calculate cache version (commit count + 500 as base)
  const cacheVersion = parseInt(commitCount, 10) + 500;

  // Read existing features if version.json exists
  let features = [];
  const versionPath = resolve(__dirname, '..', 'public', 'version.json');
  if (existsSync(versionPath)) {
    try {
      const existing = JSON.parse(readFileSync(versionPath, 'utf-8'));
      features = existing.features || [];
    } catch (e) {
      // Ignore errors
    }
  }

  const versionInfo = {
    version: `v${commitCount}.${commit}`,
    commit,
    commitFull,
    commitCount,
    cacheVersion,
    branch,
    buildDate: new Date().toISOString(),
    commitDate,
    message,
    features
  };

  writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2));
  console.log(`Generated version.json: ${versionInfo.version} (cache: ${cacheVersion})`);
}

generateVersion();
