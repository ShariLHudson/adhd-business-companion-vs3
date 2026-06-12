# Spark Studio Companions — Build Handoff

ADHD-first AI business companion. Next.js (App Router) + React + TS + Tailwind. localStorage persistence + OpenAI `gpt-4o-mini` via `/app/api/*`. "Shari" is the AI persona. Dev pinned to **port 3000** (`next dev -p 3000`).

## North star (the product in one line)
"I opened scattered; I left with one real thing done — and I didn't have to operate the app to get there." Chat understands & routes; Make executes; Do supports. Emotional connection comes from being **understood before being solved** — protect that.

## THREE ENVIRONMENTS (hard architecture)
- **CHAT** = thinking, intent detection, light guidance. NEVER produces final deliverables.
- **MAKE** = the only place content is created/edited (the generators).
- **DO** = focus/reset support (timer, breathe, brain dump, time block).

## Navigation (one system)
Sidebar: **Chat · Do · Make · More**. Default route is always Chat on open. `More` (collapsible) holds Strategies · Projects · Templates · Progress (auto-expands when one is active). **TopBar collapses to a single "⋯" on home** (Adjust My Day / New Chat / New Day Chat / Settings / Profile / avatar switch all inside it) so the home screen is just Shari + chat + input. Full TopBar shows inside sections. Settings/Profile are modal sheets (ESC/click-out/✕). `lib/companionUi.ts` holds `SIDEBAR_NAV` + `MORE_NAV` + `SECTION_NAV` (create → content-generator).

## Home / cold open (de-stacked, ≤1 layer)
- First-time user (`!prefs.hasChatted`): **3 starter chips only** — "✍️ Help me write something" (→ opens Make), "I'm feeling overwhelmed" (→ chat), "What should I work on?" (→ chat). No footer text, no voice upsell, no stacked hints.
- Returning user: **one soft line**.
- **Continue card** (see Retention) replaces the above when unfinished work exists.

## CHAT → MAKE behavioral spine (the retention/routing core)
All in `handleSend` (`app/companion/page.tsx`) + `lib/companionPrompt.ts`:
1. **Overwhelm override (checked FIRST, beats everything incl. Spin):** "overwhelmed/too much/stuck/where do I start/can't think" → reduce to ONE next step, no tools, no menus, no multiple questions. Prompt-enforced + `detectEmotionalState` reinforces.
2. **Conversational wins:** completion intent (broadened regex: sent/finished/completed/shipped/posted/"I've finished"/etc., **with negation guard** so "not done"/"need to finish" don't fire; skips "?" ) → Shari acknowledges in chat + `logMomentum("complete")` + clears Continue memory. No XP/dashboards.
3. **Creation intent** (write/draft/create + email/post/plan/message/…) → auto-routes to **Make**, prefilled, **zero-hop** (no form, straight to writing). How-to questions ("how do I…") stay in chat.
4. **Edit intent** (rewrite/edit/customize/"make it better") + a remembered draft → opens Make with that draft loaded (no regen).
5. **Soft bridge chip:** after a normal reply about something actionable (and NOT overwhelmed/how-to), ONE chip appears above input — "Want me to turn this into an email? →" → opens Make zero-hop. One chip only, never a menu, never when overwhelmed. Picks ONE highest-value type.
- Prompt rule "CHAT ROUTES, MAKE EXECUTES": Shari never drafts/refines full outputs in chat; confirms in one line and hands off; multi-intent → names ONE best action; intent-change mid-thread → drop old format, keep topic, reroute. (Server-side — needs dev reload.)

## MAKE (intent-first, progressive reveal)
`ContentGeneratorPanel`. Entry = **"What are you creating?"** → 3 cards **Email · Post · Plan** (+ "Something else…"). After pick: only **brief + tone + Generate**. Everything else collapsed: **"More options"** (avatar picker + multi-audience), and post-draft **"More options"** (Refine/Score/Remix/Export). Primary post-draft actions stay visible: **📋 Copy · Save to Templates · Add to Project**. **Zero-hop**: when opened from chat with a clear type (`seeded`), the form is skipped entirely → "✨ Writing your email…" → draft editor with **cursor auto-focused**. Saving a draft = a win (`onWin` → log + clear memory + Shari ack in chat). **Email generator** (`EmailGeneratorPanel`) is a separate 3-step flow: Intent → Context → Output.

## CLIENT AVATARS — single source of truth ("audience brain")
**Created/edited ONLY in Profile → Client Avatars** (`IdealClientBuilder`, section `client-avatars`). Everywhere else is select/view only.
- **3 levels:** L1 identity (name/emoji/image/tagline) · L2 behavior (emoji-mood traits = AI modifiers: 😩 overwhelmed → short/calm, 🧠 analytical → structured, etc. + motivations/objections/triggers/contentPrefs) · **L3 Research Mode** (behavioral/motivation/buying/communication/market/notes + custom fields; 🔍 AI research auto-fills via AIRA).
- **Editing = section hub** (jump-nav, save from any section, no wizard lock) + card quick-edit (Edit/Behavior/Research). Build flow is research-first (identity → light discovery → AI expand → review → optional deep refine).
- **Active avatar** = the one "in use" app-wide (`prefs.activeAvatarId`; `getActiveAvatar`/`setActiveAvatar`). `resolveAvatar(id?)`: explicit pick → active → primary/only. `businessContextSummary(avatarId?)` folds in pinned goals + resolved avatar (identity + behavior filter + L3 research) → every generator/chat call is client-aware automatically.
- **ClientPicker** (select-only) in Make/Email. **TopBar switcher** only at 2+ avatars. **Multiple avatars** + primary/secondary; cards: Use in AI / Edit / Make primary / Duplicate / Delete. Business Profile's old "ideal client" step is now a **pointer** to Client Avatars (no duplicate definition).
- **Multi-Avatar output mode** (Settings → Advanced AI tools, opt-in): "Generate for all audiences" = one version per avatar. Default is always ONE active avatar.

## Onboarding (first run)
`OnboardingFlow` — 7 light screens: welcome → who for → quick avatar (name+emoji+1 line) → **light research (3 Qs) + 🧠 AI expand** → comms style → business goal → done. Builds the first avatar (L1+L2), sets it active, saves goals + tone. Gated by `prefs.onboarded`; "Skip for now" on welcome.

## Retention engine
- **Continue card** (`LastActivity` store: kind draft/project/chat; recorded on draft-gen, project save, and substantive chats). Home shows ONE card "You were working on…" → **Continue** (draft → exact draft in Make, no regen; project → opens it; chat → `handleSend("Let's continue…")`) + Start fresh. **Lead line is emotion-aware** (overwhelmed → "no rush"; focused → "let's keep going"). The IdentityBar resume line is **clickable** and mutually exclusive with the card (never both). **Rule: any remembered thing MUST carry a one-click action.**
- **Continue draft NEVER regenerates** (`seed.draft` → render only).

## Progress page (`ProgressPanel`)
Rebuilt: 🟢 Today → 🟡 one-line momentum (Starter/Building/Flow, no numbers) → grouped Today's Wins (one-tap) → **"What you worked on today"** (real activity only) → Add a win. Opt-in Weekly Pattern below fold. XP exists in store but is **not shown** (momentum is silent/background).

## Voice + plans (scaffold)
`prefs.plan`: Essential (no voice) / Voice Lite (30 min) / Voice Pro (120). ElevenLabs `/api/tts`; chat toggle shows "Xm left", locked on Essential. Settings → Plan & voice. **Real billing/enforcement = backend (GoHighLevel/Stripe) — not built.** Live back-and-forth voice convo not wired.

## Google integration (LIVE)
OAuth + Drive API. `/api/google/{auth,callback,status,disconnect,create-doc}` + `lib/google.ts`. Scope `drive.file` (no paid audit). Create doc+sheet. `.env.local` has CLIENT_ID/SECRET/REDIRECT_URI (localhost + prod adhdbz.visualsparkstudios.com). Google "Testing" mode (≤100 users). Go public = Production (free).

## Known limitations / not built
- Profile photo auto-rotates `public/images/shari/shari-1..8.jpg` — only `shari.jpg` exists (static until photos added).
- Billing + voice enforcement + live voice = backend. AI-generated avatar images = not built.
- Tool-event wins (focus-session-complete, copy) not yet wired — only chat declarations + Make-save fire wins.
- Shari can't yet *name* the last task in chat ("resume the pricing email?") — would need `lastActivity` passed into `/api/companion-chat`.
- Win regex + bridge triggers are heuristic → will occasionally over/under-fire; tune with real use.

## Dev notes (IMPORTANT)
- **Sandbox bash mount serves stale/truncated copies** of large/just-edited files → in-tool tsc/parse gives FALSE errors on the truncated last line. Host files via Read/Edit are truth. Real verification = `npx tsc --noEmit` / dev-server reload locally.
- **System prompt + API routes are server-side** → reload dev server after prompt/route changes.
- After UX edits, walk the loop as a first-timer: home → "Help me write something" → Make zero-hop → save (win) → reopen (Continue card).

## Suggested next session
1. Walk/QA the full Chat→Make→win→Continue loop on a real reload; fix anything that throws.
2. Tune win + bridge + creation-routing regexes against real phrasing.
3. Pass `lastActivity` into the chat API so Shari names the task in resume/bridge lines.
4. Tool-event wins (focus complete, copy/export).
5. (Bigger) real plan billing; per-project momentum; live voice.
