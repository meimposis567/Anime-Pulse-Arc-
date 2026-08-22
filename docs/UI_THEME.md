# Otaku Ultra UI Upgrade

This upgrade keeps all routes and API behavior intact while giving the app a unique, fast, anime-styled look.

## Highlights
- Animated cosmic gradient background with subtle sparkles
- Glassmorphic cards with neon borders and 3D hover tilt + shine
- Gradient text headings, neon buttons, and kawaii pills
- Smooth scrolling, content-visibility for faster rendering
- Respect `prefers-reduced-motion` for accessibility
- No breaking changes to structure or functionality

## How it works
- New stylesheet: `src/otaku-theme.css` (imported in `src/main.jsx`)
- Body class `otaku` added in `index.html`
- Minimal component touches: `AnimeCard` gets `otaku-tilt` and a non-invasive shine layer
- Containers marked with `.section` to enable content-visibility and improve performance

## Customize quickly
- Tweak colors in `:root` of `src/otaku-theme.css` (`--otaku-primary`, `--otaku-accent`, etc)
- You can opt-out of animations with system `Reduced Motion` setting