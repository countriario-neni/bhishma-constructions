# Bhishma Constructions — Multi-Page Build

## Decisions (from user)
- "Dynamic" = **multi-page site** with real routing + per-page SEO (not Next.js/CMS)
- Leads delivered via **email + WhatsApp**
- Chatbot required
- Design system stays: black #0A0A0A / gold #C9A84C / cream, Playfair + Inter, Motion 13 animations

## Architecture
Plain static HTML output (deployable anywhere) assembled by a tiny Python build
script so nav/footer/head live in ONE place instead of being copy-pasted 5×.
`build.py` reads `src/partials/*` + `src/pages/*` and writes the root `*.html`.
Editing the built HTML directly still works; the script is a convenience, not a runtime.

## Tasks
- [x] 1. Extract CSS -> assets/site.css, JS -> assets/site.js from index.html
      verify: single-page site still renders identically, 0 console errors
- [x] 2. Build system: src/partials (head/nav/footer/scripts) + build.py
      verify: build.py regenerates current home page byte-sensibly, opens clean
- [x] 3. Page: Home (condensed — previews link out to full pages)
- [x] 4. Page: About (story, why-us, credentials, process video)
- [x] 5. Page: Services (all 6 in detail + FAQ)
- [x] 6. Page: Projects (full gallery, filterable by type)
- [x] 7. Page: Contact (form, hours, areas, map)
      verify: every nav link resolves, no 404s, active nav state correct per page
- [x] 8. Per-page SEO: unique title/description/canonical/OG + JSON-LD LocalBusiness
- [x] 9. Chatbot widget (shared): scripted lead-qualifying flow, no API key needed,
      hands off to the same lead pipeline; LLM backend swappable later
- [ ] 10. Lead API: email + WhatsApp delivery (load `vercel:marketplace` skill BEFORE
      choosing/wiring any provider, per project rules)
- [x] 11. Verify all 5 pages in browser: desktop + mobile, console clean, form + bot work

## Review

**Done and verified in Chrome (desktop 1440 + mobile 390):**
- 5 pages built from shared partials: index / services / projects / about / contact
- 0 console errors, 0 warnings on every page (favicon added, hero GSAP guarded to home only)
- Every internal link and asset ref resolves (automated check, 0 broken)
- Per-page unique title + meta description + canonical + OG + LocalBusiness JSON-LD;
  exactly one h1 per page; every img has alt text; correct active nav state per page
- Projects filter: all/villas/interiors/etc. filter correctly, count text updates,
  featured card un-spans while filtered so the grid has no hole
- Chatbot: full flow exercised end-to-end (intent -> size -> locality -> name -> phone
  -> confirmation + WhatsApp deep link). Lead captured. Panel correctly hidden on load.
- Contact form: submits, captures a structured lead, shows success + WhatsApp fallback
- Bug found and fixed: `display:flex` was overriding the `hidden` attribute, which would
  have rendered the chat panel open on every page load. Added a global `[hidden]` rule.

**Blocked — needs the user:**
- Task 10 (lead API). `vercel integration discover` requires an interactive login this
  session cannot perform, and the deploy host is unknown. Per project rules no email
  provider was guessed or hand-wired, and no mock was substituted. The client-side
  pipeline (assets/site.js -> window.BhishmaLead) is finished and points at `/api/lead`;
  it degrades safely today by stashing the lead and offering the WhatsApp deep link.

**Still placeholder content the client must replace before launch:**
- Phone, email, address, RERA number (all invented)
- All 6 project photos + their names/localities/status captions
- All 5 testimonials
- Construction video (mixkit stock, location-neutral) -> swap for real site footage
