/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';
import path from 'node:path';

export default getViteConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,astro}'],
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
});
