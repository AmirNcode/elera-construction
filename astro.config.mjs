// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

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
  integrations: [
    mdx(),
    sitemap({
      // Drop pages we don't want indexed even though noindex is also set.
      filter: (page) => !page.includes('/thank-you') && !page.includes('/admin'),
    }),
  ],
});