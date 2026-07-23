# Spark Card — Readability, Real Imagery, and Interaction Cleanup

Implementation notes for the Cursor prompt of the same name.

## Done

- Related Sparks: not present in the expanded or print UI (no regression path).
- Hero imagery: real Wikimedia photos by topic / diversity category; Summer’s Open Door uses a garden doorway (`SPARK-SEA-SUMMER`).
- Variable image layout: `aspectRatio` + `focalPoint` on art assets drive CSS layouts (landscape / portrait / square / editorial).
- See It Differently: interactive chips with selected state, keyboard focus, and a short reveal (detail + optional image).
- Estate icons: gallery + themed fallback use SVG line-art keys (`spark`, `flame`, `book`, `compass`, `seal`, `lens`, `leaf`) — no emoji collage on the card face.
- Typography: larger CSS tokens for title, subtitle, body, buttons, and meta.
- Density: front story capped at two paragraphs; Tell Me More facts capped at three on screen; expanded order prioritizes visual → fact → story → See It Differently → timeline → reflection → sources.
- Actions preserved: Save, Favorite, More (Share / Print).

## Verify manually

Seasonal, weird holiday, historical, invention, nature, quote, and business-person cards — photo loads, no Related Sparks, See It Differently reveals, readable type on mobile.
