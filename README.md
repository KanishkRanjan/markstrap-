# MarkStrap scroll presentation

A React presentation with ten scroll-driven scenes. Scroll or swipe through the story; no tabs, sliders, or next-button clicks are required. Headline reveals, section entrances, and number animations use React Bits source components. The opening uses a sculptural hand-and-sphere composition: a subtly moving human hand below directs a more active robotic hand above through puppet strings.

## Presenting

- Scroll vertically or swipe upward to continue. On desktop, a wheel gesture advances one scene; longer scenes remain scrollable.
- Up / down / left / right arrow, Page Up / Down, or Space: navigate. Home / End: first / last scene.
- F: fullscreen. N: speaker notes. S: sources and assumptions. Escape closes overlays.
- Pause button: stop ambient animations. Reduced-motion settings are respected.
- Scenes can be opened directly with `#1` through `#10`.
- The entire journey is presented in sequence. No interaction is needed to reveal core content.

## Develop and build

`npm ci` installs pinned dependencies. `npm run dev` serves at http://127.0.0.1:8765/ . `npm run build` creates a self-contained static site in `dist/`. `npm run preview` serves the production build.

## Content status

The campaign walkthrough and technical architecture are proposed behavior, not a live campaign service. Cost figures are clearly labeled illustrations. No customer traction or performance improvements are claimed. The team slide is deferred at the user's request.

## Editing

- Scene content, notes and scroll behavior: `src/main.jsx`.
- Visual design and responsive layouts: `src/styles.css`.
- Opening-slide composition: `src/hero.css`.
- Animated hand-and-sphere scene: `src/components/HandPuppet.jsx`.
- Legacy ASCII hand artwork is retained in `public/hands.js` but is not loaded by the presentation.
- React Bits components: `src/components/react-bits/`.
- The existing Site identity is retained in `.openai/hosting.json`.

## React Bits attribution

BlurText, CountUp and AnimatedContent are installed as source from the official React Bits component registry at https://reactbits.dev/ . Copyright David Haz. License: MIT + Commons Clause, included in `public/react-bits-license.txt` and the production build. BlurText is adapted to accept an `as` element for semantic headings and normalize registry text spacing. The components are incorporated into this presentation rather than distributed as a standalone component product.

## Hand assets

The generic hand models in `public/models/` are from WebXR Input Profiles assets 1.0.20, available under the MIT License, copyright Amazon 2019. Their license and source attribution are included in `public/hand-model-license.txt`. The opening scene uses Three.js for rendering and articulation. No remote model service is needed at runtime.

## Sources

Adobe, June 2025: https://business.adobe.com/blog/71-percent-of-marketers-say-content-demand-to-increase-5x

Nielsen, May 2025: https://www.nielsen.com/news-center/2025/nielsen-releases-its-2025-annual-marketing-report-looking-at-the-power-of-data-driven-marketing/
