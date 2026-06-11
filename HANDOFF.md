# Spark Studio Companions — Build Handoff (condensed)

ADHD-friendly business + thinking companion. Next.js (App Router) + React + TS + Tailwind. localStorage persistence + OpenAI `gpt-4o-mini` via `/app/api/*`. "Shari" is the AI persona. Dev pinned to **port 3000** (`next dev -p 3000`).

## Principles
Emotion-first, low cognitive load, ≤3 choices at once, one step/one question. Action-based human language (no abstract metric labels). Forest-green `#1e4f4f`, warm backgrounds. Non-home panels sit on a frosted surface; click the margin around a panel OR the big top "‹ Back" to exit.

## Navigation
Sidebar doors: Chat · Focus · Strategies · Projects · Templates · Progress. Bottom: **Open in Google** (Calendar/Docs/Sheets/Drive). **TopBar**: **👤 Using: [avatar] ▾** (global avatar switcher — switch/manage), Adjust My Day, Conversation, Settings, Profile. Settings + Profile are **modal sheets** (ESC / click-outside / ✕).

## Client Avatar system — the "Audience Brain" (SINGLE SOURCE OF TRUTH)
**Created/edited ONLY in Profile → Client Avatars** (`IdealClientBuilder`, section `client-avatars`). Everywhere else is **select/view only**.
- **3 levels per avatar**: L1 Identity (name, emoji/image, tagline) · L2 Behavior (behaviorTraits as emoji moods that act as AI modifiers: 😩 overwhelmed, ⚡ fast, 🧠 analytical, 💭 overthinking, 🔥 motivated, 🪫 low energy, etc. + motivations/objections/triggers/contentPrefs) · **L3 🧠 Research Mode** (optional depth: behavioral / motivation / buying / communication / market / "what I notice" notes + custom fields; **🔍 AI research** button calls AIRA to auto-fill empty blocks).
- **Multiple avatars**, with one **Primary** + Secondary; cards have **Use in AI / Edit / Make primary / Duplicate / Delete**.
- **Active avatar** = the one "in use" app-wide (`prefs.activeAvatarId`; `getActiveAvatar`/`setActiveAvatar`). `resolveAvatar(id?)`: explicit pick → active → primary/only.
- **`businessContextSummary(avatarId?)`** folds in: pinned goals + resolved avatar (identity + behavior filter + L3 research). Every generator/chat call already uses it → all client-aware automatically.
- **"Which client is this for?" picker** (`ClientPicker`) in Content + Email generators (appears with 2+ avatars; Auto = active).
- Multi-output "generate for ALL avatars" = intentionally **NOT built** (should be an explicit Advanced AI Mode, not default).

## Core systems (built)
- **Chat routing** (`lib/companionPrompt.ts`): 4 layers (Insight=feelings only / Strategy / Spin / Execution) + Decision Conflict + tool gating. Direct questions answered directly + App How-to knowledge block. Tone / Help Mode / Support Style (SOS). Reads business+avatar context every message.
- **Adjust My Day**: strict progressive reveal. **Brain Dump**: AI-classified capture.
- **Projects**: Now/Soon/Parked + **Next Step Engine** (1 primary + 2 backups + mode); "Add from…" picker.
- **Strategies**: Category→Strategy (understanding + execution).
- **Templates**: 6 categories + subtypes, seeded; **opens to a chooser** (must pick a category — no default "all" list); CRUD; clear **✕ close**; Refine/Score/Remix/Export per item; nameable saves.
- **Email + Content generators**: structured packages, editable, Refine/Score/Remix/Export/Save + Name field; pass business+avatar context.
- **Snippets** (opens to a type chooser), **Content types**, **Remix** (incl "Other…").
- **Action layers (reusable)**: `RefineActions`, `ScoreActions` (named dims + on-demand "Rewrite stronger"), `RemixActions`, `ExportActions` (Copy/Print/Google Docs/Sheets/Calendar/Download + social paste). Output cleaned via `lib/contentFormat.ts`.
- **Focus area**: Focus timer, Breathe (Calm 1/5/10 + Energize ≤1min), Reset Tools (5-game rotation + cooldown), Spin the Wheel, Focus Audio, Time Block.
- **Business Profile (Identity Engine)**: `BusinessProfilePanel` — role / **goals (multi-select + custom + ⭐ pin primary)** / sells / ideal client / traits / tone; skippable; in Profile. (Note: this is business identity, NOT the avatar store.)
- **AIRA** (`/api/avatar-research`): expands a client into 5 category-level layers + guidance; used by avatar L3 Research and the profile flow.

## Progress page (rebuilt — `ProgressPanel`)
Stripped abstract metrics + XP/scores. Now: 🟢 **Today** → 🟡 **Today's momentum** (one line only: Starter / Building / Flow, no numbers) → 🟢 **Today's wins** (collapsible groups 🌱 Showing up / ⚡ Action / 💼 Business with one-tap presets + ✓ chips) → 🟦 **What you worked on today** (real engagement only, no passive/future items) → 🟢 **Add a win or update**. Opt-in **Weekly Pattern** below the fold. Momentum events still logged (`logMomentum`); XP exists in store but not shown.

## Voice + plans (scaffold)
**Plan tiers** (`prefs.plan`): Essential (no voice) / Voice Lite (30 min/mo) / Voice Pro (120). **Voice output** = ElevenLabs `/api/tts`; chat toggle shows **"Xm left"**, **locked on Essential**, stops + prompts upgrade when minutes run out. **Minute meter** = `getVoiceStatus`/`addVoiceSeconds` (monthly, localStorage). **Settings → Plan & voice** sets tier + shows usage. **Real billing/enforcement = backend (GoHighLevel/Stripe) — not built.** Back-and-forth live voice convo also not yet wired.

## Google integration (LIVE)
OAuth + Drive API. `/api/google/{auth,callback,status,disconnect,create-doc}` + `lib/google.ts`. Scope `drive.file` (non-sensitive → no paid audit). Create supports **doc + sheet**. `.env.local` has CLIENT_ID/SECRET/REDIRECT_URI (localhost + prod `adhdbz.visualsparkstudios.com`). In Google **Testing** mode (≤100 users, free). Go public = flip to Production (free, no audit for drive.file).

## Settings
AI Tone · Help Mode · Support Style · Notifications · Appearance (None/Meaning/Decorative) · Pattern awareness · **Plan & voice** · Connections · Account.

## Known limitations / not built
- Profile photo auto-rotates `public/images/shari/shari-1..8.jpg` — only `shari.jpg` exists, so static until user adds photos.
- Billing + voice plan **enforcement** + live voice conversation = backend. Multi-output avatar mode = deferred (by design).
- Onboarding still has a free-text "who do you help?" (business identity, not avatar) — could become a "pick/create avatar" pointer.
- AIRA/weekly insights = one-shot AI / local heuristics (no longitudinal learning).
- AI-generated avatar images + "build avatar with AI" full auto-fill = not built (manual + AI market research only).

## Dev notes
- **Sandbox bash mount serves stale/truncated files** → in-tool parse/tsc gives FALSE errors on large/just-edited files (errors land on the truncated last line). Host files via Read/Edit are truth. Real verification = `npx tsc --noEmit` / dev-server reload locally. Files under ~230 lines that have synced do parse correctly via `cd /tmp && node -e` requiring `<abs>/node_modules/typescript`.
- System prompt + API routes are server-side; reload dev server after changes.

## Likely next
Avatar L3 as tabbed detail view (Overview/Behavior/Research) · onboarding → avatar pointer · live voice conversation + real plan billing · per-project momentum history · AI-generated avatar images.
