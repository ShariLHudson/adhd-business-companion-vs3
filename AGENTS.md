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
