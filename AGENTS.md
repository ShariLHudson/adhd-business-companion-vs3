<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:companion-architecture -->
# One Companion — not separate workspaces

**Looks incredibly simple. Works incredibly hard.** Users see ~10% of what the app does.

- **One Companion**: user has a need → companion understands context → opens the right workspace → conversation continues. Navigation is secondary.
- **One shared brain**: every interaction feeds shared intelligence (conversation, memory, pattern, emotional, business, project, decision, learning, context, automation). Do not build isolated page-level intelligence.
- **Companion-led navigation**: open the right tool automatically when appropriate (overwhelmed → Clear My Mind, stuck on priorities → Plan My Day, etc.). Avoid telling users where to go.
- **Calm-home entry**: `lib/companionLedContinue.ts` — "Continue Where I Left Off" resumes the last meaningful activity, not the last page visited.
- **Arrival Intelligence™**: `lib/arrivalIntelligence/` — Home consumes `evaluateArrivalIntelligence()` for greeting, placeholder, and presence. Never hard-code home logic in components.

Before adding a feature, ask: Does this make the companion smarter? Reduce cognitive load, clicks, and decisions? Connect to the shared intelligence layer?
<!-- END:companion-architecture -->

<!-- BEGIN:reverse-engineering-first -->
# Reverse Engineering First™

**Permanent rule** (see also `.cursor/rules/reverse-engineering-first.mdc`). Design the complete ten-year system before implementing Version 1.

Never build features one request at a time. For every workspace: purpose → five-year vision → user journey → companion journey → intelligence journey → narrative journey → data architecture → ecosystem connections → version plan → **then** code.

Core principles: Intelligence Paradox™ (simple surface, deep backend), Companion Covenant™ (trust not impress), Agency Principle™ (user independence), Ethical Foundation™ (observe, wonder, ask — never conclude for the user).

**Clear My Mind™ / My Thoughts™**: Clear My Mind captures continuously (never a completion workflow). My Thoughts organizes. Capture and organize are separate experiences — always available, never forced.

**Clear My Mind™ companion standard**: `lib/clearMyMind/COMPANION_PRINCIPLES.md` — deepen trust without adding UI complexity. Post-Share voice is companion relief, not confirmation. Relief Intelligence™ (`lib/reliefIntelligence.ts`) stays invisible.

**My Thoughts™ visual architecture**: Collections are primary navigation (Companion Boxes™, not folders). Each collection has a distinct color identity. Thought cards show title, preview, and connections. Future views (Connection, Growth, Mind Landscape) are typed but not built in V1 — design data for five years of LIG growth.
<!-- END:reverse-engineering-first -->

<!-- BEGIN:intelligence-ready-architecture -->
# Intelligence-Ready Architecture™

**Permanent global rule** (see also `.cursor/rules/intelligence-ready-architecture.mdc`). Every object is built once and enriched for years.

- **Visible features are temporary; intelligence architecture is permanent.** Design for the companion we want in ten years, not today's UI.
- **Relationships over content** — store lineage (`originatedFromId`, `originatedFromKind`), LIG edges (`connectionIds`), per-engine enrichments (`intelligenceMeta`). Never duplicate when an object evolves.
- **Hooks today, engines tomorrow** — optional fields in V1; future engines consume without migrations or user re-entry.
- **Invisible evolution** — users never "train AI"; intelligence compounds quietly (Intelligence Paradox™).
- **Intelligence Registry™** — internal blueprint at `lib/intelligence/INTELLIGENCE_REGISTRY.md`. Update when adding object types or engines.
- **Shared types** — `lib/intelligence/intelligenceReadyTypes.ts` (`IntelligenceReadyHooks`, sprint questions).

Before every sprint: What is this object? What might it become? Which engines benefit? What metadata exists now unused? Will this support unimagined features?
<!-- END:intelligence-ready-architecture -->
