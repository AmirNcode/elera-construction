# Elera Construction Website — Design Spec

**Status:** Draft, pending review
**Date:** 2026-05-13
**Owner:** Amir
**Project:** Marketing website for Elera Construction (residential renovations, Greater Toronto Area)

---

## 1. Goal & Audience

### Primary goal
Convert GTA homeowners researching home renovations into qualified leads via the Quote Request form or phone call.

### Audience
Homeowners in the Greater Toronto Area planning a renovation project. Property types: single-family detached, semi-detached, townhouses, and condos/apartments. Project types: bathrooms, kitchens, flooring, cabinetry, and full-home renovations.

### Why this site can win
Elera is a new company without a public portfolio. The site has to substitute for word-of-mouth and reviews with:
- The founder's 10+ years building for top GTA developers (premium pedigree)
- Direct supplier relationships → trade pricing on cabinetry, tile, stone, and flooring
- Concrete trust signals: $2M general liability insurance, WSIB clearance, 2-year workmanship warranty
- A clearly explained renovation process that removes uncertainty
- A premium visual identity that justifies "request a quote" (no public pricing)

### Success metrics (post-launch)
- Quote-form conversion rate (target: 2–4% of unique visitors)
- Phone calls from the site (tracked via call-tracking number — phase 2)
- Lighthouse scores: 95+ on Performance, Accessibility, Best Practices, SEO
- Organic search rankings for primary keywords (e.g., "kitchen renovation Toronto") within 6 months
- AI search citation (Google AI Overview / Perplexity) for at least one GTA renovation query within 6 months

### Non-goals
- E-commerce, online booking/payment
- Public pricing (intentional — "request a quote" only)
- Multilingual / i18n at launch (English only; architected to allow future addition)
- Client portal / project tracking dashboard

---

## 2. Tech Stack & Architecture

### Stack
- **Framework:** Astro 5 (static-first, with server endpoints for the form handler)
- **Styling:** Tailwind CSS v4 (utility-first, no runtime cost)
- **Content:** Astro Content Collections (MDX) for pages, blog posts, projects, services
- **CMS:** Decap CMS (git-based, free) for blog and portfolio entries; core pages stay in-repo as MDX
- **Forms / email:** Astro server endpoint (`/api/quote`) → Resend transactional email
- **Spam protection:** Cloudflare Turnstile + honeypot field
- **Hosting:** Cloudflare Pages (global CDN, free tier, supports Astro SSR endpoints)
- **Analytics:** Cloudflare Web Analytics (privacy-friendly, no cookie banner needed)
- **Icons:** Lucide
- **Fonts:** Inter (Google Fonts, variable, self-hosted for performance)

### Architecture principles
- **Static-first.** Every page pre-rendered at build. The form handler is the only server endpoint.
- **Islands.** Zero JavaScript by default. Hydrate only interactive components: mobile nav, form, image galleries, FAQ accordions.
- **Type-safe content.** Content Collections schemas validate every MDX file at build (catches missing alt text, missing meta, etc. before deploy).
- **Git as database.** Decap CMS commits content edits to the repo; deploys trigger automatically. No external database to manage.
- **No client-side router.** Astro View Transitions handle page nav with browser-native APIs.

### Explicitly NOT using
- React, Vue, Svelte — Astro's native components suffice; less JS to ship
- Traditional CMS (Wordpress, Sanity, Strapi) — overkill for content volume; Decap is sufficient
- Serverless functions beyond the form handler

### Project structure
```
/
├── astro.config.mjs
├── tailwind.config.js
├── decap.config.yml             # CMS schema
├── public/
│   ├── admin/                   # Decap CMS UI
│   ├── llms.txt                 # AI crawler summary
│   └── (favicon, og-default, robots is generated)
├── src/
│   ├── content/
│   │   ├── config.ts            # Collection schemas (Zod)
│   │   ├── projects/            # MDX, CMS-editable
│   │   ├── blog/                # MDX, CMS-editable
│   │   └── services/            # MDX, in-repo only
│   ├── components/
│   │   ├── layout/              # Header, Footer, MobileSticky
│   │   ├── ui/                  # Button, Card, Input, FAQ, etc.
│   │   ├── sections/            # Hero, TrustStrip, ServicesGrid, etc.
│   │   └── seo/                 # SEO head, JSON-LD components
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── PageLayout.astro
│   │   ├── ServiceLayout.astro
│   │   └── ProjectLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── process.astro
│   │   ├── faq.astro
│   │   ├── thank-you.astro
│   │   ├── privacy.astro
│   │   ├── terms.astro
│   │   ├── services/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── projects/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   └── api/
│   │       └── quote.ts         # Server endpoint
│   ├── lib/
│   │   ├── email.ts             # Resend wrapper
│   │   ├── validation.ts        # Form/Zod schemas
│   │   └── seo.ts               # Schema.org helpers
│   └── styles/
│       └── globals.css          # Tailwind + custom properties
├── docs/
│   └── superpowers/
│       └── specs/               # this file
└── tests/
    ├── unit/                    # form validation, helpers
    └── e2e/                     # Playwright: form submission, nav, perf
```

---

## 3. Sitemap & Pages

### Public pages (12)

| URL | Purpose | Source |
|---|---|---|
| `/` | Home | MDX |
| `/services` | Services overview | MDX |
| `/services/bathroom-renovation` | Service detail | MDX |
| `/services/kitchen-renovation` | Service detail | MDX |
| `/services/flooring` | Service detail | MDX |
| `/services/cabinetry` | Service detail | MDX |
| `/services/full-home-renovation` | Service detail | MDX |
| `/projects` | Portfolio gallery (filterable) | Decap CMS |
| `/projects/[slug]` | Project detail | Decap CMS |
| `/about` | About / founder story | MDX |
| `/process` | 7-step renovation process | MDX |
| `/faq` | FAQ (grouped, with FAQPage schema) | MDX |
| `/contact` | Quote form + phone/email/area | MDX |
| `/blog` | Blog index | Decap CMS |
| `/blog/[slug]` | Blog post | Decap CMS |

### Utility pages (4)
- `/thank-you` — post-form-submit landing (conversion target)
- `/privacy` — privacy policy
- `/terms` — terms of service
- `/admin` — Decap CMS UI (`noindex`)

### Global navigation
- **Desktop header:** Logo · Services · Projects · Process · About · FAQ + phone number (visible, click-to-call)
- **Mobile header:** Logo + hamburger menu (full-screen overlay)
- **Mobile sticky bottom bar:** "Call" button + "Quote" button (visible on every page except `/thank-you` and `/admin`)
- **Footer:** Logo, service links, contact info, trust badges, license/insurance details (placeholder for numbers), Privacy/Terms links

### Home page sections (top to bottom)
1. Hero — eyebrow + headline + subhead + primary CTA + secondary CTA + phone
2. Trust strip — 4 badges in one row (insured / WSIB / warranty / GTA-wide)
3. Services grid — 5 service cards linking to detail pages
4. Why Elera (dark inset section) — founder pedigree + supplier-pricing differentiator
5. Featured projects — 3 cards
6. Process summary — compressed 7-step
7. Testimonial — placeholder (replaceable when reviews arrive)
8. FAQ teaser — 4 questions
9. Final CTA section — full-width with form preview or direct link
10. Footer

### Service detail page template (used for all 5 services)
1. Hero — service-specific imagery + headline + CTA
2. "What's included" — checklist
3. Service-specific process steps (tailored from the 7-step master)
4. Related project examples (2–3, filtered by service tag)
5. Service-specific FAQs (4–6, with FAQPage schema)
6. Trust strip
7. CTA

### Project detail page template
1. Hero — project name + location (neighborhood/city) + completion year
2. Before/after gallery (with toggle slider for hero comparison)
3. Project scope — services used, property type, project length
4. "About this project" narrative — 2–3 paragraphs
5. Materials / suppliers used (optional, demonstrates supplier-network claim)
6. "Want something similar?" CTA
7. Related projects (2 cards)

---

## 4. Visual Design System

### Color tokens

| Token | Hex | Use |
|---|---|---|
| `--cream` | `#F0EEE6` | Page background (warm white, not yellow) |
| `--paper` | `#FFFFFF` | Card backgrounds, max contrast surfaces |
| `--midnight` | `#1E3A5F` | Primary brand color: logo, CTAs, links, eyebrows, accents |
| `--midnight-deep` | `#16304F` | Hover / pressed state for primary actions |
| `--midnight-soft` | `#E8EDF3` | Tinted backgrounds (CTA section panels, hover states on cards) |
| `--ink` | `#14241B` | Body text on light, headlines |
| `--slate` | `#1A1A1A` | Secondary headings |
| `--muted` | `#6B6B6B` | Captions, eyebrows when not branded, microcopy |
| `--hairline` | `#E5E0D8` | Subtle borders, dividers |
| `--success` | `#5C8A6E` | Form success states |
| `--danger` | `#A04545` | Form errors |

### Typography
- **All headings and body:** Inter (variable, self-hosted from `unpkg.com/@fontsource-variable/inter` or similar; subset to Latin)
- **Heading weights:** 700–800, tight letter-spacing (-0.025em), generous line-height (1.05–1.15)
- **Body weight:** 400, line-height 1.55
- **Microcopy/eyebrows:** Inter, 11–12px, uppercase, +0.18–0.22em tracking, weight 700

**Type scale (desktop / mobile, px):**
- H1 hero: 64 / 40
- H2 section: 44 / 32
- H3 card: 24 / 22
- Body: 17 / 16
- Small: 14 / 14
- Eyebrow: 12 / 11

### Spacing & layout
- Max content width: 1280px
- Gutters: 24px mobile, 48px desktop
- Vertical section padding: 96px desktop, 56px mobile
- Spacing scale: 4/8/12/16/24/32/48/64/96 px (Tailwind defaults)

### Logo & lockups
- **Primary lockup:** All midnight blue, sunburst icon + ELERA wordmark + CONSTRUCTION subtype
- **Horizontal lockup** for nav (icon left of wordmark)
- **Stacked lockup** for footer, About hero, social avatars, business cards
- **Icon-only mark** for favicon, app icon, watermarks
- Owner provides final SVG; in the meantime an internal SVG approximation is used

### Components inventory
- Buttons: `primary` (filled midnight, cream text), `secondary` (outlined ink), `ghost` (text only)
- Cards: ServiceCard, ProjectCard (with before/after toggle), TestimonialCard, ProcessStep, BlogCard
- Inputs: TextInput, TextareaInput, SegmentedControl, Dropdown, all with label + error state
- FAQ accordion (single-expand)
- TrustStrip
- Hero (light variant — primary) and Hero (dark variant — for "Why Elera" inset sections)
- Header (transparent over hero, ink-on-cream when scrolled), MobileNav, MobileStickyBar
- Footer (dark, multi-column)
- SectionEyebrow + SectionHeading combo
- BeforeAfterSlider (interactive island)
- Map embed (Contact page; lightweight, deferred)

### Motion
- Section fade-up on scroll (Intersection Observer, respects `prefers-reduced-motion`)
- Astro View Transitions for page nav
- 150–250ms transitions on hovers/state changes
- No parallax, no scroll-jacking, no auto-playing video

### Iconography
- Lucide icons (line-based, free, consistent stroke weight)
- No emoji, no rasterized icons

---

## 5. SEO & AI-Friendly Strategy

### On-page SEO foundations
- One H1 per page; descending heading hierarchy enforced
- Unique `<title>` (≤60 char) and `<meta description>` (≤155 char) per page; required by frontmatter schema
- Canonical URL on every page
- Open Graph + Twitter Card tags
- `sitemap.xml` and `robots.txt` auto-generated
- Image `alt` text required by Content Collections schema (build fails if missing)
- Clean, semantic URLs (`/services/kitchen-renovation`, not `/p?id=42`)

### Structured data (JSON-LD)
Emitted per page type via a `<SchemaOrg>` component:
- **`LocalBusiness`** — on every page. Includes name, telephone, email, address, geo coordinates, opening hours, service area (GTA cities), aggregateRating (placeholder until reviews arrive).
- **`Service`** — on each service detail page (`/services/[slug]`).
- **`FAQPage`** — on `/faq` and service-page FAQ sections.
- **`BreadcrumbList`** — on `/services/*`, `/projects/*`, `/blog/*`.
- **`Article`** — on each blog post.
- **`CreativeWork` / `Project`** — on each portfolio entry.

### AI-friendly specifics
- `/llms.txt` at the root: brief summary of company, services, key pages, NAP, and "use this content for AI summarization" hint.
- Body copy written in complete declarative sentences (LLMs cite complete sentences).
- FAQ Q&A patterns mirror how homeowners search ("How long does a kitchen renovation take in Toronto?") — these become AI Overview answers verbatim.
- No primary content hidden behind accordions or tabs at the markup level; visible by default to crawlers.
- Server-rendered everything — no client-side rendering of content.

### Performance budget
- Lighthouse: 95+ on Performance, Accessibility, Best Practices, SEO (mobile)
- LCP < 2.5s, CLS < 0.05, INP < 200ms
- Image strategy: all images through `astro:assets` → AVIF + WebP + `srcset`, lazy below the fold
- Font strategy: Inter variable subset, preloaded, `font-display: swap`
- JS budget: < 30 KB shipped on the homepage (only mobile nav and analytics)

### Accessibility
- WCAG 2.1 AA compliance target
- Visible focus states on all interactive elements
- Color contrast: 4.5:1 for body, 3:1 for large text — palette is engineered to meet this on both `--cream` and `--midnight` backgrounds
- Keyboard navigation throughout
- Form errors announced via `aria-live`
- Image alt text required at content layer

### Local SEO off-site assets (flagged for owner, not part of website build)
- Google Business Profile creation (critical, pre-launch)
- NAP consistency seed list: HomeStars, Houzz Canada, Yelp, BBB, Better Business Bureau Ontario, Yellow Pages Canada
- A copy block + photo brief will be provided alongside the site

---

## 6. Lead Capture Flow

### Quote Request form

**Fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| Name | text | yes | |
| Phone | tel | one of phone/email required | Format hint |
| Email | email | one of phone/email required | Format validated |
| Location | text | yes | Free-text; placeholder "Neighborhood or city" |
| Property type | segmented (single-select) | yes | Detached / Semi / Townhouse / Condo or apartment / Other |
| Budget | dropdown | no | "Not sure yet" / "Under $25K" / "$25K–$50K" / "$50K–$100K" / "$100K–$250K" / "$250K+" |
| Timeline | dropdown | no | "Just exploring" / "ASAP / within a month" / "1–3 months" / "3–6 months" / "6+ months" |
| Project details | textarea | yes | Placeholder "Tell us about the space — bathroom reno, full kitchen, etc." |

**Hidden / passive fields (server-side):**
- Honeypot field (silently rejects submission if filled)
- Cloudflare Turnstile token (validated server-side)
- UTM parameters from URL (captured client-side)
- Page-of-origin (URL the form was submitted from)
- Submission timestamp

### Server flow (`POST /api/quote`)
1. Verify Turnstile token via Cloudflare API → reject on failure
2. Validate fields against Zod schema → return field-level errors on failure
3. Send two emails via Resend:
   - **To owner** (`leads@<domain>`):
     Subject: `New quote request — [Name], [Property type], [Location]`
     Body: all fields, page-of-origin, UTM info
     Reply-To: lead's email (so owner can reply directly)
   - **To lead** (if email provided):
     Subject: `Thanks — we've received your renovation enquiry`
     Body: warm acknowledgement, "we'll be in touch within 24 hours", phone number for urgent matters, next-steps preview
4. Return JSON `{ success: true }` → client redirects to `/thank-you`
5. On Resend failure: log lead to fallback (Cloudflare KV) and return success to user; owner gets a daily stranded-lead digest

### Anti-loss safeguards
- If both emails fail, lead is logged and the user still sees success — no lost lead
- Client retains form values on network error and shows a retry option
- Form submissions are logged with a unique ID (used in fallback queue)

### `/thank-you` page
- Confirms submission, restates "within 24h" expectation
- Repeats phone number
- Two suggested next reads: "See our process" + "Browse our projects"
- Tracks conversion goal in Cloudflare Web Analytics

### Phone CTA
- Header pill on desktop
- Mobile sticky bottom bar — "Call" (tel:) + "Quote" (anchor / modal)
- Footer
- In JSON-LD `LocalBusiness.telephone`

---

## 7. CMS Setup (Decap)

### Schema for Project entries
- `title` (string, required)
- `slug` (auto-generated from title)
- `service` (one of: bathroom / kitchen / flooring / cabinetry / full-home — multi-select)
- `propertyType` (one of: detached / semi / townhouse / condo)
- `location` (string — neighborhood/city)
- `year` (number)
- `summary` (string, ≤200 char — used in cards and meta description)
- `heroImage` (image, with required `alt`)
- `gallery` (list of {image, alt, caption?, kind: before|after|inProgress})
- `scope` (rich text — what was done)
- `body` (markdown — narrative)
- `featured` (boolean — controls home page surfacing)

### Schema for Blog post entries
- `title`, `slug` (auto)
- `summary` (string, ≤200 char)
- `heroImage` (image + alt)
- `publishedAt` (date)
- `updatedAt` (date, optional)
- `tags` (string list)
- `author` (string — default "Elera Construction")
- `body` (markdown)

### Owner UX
- Owner logs in at `/admin` via Decap's auth (GitHub OAuth or invite link)
- Edits via web UI; commits land in `main` branch → Cloudflare Pages auto-deploys
- Editorial workflow optional (Draft / In Review / Ready) — recommend enabling

---

## 8. Out of Scope (explicit)

Items intentionally deferred to keep the launch scope tight:

- **Per-city geo landing pages** (Mississauga, Vaughan, Markham, Oakville, Richmond Hill, Brampton) — architecture supports adding `/areas/[city]` later without rework. Reconsider after first month of traffic data + GBP set up.
- **Multilingual support** — English only. Site structure compatible with future i18n via Astro's built-in i18n module.
- **Online booking / Calendly integration** — confirmation email links can add this later when owner is ready.
- **CRM integration** (Airtable, HubSpot) — leads land in email; CRM bolt-on is a phase-2 task if volume grows.
- **Client portal / project tracking** — out of scope.
- **Call-tracking number** — phone number is direct; replace with a tracking number in phase 2 to attribute calls to source.
- **Live chat** — out of scope.
- **Real testimonials and reviews** — placeholder testimonial component for now; replace as actual reviews arrive (homepage + service pages have `TestimonialCard` slots).
- **Real portfolio photography** — homeowner-supplied AI before/after images are placeholders; replace as real projects complete.
- **Pricing transparency** — no public pricing; "request a quote" only.

---

## 9. Operational Inputs — Resolved

### Values confirmed for build

| Item | Resolved value |
|---|---|
| Phone number (placeholder) | `416-837-6897` — stored in a single config file; one-line swap when final number is set |
| Lead-destination email | `leads@eleraconstruction.com` (Google Workspace) — also the Resend sender after domain verification |
| Hours of operation | **None published.** Owner takes calls when awake. Contact page shows "Available 7 days a week — reach out anytime." `openingHours` is omitted from `LocalBusiness` JSON-LD. |
| Logo | Internal SVG approximation (16-ray sunburst + ELERA wordmark, midnight blue) committed to `src/components/brand/Logo.astro`. Replace with owner-supplied SVG when available. |
| Domain | `eleraconstruction.com` — used for canonical URLs, OG tags, sitemap, Resend sender, schema URL |
| Founder first name | Kaveh — appears in About narrative and lead confirmation email sign-off ("— Kaveh & the Elera team") |
| Imagery | Neutral gray placeholder blocks with labels (e.g., "[Hero — kitchen renovation]") in `src/assets/placeholders/`. Owner supplies AI before/after images for portfolio post-build. |
| GitHub | Repo: `https://github.com/AmirNcode/elera-construction.git`. Decap OAuth app set up during CMS-wiring phase. |
| Cloudflare | Account exists. Pages + Turnstile + Web Analytics + Workers KV (KV namespace `lead-fallback`) configured at deploy time. |
| Resend | Account exists, API key obtained. Domain verification (SPF / DKIM / DMARC for `eleraconstruction.com`) happens at deploy time. API key stored only in Cloudflare Pages env vars and local `.env.local` — never committed. |

### Secrets handling (security note)
- `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, and any other secrets live in:
  - **Local dev:** `.env.local` (git-ignored)
  - **Production:** Cloudflare Pages → Settings → Environment variables (encrypted)
- A `.env.example` is committed listing required vars without values

### Nice-to-haves (post-launch, not blocking)
- Real WSIB clearance + insurance certificate numbers (display in footer; placeholder copy "Insured up to $2M · WSIB Cleared" works in the meantime)
- Social media URLs (Instagram, Facebook) for footer
- Owner-supplied seed blog topics / outlines
- Final logo SVG from owner

### Things the build will generate (no further owner input needed)
- All page copy (hero, services, about, process, FAQ, privacy, terms) drafted from this spec
- 2–3 seed blog posts (likely topics: "What does a kitchen renovation cost in the GTA in 2026", "Choosing a contractor: 7 questions to ask", "Permits for condo renovations in Toronto")
- All schema.org JSON-LD
- Tailwind theme, component library, layouts

---

## 10. Testing & Validation Strategy

- **Unit tests:** form validation logic, email body builders, schema.org helpers
- **E2E tests** (Playwright): home page renders, quote form happy path, quote form validation errors, mobile sticky bar visibility, 404 page
- **Visual regression:** screenshot tests for key pages at desktop + mobile widths
- **Lighthouse CI:** runs against every preview deploy; blocks merge if scores drop below targets
- **Accessibility:** axe-core run in E2E suite
- **Build-time content validation:** Content Collections Zod schemas fail the build on missing required fields

---

## 11. Phased Rollout

### Phase 1 — Launch (scope of this spec)
All 12 public pages + utilities, full visual system, lead capture, Decap CMS for projects + blog, 2–3 seed blog posts, AI-friendly + structured-data foundation, performance/a11y baselines.

### Phase 2 — Growth (post-launch, separate spec)
- Per-city landing pages (Mississauga, Vaughan, Markham, Oakville, Richmond Hill)
- More blog content (cost guides, permit guides, neighborhood guides)
- Real reviews replacing placeholders
- Real photography replacing AI placeholders
- Call-tracking number
- Optional: Calendly self-booking integration
- Optional: CRM integration

### Phase 3 — Scale (if/when warranted)
- Multilingual support (French / Mandarin / Persian if a community niche emerges)
- Per-neighborhood landing pages within Toronto (Leslieville, High Park, Forest Hill, etc.)
- Lead-magnet content (downloadable cost guides, email nurture)
- Owner-facing CRM dashboard

---

## 12. Open Decisions / Risks

- **Logo SVG quality:** the rays in the design preview are an approximation; the final SVG from the owner may differ in proportions and need a minor design tuning pass.
- **AI placeholder image consistency:** owner-supplied AI before/after images should follow a consistent visual treatment (lighting, angle, style) for portfolio cohesion — a brief will accompany the build.
- **No reviews at launch:** the testimonial section is intentionally a placeholder with a real component slot. Risk: it looks empty. Mitigation: the founder pedigree + supplier network + warranty section carry the trust load until reviews arrive.
- **Cloudflare vs Vercel/Netlify:** all three would work. Cloudflare Pages chosen for free tier generosity, edge network performance in Canada, and integrated Turnstile + Workers KV. Switchable later with minimal rework.
- **Decap vs Sanity:** Decap chosen for cost (free) and git-based simplicity. If the owner finds the UI too rough, swappable to Sanity in phase 2 (would require a content migration script).
