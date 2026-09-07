#!/usr/bin/env python3
"""
Static build for the Bhishma Constructions site.

Assembles the root *.html pages from shared partials (defined here) plus the
section/page fragments in src/. Output is plain static HTML with no runtime
dependency on this script — it exists so the nav, footer and <head> live in one
place instead of being copy-pasted across five pages.

    python build.py
"""
import io
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))

SITE = {
    "name": "Bhishma Constructions",
    "phone_display": "+91 98495 12345",
    "phone_href": "+919849512345",
    "whatsapp": "919849512345",
    "email": "info@bhishmaconstructions.in",
    "address": "4-12-88, Lakshmipuram Main Road, Guntur, AP 522007",
    "city": "Guntur",
    "since": "2009",
    "origin": "https://www.bhishmaconstructions.in",
}

NAV_ITEMS = [
    ("index.html", "Home"),
    ("services.html", "Services"),
    ("projects.html", "Projects"),
    ("about.html", "About"),
    ("contact.html", "Contact"),
]

JSONLD = """{
  "@context": "https://schema.org",
  "@type": "GeneralContractor",
  "name": "Bhishma Constructions",
  "image": "%(origin)s/assets/og.jpg",
  "@id": "%(origin)s/#organization",
  "url": "%(origin)s/",
  "telephone": "%(phone_display)s",
  "email": "%(email)s",
  "foundingDate": "%(since)s",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "4-12-88, Lakshmipuram Main Road",
    "addressLocality": "Guntur",
    "addressRegion": "Andhra Pradesh",
    "postalCode": "522007",
    "addressCountry": "IN"
  },
  "areaServed": ["Guntur", "Gorantla", "Nallapadu", "Amaravati Road", "Mangalagiri", "Tenali"],
  "aggregateRating": {"@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "340"},
  "openingHoursSpecification": [
    {"@type": "OpeningHoursSpecification",
     "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
     "opens": "09:00", "closes": "19:00"},
    {"@type": "OpeningHoursSpecification", "dayOfWeek": "Sunday",
     "opens": "10:00", "closes": "14:00"}
  ]
}""" % SITE

HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<!-- PROTOTYPE: this build carries placeholder contact details, a placeholder RERA
     number and sample testimonials. noindex keeps search engines (and the JSON-LD
     rating below) from being ingested as the real business. Delete this meta tag
     once the real details are in and the client approves going live. -->
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="{origin}/{page}">

<meta property="og:type" content="website">
<meta property="og:site_name" content="{name}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{origin}/{page}">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=&apos;http://www.w3.org/2000/svg&apos; viewBox=&apos;0 0 32 32&apos;%3E%3Crect width=&apos;32&apos; height=&apos;32&apos; rx=&apos;6&apos; fill=&apos;%230A0A0A&apos;/%3E%3Ctext x=&apos;16&apos; y=&apos;23&apos; font-family=&apos;Georgia,serif&apos; font-size=&apos;20&apos; font-weight=&apos;bold&apos; fill=&apos;%23C9A84C&apos; text-anchor=&apos;middle&apos;%3EB%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="https://unpkg.com/splitting/dist/splitting.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link rel="stylesheet" href="assets/site.css">

<script type="application/ld+json">
{jsonld}
</script>

<script>
  /* Arm Motion's initial hidden state before first paint, with a safety net:
     if the Motion module fails to load, un-hide everything after 2.5s. */
  document.documentElement.classList.add('js-motion');
  setTimeout(function () {{
    if (!window.__motionReady) document.documentElement.classList.remove('js-motion');
  }}, 2500);
</script>
</head>
<body>

<div id="scroll-progress"></div>
"""

NAV = """
<!-- ================= NAV ================= -->
<header id="nav"{nav_solid}>
  <div class="nav-inner">
    <a href="index.html" class="brand">Bhishma <span>Constructions</span></a>
    <nav class="nav-links">
{links}
      <a href="tel:+{phone_href}" class="nav-phone">{phone_display}</a>
      <a href="contact.html" class="btn btn-gold">Get Free Quote</a>
    </nav>
    <div class="burger" id="burger" role="button" tabindex="0" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></div>
  </div>
</header>

<div id="mobile-menu">
{mlinks}
  <a href="tel:+{phone_href}" style="color:#C9A84C;">{phone_display}</a>
</div>
"""

FOOTER = """
<!-- ================= FOOTER ================= -->
<footer>
  <div class="wrap">
    <div class="f-grid">
      <div>
        <div class="f-brand">Bhishma Constructions</div>
        <p class="f-tag">Guntur's builder of record since 2009 — fixed pricing, honest materials, keys on the promised date.</p>
        <div class="f-social">
          <a href="https://www.facebook.com/" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
          <a href="https://www.instagram.com/" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
          <a href="https://www.google.com/maps" aria-label="Google Business Profile"><i class="fa-brands fa-google"></i></a>
        </div>
      </div>
      <div>
        <div class="f-h">Services</div>
        <ul>
          <li><a href="services.html#turnkey">Turnkey Home Construction</a></li>
          <li><a href="services.html#apartments">Residential Apartments</a></li>
          <li><a href="services.html#villas">Independent Villas</a></li>
          <li><a href="services.html#commercial">Commercial &amp; Retail</a></li>
          <li><a href="services.html#interiors">Interiors &amp; Renovation</a></li>
          <li><a href="services.html#land">Land Development &amp; Plots</a></li>
        </ul>
      </div>
      <div>
        <div class="f-h">Contact Us</div>
        <ul>
          <li><a href="tel:+{phone_href}"><i class="fa-solid fa-phone"></i>{phone_display}</a></li>
          <li><a href="mailto:{email}"><i class="fa-solid fa-envelope"></i>{email}</a></li>
          <li><a href="contact.html"><i class="fa-solid fa-map-marker-alt"></i>Lakshmipuram, Guntur, AP</a></li>
        </ul>
      </div>
      <div>
        <div class="f-h">Company</div>
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="about.html">About</a></li>
          <li><a href="services.html">Services</a></li>
          <li><a href="projects.html">Projects</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
      </div>
    </div>
    <div class="f-divider"></div>
    <div class="f-bottom">© 2025 Bhishma Constructions. All rights reserved. · RERA Registered &amp; Insured · RERA Reg. No. P02400004821</div>
  </div>
</footer>
"""

TAIL = """
<a href="tel:+{phone_href}" id="callbtn" aria-label="Call Bhishma Constructions"><i class="fa-solid fa-phone"></i></a>

<!-- ================= CHATBOT ================= -->
<button id="chat-toggle" aria-label="Open chat with Bhishma Constructions" aria-expanded="false">
  <i class="fa-solid fa-comment-dots" aria-hidden="true"></i>
</button>
<section id="chat-panel" aria-live="polite" aria-label="Chat with Bhishma Constructions" hidden>
  <header class="chat-head">
    <div>
      <strong>Bhishma Constructions</strong>
      <span>Typically replies in a few minutes</span>
    </div>
    <button id="chat-close" aria-label="Close chat"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
  </header>
  <div id="chat-log" class="chat-log"></div>
  <div id="chat-choices" class="chat-choices"></div>
  <form id="chat-form" class="chat-input" hidden>
    <input id="chat-text" type="text" autocomplete="off" placeholder="Type your answer…" aria-label="Your answer">
    <button type="submit" aria-label="Send"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i></button>
  </form>
</section>

<!-- ================= SCRIPTS ================= -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://unpkg.com/splitting/dist/splitting.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/tsparticles@2.12.0/tsparticles.bundle.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.1/vanilla-tilt.min.js"></script>
<script src="assets/site.js"></script>
<script src="assets/chatbot.js"></script>
<script type="module" src="assets/motion.js"></script>
</body>
</html>
"""

PAGES = {
    "index.html": dict(
        title="Bhishma Constructions — Builders & Developers in Guntur",
        desc="RERA-approved apartments, custom villas and commercial spaces across Guntur. 16 years, 240+ projects, 98% handed over on time. Free site visit and written estimate.",
        solid_nav=False,
    ),
    "services.html": dict(
        title="Construction Services in Guntur | Bhishma Constructions",
        desc="Turnkey home construction, apartments, villas, commercial floors, interiors and DTCP-approved layouts in Guntur — fixed per-square-foot pricing, in-house engineers.",
        solid_nav=True,
    ),
    "projects.html": dict(
        title="Our Projects in Guntur | Bhishma Constructions",
        desc="Apartments, villas, turnkey homes, commercial floors and approved layouts delivered across Guntur, Gorantla, Nallapadu, Amaravati Road and Mangalagiri.",
        solid_nav=True,
    ),
    "about.html": dict(
        title="About Bhishma Constructions | Builders in Guntur Since 2009",
        desc="16 years building in Guntur. 240 projects delivered, 1,800 families handed keys, not one abandoned site. Meet the team and the standards we build to.",
        solid_nav=True,
    ),
    "contact.html": dict(
        title="Contact Bhishma Constructions | Free Site Visit in Guntur",
        desc="Call +91 98495 12345 or send your plot details for a free site visit and written estimate. Serving Guntur, Gorantla, Nallapadu, Amaravati Road, Mangalagiri and Tenali.",
        solid_nav=True,
    ),
}


def read(path):
    with io.open(os.path.join(ROOT, path), encoding="utf-8") as fh:
        return fh.read()


def nav_for(page):
    links, mlinks = [], []
    for href, label in NAV_ITEMS:
        active = ' aria-current="page"' if href == page else ""
        cls = "nlink active" if href == page else "nlink"
        links.append('      <a href="%s" class="%s"%s>%s</a>' % (href, cls, active, label))
        mlinks.append('  <a href="%s"%s>%s</a>' % (href, active, label))
    return NAV.format(
        links="\n".join(links),
        mlinks="\n".join(mlinks),
        nav_solid=' class="solid"' if PAGES[page]["solid_nav"] else "",
        **SITE
    )


def build():
    written = []
    for page, meta in PAGES.items():
        content = read(os.path.join("src", "pages", page))
        html = (
            HEAD.format(title=meta["title"], desc=meta["desc"], page=page,
                        origin=SITE["origin"], name=SITE["name"], jsonld=JSONLD)
            + nav_for(page)
            + "\n" + content.strip() + "\n"
            + FOOTER.format(**SITE)
            + TAIL.format(**SITE)
        )
        out = os.path.join(ROOT, page)
        with io.open(out, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(html)
        written.append((page, len(html)))
    return written


if __name__ == "__main__":
    for page, size in build():
        print("%-16s %6d bytes" % (page, size))
