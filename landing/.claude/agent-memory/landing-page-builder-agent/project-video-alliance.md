---
name: project-video-alliance
description: Video Alliance landing — dark navy/yellow security surveillance company, 4-section page with hero form, turnkey services, control/mobile, projects/case
metadata:
  type: project
---

Video Alliance security surveillance landing at `video_alliance/`. Reference: `ui/video_alliance/landing.jpeg`.

**Palette:** `--color-dark: #1f2a38` (navy header/dark blocks), `--color-accent: #f5c518` (yellow buttons + title underlay), white section backgrounds.

**Section structure (top to bottom):**
1. Sticky header — burger left, shield logo, city address, yellow "Заказать звонок" button, phone right
2. Hero — dark background, yellow `<span class="accent-bg">` title wraps, advantages list (data-driven), right column: camera placeholder + 2 dark badges (data-driven)
3. Turnkey — 3-col grid: left text+advantages, center services list (data-driven, dark emoji panels), right question card
4. Control — 2-col: bold title with shield icon, green nature phone-mockup placeholder; below: form section + dielectric block
5. Projects — 2-col: left title+advantages+dark specialist card, right АГРОЭКО case (data-driven)
6. Clients — logo slider with prev/next arrows (data-driven, doubled array for loop effect)
7. Footer — dark background

**data.js keys:** `heroAdvantages`, `heroBadges`, `turnkeyAdvantages`, `services`, `projectAdvantages`, `projectCase`, `clients`

**Placeholders used (no real images):** camera emoji in hero (dark gradient bg), phone emoji in green gradient for control section, grass emoji for case photo. Shield uses CSS `clip-path: polygon(...)`.

**Fixes applied during build:**
- `clients-list` id goes directly on `.clients-track` (not a nested div inside it) — slider JS targets `getElementById("clients-list")`
- Control form: button lives inside `.control-form-fields` (not as 3rd grid column); grid is `60px 1fr`
- Favicon `<link rel="icon" href="data:,">` suppresses browser 404 for favicon

**How to apply:** When building similar dark-nav + yellow-accent B2B security/tech landing, follow this pattern.
