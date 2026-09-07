# Bhishma Constructions — Website

Five-page marketing site for a Guntur-based construction company. Static HTML,
no framework, no build dependencies beyond Python 3.

> ### ⚠️ This is a prototype, not a live business site
>
> The contact details, RERA registration number, project names, statistics and
> testimonials in this build are **placeholders written to demonstrate the design**.
> They are not real. Every page ships with `<meta name="robots" content="noindex">`
> so search engines do not ingest the structured data as the real business.
>
> **Before this goes live, replace everything in "Placeholder content" below and
> remove the noindex tag** (it lives in the `HEAD` template in `build.py`).

## Pages

| Page | Contents |
|---|---|
| `index.html` | Hero, trust counters, services, build video, project gallery, why-us, testimonials |
| `services.html` | Six services in detail with pricing bands, plus FAQ |
| `projects.html` | Filterable project gallery |
| `about.html` | Company story, credentials, process |
| `contact.html` | Quote form, hours, service areas, map |

## Build

Shared `<head>`, nav and footer live once in `build.py`. Page bodies live in
`src/pages/`, reusable blocks in `src/sections/`.

```bash
python build.py     # regenerates the five root *.html files
```

The output is plain static HTML — it deploys anywhere and runs without the script.
Editing the built files directly works too; just know `build.py` will overwrite them.

## Structure

```
build.py           assembles pages from shared partials
src/pages/         per-page body content
src/sections/      reusable blocks (hero, trust, services, testimonials, …)
assets/site.css    all styles
assets/site.js     interactions + the lead pipeline (window.BhishmaLead)
assets/chatbot.js  scripted lead-qualifying chat widget
assets/motion.js   scroll animations (Motion 13, ES module)
assets/construction.mp4  process footage (Mixkit, free licence)
```

## Stack

Plain HTML/CSS/JS with these CDN libraries: Motion 13 (spring reveals, scroll-linked
animation), GSAP + Splitting (hero headline), Swiper (testimonials), Lenis (smooth
scroll), tsParticles, Vanilla Tilt, Font Awesome.

Design: Playfair Display + Inter, `#0A0A0A` / `#C9A84C` / `#F5F0E8`.
Respects `prefers-reduced-motion`; content stays visible if the Motion CDN fails.

## Lead capture — not yet connected

The contact form and the chatbot both funnel through `window.BhishmaLead.send()`
in `assets/site.js`, which POSTs to `/api/lead`. **That endpoint does not exist yet.**

Until it is built, submissions are stored in the visitor's `localStorage` and the UI
offers a WhatsApp deep link, so no enquiry is silently dropped — but nothing reaches
the office inbox automatically. Wiring it up needs a decision on hosting:

- **Vercel** — provision an email integration from the Marketplace, add `api/lead.js`
- **Shared hosting (Hostinger/cPanel)** — a PHP mail handler instead

The chatbot is scripted, not generative: it runs a fixed decision tree, so it needs no
API key and cannot invent a price. To move to an LLM later, replace `answer()` in
`assets/chatbot.js` and keep the same `push()` / `choices()` calls.

## Placeholder content to replace before launch

- [ ] Phone `+91 98495 12345`, email, and street address — **all invented**
- [ ] RERA number `P02400004821` — **invented; a fabricated legal registration**
- [ ] All six project photos, names, localities and status captions
- [ ] All five testimonials and the reviewer names
- [ ] Statistics: 240 projects, 1,800 families, 98% on-time, 4.9 / 340 reviews
- [ ] `assets/construction.mp4` — stock footage; swap for real site footage
- [ ] `origin` in `build.py` — set to the real domain so canonical/OG URLs are right
- [ ] Social links in the footer point at bare facebook.com / instagram.com
