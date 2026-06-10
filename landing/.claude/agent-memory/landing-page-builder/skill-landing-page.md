---
name: skill-landing-page
description: Location and key instructions for the landing-page skill
metadata:
  type: reference
---

The landing-page skill lives at `.claude/skills/landing-page/`:
- `SKILL.md` — main skill instructions (read at start of every session)
- `references/architecture.md` — technical data-driven pattern: escapeHtml, container→array→render, mobile menu boilerplate

Key rules from the skill:
- Reference image is source of truth — reproduce sections, palette, buttons, typography literally
- data.js loaded BEFORE main.js, both defer
- All SITE_DATA strings through escapeHtml() before innerHTML
- Palette in CSS :root variables, minimum --color-accent
- Relative paths only
- Launch via local HTTP server (`python3 -m http.server` from repo root → `http://localhost:8000/<folder>/`), NOT file://. Real origin → iframe/fetch/ES-modules all work.
- Media via SITE_DATA paths (`img: "img/..."`), not hardcoded; show a tidy CSS/SVG/emoji placeholder until the real file is dropped into `<folder>/img/`
- Mandatory final step: serve over HTTP, screenshot desktop+mobile via chrome-devtools, check console has no errors, compare against the reference checklist; fix mismatches before finishing
