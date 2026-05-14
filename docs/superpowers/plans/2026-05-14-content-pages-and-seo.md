# Content Pages & SEO Infrastructure — Implementation Plan

**Goal:** Replace the stub home with the real content site: all 12 public pages with final copy, Astro Content Collections schemas, JSON-LD structured data, sitemap/robots/llms.txt, seed blog posts and project entries (with placeholder images), and a filterable portfolio with before/after slider.

**Architecture:** Static-first content collections (MDX) for pages that change rarely; Decap-ready schemas for projects + blog. SEO helpers emit JSON-LD as `<script type="application/ld+json">` slotted into `BaseLayout`. Tight scope: no form server endpoint (Plan 3), no CMS UI wiring (Plan 3), no geo landing pages (Phase 2 of the spec).

**Tech Stack:** Astro 6 Content Collections (MDX), `@astrojs/sitemap`, `@astrojs/mdx`, JSON-LD schemas as Astro components, Inter font already wired, existing layouts/components from Plan 1.

**Spec reference:** `docs/superpowers/specs/2026-05-13-elera-construction-website-design.md` Sections 3, 5, 7.

---

## File Structure (target state at end of Plan 2)

```
src/
├── content.config.ts                         # Collection schemas (Zod)
├── content/
│   ├── services/                             # one MDX per service
│   │   ├── bathroom-renovation.mdx
│   │   ├── kitchen-renovation.mdx
│   │   ├── flooring.mdx
│   │   ├── cabinetry.mdx
│   │   └── full-home-renovation.mdx
│   ├── projects/                             # seed entries
│   │   ├── leslieville-kitchen.mdx
│   │   ├── high-park-bathroom.mdx
│   │   ├── etobicoke-condo-floors.mdx
│   │   └── vaughan-full-home.mdx
│   └── blog/                                 # seed posts
│       ├── kitchen-reno-cost-2026.mdx
│       ├── choosing-a-contractor.mdx
│       └── permits-for-condo-renos.mdx
├── lib/
│   └── seo.ts                                # JSON-LD builders (LocalBusiness, Service, FAQPage, etc.)
├── components/
│   ├── seo/
│   │   └── JsonLd.astro                      # <script type="application/ld+json"> wrapper
│   ├── ui/
│   │   ├── Breadcrumb.astro
│   │   └── BeforeAfterSlider.astro
│   └── sections/
│       ├── ProjectCard.astro
│       └── BlogCard.astro
├── layouts/
│   ├── ServiceLayout.astro                   # for service detail pages
│   └── ProjectLayout.astro                   # for project detail pages
└── pages/
    ├── index.astro                           # REPLACE stub with final home
    ├── about.astro
    ├── contact.astro                         # form is a non-functional shell; Plan 3 wires it
    ├── process.astro
    ├── faq.astro
    ├── privacy.astro
    ├── terms.astro
    ├── thank-you.astro
    ├── services/
    │   ├── index.astro
    │   └── [slug].astro
    ├── projects/
    │   ├── index.astro                       # filterable gallery
    │   └── [slug].astro
    └── blog/
        ├── index.astro
        └── [slug].astro

public/
├── llms.txt                                  # AI crawler summary
└── robots.txt                                # full version (sitemap-aware)

astro.config.mjs                              # +@astrojs/sitemap, +@astrojs/mdx
```

---

## Task list (executed inline, TDD where logic exists)

### Phase A — SEO infrastructure (Tasks 1–4)

**Task 1:** Add MDX + Sitemap integrations
- `npx astro add mdx sitemap --yes`
- Sitemap integration registered in `astro.config.mjs`
- Verify build still works

**Task 2:** Create `src/lib/seo.ts` with JSON-LD builders
- `buildLocalBusiness()` — used on every page
- `buildService(service)` — service detail pages
- `buildFAQPage(faqs)` — FAQ page + service-page FAQs
- `buildBreadcrumb(items)` — service/project/blog detail pages
- `buildArticle(post)` — blog post pages
- `buildProject(project)` — project detail pages
- Unit tests: each builder produces valid JSON-LD with required fields

**Task 3:** Create `JsonLd.astro` component + extend `BaseLayout`
- Component takes a `data` prop, renders `<script type="application/ld+json">`
- `BaseLayout` always emits `LocalBusiness` schema; page-specific schemas via a named slot

**Task 4:** Create `public/llms.txt`, `public/robots.txt`
- llms.txt: brief summary of company, services, key pages, NAP, "use for AI summarization"
- robots.txt: allow all, sitemap pointer

### Phase B — Content Collections + seed data (Tasks 5–8)

**Task 5:** `src/content.config.ts` schemas
- `services` collection (in-repo MDX)
- `projects` collection (Decap-ready; placeholder images)
- `blog` collection (Decap-ready)
- Zod schemas enforce `alt` text on all images; required `title`, `summary`, `heroImage`, etc.

**Task 6:** 5 service MDX files
- bathroom-renovation, kitchen-renovation, flooring, cabinetry, full-home-renovation
- Each has: title, summary, heroImage (placeholder ref), `whatsIncluded` checklist, `processSteps` (tailored), service-specific FAQs (4–6), MDX body

**Task 7:** 4 seed project MDX files
- leslieville-kitchen, high-park-bathroom, etobicoke-condo-floors, vaughan-full-home
- Each has: title, summary, service tags, propertyType, location, year, hero placeholder, scope, narrative

**Task 8:** 3 seed blog post MDX files
- kitchen-reno-cost-2026, choosing-a-contractor, permits-for-condo-renos
- Each has: title, summary, hero placeholder, publishedAt, body

### Phase C — Page templates + pages (Tasks 9–18)

**Task 9:** ProjectCard, BlogCard, Breadcrumb, BeforeAfterSlider components
- All with unit tests

**Task 10:** ServiceLayout + service detail page (`/services/[slug]`)
- Hero, what's included, process steps (tailored), related projects, service-specific FAQs (with schema), trust strip, CTA
- `getStaticPaths` from services collection

**Task 11:** Services overview (`/services`)

**Task 12:** ProjectLayout + project detail (`/projects/[slug]`)
- Hero, before/after gallery (slider), scope, narrative, related projects, CTA

**Task 13:** Projects index (`/projects`) — filterable by service tag (client-side, minimal JS island)

**Task 14:** Blog index (`/blog`) + blog post (`/blog/[slug]`)

**Task 15:** About, Process, FAQ pages
- About: founder story, supplier-network differentiator, values, trust details
- Process: full 7 steps + "what sets us apart" + process-specific FAQ
- FAQ: grouped, with FAQPage schema

**Task 16:** Contact, Thank-you, Privacy, Terms pages
- Contact: form shell (non-functional; Plan 3 wires it), phone, email, service area
- Thank-you: post-form-submit landing
- Privacy + Terms: minimal lawful boilerplate noting we collect form data + use Resend, Cloudflare

**Task 17:** Replace stub home page (`/`) with final assembly
- Hero, trust strip, "Why Elera" dark inset, services grid, featured projects (3), process summary (4 steps), testimonial placeholder, FAQ teaser, final CTA

**Task 18:** ServicesGrid rewired to read from content collection (was hardcoded in Plan 1)
- Drop the hardcoded array; query `services` collection; same markup

### Phase D — Wrap-up

**Task 19:** Update Footer / nav internal links audit
- Verify every internal link resolves to an existing page
- Build passes with zero broken-link warnings

**Task 20:** Lighthouse smoke (manual, optional)
- `npm run build && npm run preview`, run Lighthouse against `/` and `/services/kitchen-renovation`
- Document scores in commit (no hard gate at this plan; full perf budget enforcement is Phase 2)

**Task 21:** Push branch, open PR description

---

## Out of scope (deferred to Plan 3)

- Form server endpoint (`/api/quote`)
- Resend integration, Cloudflare Turnstile
- Workers KV fallback
- Decap CMS UI wiring (`/admin`)
- Cloudflare Pages deploy config & env vars

## Out of scope (deferred to Phase 2 — separate spec/plan)

- Per-city geo landing pages
- Lighthouse CI gating
- Real photography
- Multilingual / i18n
