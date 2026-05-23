# adamatta.dev — Personal Projects Page

## Project Overview

Personal portfolio/projects page for Alan Damatta. Static site: no framework, no build step, no bundler. Vanilla HTML, CSS, and JS only. Deployed via Vercel (or equivalent static host).

**Goals:** Responsive, minimalist, extremely fast (Lighthouse 100 across all categories), distinctive visual identity.

---

## Visual Identity & Aesthetic

**Theme:** Minimal retro-futuristic. Inspired by the visual language of space exploration, industrial sci-fi (think Alien, 2001, Dark Star) — not the creatures, but the *feel*: cathode-ray monitors, chunky UI chrome, phosphor glows, warning labels, analog readouts, utilitarian engineering aesthetics.

**Core visual principles:**
- Pixel-perfect dithered rendering: use real 1px × 1px pixel patterns, not CSS blur/opacity tricks
- Everything feels like it's running on a terminal or an old CRT embedded in a spaceship console
- High contrast. Extremely limited palette (see below)
- Animation through dithering state changes, not smooth CSS transitions — things should "flicker" into existence
- Scanlines, pixel grids, and ordered dither patterns are first-class design elements
- Typography is monospace. No serifs, no fancy variable fonts. One typeface throughout.

**Palette (strict — do not introduce new colors without a strong reason):**
```
--color-bg:        #0a0a0a   /* near-black, the void */
--color-surface:   #111111   /* panel backgrounds */
--color-border:    #1e1e1e   /* subtle grid lines */
--color-dim:       #333333   /* disabled / secondary text */
--color-muted:     #555555   /* placeholder / dithered mid-tone */
--color-text:      #c8c8c8   /* primary text — slightly off-white, not blinding */
--color-bright:    #e8e8e8   /* headings / highlighted text */
--color-accent:    #00ff88   /* phosphor green — use sparingly, never as background */
--color-warn:      #ff6b2b   /* amber warning — use sparingly */
--color-scan:      rgba(0,255,136,0.03) /* subtle scanline tint */
```

**Dither palette (for pixel art / animations):**
Only use the main palette colors above in dither patterns — never intermediate colors. Dithering IS the intermediate color.

---

## Tech Stack & Constraints

- **HTML5** — semantic, accessible. One `index.html` per page if multi-page, or a single page with sections.
- **CSS** — plain CSS. Custom properties (variables) for all tokens. No Tailwind, no SASS, no CSS-in-JS.
- **JavaScript** — vanilla ES2022. No frameworks (React, Vue, etc.). No npm dependencies.
- **Canvas API** — for all dithered animations and pixel-art effects. Do not use WebGL unless absolutely necessary.
- **Fonts** — only system monospace stack or a single self-hosted monospace webfont (Departure Mono, or IBM Plex Mono, or similar). No Google Fonts CDN (it's a privacy/speed leak).
- **Images** — keep tiny. Prefer SVG or canvas-drawn. If raster, convert to WebP, max width 800px. Use `loading="lazy"` everywhere.
- **No third-party scripts** — no analytics, no trackers, no CDN-hosted libraries.

---

## File Structure

```
adamatta.dev/
├── CLAUDE.md          ← this file
├── index.html         ← entry point
├── css/
│   ├── reset.css      ← minimal reset (box-sizing, margin, padding)
│   ├── tokens.css     ← all CSS custom properties / design tokens
│   ├── layout.css     ← grid, flexbox, responsive layout
│   ├── components.css ← reusable UI patterns (card, badge, tag, button)
│   └── main.css       ← page-specific styles, imports above
├── js/
│   ├── dither.js      ← canvas dither engine (pixel patterns, animations)
│   └── main.js        ← page logic, event listeners
└── assets/
    └── fonts/         ← self-hosted font files only
```

Keep files small. If a CSS file exceeds ~200 lines, consider splitting. If JS exceeds ~300 lines, split into modules.

---

## CSS Architecture Rules

1. **All values come from tokens.** Never hardcode a hex color or pixel size that isn't in `tokens.css`.
2. **Mobile-first.** Base styles are for narrow screens. Use `@media (min-width: ...)` to add complexity upward.
3. **No magic numbers.** Spacing follows an 8px base grid: `--space-1: 8px`, `--space-2: 16px`, `--space-3: 24px`, etc.
4. **No `!important`.** If specificity is a fight, refactor selectors.
5. **Pixel rendering.** For any element that should look pixelated: `image-rendering: pixelated`. For canvas: always set `ctx.imageSmoothingEnabled = false`.
6. **Scanlines.** A subtle scanline effect is applied globally via a `::before` pseudo-element on `body` — do not duplicate per-component.

---

## Dither Engine (`js/dither.js`)

The dither engine is the heart of the visual identity. It must be fast enough to animate at 30 fps without dropping frames on a mid-range phone.

**Ordered dither patterns to implement:**
- Bayer 2×2
- Bayer 4×4
- Bayer 8×8
- Horizontal scanline (every other row)
- Vertical bar (every other column)
- Checkerboard

**API shape to target:**
```js
// Render a dithered rectangle to a canvas context
ditherRect(ctx, x, y, w, h, fgColor, bgColor, pattern, threshold)

// Animate between two dither states (handles requestAnimationFrame)
ditherTransition(canvas, fromState, toState, durationMs)

// Draw a pixel-art progress/loading bar
ditherBar(ctx, x, y, w, h, progress, fgColor, bgColor)
```

**Performance rules:**
- Pre-compute all Bayer matrices as flat typed arrays (Uint8Array)
- Use `createImageData` / `putImageData` for pixel manipulation — never loop over CSS or SVG
- Throttle animations to 30 fps with a timestamp diff check
- No layout thrash: read DOM → batch writes, never interleave

---

## Layout

Single-page with sections. Sections are:

1. **Header / Hero** — name, one-line descriptor, a dithered animation in the background (subtle noise / starfield)
2. **Projects** — card grid. Each card: project name, short description, tech tags, link(s)
3. **About** — short bio, possibly a skill/tools list rendered as dithered bars
4. **Contact / Links** — minimal link list (GitHub, email, etc.)

No navbar scroll-spy needed yet. A sticky minimal header with name + jump links is fine.

---

## Accessibility

- Semantic HTML: `<header>`, `<main>`, `<section>`, `<article>`, `<footer>`
- Every interactive element reachable by keyboard
- All canvas animations have `aria-hidden="true"` and a text fallback
- Color contrast must pass WCAG AA for body text (--color-text on --color-bg)
- Respect `prefers-reduced-motion`: skip or freeze all canvas animations if set

---

## Performance Budget

| Metric | Target |
|---|---|
| First Contentful Paint | < 0.5s |
| Total page weight (uncompressed) | < 100 KB |
| Total JS | < 30 KB |
| Total CSS | < 15 KB |
| Largest image | < 20 KB |
| Third-party requests | 0 |

---

## Development Workflow

- No build step. Open `index.html` directly in a browser or use a zero-config static server (`npx serve .` or `python3 -m http.server`).
- Before shipping any change, run Lighthouse in Chrome DevTools and confirm all four scores are 90+.
- Test on: Chrome latest, Firefox latest, Safari (mobile), and a throttled 3G network simulation.

---

## What Claude Should Do

- Always write vanilla HTML/CSS/JS — never suggest a framework or bundler
- Always use design tokens from `tokens.css` — never hardcode colors or spacing
- When adding animations, implement via the dither engine — not CSS `transition` or `animation` for visual effects
- Keep every file small and focused
- Add pixel rendering where appropriate (`image-rendering: pixelated`, `imageSmoothingEnabled = false`)
- When asked to add a component, match the existing visual language — monospace, high-contrast, dithered
- Do not add external dependencies
- Do not create new files unless necessary — prefer extending existing ones
- Do not write comments unless the logic is genuinely non-obvious
- Prefer `rem` for font sizes, `px` for borders/pixel-art elements, CSS custom properties for everything else
