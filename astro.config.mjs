// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// Skip the Cloudflare adapter when Vitest loads the config — its Vite plugin
// trips on the Workers environment Vitest creates. The adapter is only needed
// for dev/build/deploy, not for unit tests that render components in isolation.
const isVitest = !!process.env.VITEST;

// https://astro.build/config
export default defineConfig({
  site: 'https://eleraconstruction.com',
  output: 'static',
  ...(isVitest ? {} : { adapter: cloudflare() }),
  vite: { plugins: [tailwindcss()] },
});
