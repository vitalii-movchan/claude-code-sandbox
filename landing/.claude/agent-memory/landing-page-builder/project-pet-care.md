---
name: project-pet-care
description: Pawsome pet care landing — design notes and section map
metadata:
  type: project
---

Landing saved at: `pet_care/` (index.html, css/styles.css, js/data.js, js/main.js)
Reference: `ui/pet_care/landing.jpeg`

**Palette:**
- --color-bg: #d6eef8 (light blue)
- --color-bg-light: #e8f5fb
- --color-accent: #6cc4e0
- --color-accent-btn: #7ecde8
- --color-footer-bg: #b8dff0
- --color-star: #f5c518 (yellow gold)
- Body has SVG paw-print repeat pattern overlay via ::before pseudo-element

**Sections (top to bottom):**
1. Header — sticky white, logo "Pawsome" + paw emoji, 5 nav links, hamburger mobile
2. Hero — 2-col grid: text left (h1 "Pets Grooming", subtitle, CTA button), dog placeholder right with wave shape
3. "All Pet care Service" — carousel with dot indicators; 2 cards visible desktop, 1 mobile; SITE_DATA.services
4. Veterinarians — 2-col: vet photo placeholder left, text+button right
5. Pet Accessories — 2-col reversed: text+button left, accessories photo right; white section bg
6. Client Review — 3-col grid; center card featured (blue bg, scale 1.06); SITE_DATA.reviews
7. Footer — light blue bg, dog-in-glasses placeholder top center, 2 link columns + center logo+socials; SITE_DATA.footerLinks

**Data-driven lists:** services, reviews, footerLinks (two columns: left/right)

**Why:** Client requested literal pixel-perfect reproduction of reference mockup.
**How to apply:** If editing this landing, preserve the paw SVG pattern, carousel dot logic in main.js, and the featured center card pattern for reviews.
