/**
 * vitest.server.config.ts
 * Vitest configuration for server-side (Node.js) tests.
 * These run independently from the React/jsdom frontend tests.
 *
 * Usage: npx vitest run --config vitest.server.config.ts
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['server/__tests__/**/*.test.{js,ts}'],
    // No jsdom setupFiles — server tests are pure Node
  },
});
