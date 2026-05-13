# Foundation & Design System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Elera Construction Astro project and build every reusable visual primitive — design tokens, fonts, layout chrome, brand logo, UI components, section components, navigation, footer, mobile sticky bar — leaving a navigable site shell ready to receive content in Plan 2.

**Architecture:** Astro 6 (static-first, with per-route opt-out for SSR later) on Cloudflare Pages. Tailwind CSS v4 via the official `@tailwindcss/vite` plugin. CSS custom properties carry brand tokens, mapped into Tailwind's `@theme` block. Inter variable font self-hosted via `@fontsource-variable/inter`. Components are Astro components (`.astro`), with islands only for interactive UI (mobile nav, FAQ accordion). TDD where logic exists; for components, tests assert that the rendered HTML contains the expected structure, classes, and text via Astro's Container API.

**Tech Stack:** Astro 6 (Astro 5 features confirmed: `output: 'static'` default with per-route SSR opt-out, `@tailwindcss/vite` plugin, Content Collections at `src/content.config.ts`, `astro:env/server` API — all carried into Astro 6), Tailwind CSS v4 (`@tailwindcss/vite`), `@astrojs/cloudflare`, TypeScript, Inter variable font (`@fontsource-variable/inter`), Vitest 2 + `@vitest/coverage-v8` for unit tests, Playwright for E2E. Plan 1 uses inline SVG for all icons (sunburst, hamburger, close, checkmark, plus); an icon library (Lucide via `astro-icon`) is added in Plan 2 when service-card icons are needed.

**Spec reference:** `docs/superpowers/specs/2026-05-13-elera-construction-website-design.md` (Sections 2, 3, 4).

---

## File Structure (target state at end of Plan 1)

```
/
├── astro.config.mjs                        # Astro + Cloudflare adapter + Vite tailwind plugin
├── package.json
├── tsconfig.json
├── .env.example                            # required env vars listed, no values
├── playwright.config.ts
├── vitest.config.ts
├── public/
│   └── favicon.svg                         # robots.txt, sitemap.xml, llms.txt land in Plan 2
├── src/
│   ├── env.d.ts                            # astro:env types
│   ├── styles/
│   │   └── global.css                      # Tailwind v4 + brand tokens via @theme
│   ├── lib/
│   │   └── site.ts                         # site config (name, phone, email, urls)
│   ├── components/
│   │   ├── brand/
│   │   │   └── Logo.astro
│   │   ├── ui/
│   │   │   ├── Button.astro
│   │   │   ├── TextInput.astro
│   │   │   ├── Textarea.astro
│   │   │   ├── SegmentedControl.astro
│   │   │   ├── Dropdown.astro
│   │   │   ├── SectionHeading.astro
│   │   │   ├── Card.astro
│   │   │   └── FaqAccordion.astro
│   │   ├── sections/
│   │   │   ├── Hero.astro
│   │   │   ├── TrustStrip.astro
│   │   │   ├── ServicesGrid.astro
│   │   │   ├── ProcessSteps.astro
│   │   │   └── TestimonialCard.astro
│   │   └── layout/
│   │       ├── Header.astro
│   │       ├── MobileNav.astro
│   │       ├── MobileStickyBar.astro
│   │       └── Footer.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro                # minimal (head + body, no chrome)
│   │   └── PageLayout.astro                # BaseLayout + Header + Footer + MobileStickyBar
│   └── pages/
│       ├── index.astro                     # stub home assembling components
│       └── 404.astro
└── tests/
    ├── unit/
    │   ├── button.test.ts
    │   ├── logo.test.ts
    │   ├── hero.test.ts
    │   ├── trust-strip.test.ts
    │   ├── services-grid.test.ts
    │   ├── process-steps.test.ts
    │   ├── faq-accordion.test.ts
    │   ├── header.test.ts
    │   └── footer.test.ts
    └── e2e/
        ├── home.spec.ts
        ├── nav.spec.ts
        └── responsive.spec.ts
```

---

## Conventions

- **Branch strategy:** Work on `main` for Plan 1 (greenfield scaffold). Commit after every task. Push every 3–5 tasks.
- **Commit format:** Conventional Commits — `feat:`, `chore:`, `test:`, `docs:`, `style:`, `refactor:`. Plus the `Co-Authored-By` trailer.
- **TDD:** for any task containing logic or rendered output, write the test first, watch it fail, then implement.
- **Component testing:** use Astro's [Container API](https://docs.astro.build/en/reference/container-reference/) — instantiate the component, render to a string, assert on the string with regex / `.toContain()` / DOM-parse helpers. Snapshot tests are acceptable for stable visual structure.
- **Imports use `~/` alias** — configure in `tsconfig.json` (`"paths": { "~/*": ["src/*"] }`).

---

## Task 1: Scaffold the Astro project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`, `public/favicon.svg`, `src/env.d.ts`
- Modify: `.gitignore` (Astro additions appended)

The project root already contains `.git/`, `docs/`, `.gitignore`, and (gitignored) `.superpowers/`. `npm create astro@latest` refuses to scaffold into a non-empty directory, so we scaffold into a temporary sibling directory and move the generated files in.

- [ ] **Step 1.1: Scaffold into a sibling temp directory**

Run from one level above the project (`/Users/amir/Workspace`):

```bash
cd /Users/amir/Workspace
npm create astro@latest elera-scaffold-tmp -- --template minimal --no-install --no-git --typescript=strict --yes
```

The positional dir name (`elera-scaffold-tmp`) must come **before** the `--` separator and the named flags use `--typescript=strict` (with `=`), not space-separated, because `create-astro` otherwise parses `--typescript` as the positional dir name and `strict` as its value.

Expected: creates `/Users/amir/Workspace/elera-scaffold-tmp/` with `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`, `public/favicon.svg`, plus the scaffold's `.gitignore`.

- [ ] **Step 1.2: Merge the scaffold into the project**

```bash
cd /Users/amir/Workspace/EleraConstruction

# Copy everything except the scaffold's .gitignore (we already have one) and its .git (it has none with --no-git anyway)
rsync -a --exclude='.gitignore' /Users/amir/Workspace/elera-scaffold-tmp/ .

# Append the scaffold's gitignore entries to ours
echo "" >> .gitignore
echo "# Astro" >> .gitignore
cat /Users/amir/Workspace/elera-scaffold-tmp/.gitignore | grep -vE '^#|^$' | sort -u >> .gitignore

# Remove the temp directory
rm -rf /Users/amir/Workspace/elera-scaffold-tmp
```

Expected: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`, `public/favicon.svg`, `src/env.d.ts` (if generated) now exist in the project. The existing `.gitignore` has Astro patterns (`dist/`, `.astro/`, `node_modules/`) appended (some may already be present from the initial commit — duplicates are fine).

- [ ] **Step 1.3: Install dependencies**

```bash
npm install
```

Expected: completes without errors. `node_modules/` and `package-lock.json` are created.

- [ ] **Step 1.4: Configure path alias in tsconfig.json**

Edit `tsconfig.json` so it extends `astro/tsconfigs/strict` and adds the `~/` alias:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "~/*": ["src/*"]
    },
    "jsx": "preserve"
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 1.5: Smoke-test dev server**

```bash
npm run dev
```

Expected: dev server starts on `http://localhost:4321` and the default "Welcome to Astro" page renders. Stop with Ctrl-C.

- [ ] **Step 1.6: Smoke-test build**

```bash
npm run build
```

Expected: build completes, `dist/` is created with `index.html`.

- [ ] **Step 1.7: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
chore: scaffold Astro project with strict TypeScript

Initialize the Astro project (currently v6) using the minimal template
with strict TypeScript and the ~/* path alias. Dev server and
production build both verified.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Add Tailwind CSS v4 via the official Vite plugin

**Files:**
- Modify: `astro.config.mjs`, `package.json`
- Create: `src/styles/global.css`

- [ ] **Step 2.1: Install Tailwind via the Astro CLI helper**

```bash
npx astro add tailwind --yes
```

This installs `tailwindcss` and `@tailwindcss/vite`, edits `astro.config.mjs` to register the Vite plugin, and creates `src/styles/global.css` with `@import "tailwindcss";`. Verify the changes look like:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

```css
/* src/styles/global.css */
@import "tailwindcss";
```

- [ ] **Step 2.2: Write a Tailwind smoke test**

Create `src/pages/index.astro` (overwrite the template content):

```astro
---
import '~/styles/global.css';
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Tailwind smoke test</title>
  </head>
  <body class="bg-red-500 text-white text-3xl p-12">
    Tailwind is working if this is red.
  </body>
</html>
```

- [ ] **Step 2.3: Run dev server and visually verify**

```bash
npm run dev
```

Expected: `http://localhost:4321` shows white text on a red background. Stop the server.

- [ ] **Step 2.4: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: add Tailwind CSS v4 via @tailwindcss/vite plugin

Astro 5.2+ (current installs are Astro 6) uses the official Vite plugin instead of the deprecated
@astrojs/tailwind integration. Global stylesheet imports tailwindcss
and is loaded in the root page. Smoke-tested with utility classes.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Install Cloudflare adapter (configured but not deployed yet)

**Files:**
- Modify: `astro.config.mjs`, `package.json`
- Create: `.env.example`

- [ ] **Step 3.1: Install the Cloudflare adapter**

```bash
npx astro add cloudflare --yes
```

This installs `@astrojs/cloudflare`, edits `astro.config.mjs` to register the adapter, and sets `output: 'static'` (Astro 5+ default carried into Astro 6 — server-rendered routes opt in per-route via `export const prerender = false`).

After the command, verify `astro.config.mjs` contains:

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'static',
  adapter: cloudflare(),
  vite: { plugins: [tailwindcss()] },
});
```

If `output: 'static'` is missing, add it manually.

- [ ] **Step 3.2: Add site config**

Edit `astro.config.mjs` to include `site` (used by sitemap, canonical URLs, OG tags later):

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://eleraconstruction.com',
  output: 'static',
  adapter: cloudflare(),
  vite: { plugins: [tailwindcss()] },
});
```

- [ ] **Step 3.3: Create `.env.example` listing future env vars**

```bash
# Resend transactional email (required for form handler in Plan 3)
RESEND_API_KEY=

# Cloudflare Turnstile (required for form handler in Plan 3)
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Optional: override the deployed origin for local SSR previews
PUBLIC_SITE_URL=http://localhost:4321
```

- [ ] **Step 3.4: Smoke-test the build still passes**

```bash
npm run build
```

Expected: build succeeds. (The Cloudflare adapter is now installed but inert until we have server-rendered routes in Plan 3.)

- [ ] **Step 3.5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
chore: install @astrojs/cloudflare adapter and set site origin

Adapter is configured ahead of time so the SSR endpoint added in Plan 3
slots in without further config. output: 'static' keeps the site
prerendered by default; future server routes opt in per-file.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Brand tokens, theme mapping, base styles

**Files:**
- Modify: `src/styles/global.css`
- Create: `src/lib/site.ts`

- [ ] **Step 4.1: Replace `src/styles/global.css` with the full token map**

```css
@import "tailwindcss";

/* ===== Brand tokens (CSS custom properties) =====
   Single source of truth for the design system.
   Tailwind picks these up via the @theme block below.
*/
:root {
  /* Surfaces */
  --color-cream: #F0EEE6;
  --color-paper: #FFFFFF;
  --color-ink: #14241B;
  --color-slate: #1A1A1A;
  --color-muted: #6B6B6B;
  --color-hairline: #E5E0D8;

  /* Brand */
  --color-midnight: #1E3A5F;
  --color-midnight-deep: #16304F;
  --color-midnight-soft: #E8EDF3;

  /* States */
  --color-success: #5C8A6E;
  --color-danger: #A04545;

  /* Type */
  --font-sans: "Inter Variable", system-ui, -apple-system, "Segoe UI", sans-serif;

  /* Rhythm */
  --container-max: 1280px;
  --gutter-mobile: 1.5rem;
  --gutter-desktop: 3rem;
  --section-py-mobile: 3.5rem;
  --section-py-desktop: 6rem;
}

/* Map CSS variables into Tailwind theme tokens (Tailwind v4 syntax). */
@theme {
  --color-cream: var(--color-cream);
  --color-paper: var(--color-paper);
  --color-ink: var(--color-ink);
  --color-slate: var(--color-slate);
  --color-muted: var(--color-muted);
  --color-hairline: var(--color-hairline);
  --color-midnight: var(--color-midnight);
  --color-midnight-deep: var(--color-midnight-deep);
  --color-midnight-soft: var(--color-midnight-soft);
  --color-success: var(--color-success);
  --color-danger: var(--color-danger);

  --font-sans: var(--font-sans);
}

/* Base */
html {
  background: var(--color-cream);
  color: var(--color-ink);
  font-family: var(--font-sans);
  font-feature-settings: "ss01", "cv11";
  -webkit-font-smoothing: antialiased;
}

body {
  font-size: 17px;
  line-height: 1.55;
}

@media (max-width: 768px) {
  body { font-size: 16px; }
}

/* Headings default to tight tracking, no bottom margin (let layout decide spacing). */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-sans);
  letter-spacing: -0.025em;
  line-height: 1.08;
  font-weight: 800;
  color: var(--color-ink);
  margin: 0;
}

/* Eyebrow utility class — used above section headings */
.eyebrow {
  font-size: 0.6875rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--color-midnight);
}

/* Containers */
.container-x {
  width: 100%;
  max-width: var(--container-max);
  margin-inline: auto;
  padding-inline: var(--gutter-mobile);
}
@media (min-width: 768px) {
  .container-x { padding-inline: var(--gutter-desktop); }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

- [ ] **Step 4.2: Create `src/lib/site.ts` — single source of truth for site facts**

```typescript
// src/lib/site.ts
export const site = {
  name: 'Elera Construction',
  tagline: '', // intentionally blank
  description:
    'Premium home renovations across the GTA — bathrooms, kitchens, flooring, cabinetry, and full-home renovations.',
  url: 'https://eleraconstruction.com',
  phone: '416-837-6897',
  phoneHref: 'tel:+14168376897',
  email: 'leads@eleraconstruction.com',
  founder: 'Kaveh',
  city: 'Toronto',
  region: 'Ontario',
  country: 'Canada',
  serviceArea: 'Greater Toronto Area',
  availabilityCopy: 'Available 7 days a week — reach out anytime.',
  social: {
    instagram: '', // placeholder, populate later
    facebook: '',
  },
  trust: {
    insuranceCopy: 'Insured up to $2M',
    wsibCopy: 'WSIB Cleared',
    warrantyCopy: '2-Year Workmanship Warranty',
    serviceAreaCopy: 'Serving All of the GTA',
  },
} as const;

export type Site = typeof site;
```

- [ ] **Step 4.3: Smoke-test the new styles**

Edit `src/pages/index.astro`:

```astro
---
import '~/styles/global.css';
import { site } from '~/lib/site';
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Token smoke test</title>
  </head>
  <body>
    <div class="container-x py-24">
      <span class="eyebrow">Tokens loaded</span>
      <h1 class="text-5xl mt-3">{site.name}</h1>
      <p class="mt-4 text-muted max-w-prose">{site.description}</p>
      <div class="mt-8 flex gap-3">
        <span class="px-4 py-2 bg-midnight text-cream rounded">midnight on cream</span>
        <span class="px-4 py-2 bg-midnight-soft text-midnight rounded">midnight on soft</span>
      </div>
    </div>
  </body>
</html>
```

```bash
npm run dev
```

Expected: cream background, midnight blue eyebrow + heading, two color swatches render. Stop.

- [ ] **Step 4.4: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: brand tokens, theme mapping, and central site config

Define brand colors, type, and rhythm as CSS custom properties and
expose them to Tailwind v4 via @theme. Add src/lib/site.ts as the
single source of truth for company name, phone, email, founder name,
and trust-signal copy — referenced everywhere instead of inlining.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Self-host Inter Variable font

**Files:**
- Modify: `src/styles/global.css`, `package.json`

- [ ] **Step 5.1: Install fontsource Inter Variable**

```bash
npm install @fontsource-variable/inter
```

- [ ] **Step 5.2: Import the font subset in `src/styles/global.css`**

Add to the top of `src/styles/global.css` (above `@import "tailwindcss";`):

```css
@import "@fontsource-variable/inter/index.css";
@import "tailwindcss";
```

- [ ] **Step 5.3: Verify the font loads**

Re-run `npm run dev` and inspect the homepage in the browser — the heading text should clearly render in Inter (open dev tools → Network → check that a font file is loaded). Stop the server.

- [ ] **Step 5.4: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: self-host Inter Variable via @fontsource-variable

Avoid Google Fonts CDN to remove a third-party dependency and a
render-blocking external request. fontsource ships the subset
through npm and serves it from our own origin.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Vitest setup with Astro Container API

**Files:**
- Create: `vitest.config.ts`, `tests/unit/.gitkeep`, `tests/unit/smoke.test.ts`
- Modify: `package.json` (test scripts)

- [ ] **Step 6.1: Install Vitest**

```bash
npm install -D vitest @vitest/coverage-v8 @types/node
```

- [ ] **Step 6.2: Create `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
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
```

- [ ] **Step 6.3: Add npm scripts**

Edit `package.json` `scripts` block:

```json
{
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:cov": "vitest run --coverage",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 6.4: Write a failing smoke test**

Create `tests/unit/smoke.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { site } from '~/lib/site';

describe('site config', () => {
  it('uses the eleraconstruction.com origin', () => {
    expect(site.url).toBe('https://eleraconstruction.com');
  });

  it('has the founder first name set', () => {
    expect(site.founder).toBe('Kaveh');
  });

  it('exposes a tel: link in addition to the display phone', () => {
    expect(site.phoneHref.startsWith('tel:+')).toBe(true);
    expect(site.phoneHref.replace(/[^0-9]/g, '')).toContain('14168376897');
  });
});
```

- [ ] **Step 6.5: Run the test**

```bash
npm test
```

Expected: all three assertions PASS. (If any fail, the site config in Task 4 is wrong — fix and rerun.)

- [ ] **Step 6.6: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
test: add Vitest config and a smoke test for src/lib/site

Vitest is configured with the ~/* path alias so tests can import
from src exactly as Astro components do. The smoke test fails fast
if anyone breaks the canonical site origin, founder name, or
tel: link format.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Playwright setup with a single smoke E2E

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/home.spec.ts`
- Modify: `package.json`, `.gitignore`

- [ ] **Step 7.1: Install Playwright**

```bash
npm install -D @playwright/test
```

Expected: `@playwright/test` is added to `devDependencies`. We skip `npm init playwright` because its prompts and generated example files aren't needed — we write the config and tests ourselves in the next steps.

- [ ] **Step 7.2: Create `playwright.config.ts`**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4321',
    headless: true,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

- [ ] **Step 7.3: Install the Chromium browser binary**

```bash
npx playwright install chromium
```

- [ ] **Step 7.4: Add Playwright artifacts to .gitignore**

Append to `.gitignore`:

```
# Playwright
test-results/
playwright-report/
playwright/.cache/
```

- [ ] **Step 7.5: Write a failing E2E**

Create `tests/e2e/home.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('home page renders the company name', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Elera Construction');
});
```

- [ ] **Step 7.6: Run E2E — it should PASS (the smoke `index.astro` from Task 4 already renders the name)**

```bash
npm run test:e2e
```

Expected: 1 passed.

- [ ] **Step 7.7: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
test: add Playwright with a chromium-only home smoke test

Playwright spins up the dev server itself via webServer. The first
spec asserts the homepage H1 contains the company name; it locks in
the contract that index.astro must always render this.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Logo component with three lockup variants

**Files:**
- Create: `src/components/brand/Logo.astro`, `tests/unit/logo.test.ts`

The logo is a 16-ray sunburst (one ray every 22.5°) around a solid center circle, plus the ELERA wordmark and CONSTRUCTION sub-label. Color always inherits `currentColor`, so we control color from the parent (default: midnight blue).

- [ ] **Step 8.1: Write the failing tests**

Create `tests/unit/logo.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Logo from '~/components/brand/Logo.astro';

describe('Logo', () => {
  it('renders the horizontal lockup by default with brand name', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Logo);
    expect(html).toContain('ELERA');
    expect(html).toContain('CONSTRUCTION');
    expect(html).toMatch(/data-variant="horizontal"/);
  });

  it('renders the stacked lockup when variant="stacked"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Logo, { props: { variant: 'stacked' } });
    expect(html).toMatch(/data-variant="stacked"/);
    expect(html).toContain('ELERA');
  });

  it('renders the icon-only variant without the wordmark', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Logo, { props: { variant: 'icon' } });
    expect(html).toMatch(/data-variant="icon"/);
    expect(html).not.toContain('ELERA');
  });

  it('renders exactly 16 sunburst rays', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Logo);
    const rayMatches = html.match(/<line[^>]+>/g) ?? [];
    expect(rayMatches.length).toBe(16);
  });
});
```

- [ ] **Step 8.2: Run the tests — confirm they fail**

```bash
npm test -- tests/unit/logo.test.ts
```

Expected: all FAIL with "Cannot find module '~/components/brand/Logo.astro'".

- [ ] **Step 8.3: Implement `src/components/brand/Logo.astro`**

```astro
---
type Variant = 'horizontal' | 'stacked' | 'icon';

interface Props {
  variant?: Variant;
  /**
   * Pixel size of the sunburst icon. Wordmark scales relative to this.
   * Defaults to 36 for nav use.
   */
  size?: number;
  /**
   * Accessible label for the logo. Defaults to "Elera Construction home".
   */
  label?: string;
  /**
   * Optional extra Tailwind classes on the wrapper element.
   */
  class?: string;
}

const {
  variant = 'horizontal',
  size = 36,
  label = 'Elera Construction home',
  class: className = '',
} = Astro.props;

// Pre-compute the 16 ray rotations: 0, 22.5, 45 ... 337.5
const rays = Array.from({ length: 16 }, (_, i) => i * 22.5);

// Layout classes per variant
const wrapperClass =
  variant === 'stacked'
    ? `inline-flex flex-col items-center gap-2 ${className}`
    : variant === 'icon'
      ? `inline-flex ${className}`
      : `inline-flex items-center gap-3 ${className}`;

const nameSize = variant === 'stacked' ? 'text-[1.375rem]' : 'text-[1.1875rem]';
const subSize = variant === 'stacked' ? 'text-[0.6875rem]' : 'text-[0.625rem]';
---
<a href="/" aria-label={label} data-variant={variant} class={wrapperClass}>
  <svg
    width={size}
    height={size}
    viewBox="0 0 60 60"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="30" cy="30" r="5" fill="currentColor" />
    <g
      stroke="currentColor"
      stroke-width="2.6"
      stroke-linecap="round"
      transform="translate(30 30)"
    >
      {rays.map((deg) => (
        <line x1="0" y1="-22" x2="0" y2="-13" transform={`rotate(${deg})`} />
      ))}
    </g>
  </svg>

  {variant !== 'icon' && (
    <span class="flex flex-col leading-none">
      <span class={`font-extrabold tracking-[0.04em] ${nameSize}`}>ELERA</span>
      <span class={`font-medium tracking-[0.22em] text-muted mt-1 ${subSize}`}>
        CONSTRUCTION
      </span>
    </span>
  )}
</a>
```

- [ ] **Step 8.4: Re-run logo tests — they should PASS**

```bash
npm test -- tests/unit/logo.test.ts
```

Expected: all 4 PASS.

- [ ] **Step 8.5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: Logo component with horizontal, stacked, and icon variants

The 16-ray sunburst + ELERA wordmark renders entirely from inline SVG
plus brand-color currentColor inheritance. Variant prop swaps between
horizontal (nav), stacked (footer / About / social avatar), and icon-
only (favicon, watermark). All four behaviors covered by unit tests.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Button component (primary / secondary / ghost)

**Files:**
- Create: `src/components/ui/Button.astro`, `tests/unit/button.test.ts`

- [ ] **Step 9.1: Write the failing tests**

Create `tests/unit/button.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Button from '~/components/ui/Button.astro';

describe('Button', () => {
  it('renders an <a> when href is provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Button, {
      props: { href: '/contact' },
      slots: { default: 'Get a quote' },
    });
    expect(html).toMatch(/<a [^>]*href="\/contact"/);
    expect(html).toContain('Get a quote');
  });

  it('renders a <button> when no href is given', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Button, {
      slots: { default: 'Submit' },
    });
    expect(html).toMatch(/<button[^>]*type="button"/);
  });

  it('applies the primary variant by default with the midnight bg class', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Button, {
      props: { href: '/' },
      slots: { default: 'Primary' },
    });
    expect(html).toContain('bg-midnight');
  });

  it('applies the secondary variant outline styling', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Button, {
      props: { href: '/', variant: 'secondary' },
      slots: { default: 'Secondary' },
    });
    expect(html).toMatch(/border/);
    expect(html).not.toContain('bg-midnight');
  });

  it('applies the ghost variant (text-only)', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Button, {
      props: { href: '/', variant: 'ghost' },
      slots: { default: 'Ghost' },
    });
    expect(html).toContain('underline');
  });
});
```

- [ ] **Step 9.2: Run tests — confirm fail**

```bash
npm test -- tests/unit/button.test.ts
```

Expected: all FAIL.

- [ ] **Step 9.3: Implement `src/components/ui/Button.astro`**

```astro
---
type Variant = 'primary' | 'secondary' | 'ghost';

interface Props {
  href?: string;
  variant?: Variant;
  type?: 'button' | 'submit';
  class?: string;
  /** When true, opens external links in a new tab with rel=noopener noreferrer. */
  external?: boolean;
}

const {
  href,
  variant = 'primary',
  type = 'button',
  class: className = '',
  external = false,
} = Astro.props;

const base =
  'inline-flex items-center justify-center font-semibold tracking-wide text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight';

const variants: Record<Variant, string> = {
  primary:
    'bg-midnight text-cream hover:bg-midnight-deep px-6 py-3 rounded-sm',
  secondary:
    'bg-transparent text-ink border border-ink/70 hover:bg-ink hover:text-cream px-6 py-3 rounded-sm',
  ghost:
    'bg-transparent text-midnight underline underline-offset-4 decoration-2 decoration-transparent hover:decoration-midnight px-1 py-1',
};

const classes = `${base} ${variants[variant]} ${className}`;
const externalAttrs = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
---
{href ? (
  <a href={href} class={classes} {...externalAttrs}><slot /></a>
) : (
  <button type={type} class={classes}><slot /></button>
)}
```

- [ ] **Step 9.4: Re-run tests — confirm pass**

```bash
npm test -- tests/unit/button.test.ts
```

Expected: 5 passing.

- [ ] **Step 9.5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: Button component (primary, secondary, ghost variants)

Renders as <a> when href is supplied, <button> otherwise. Variants
map to Tailwind class strings consolidated in one place so any
visual tweak is a single-file change. Accessible focus ring uses the
midnight outline; external links opt in via external prop.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Form input primitives (TextInput, Textarea, SegmentedControl, Dropdown)

**Files:**
- Create:
  - `src/components/ui/TextInput.astro`
  - `src/components/ui/Textarea.astro`
  - `src/components/ui/SegmentedControl.astro`
  - `src/components/ui/Dropdown.astro`
  - `tests/unit/inputs.test.ts`

These are styled controls; full validation behavior is wired in Plan 3. The components must accept `label`, `name`, `error?`, and `required?` props.

- [ ] **Step 10.1: Write the failing tests**

Create `tests/unit/inputs.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import TextInput from '~/components/ui/TextInput.astro';
import Textarea from '~/components/ui/Textarea.astro';
import SegmentedControl from '~/components/ui/SegmentedControl.astro';
import Dropdown from '~/components/ui/Dropdown.astro';

describe('TextInput', () => {
  it('renders a label associated to the input by id', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(TextInput, {
      props: { name: 'name', label: 'Your name', required: true },
    });
    expect(html).toMatch(/<label[^>]*for="name"/);
    expect(html).toMatch(/<input[^>]*id="name"[^>]*name="name"[^>]*required/);
    expect(html).toContain('Your name');
  });

  it('renders an error message and sets aria-invalid', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(TextInput, {
      props: { name: 'email', label: 'Email', error: 'Invalid format' },
    });
    expect(html).toContain('Invalid format');
    expect(html).toMatch(/aria-invalid="true"/);
  });
});

describe('Textarea', () => {
  it('renders a textarea with rows and label', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Textarea, {
      props: { name: 'msg', label: 'Project details', rows: 5 },
    });
    expect(html).toMatch(/<textarea[^>]*rows="5"/);
    expect(html).toContain('Project details');
  });
});

describe('SegmentedControl', () => {
  it('renders a radio group with the provided options', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(SegmentedControl, {
      props: {
        name: 'propertyType',
        label: 'Property type',
        options: [
          { value: 'detached', label: 'Detached' },
          { value: 'semi', label: 'Semi-detached' },
        ],
      },
    });
    expect(html).toMatch(/<input[^>]+type="radio"[^>]+name="propertyType"[^>]+value="detached"/);
    expect(html).toContain('Semi-detached');
  });
});

describe('Dropdown', () => {
  it('renders a select element with options including a default empty option', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Dropdown, {
      props: {
        name: 'budget',
        label: 'Budget',
        options: [
          { value: '', label: 'Select…' },
          { value: 'under-25k', label: 'Under $25K' },
        ],
      },
    });
    expect(html).toMatch(/<select[^>]+name="budget"/);
    expect(html).toContain('Under $25K');
  });
});
```

- [ ] **Step 10.2: Run tests — confirm fail**

```bash
npm test -- tests/unit/inputs.test.ts
```

- [ ] **Step 10.3: Implement TextInput**

`src/components/ui/TextInput.astro`:

```astro
---
interface Props {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel';
  placeholder?: string;
  required?: boolean;
  autocomplete?: string;
  error?: string;
  value?: string;
}

const {
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  autocomplete,
  error,
  value,
} = Astro.props;

const describedBy = error ? `${name}-error` : undefined;
---
<div class="flex flex-col gap-1.5">
  <label for={name} class="text-sm font-semibold text-ink">
    {label}{required && <span class="text-danger ml-1" aria-hidden="true">*</span>}
  </label>
  <input
    id={name}
    name={name}
    type={type}
    placeholder={placeholder}
    autocomplete={autocomplete}
    value={value}
    required={required}
    aria-invalid={error ? 'true' : undefined}
    aria-describedby={describedBy}
    class:list={[
      'w-full px-4 py-3 bg-paper border rounded-sm text-ink',
      'placeholder:text-muted/70',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight',
      error ? 'border-danger' : 'border-hairline',
    ]}
  />
  {error && <p id={`${name}-error`} class="text-sm text-danger">{error}</p>}
</div>
```

- [ ] **Step 10.4: Implement Textarea**

`src/components/ui/Textarea.astro`:

```astro
---
interface Props {
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  error?: string;
}

const { name, label, placeholder, rows = 4, required = false, error } = Astro.props;
const describedBy = error ? `${name}-error` : undefined;
---
<div class="flex flex-col gap-1.5">
  <label for={name} class="text-sm font-semibold text-ink">
    {label}{required && <span class="text-danger ml-1" aria-hidden="true">*</span>}
  </label>
  <textarea
    id={name}
    name={name}
    rows={rows}
    placeholder={placeholder}
    required={required}
    aria-invalid={error ? 'true' : undefined}
    aria-describedby={describedBy}
    class:list={[
      'w-full px-4 py-3 bg-paper border rounded-sm text-ink resize-y',
      'placeholder:text-muted/70',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight',
      error ? 'border-danger' : 'border-hairline',
    ]}
  ></textarea>
  {error && <p id={`${name}-error`} class="text-sm text-danger">{error}</p>}
</div>
```

- [ ] **Step 10.5: Implement SegmentedControl**

`src/components/ui/SegmentedControl.astro`:

```astro
---
interface Option {
  value: string;
  label: string;
}
interface Props {
  name: string;
  label: string;
  options: Option[];
  value?: string;
  required?: boolean;
  error?: string;
}

const { name, label, options, value, required = false, error } = Astro.props;
---
<fieldset class="flex flex-col gap-2">
  <legend class="text-sm font-semibold text-ink">
    {label}{required && <span class="text-danger ml-1" aria-hidden="true">*</span>}
  </legend>
  <div class="flex flex-wrap gap-2">
    {options.map((opt) => (
      <label class="cursor-pointer">
        <input
          type="radio"
          name={name}
          value={opt.value}
          checked={value === opt.value}
          required={required}
          class="peer sr-only"
        />
        <span class="inline-block px-4 py-2 border border-hairline rounded-sm text-sm bg-paper text-ink hover:border-midnight peer-checked:bg-midnight peer-checked:text-cream peer-checked:border-midnight peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-midnight">
          {opt.label}
        </span>
      </label>
    ))}
  </div>
  {error && <p class="text-sm text-danger">{error}</p>}
</fieldset>
```

- [ ] **Step 10.6: Implement Dropdown**

`src/components/ui/Dropdown.astro`:

```astro
---
interface Option {
  value: string;
  label: string;
}
interface Props {
  name: string;
  label: string;
  options: Option[];
  value?: string;
  required?: boolean;
  error?: string;
}

const { name, label, options, value, required = false, error } = Astro.props;
const describedBy = error ? `${name}-error` : undefined;
---
<div class="flex flex-col gap-1.5">
  <label for={name} class="text-sm font-semibold text-ink">
    {label}{required && <span class="text-danger ml-1" aria-hidden="true">*</span>}
  </label>
  <select
    id={name}
    name={name}
    required={required}
    aria-invalid={error ? 'true' : undefined}
    aria-describedby={describedBy}
    class:list={[
      'w-full px-4 py-3 bg-paper border rounded-sm text-ink',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight',
      error ? 'border-danger' : 'border-hairline',
    ]}
  >
    {options.map((opt) => (
      <option value={opt.value} selected={value === opt.value}>{opt.label}</option>
    ))}
  </select>
  {error && <p id={`${name}-error`} class="text-sm text-danger">{error}</p>}
</div>
```

- [ ] **Step 10.7: Re-run tests — confirm pass**

```bash
npm test -- tests/unit/inputs.test.ts
```

Expected: all PASS.

- [ ] **Step 10.8: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: form input primitives (TextInput, Textarea, SegmentedControl, Dropdown)

Each control owns its own label, error, and a11y wiring (aria-invalid,
aria-describedby). SegmentedControl uses radio inputs + Tailwind peer
styling so it's keyboard-accessible by construction. These are visual
shells; Plan 3 wires validation and submission logic.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: SectionHeading combo (eyebrow + heading + optional subhead)

**Files:**
- Create: `src/components/ui/SectionHeading.astro`, `tests/unit/section-heading.test.ts`

- [ ] **Step 11.1: Write the failing test**

`tests/unit/section-heading.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import SectionHeading from '~/components/ui/SectionHeading.astro';

describe('SectionHeading', () => {
  it('renders the eyebrow, heading and subhead', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(SectionHeading, {
      props: {
        eyebrow: 'OUR SERVICES',
        heading: 'Renovations, done properly.',
        subhead: 'From a single bathroom to a full home.',
      },
    });
    expect(html).toContain('OUR SERVICES');
    expect(html).toContain('Renovations, done properly.');
    expect(html).toContain('From a single bathroom to a full home.');
    expect(html).toMatch(/<h2/);
  });

  it('renders an H3 when level=3', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(SectionHeading, {
      props: { eyebrow: '', heading: 'Smaller', level: 3 },
    });
    expect(html).toMatch(/<h3/);
  });
});
```

- [ ] **Step 11.2: Confirm fail**

```bash
npm test -- tests/unit/section-heading.test.ts
```

- [ ] **Step 11.3: Implement `src/components/ui/SectionHeading.astro`**

```astro
---
interface Props {
  eyebrow?: string;
  heading: string;
  subhead?: string;
  level?: 1 | 2 | 3;
  align?: 'left' | 'center';
  class?: string;
}

const {
  eyebrow,
  heading,
  subhead,
  level = 2,
  align = 'left',
  class: className = '',
} = Astro.props;

const Tag = `h${level}` as 'h1' | 'h2' | 'h3';
const headingSize =
  level === 1
    ? 'text-5xl md:text-6xl'
    : level === 2
      ? 'text-3xl md:text-5xl'
      : 'text-2xl md:text-3xl';
const alignClass = align === 'center' ? 'text-center max-w-2xl mx-auto' : '';
---
<div class:list={[alignClass, className]}>
  {eyebrow && <p class="eyebrow mb-3">{eyebrow}</p>}
  <Tag class:list={[headingSize, 'font-extrabold']}>{heading}</Tag>
  {subhead && <p class="mt-4 text-muted text-lg md:max-w-xl">{subhead}</p>}
</div>
```

- [ ] **Step 11.4: Confirm pass**

```bash
npm test -- tests/unit/section-heading.test.ts
```

- [ ] **Step 11.5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: SectionHeading combo (eyebrow + heading + subhead)

Single component prevents inconsistent eyebrow spacing across pages.
Level prop swaps the heading tag while keeping visual weight bound
to the level so editors don't get to override H1 size from H1 usage.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Card primitive

**Files:**
- Create: `src/components/ui/Card.astro`, `tests/unit/card.test.ts`

- [ ] **Step 12.1: Write the failing test**

`tests/unit/card.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Card from '~/components/ui/Card.astro';

describe('Card', () => {
  it('renders a div by default with default-slot content', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Card, { slots: { default: 'Hello' } });
    expect(html).toMatch(/^<div/);
    expect(html).toContain('Hello');
  });

  it('renders an <a> with href when href is provided', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Card, {
      props: { href: '/services/bathroom' },
      slots: { default: 'Bathroom' },
    });
    expect(html).toMatch(/^<a [^>]*href="\/services\/bathroom"/);
  });
});
```

- [ ] **Step 12.2: Confirm fail**

```bash
npm test -- tests/unit/card.test.ts
```

- [ ] **Step 12.3: Implement `src/components/ui/Card.astro`**

```astro
---
interface Props {
  href?: string;
  class?: string;
}
const { href, class: className = '' } = Astro.props;

const base =
  'block bg-paper border border-hairline rounded-sm p-7 transition-all duration-150';
const interactive = href ? 'hover:border-midnight hover:-translate-y-0.5' : '';
const classes = `${base} ${interactive} ${className}`;
---
{href ? (
  <a href={href} class={classes}><slot /></a>
) : (
  <div class={classes}><slot /></div>
)}
```

- [ ] **Step 12.4: Confirm pass**

```bash
npm test -- tests/unit/card.test.ts
```

- [ ] **Step 12.5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: Card primitive (linked or static)

Card switches between <a> and <div> based on the href prop. Interactive
state (border-midnight + 2px lift) is gated on the linked variant so
static cards don't twitch on hover. This is the base for service,
project, and blog cards.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: FAQ accordion (interactive island)

**Files:**
- Create: `src/components/ui/FaqAccordion.astro`, `tests/unit/faq-accordion.test.ts`

Uses native `<details>`/`<summary>` for zero-JS baseline; a small client-side script adds smooth open/close transitions. Single-expand behavior is opt-in.

- [ ] **Step 13.1: Write the failing test**

`tests/unit/faq-accordion.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import FaqAccordion from '~/components/ui/FaqAccordion.astro';

describe('FaqAccordion', () => {
  it('renders <details> + <summary> for each item', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(FaqAccordion, {
      props: {
        items: [
          { question: 'How long does a kitchen take?', answer: 'About 6 weeks.' },
          { question: 'Do you handle permits?', answer: 'Yes, every time.' },
        ],
      },
    });
    expect((html.match(/<details/g) ?? []).length).toBe(2);
    expect(html).toContain('How long does a kitchen take?');
    expect(html).toContain('About 6 weeks.');
  });
});
```

- [ ] **Step 13.2: Confirm fail**

```bash
npm test -- tests/unit/faq-accordion.test.ts
```

- [ ] **Step 13.3: Implement `src/components/ui/FaqAccordion.astro`**

```astro
---
interface FaqItem {
  question: string;
  /** Plain text or HTML string (rendered with set:html). */
  answer: string;
}
interface Props {
  items: FaqItem[];
  /** When true, opening one item closes the others. */
  singleExpand?: boolean;
  class?: string;
}

const { items, singleExpand = true, class: className = '' } = Astro.props;
---
<div
  class:list={['flex flex-col border-t border-hairline', className]}
  data-single-expand={singleExpand ? 'true' : 'false'}
>
  {items.map((item) => (
    <details class="border-b border-hairline group">
      <summary class="flex items-center justify-between cursor-pointer py-5 list-none">
        <span class="text-lg font-semibold text-ink pr-6">{item.question}</span>
        <span
          aria-hidden="true"
          class="shrink-0 text-midnight text-xl transition-transform group-open:rotate-45"
        >+</span>
      </summary>
      <div class="pb-5 text-muted text-base leading-relaxed" set:html={item.answer}></div>
    </details>
  ))}
</div>

<script>
  // Single-expand behavior: when one <details> opens, close its siblings.
  document.querySelectorAll<HTMLElement>('[data-single-expand="true"]').forEach((group) => {
    const items = Array.from(group.querySelectorAll<HTMLDetailsElement>('details'));
    items.forEach((item) => {
      item.addEventListener('toggle', () => {
        if (item.open) {
          items.forEach((other) => {
            if (other !== item) other.open = false;
          });
        }
      });
    });
  });
</script>
```

- [ ] **Step 13.4: Confirm pass**

```bash
npm test -- tests/unit/faq-accordion.test.ts
```

- [ ] **Step 13.5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: FaqAccordion using native <details> with single-expand JS

No-JS users get a fully functional disclosure widget. Tiny script
adds single-expand behavior when data-single-expand is true. The
+ glyph rotates to × via group-open: utility, no extra state.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 14: Hero section (light + dark variants)

**Files:**
- Create: `src/components/sections/Hero.astro`, `tests/unit/hero.test.ts`

Hero accepts eyebrow, headline (with inline accent span), subhead, primary + secondary CTA, and an image slot. `variant="dark"` uses the midnight inset look for "Why Elera"-style placement.

- [ ] **Step 14.1: Write the failing test**

`tests/unit/hero.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Hero from '~/components/sections/Hero.astro';

describe('Hero', () => {
  it('renders headline, eyebrow, subhead, and both CTAs', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Hero, {
      props: {
        eyebrow: 'GTA',
        headline: 'Renovations built the way',
        headlineAccent: 'top developers',
        headlineTail: 'build.',
        subhead: 'Bathrooms, kitchens, full-home.',
        primaryCta: { label: 'Get a free quote', href: '/contact' },
        secondaryCta: { label: 'See our work', href: '/projects' },
      },
    });
    expect(html).toContain('GTA');
    expect(html).toContain('Renovations built the way');
    expect(html).toContain('top developers');
    expect(html).toContain('build.');
    expect(html).toContain('Get a free quote');
    expect(html).toContain('See our work');
    expect(html).toMatch(/<h1/);
  });

  it('uses the dark variant background when variant="dark"', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Hero, {
      props: {
        eyebrow: 'WHY ELERA',
        headline: 'Ten years building',
        headlineAccent: 'for top developers.',
        primaryCta: { label: 'Read our story', href: '/about' },
        variant: 'dark',
      },
    });
    expect(html).toContain('bg-ink');
  });
});
```

- [ ] **Step 14.2: Confirm fail**

```bash
npm test -- tests/unit/hero.test.ts
```

- [ ] **Step 14.3: Implement `src/components/sections/Hero.astro`**

```astro
---
import Button from '~/components/ui/Button.astro';

interface CTA {
  label: string;
  href: string;
}

interface Props {
  eyebrow?: string;
  headline: string;
  headlineAccent?: string;
  headlineTail?: string;
  subhead?: string;
  primaryCta: CTA;
  secondaryCta?: CTA;
  variant?: 'light' | 'dark';
}

const {
  eyebrow,
  headline,
  headlineAccent,
  headlineTail,
  subhead,
  primaryCta,
  secondaryCta,
  variant = 'light',
} = Astro.props;

const isDark = variant === 'dark';
const sectionClass = isDark
  ? 'bg-ink text-cream'
  : 'bg-cream text-ink';
const subheadColor = isDark ? 'text-cream/70' : 'text-muted';
const eyebrowColor = isDark ? 'text-midnight-soft' : 'text-midnight';
const accentColor = isDark ? 'text-midnight-soft' : 'text-midnight';
---
<section class:list={['relative py-24 md:py-32', sectionClass]}>
  <div class="container-x grid md:grid-cols-2 gap-12 md:gap-16 items-center">
    <div>
      {eyebrow && <p class:list={['eyebrow', eyebrowColor]}>{eyebrow}</p>}
      <h1 class="mt-4 text-4xl md:text-6xl font-extrabold leading-tight">
        {headline}{' '}
        {headlineAccent && <span class={accentColor}>{headlineAccent}</span>}
        {headlineTail && <> {headlineTail}</>}
      </h1>
      {subhead && <p class:list={['mt-6 text-lg max-w-prose', subheadColor]}>{subhead}</p>}
      <div class="mt-8 flex flex-wrap gap-3">
        <Button href={primaryCta.href} variant="primary">{primaryCta.label} →</Button>
        {secondaryCta && (
          <Button href={secondaryCta.href} variant="secondary">{secondaryCta.label}</Button>
        )}
      </div>
    </div>
    <div class="aspect-[4/5] bg-hairline/60 rounded-sm overflow-hidden">
      <slot name="image">
        <div class="w-full h-full grid place-items-center text-sm text-muted">
          [Hero image]
        </div>
      </slot>
    </div>
  </div>
</section>
```

- [ ] **Step 14.4: Confirm pass**

```bash
npm test -- tests/unit/hero.test.ts
```

- [ ] **Step 14.5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: Hero section with light/dark variants and image slot

Single Hero component used at the top of the home page and inset
inside dark "Why Elera"-style sections. Headline supports an inline
accent span without HTML markup in MDX (just three string props:
headline / headlineAccent / headlineTail).

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 15: TrustStrip section

**Files:**
- Create: `src/components/sections/TrustStrip.astro`, `tests/unit/trust-strip.test.ts`

- [ ] **Step 15.1: Write the failing test**

`tests/unit/trust-strip.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import TrustStrip from '~/components/sections/TrustStrip.astro';

describe('TrustStrip', () => {
  it('renders the four default trust items', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(TrustStrip);
    expect(html).toContain('Insured up to $2M');
    expect(html).toContain('WSIB Cleared');
    expect(html).toContain('2-Year Workmanship Warranty');
    expect(html).toContain('Serving All of the GTA');
  });

  it('renders the dark variant when variant="dark"', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(TrustStrip, { props: { variant: 'dark' } });
    expect(html).toContain('bg-ink');
  });
});
```

- [ ] **Step 15.2: Confirm fail**

```bash
npm test -- tests/unit/trust-strip.test.ts
```

- [ ] **Step 15.3: Implement `src/components/sections/TrustStrip.astro`**

```astro
---
import { site } from '~/lib/site';

interface Props {
  variant?: 'light' | 'dark';
}
const { variant = 'light' } = Astro.props;
const isDark = variant === 'dark';
const sectionClass = isDark
  ? 'bg-ink text-cream/80 border-t border-cream/10'
  : 'bg-paper text-ink border-y border-hairline';
const items = [
  site.trust.insuranceCopy,
  site.trust.wsibCopy,
  site.trust.warrantyCopy,
  site.trust.serviceAreaCopy,
];
---
<section class:list={['py-6', sectionClass]} aria-label="Credentials">
  <div class="container-x flex flex-wrap items-center justify-between gap-x-8 gap-y-3 text-sm">
    {items.map((item) => (
      <div class="flex items-center gap-2">
        <span
          aria-hidden="true"
          class="inline-grid place-items-center w-5 h-5 rounded-full border border-midnight text-midnight text-xs"
        >✓</span>
        <span>{item}</span>
      </div>
    ))}
  </div>
</section>
```

- [ ] **Step 15.4: Confirm pass**

```bash
npm test -- tests/unit/trust-strip.test.ts
```

- [ ] **Step 15.5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: TrustStrip section pulling copy from site config

Credentials are wired through site.trust so a single edit propagates
to every page that includes this strip. Light and dark variants keep
the strip readable inside both cream and ink-bg sections.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 16: ServicesGrid section

**Files:**
- Create: `src/components/sections/ServicesGrid.astro`, `tests/unit/services-grid.test.ts`

This task renders a hard-coded service list. Plan 2 will rewire it to read from Content Collections. The seam stays the same — just the data source changes.

- [ ] **Step 16.1: Write the failing test**

`tests/unit/services-grid.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ServicesGrid from '~/components/sections/ServicesGrid.astro';

describe('ServicesGrid', () => {
  it('renders the five services with links to their detail pages', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(ServicesGrid);
    expect(html).toContain('Bathroom Renovations');
    expect(html).toContain('Kitchen Renovations');
    expect(html).toContain('Flooring');
    expect(html).toContain('Cabinetry');
    expect(html).toContain('Full-Home Renovations');
    expect(html).toContain('/services/bathroom-renovation');
    expect(html).toContain('/services/kitchen-renovation');
    expect(html).toContain('/services/flooring');
    expect(html).toContain('/services/cabinetry');
    expect(html).toContain('/services/full-home-renovation');
  });
});
```

- [ ] **Step 16.2: Confirm fail**

```bash
npm test -- tests/unit/services-grid.test.ts
```

- [ ] **Step 16.3: Implement `src/components/sections/ServicesGrid.astro`**

```astro
---
import Card from '~/components/ui/Card.astro';

interface Service {
  slug: string;
  title: string;
  blurb: string;
}

const services: Service[] = [
  {
    slug: 'bathroom-renovation',
    title: 'Bathroom Renovations',
    blurb: 'From powder rooms to spa-grade en-suites — tile, plumbing, vanities, all in.',
  },
  {
    slug: 'kitchen-renovation',
    title: 'Kitchen Renovations',
    blurb: 'Custom cabinetry, stone counters, and supplier-direct material pricing.',
  },
  {
    slug: 'flooring',
    title: 'Flooring',
    blurb: 'Engineered hardwood, tile, luxury vinyl — whole-home or single-room.',
  },
  {
    slug: 'cabinetry',
    title: 'Cabinetry',
    blurb: 'Built-ins, vanities, kitchens, walk-in closets — trade pricing on stock and custom.',
  },
  {
    slug: 'full-home-renovation',
    title: 'Full-Home Renovations',
    blurb: 'Whole-home gut renos, condo overhauls, and additions — managed end to end.',
  },
];
---
<section class="py-24 md:py-32">
  <div class="container-x">
    <slot name="heading" />
    <div class="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {services.map((svc) => (
        <Card href={`/services/${svc.slug}`}>
          <h3 class="text-xl font-extrabold text-ink">{svc.title}</h3>
          <p class="mt-3 text-muted text-base leading-relaxed">{svc.blurb}</p>
          <span class="mt-5 inline-block text-sm font-semibold text-midnight">Explore →</span>
        </Card>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 16.4: Confirm pass**

```bash
npm test -- tests/unit/services-grid.test.ts
```

- [ ] **Step 16.5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: ServicesGrid with five hard-coded service cards

Cards link to /services/[slug] detail pages that will be implemented
in Plan 2. The static service list lives in the component for now;
Plan 2 swaps it for a Content Collections query without touching
the markup downstream.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 17: ProcessSteps section

**Files:**
- Create: `src/components/sections/ProcessSteps.astro`, `tests/unit/process-steps.test.ts`

- [ ] **Step 17.1: Write the failing test**

`tests/unit/process-steps.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ProcessSteps from '~/components/sections/ProcessSteps.astro';

describe('ProcessSteps', () => {
  it('renders all 7 default process steps with numbers', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(ProcessSteps);
    expect(html).toContain('Free consultation');
    expect(html).toContain('Detailed written quote');
    expect(html).toContain('Design &amp; material selection');
    expect(html).toContain('Permits &amp; scheduling');
    expect(html).toContain('Construction');
    expect(html).toContain('Final walkthrough &amp; handover');
    expect(html).toContain('2-year workmanship warranty');
    // Step numbers 01..07 should appear
    expect(html).toContain('01');
    expect(html).toContain('07');
  });

  it('renders only the first N steps when compact=true with stepLimit', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(ProcessSteps, {
      props: { compact: true, stepLimit: 4 },
    });
    expect(html).toContain('01');
    expect(html).toContain('04');
    expect(html).not.toContain('05');
  });
});
```

- [ ] **Step 17.2: Confirm fail**

```bash
npm test -- tests/unit/process-steps.test.ts
```

- [ ] **Step 17.3: Implement `src/components/sections/ProcessSteps.astro`**

```astro
---
interface Step {
  title: string;
  body: string;
}

interface Props {
  /** When true, renders a compressed layout for the home page. */
  compact?: boolean;
  /** When set, limits to the first N steps. */
  stepLimit?: number;
}

const { compact = false, stepLimit } = Astro.props;

const steps: Step[] = [
  {
    title: 'Free consultation',
    body: 'We come to your home — anywhere in the GTA — look at the space, and listen to what you want. No sales pressure, no obligation.',
  },
  {
    title: 'Detailed written quote',
    body: 'Within 5 business days you get a line-item proposal: labour, materials, finishes, timeline, payment schedule. No vague lump sums.',
  },
  {
    title: 'Design & material selection',
    body: 'Select finishes from our supplier network — tile, cabinetry, countertops, flooring — at trade pricing you can\'t get at retail.',
  },
  {
    title: 'Permits & scheduling',
    body: 'If your project needs a permit, we handle the application. You get a confirmed start date in writing.',
  },
  {
    title: 'Construction',
    body: 'Daily site protection, end-of-day cleanup, weekly progress updates by text or email. One project lead from start to finish.',
  },
  {
    title: 'Final walkthrough & handover',
    body: 'We walk the finished space with you, fix any deficiencies before final payment, and hand you a closeout package.',
  },
  {
    title: '2-year workmanship warranty',
    body: 'If something we built fails, we come back and fix it. In writing.',
  },
];

const visible = stepLimit ? steps.slice(0, stepLimit) : steps;
---
<section class:list={['py-24 md:py-32 bg-cream', compact ? '' : 'border-t border-hairline']}>
  <div class="container-x">
    <slot name="heading" />
    <ol class:list={['mt-12 grid gap-8', compact ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2']}>
      {visible.map((step, i) => {
        const n = String(i + 1).padStart(2, '0');
        return (
          <li class="relative border-l-2 border-midnight pl-6">
            <span class="block text-xs font-bold tracking-widest text-midnight">{n}</span>
            <h3 class="mt-2 text-xl font-extrabold text-ink">{step.title}</h3>
            <p class="mt-2 text-muted leading-relaxed">{step.body}</p>
          </li>
        );
      })}
    </ol>
  </div>
</section>
```

- [ ] **Step 17.4: Confirm pass**

```bash
npm test -- tests/unit/process-steps.test.ts
```

- [ ] **Step 17.5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: ProcessSteps section with 7 default steps and a compact mode

The 7-step master list is colocated with the component for now; if
Plan 2 needs page-specific variations (per service detail), the
steps prop will become injectable. Compact mode is used on the home
page where space for the full list isn't warranted.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 18: TestimonialCard section (placeholder-friendly)

**Files:**
- Create: `src/components/sections/TestimonialCard.astro`, `tests/unit/testimonial-card.test.ts`

- [ ] **Step 18.1: Write the failing test**

`tests/unit/testimonial-card.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import TestimonialCard from '~/components/sections/TestimonialCard.astro';

describe('TestimonialCard', () => {
  it('renders quote, attribution, and project context when provided', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(TestimonialCard, {
      props: {
        quote: 'They finished on time and on budget.',
        author: 'Maria T.',
        context: 'Kitchen renovation, Leslieville',
      },
    });
    expect(html).toContain('They finished on time and on budget.');
    expect(html).toContain('Maria T.');
    expect(html).toContain('Kitchen renovation, Leslieville');
  });

  it('renders a placeholder when no quote is provided', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(TestimonialCard);
    expect(html).toMatch(/data-placeholder/);
  });
});
```

- [ ] **Step 18.2: Confirm fail**

```bash
npm test -- tests/unit/testimonial-card.test.ts
```

- [ ] **Step 18.3: Implement `src/components/sections/TestimonialCard.astro`**

```astro
---
interface Props {
  quote?: string;
  author?: string;
  context?: string;
}
const { quote, author, context } = Astro.props;
const isPlaceholder = !quote;
---
<figure
  class="bg-midnight-soft border border-midnight/15 rounded-sm p-8 md:p-12 max-w-3xl mx-auto"
  data-placeholder={isPlaceholder ? 'true' : undefined}
>
  {isPlaceholder ? (
    <p class="text-midnight italic text-lg md:text-xl leading-relaxed">
      "Client testimonials from completed projects will appear here as projects wrap up. Want to be our first review? <a href="/contact" class="underline">Get a quote</a>."
    </p>
  ) : (
    <>
      <blockquote class="text-ink text-lg md:text-2xl leading-relaxed">
        "{quote}"
      </blockquote>
      <figcaption class="mt-6 text-sm">
        <span class="font-semibold text-ink">{author}</span>
        {context && <span class="text-muted block mt-1">{context}</span>}
      </figcaption>
    </>
  )}
</figure>
```

- [ ] **Step 18.4: Confirm pass**

```bash
npm test -- tests/unit/testimonial-card.test.ts
```

- [ ] **Step 18.5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: TestimonialCard with a graceful "no reviews yet" placeholder

Until real testimonials arrive the placeholder doubles as a CTA
("be our first review"). The component degrades to real-quote
rendering by passing quote/author/context props — no other markup
changes needed when the first review lands.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 19: BaseLayout

**Files:**
- Create: `src/layouts/BaseLayout.astro`

BaseLayout is the minimal head + body wrapper. Used directly by `/admin` and `/thank-you` (no nav chrome); everything else uses `PageLayout` which extends it.

- [ ] **Step 19.1: Implement `src/layouts/BaseLayout.astro`**

```astro
---
import '~/styles/global.css';
import { site } from '~/lib/site';

interface Props {
  title: string;
  description?: string;
  /** Path-only canonical (e.g., '/services') — site.url is prepended. */
  canonicalPath?: string;
  noindex?: boolean;
}

const {
  title,
  description = site.description,
  canonicalPath = Astro.url.pathname,
  noindex = false,
} = Astro.props;

const canonical = new URL(canonicalPath, site.url).toString();
const fullTitle = title === site.name ? title : `${title} · ${site.name}`;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{fullTitle}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    {noindex && <meta name="robots" content="noindex" />}
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="theme-color" content="#F0EEE6" />

    <!-- Open Graph (full schema wired up in Plan 2) -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonical} />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:site_name" content={site.name} />
  </head>
  <body class="min-h-screen flex flex-col">
    <slot />
  </body>
</html>
```

- [ ] **Step 19.2: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: BaseLayout (minimal head/body wrapper)

Provides canonical URL handling, title formatting, default
description, viewport, theme-color, favicon, and Open Graph
placeholders. noindex prop covers /admin and thank-you-style
internal pages. Full schema markup arrives in Plan 2.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 20: Header (desktop nav + mobile nav trigger)

**Files:**
- Create: `src/components/layout/Header.astro`, `tests/unit/header.test.ts`

Behavior:
- Transparent over `bg-cream` sections (default page-top look) — the nav text reads `text-ink`
- On scroll past 8px, a `data-scrolled` attribute toggles, adding a hairline border and `bg-cream/95` backdrop
- Mobile (under 768px): hamburger replaces the nav; tapping opens `MobileNav` overlay

- [ ] **Step 20.1: Write the failing test**

`tests/unit/header.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Header from '~/components/layout/Header.astro';

describe('Header', () => {
  it('renders all primary nav links and the phone pill', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Header);
    expect(html).toContain('href="/services"');
    expect(html).toContain('href="/projects"');
    expect(html).toContain('href="/process"');
    expect(html).toContain('href="/about"');
    expect(html).toContain('href="/faq"');
    expect(html).toContain('416-837-6897');
    expect(html).toMatch(/aria-label="Open menu"/);
  });
});
```

- [ ] **Step 20.2: Confirm fail**

```bash
npm test -- tests/unit/header.test.ts
```

- [ ] **Step 20.3: Implement `src/components/layout/Header.astro`**

```astro
---
import Logo from '~/components/brand/Logo.astro';
import { site } from '~/lib/site';

const navItems = [
  { label: 'Services', href: '/services' },
  { label: 'Projects', href: '/projects' },
  { label: 'Process', href: '/process' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
];
---
<header
  data-scrolled="false"
  class="fixed top-0 inset-x-0 z-40 transition-all duration-200 data-[scrolled=true]:bg-cream/95 data-[scrolled=true]:backdrop-blur data-[scrolled=true]:border-b data-[scrolled=true]:border-hairline"
>
  <div class="container-x flex items-center justify-between py-5">
    <Logo variant="horizontal" size={36} class="text-midnight" />

    <nav class="hidden md:flex items-center gap-8" aria-label="Primary">
      {navItems.map((n) => (
        <a href={n.href} class="text-sm font-medium text-ink/85 hover:text-midnight transition-colors">{n.label}</a>
      ))}
      <a
        href={site.phoneHref}
        class="ml-2 inline-flex items-center px-4 py-2 border border-midnight text-midnight text-sm font-semibold tracking-wide rounded-sm hover:bg-midnight hover:text-cream transition-colors"
      >{site.phone}</a>
    </nav>

    <button
      type="button"
      aria-label="Open menu"
      aria-expanded="false"
      aria-controls="mobile-nav"
      class="md:hidden p-2 text-ink"
      data-open-menu
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </button>
  </div>
</header>

<script>
  // Toggle the scrolled state for the sticky header.
  const header = document.querySelector('header[data-scrolled]');
  if (header) {
    const onScroll = () => {
      header.setAttribute('data-scrolled', window.scrollY > 8 ? 'true' : 'false');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
</script>
```

- [ ] **Step 20.4: Confirm pass**

```bash
npm test -- tests/unit/header.test.ts
```

- [ ] **Step 20.5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: Header with desktop nav, phone pill, and mobile-menu trigger

Header is fixed and transparent until the user scrolls 8px, then it
gains a hairline border and a cream backdrop blur. Mobile shows only
the logo and a hamburger button wired to the MobileNav overlay
(implemented in Task 21).

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 21: MobileNav overlay

**Files:**
- Create: `src/components/layout/MobileNav.astro`

- [ ] **Step 21.1: Implement `src/components/layout/MobileNav.astro`**

```astro
---
import Logo from '~/components/brand/Logo.astro';
import { site } from '~/lib/site';

const navItems = [
  { label: 'Services', href: '/services' },
  { label: 'Projects', href: '/projects' },
  { label: 'Process', href: '/process' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];
---
<div
  id="mobile-nav"
  data-open="false"
  class="fixed inset-0 z-50 bg-ink text-cream data-[open=false]:hidden flex-col"
  role="dialog"
  aria-modal="true"
  aria-label="Mobile navigation"
>
  <div class="container-x flex items-center justify-between py-5">
    <Logo variant="horizontal" size={36} class="text-cream" />
    <button
      type="button"
      aria-label="Close menu"
      class="p-2 text-cream"
      data-close-menu
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 6l12 12M18 6l-12 12" />
      </svg>
    </button>
  </div>

  <nav class="container-x flex-1 flex flex-col gap-1 pt-8" aria-label="Primary mobile">
    {navItems.map((n) => (
      <a href={n.href} class="py-3 text-2xl font-extrabold tracking-tight border-b border-cream/10">
        {n.label}
      </a>
    ))}
  </nav>

  <div class="container-x py-8 flex flex-col gap-3">
    <a
      href={site.phoneHref}
      class="block w-full text-center px-5 py-4 bg-midnight text-cream text-base font-semibold rounded-sm"
    >Call {site.phone}</a>
    <a
      href="/contact"
      class="block w-full text-center px-5 py-4 border border-cream/30 text-cream text-base font-semibold rounded-sm"
    >Get a free quote →</a>
  </div>
</div>

<script>
  const dialog = document.getElementById('mobile-nav');
  const openBtn = document.querySelector('[data-open-menu]');
  const closeBtn = document.querySelector('[data-close-menu]');
  if (dialog && openBtn && closeBtn) {
    const open = () => {
      dialog.setAttribute('data-open', 'true');
      dialog.style.display = 'flex';
      (openBtn as HTMLElement).setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      dialog.setAttribute('data-open', 'false');
      dialog.style.display = 'none';
      (openBtn as HTMLElement).setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    dialog.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dialog.getAttribute('data-open') === 'true') close();
    });
  }
</script>
```

- [ ] **Step 21.2: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: MobileNav full-screen overlay

Activates on the hamburger from Header. Locks body scroll while
open, closes on link tap or Escape. Phone and Quote CTAs anchored
at the bottom for thumb reach. Hidden by default via data-open
state to keep it out of the layout flow.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 22: MobileStickyBar

**Files:**
- Create: `src/components/layout/MobileStickyBar.astro`

A bottom-fixed bar (mobile only) with two evenly-sized buttons: Call and Quote.

- [ ] **Step 22.1: Implement `src/components/layout/MobileStickyBar.astro`**

```astro
---
import { site } from '~/lib/site';
---
<div class="md:hidden fixed bottom-0 inset-x-0 z-30 bg-cream/95 backdrop-blur border-t border-hairline px-4 py-3 grid grid-cols-2 gap-2">
  <a
    href={site.phoneHref}
    class="text-center px-4 py-3 border border-midnight text-midnight text-sm font-semibold rounded-sm"
  >Call</a>
  <a
    href="/contact"
    class="text-center px-4 py-3 bg-midnight text-cream text-sm font-semibold rounded-sm"
  >Get a quote →</a>
</div>
```

- [ ] **Step 22.2: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: MobileStickyBar with Call + Quote buttons

Mobile-only bottom CTA bar so the primary actions are always one
tap away. Backdrop blur keeps it readable over any scrolling
content. Used by PageLayout, hidden on /thank-you and /admin.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 23: Footer

**Files:**
- Create: `src/components/layout/Footer.astro`, `tests/unit/footer.test.ts`

- [ ] **Step 23.1: Write the failing test**

`tests/unit/footer.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Footer from '~/components/layout/Footer.astro';

describe('Footer', () => {
  it('renders site name, phone, email, all five service links, and policy links', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Footer);
    expect(html).toContain('Elera Construction');
    expect(html).toContain('416-837-6897');
    expect(html).toContain('leads@eleraconstruction.com');
    expect(html).toContain('/services/bathroom-renovation');
    expect(html).toContain('/services/kitchen-renovation');
    expect(html).toContain('/services/flooring');
    expect(html).toContain('/services/cabinetry');
    expect(html).toContain('/services/full-home-renovation');
    expect(html).toContain('/privacy');
    expect(html).toContain('/terms');
  });
});
```

- [ ] **Step 23.2: Confirm fail**

```bash
npm test -- tests/unit/footer.test.ts
```

- [ ] **Step 23.3: Implement `src/components/layout/Footer.astro`**

```astro
---
import Logo from '~/components/brand/Logo.astro';
import { site } from '~/lib/site';

const year = new Date().getFullYear();
const services = [
  { label: 'Bathroom Renovations', href: '/services/bathroom-renovation' },
  { label: 'Kitchen Renovations', href: '/services/kitchen-renovation' },
  { label: 'Flooring', href: '/services/flooring' },
  { label: 'Cabinetry', href: '/services/cabinetry' },
  { label: 'Full-Home Renovations', href: '/services/full-home-renovation' },
];
---
<footer class="mt-auto bg-ink text-cream pt-16 pb-8">
  <div class="container-x grid gap-12 md:grid-cols-4">
    <div class="md:col-span-2">
      <Logo variant="stacked" size={56} class="text-cream" />
      <p class="mt-6 text-cream/70 max-w-xs text-sm leading-relaxed">{site.description}</p>
      <div class="mt-6 flex flex-col gap-1 text-sm">
        <a href={site.phoneHref} class="text-cream hover:text-midnight-soft">{site.phone}</a>
        <a href={`mailto:${site.email}`} class="text-cream hover:text-midnight-soft">{site.email}</a>
        <span class="text-cream/60">{site.availabilityCopy}</span>
      </div>
    </div>

    <div>
      <h4 class="text-xs font-bold tracking-[0.2em] uppercase text-cream/60">Services</h4>
      <ul class="mt-4 flex flex-col gap-2 text-sm">
        {services.map((svc) => (
          <li><a href={svc.href} class="text-cream/85 hover:text-cream">{svc.label}</a></li>
        ))}
      </ul>
    </div>

    <div>
      <h4 class="text-xs font-bold tracking-[0.2em] uppercase text-cream/60">Company</h4>
      <ul class="mt-4 flex flex-col gap-2 text-sm">
        <li><a href="/about" class="text-cream/85 hover:text-cream">About</a></li>
        <li><a href="/process" class="text-cream/85 hover:text-cream">Process</a></li>
        <li><a href="/projects" class="text-cream/85 hover:text-cream">Projects</a></li>
        <li><a href="/faq" class="text-cream/85 hover:text-cream">FAQ</a></li>
        <li><a href="/contact" class="text-cream/85 hover:text-cream">Contact</a></li>
      </ul>
    </div>
  </div>

  <div class="container-x mt-12 pt-6 border-t border-cream/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-cream/60">
    <div>© {year} {site.name}. {site.trust.insuranceCopy} · {site.trust.wsibCopy} · {site.trust.warrantyCopy}.</div>
    <div class="flex gap-6">
      <a href="/privacy" class="hover:text-cream">Privacy</a>
      <a href="/terms" class="hover:text-cream">Terms</a>
    </div>
  </div>
</footer>
```

- [ ] **Step 23.4: Confirm pass**

```bash
npm test -- tests/unit/footer.test.ts
```

- [ ] **Step 23.5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: Footer with services, company, contact, and credentials row

Four-column layout collapses to single-column on mobile. Trust copy
shows in the bottom band so the credentials persist on every page
even when the user scrolls past the inline TrustStrip. All links
point at routes that exist by end of Plan 1 or land in Plan 2.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 24: PageLayout (BaseLayout + Header + Footer + MobileStickyBar)

**Files:**
- Create: `src/layouts/PageLayout.astro`

- [ ] **Step 24.1: Implement `src/layouts/PageLayout.astro`**

```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
import Header from '~/components/layout/Header.astro';
import MobileNav from '~/components/layout/MobileNav.astro';
import MobileStickyBar from '~/components/layout/MobileStickyBar.astro';
import Footer from '~/components/layout/Footer.astro';

interface Props {
  title: string;
  description?: string;
  canonicalPath?: string;
  noindex?: boolean;
}

const props = Astro.props;
---
<BaseLayout {...props}>
  <Header />
  <MobileNav />
  <main class="flex-1 pt-24">
    <slot />
  </main>
  <Footer />
  <MobileStickyBar />
</BaseLayout>
```

- [ ] **Step 24.2: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: PageLayout composes the full chrome for content pages

Wraps BaseLayout with Header, MobileNav, Footer, and MobileStickyBar.
Adds pt-24 to <main> so content clears the fixed header. Pages
without chrome (admin, thank-you) bypass this layout.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 25: Stub home page assembling the components

**Files:**
- Modify: `src/pages/index.astro`
- Create: `src/pages/404.astro`

This validates that everything composes correctly. Plan 2 replaces this with real copy.

- [ ] **Step 25.1: Replace `src/pages/index.astro`**

```astro
---
import PageLayout from '~/layouts/PageLayout.astro';
import Hero from '~/components/sections/Hero.astro';
import TrustStrip from '~/components/sections/TrustStrip.astro';
import ServicesGrid from '~/components/sections/ServicesGrid.astro';
import ProcessSteps from '~/components/sections/ProcessSteps.astro';
import TestimonialCard from '~/components/sections/TestimonialCard.astro';
import SectionHeading from '~/components/ui/SectionHeading.astro';
import { site } from '~/lib/site';
---
<PageLayout title={site.name}>
  <Hero
    eyebrow="Greater Toronto Area"
    headline="Renovations built the way"
    headlineAccent="top developers"
    headlineTail="build."
    subhead="Bathrooms, kitchens, full-home renovations across the GTA — by a team with 10+ years building for Toronto's leading developers, and the supplier relationships to back it."
    primaryCta={{ label: 'Get a free quote', href: '/contact' }}
    secondaryCta={{ label: 'See our work', href: '/projects' }}
  />

  <TrustStrip />

  <ServicesGrid>
    <SectionHeading
      slot="heading"
      eyebrow="WHAT WE DO"
      heading="Renovations, done properly."
      subhead="From a single bathroom to a full home gut. House, condo, or townhouse — same standard of work."
      align="center"
    />
  </ServicesGrid>

  <ProcessSteps compact stepLimit={4}>
    <SectionHeading
      slot="heading"
      eyebrow="OUR PROCESS"
      heading="How it works."
      subhead="Same process for every project — no surprises."
      align="center"
    />
  </ProcessSteps>

  <section class="py-24 bg-cream">
    <div class="container-x">
      <SectionHeading
        eyebrow="WHAT OUR CLIENTS SAY"
        heading="Trusted by GTA homeowners."
        align="center"
        class="mb-12"
      />
      <TestimonialCard />
    </div>
  </section>
</PageLayout>
```

- [ ] **Step 25.2: Create `src/pages/404.astro`**

```astro
---
import PageLayout from '~/layouts/PageLayout.astro';
import Button from '~/components/ui/Button.astro';
---
<PageLayout title="Page not found" noindex>
  <section class="py-32 text-center">
    <div class="container-x">
      <p class="eyebrow">404</p>
      <h1 class="mt-3 text-5xl md:text-6xl font-extrabold">We couldn't find that page.</h1>
      <p class="mt-4 text-muted max-w-prose mx-auto">
        It may have moved, or never existed. Try the homepage or get in touch.
      </p>
      <div class="mt-8 flex flex-wrap gap-3 justify-center">
        <Button href="/" variant="primary">Back to home</Button>
        <Button href="/contact" variant="secondary">Contact us</Button>
      </div>
    </div>
  </section>
</PageLayout>
```

- [ ] **Step 25.3: Run the dev server and visually smoke-test**

```bash
npm run dev
```

Walk through `/` and `/non-existent-page`. Confirm:
- Header is transparent at top, gains border + backdrop when scrolling
- Hero displays with midnight accent on "top developers"
- TrustStrip shows the four credentials
- ServicesGrid renders 5 cards
- ProcessSteps shows 4 steps in compact mode
- TestimonialCard placeholder copy appears
- Footer renders with all link sections
- Mobile (resize browser < 768px): hamburger appears, click opens overlay, MobileStickyBar appears
- 404 page renders with two CTAs

Stop the server.

- [ ] **Step 25.4: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: stub home page assembling all section components, plus 404

Validates every Plan 1 component composes without layout regressions.
Copy is intentionally minimal — Plan 2 replaces the home page with
final copy, real featured projects, and FAQ teaser. 404 page already
uses its final design.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 26: E2E coverage for the assembled shell

**Files:**
- Modify: `tests/e2e/home.spec.ts`
- Create: `tests/e2e/nav.spec.ts`, `tests/e2e/responsive.spec.ts`

- [ ] **Step 26.1: Extend the home E2E**

Replace `tests/e2e/home.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('renders the hero with the company differentiator', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('top developers');
  });

  test('renders the trust strip credentials', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Insured up to $2M')).toBeVisible();
    await expect(page.getByText('WSIB Cleared')).toBeVisible();
    await expect(page.getByText('2-Year Workmanship Warranty')).toBeVisible();
  });

  test('lists all five services with links', async ({ page }) => {
    await page.goto('/');
    for (const slug of [
      'bathroom-renovation',
      'kitchen-renovation',
      'flooring',
      'cabinetry',
      'full-home-renovation',
    ]) {
      await expect(page.locator(`a[href="/services/${slug}"]`)).toBeVisible();
    }
  });
});
```

- [ ] **Step 26.2: Add `tests/e2e/nav.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test('header nav links are present on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  for (const label of ['Services', 'Projects', 'Process', 'About', 'FAQ']) {
    await expect(page.getByRole('link', { name: label, exact: true }).first()).toBeVisible();
  }
  await expect(page.getByRole('link', { name: '416-837-6897' })).toBeVisible();
});

test('404 page renders with both CTAs', async ({ page }) => {
  const response = await page.goto('/this-route-does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('couldn\'t find');
  await expect(page.getByRole('link', { name: 'Back to home' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Contact us' })).toBeVisible();
});
```

- [ ] **Step 26.3: Add `tests/e2e/responsive.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Responsive chrome', () => {
  test('desktop: no hamburger, no mobile sticky bar', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeHidden();
    await expect(page.getByRole('link', { name: 'Get a quote →' }).last()).toBeHidden();
  });

  test('mobile: hamburger opens overlay; sticky bar is visible', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('dialog', { name: 'Mobile navigation' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Mobile navigation' })).toBeHidden();
    // Mobile sticky bar
    await expect(page.locator('a[href="tel:+14168376897"]').last()).toBeVisible();
  });
});
```

- [ ] **Step 26.4: Run the full E2E suite**

```bash
npm run test:e2e
```

Expected: all tests PASS. If `404 status` assertion fails, double-check Astro's `404.astro` page is at `src/pages/404.astro` (not in a subdirectory).

- [ ] **Step 26.5: Run the unit suite to confirm nothing regressed**

```bash
npm test
```

Expected: all PASS.

- [ ] **Step 26.6: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
test: end-to-end coverage for home, nav, 404, and responsive chrome

Locks the shell behavior: home renders the differentiator copy and
all five service links; desktop hides mobile-only UI; mobile shows
the hamburger, opens the overlay, and reveals the sticky bar.
Regressions in the layout chrome now break CI before they ship.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 27: Push to GitHub and tag the milestone

**Files:** none (git only)

- [ ] **Step 27.1: Push all commits**

```bash
git push origin main
```

Expected: all Plan 1 commits land on `origin/main`.

- [ ] **Step 27.2: Tag the milestone**

```bash
git tag -a v0.1.0-foundation -m "Plan 1 complete: foundation and design system"
git push origin v0.1.0-foundation
```

---

## Self-review checklist (run before handing off)

- [ ] **Spec coverage:** every Section 2 (tech stack), Section 4 (design system), and Section 3 (sitemap chrome — header, footer, mobile sticky) requirement maps to a task above.
- [ ] **No placeholders:** no "TBD" / "TODO" / "add appropriate" / "similar to Task N" anywhere in this plan.
- [ ] **Type consistency:** `site.phone` / `site.phoneHref` / `site.email` / `site.founder` are referenced consistently. `Logo` variants are exactly `'horizontal' | 'stacked' | 'icon'` everywhere. Button variants are exactly `'primary' | 'secondary' | 'ghost'`.
- [ ] **Tests exist:** every component task has at least one Vitest test. End-to-end coverage exists for the assembled shell.
- [ ] **No spec section orphaned:** form-handler, JSON-LD, CMS, deploy are intentionally out of scope (Plans 2 and 3). All other foundation requirements from Sections 2, 3, 4 are covered.

---

## What Plan 2 will assume exists after this plan

- Working Astro project, Tailwind v4, Cloudflare adapter, Inter font
- All UI primitives: Button, TextInput, Textarea, SegmentedControl, Dropdown, SectionHeading, Card, FaqAccordion
- All section components: Hero, TrustStrip, ServicesGrid, ProcessSteps, TestimonialCard
- Layout chrome: Header, MobileNav, MobileStickyBar, Footer
- Layouts: BaseLayout, PageLayout
- `src/lib/site.ts` central config
- 404 page
- Vitest + Playwright harness with green test suite

## What Plan 2 will add

- Astro Content Collections schemas (services, projects, blog)
- All 12 public pages with final copy
- 2–3 seed blog posts, 3–5 seed project entries (with AI-image placeholders)
- BeforeAfterSlider component
- JSON-LD components (LocalBusiness, Service, FAQPage, BreadcrumbList, Article, CreativeWork)
- sitemap.xml, robots.txt, llms.txt
- Service detail page template, Project detail page template
- ServicesGrid rewired to source from Content Collections
- Internal link audit
