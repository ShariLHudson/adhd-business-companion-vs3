# Companion Homestead™
## First Production Experience

**Version:** 1.0  
**Status:** Design authority — awaiting approval (no production code)  
**Scope:** The user's first **30–60 seconds** inside the homestead — from app open to natural arrival at first workspace  
**This is NOT:** a screen redesign · CSS · React · a feature spec  

**This IS:** the first **complete production experience** — one continuous emotional arc that every return visit still deserves.

**Subordinate to:**

- Product Constitution™ · Companion Constitution™
- [`COMPANION_HOMESTEAD_MANIFESTO.md`](../COMPANION_HOMESTEAD_MANIFESTO.md)
- Hospitality Principle™ · [`EXPERIENCE_OF_SHARI.md`](../EXPERIENCE_OF_SHARI.md)
- [`COMPANION_DECISION_INTELLIGENCE.md`](../COMPANION_DECISION_INTELLIGENCE.md)
- [`COMPANION_TRUST_ARCHITECTURE.md`](../COMPANION_TRUST_ARCHITECTURE.md)
- [`SCREEN_COMPOSITION_GUIDE.md`](./SCREEN_COMPOSITION_GUIDE.md)
- [`docs/room-lookbooks/`](../room-lookbooks/) — especially Living Room™
- Companion Object Registry™ · Scene Integrity Engine™ · Companion Layout System™

**Bridges:**

```
Room Look Books™ → Screen Composition Guide™ → First Production Experience™ → React
```

**Success test:**

> Someone opening the app for the **hundredth time** still feels: *"I'm glad I came."* — before they accomplish a single task.

---

# Executive Summary

The homestead does not open to software. It opens to **a room that was already waiting**.

The first production experience is a **single choreographed journey** with six beats — not six pages. The Living Room™ holds the entire arc. Only at the end does the environment **walk** the guest to their first workspace. One recommendation. One transition. One next thing.

| Beat | Name | Duration | User feels |
|------|------|----------|------------|
| 0 | **Settle** | 0–3s | *I'm somewhere real.* |
| 1 | **Arrive** | 3–8s | *She's glad I came.* |
| 2 | **Today's Reality™** | 8–38s | *She gets today — I wasn't interrogated.* |
| 3 | **Room responds** | overlaps 2–4 | *The house noticed.* |
| 4 | **One door** | 38–48s | *She has one idea — I can say yes or not today.* |
| 5 | **Walk there** | 48–60s | *We moved through the house — not clicked a link.* |

**Total target:** 30–60 seconds to first workspace. **Minimum viable warmth:** 15 seconds if guest is RETURNING_ACTIVE with cached reality and a clear continue path.

---

# Deliverable 1 — Complete Journey Map

## The arc (all visits)

```
APP OPEN
   │
   ▼
┌──────────────────────────────────────────────────────────────┐
│  LIVING ROOM™ — full-arrival (95% environment)               │
│                                                              │
│  [Settle] ──► [Greet] ──► [Today's Reality™] ──► [Respond]  │
│                              conversational                   │
│                                    │                         │
│                                    ▼                         │
│                         [One Recommendation]                 │
│                                    │                         │
│                                    ▼                         │
│                         [Walk to Workspace]                │
└──────────────────────────────────────────────────────────────┘
   │
   ▼
FIRST WORKSPACE (Planning Table™ · Window Seat™ · Creative Studio™ · etc.)
```

## Visitor paths

Three home states from Arrival Intelligence™ — same journey **shape**, different **depth**:

| State | When | Journey depth |
|-------|------|---------------|
| **FIRST_VISIT** | Never chatted | Full arc — all six beats; reality may be one gentle question |
| **QUIET_PRESENCE** | Established relationship, no urgent continue | Beats 0–2 shortened; reality optional if fresh today; one door or conversation only |
| **RETURNING_ACTIVE** | Unfinished thread or explicit continue | Skip or compress reality if unchanged; greet + carry + one door to continue |

## Emotional choreography alignment

Maps to Journey Experience Bible™ beats:

| Bible beat | Production beat |
|------------|-----------------|
| Arrival | Settle + Arrive |
| Pause | First 1.5s — room only, no copy |
| Greeting | Arrive |
| Orientation | Today's Reality™ |
| Invitation | One door |
| Transition | Walk there |
| Support | Begins inside workspace — out of scope for this doc's end |

## Decision ladder alignment

Today's Reality™ and room recommendation obey Decision Intelligence™ rungs:

1. **Emotional safety** — greeting and reality never push productivity when flooded  
2. **Cognitive capacity** — fewer questions when low; Window Seat bias when very low  
3. **User intent** — if they typed before reality completes, honor intent over script  
4. **Relationship history** — six-week return gets recovery warmth, not guilt  
5. **Environmental support** — room responds to stated reality  
6. **Action** — one recommendation last  

---

# Deliverable 2 — Wireframe-Level Layout

## Global frame (every beat)

```
┌─────────────────────────────────────────────────────────────┐
│ House Map (muted)                              Toolbelt (muted) │  ← Persistent UI — visually deferential
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────────────────────┐                   │
│   │                                     │  FIREPLACE        │
│   │         PHOTOGRAPH                  │  (hero,            │
│   │         Living Room                 │   center-left)     │
│   │                                     │                   │
│   │              [window / Iowa]        │                   │
│   │                                     │                   │
│   ├─────────────────────────────────────┤                   │
│   │ SAFE TEXT ZONE (lower third)        │                   │
│   │  · greeting / reality / one door    │  Shari portrait   │
│   │  · cream scrim — not opaque slab    │  (lower right,    │
│   │  · max width ~42ch conversation   │   optional beat 1) │
│   └─────────────────────────────────────┘                   │
│                                                             │
│   [Conversation input — hidden until invite phase]          │
└─────────────────────────────────────────────────────────────┘
```

### Layer ownership (Screen Composition Guide™)

| Layer | Arrival layout |
|-------|----------------|
| Background | Full viewport photograph; `object-position` anchors fireplace center-left |
| Living | Hero: fire flicker OR rain on glass (engine picks one) |
| Atmosphere | Scene Integrity — time, season, weather, lamp state |
| Companion | Portrait in safe zone — Host presence; fades to chip after beat 2 |
| UI | Cream scrim cards only in **safe text zone** — never over fireplace |
| Objects | Mug, blanket appear as **environmental** — not UI icons |
| Interaction | Single input line; no toolbar in content canvas |

### Safe composition zones (Living Room™)

| Zone | Rect (conceptual) | Allowed |
|------|-------------------|---------|
| **Hero — fireplace** | Upper-left 45% × upper 55% | Photography only — no text, no cards |
| **Hero — window** | Upper-right 40% × upper 45% | Photography + subtle weather motion |
| **Safe text** | Lower 38% × center 70% | Greeting, reality exchange, one door |
| **Companion portrait** | Lower-right 22% × lower 35% | Shari still image — must not cover fireplace |
| **Input strip** | Bottom 12% × center 85% | Single conversational field |

**Environment share:** ~95% of viewport shows room at beat 0; scrim occupies ~25% of lower frame at peak UI — room still recognizable at edges and through scrim transparency.

---

## Beat-by-beat layout

### Beat 0 — Settle (0–3s)

- **Visible:** Photograph only. House Map / Toolbelt at 40% opacity (muted).
- **Copy:** None.
- **Motion:** Hero motion begins after 0.8s (fire or rain).
- **Audio:** Optional ambient — one bird, distant wind, or silence.

### Beat 1 — Arrive (3–8s)

- **Visible:** Greeting line fades into safe text zone. Portrait fades in lower-right (if Host path).
- **Copy:** One line greeting. No subtitle. No feature names.
- **Input:** Hidden.

### Beat 2 — Today's Reality™ (8–38s)

- **Visible:** Conversational exchange in safe text zone — reads like chat bubbles from Shari, not a form.
- **Visible:** Optional **Reality Echo** — one short line summarizing what was understood (not a data card).
- **Input:** Single line — placeholder rotates: *"In your own words…"* / *"A few words is enough."*
- **Never visible:** Sliders, 1–10 scales, multi-field forms, "Energy / Motivation / Vibe" headers.

### Beat 3 — Room responds (overlaps)

- **Visible:** Same layout — **environment** changes, not new UI.
- **No toast, no banner, no "Shari prepared…"**

### Beat 4 — One door (38–48s)

- **Visible:** One sentence recommendation + one primary button + one text escape (*"Not today"* / *"Stay here"*).
- **Never visible:** Secondary feature list, "Or try…", grid of rooms.

### Beat 5 — Walk there (48–60s)

- **Visible:** Living Room photograph **slides and softens** (scale 1 → 0.97, slight blur) while destination room **grows from the direction of travel** (Planning Table from right hall, Window Seat from left window wall, etc.).
- **Visible:** Working layer rises from bottom — cream surface — environment header of destination room.
- **Copy:** One walking line from Shari during transition — optional, ≤12 words.

---

## Mobile-first wireframe (375px)

```
┌──────────────────┐
│ ≡    Homestead  ☰ │  ← House Map collapsed; Toolbelt icon
├──────────────────┤
│                  │
│   FIREPLACE      │  Hero band — 50% viewport height
│   (cropped       │
│    center-left)  │
│                  │
├──────────────────┤
│ ░░ scrim ░░░░░░  │  Safe zone — full width
│ Greeting         │
│ Reality line     │
│ [ One door ]     │
│                  │
│ ┌──────────────┐ │
│ │ say something│ │  Input — sticky bottom
│ └──────────────┘ │
└──────────────────┘
```

**Mobile rules:**

- Portrait **hidden** on narrow viewports — voice is enough; saves hero space.
- Fireplace remains in upper band — never cropped away entirely.
- One column only — no sidebar.
- Touch targets ≥ 44px; primary button full-width soft fill.
- Keyboard: input scrolls above keyboard; fireplace stays partially visible.

---

# Deliverable 3 — Interaction Flow

## State machine

```
                    ┌─────────────┐
                    │   SETTLE    │
                    └──────┬──────┘
                           │ 1.5s + atmosphere ready
                           ▼
                    ┌─────────────┐
              ┌────│   GREET     │────┐
              │    └──────┬──────┘    │
              │ skip if   │           │ user types early
              │ RETURNING │           │ (intent override)
              │ w/ cache  │           ▼
              │           ▼    ┌──────────────┐
              │    ┌─────────────┐         │
              │    │   REALITY   │◄────────┘
              │    │ (conv.)     │
              │    └──────┬──────┘
              │           │ understood OR timeout soft-complete
              │           ▼
              │    ┌─────────────┐
              └────►│ ROOM_RESPOND│ (parallel animation)
                    └──────┬──────┘
                           ▼
                    ┌─────────────┐
                    │  ONE_DOOR   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │ accept     │ decline    │ stay / chat
              ▼            ▼            ▼
         ┌─────────┐  ┌─────────┐  ┌─────────┐
         │  WALK   │  │ LIVING  │  │ LIVING  │
         │         │  │  ROOM   │  │ + CHAT  │
         └────┬────┘  └─────────┘  └─────────┘
              ▼
         WORKSPACE
```

## Today's Reality™ — conversational protocol

**Not a form.** A **three-turn maximum** dialogue embedded in the Living Room.

| Turn | Shari | Guest |
|------|-------|-------|
| **Open** | One orienting question — varies by context | Optional reply |
| **Clarify** (only if needed) | One follow-up — capacity OR emotional tone, not both | Short reply |
| **Close** | Reality Echo — one sentence mirror | Tap **That's right** OR silent accept after 4s |

**Extraction (invisible):** Companion Brain maps natural language → `DayState` signals (energy band, emotional tone, capacity). Guest never sees field names.

**Soft complete:** If guest sends one word ("tired", "good", "overwhelmed") — skip clarify turn.

**Skip path:** "Same as yesterday" (returning guests) — one tap, no re-interview.

**Timeout kindness:** After 30s without input, Shari offers: *"I'll keep today gentle until you tell me otherwise."* — default low-pressure reality, proceed to one door or quiet stay.

## One door interaction

| Guest action | System response |
|--------------|-----------------|
| **Primary** (accept) | Begin WALK transition → open recommended workspace |
| **Not today** | Remain in Living Room; chat input opens; no second recommendation for 10 min |
| **Stay here** | Conversation mode; no workspace push |
| **Types new intent** | Decision Intelligence re-evaluates; may replace recommendation once |

## Consent rules

- No auto-navigation — ever.
- No pre-opened workspace behind the living room.
- Decline is complete — no guilt copy.

---

# Deliverable 4 — Motion Timeline

**One hero motion** in Living Room: fire flicker **OR** rain on glass (Scene Integrity picks — never both at full amplitude).

| Time | Motion | Layer |
|------|--------|-------|
| **0.0s** | Static photograph (loaded) | Background |
| **0.0s** | House Map / Toolbelt fade from 0 → 40% opacity over 1.2s | Persistent UI |
| **0.8s** | Hero motion begins (fire or rain) | Living |
| **1.5s** | Optional ambient audio fade in (0 → 15% volume, 2s) | Atmosphere |
| **3.0s** | Greeting text fade in (400ms, ease-out) | UI |
| **3.2s** | Portrait fade in (300ms) — desktop only | Companion |
| **5.0s** | Reality question fade in | UI |
| **8.0s** | Input strip slide up (250ms) | Interaction |
| **On reply** | Mug steam OR blanket edge visible (800ms object fade) | Atmosphere / Object |
| **On understand** | Lamp warm shift +2% amber (3s ease) | Atmosphere |
| **38s** | One door button fade in | UI |
| **On accept** | Living room scale 1 → 0.97 (600ms); parallel destination room parallax in (800ms) | Environment |
| **+0.4s** | Cream working surface rise from bottom (500ms) | Working |
| **+1.0s** | Shari portrait → small chip (crossfade 400ms) | Companion |
| **Complete** | Hero motion transfers to destination room rules | Living |

**Reduced motion:** All transitions → opacity crossfade only; hero motion off; audio off.

**Never:** Bounce, pulse, confetti, loading spinners on the photograph, skeleton placeholders over fireplace.

---

# Deliverable 5 — Companion Dialogue

## Voice rules (all beats)

- One voice — Shari — not "the app."
- Short sentences. Spoken rhythm.
- Never feature names on first line.
- Never streak, guilt, absence shame, clinical tone.
- Never multiple questions in one message.
- Trust Architecture™ — earned warmth scales with relationship.

## Beat 1 — Greeting variants

### First visit

| Line | Notes |
|------|-------|
| **Greeting:** *"Welcome. I'm glad you're here."* | No exclamation overload |
| **Never:** *"Welcome to Companion Homestead!"* · tour language · capability list |

### Returning — ordinary (daily)

| Time | Greeting examples |
|------|-------------------|
| Morning | *"Good morning."* · *"There you are."* · *"Coffee's ready."* |
| Afternoon | *"Welcome back."* · *"Come on in."* |
| Evening | *"Long day?"* · *"Let's slow things down."* |

### Returning after six weeks

| Line | Notes |
|------|-------|
| **Greeting:** *"I'm really glad you came back today."* | Recovery category — no "where have you been" |
| **Never:** Missed-you guilt · streak reset · "You have 47 unread…" |

### Difficult day (signals: overwhelm, shame, grief words in history or first reply)

| Line | Notes |
|------|-------|
| **Greeting:** *"I'm here."* or *"We'll go gently."* | Shorter — Host not cheerleader |
| **Never:** *"Let's crush it!"* · toxic positivity · immediate planning |

### Exciting day (celebration signals, win context, birthday)

| Line | Notes |
|------|-------|
| **Greeting:** *"Before anything else — congratulations."* OR *"Happy Birthday."* | Match their news — don't pivot to tasks in greeting |
| **Never:** Immediate *"now let's plan next"* |

### Low energy (explicit or inferred)

| Line | Notes |
|------|-------|
| **Greeting:** *"Let's keep today honest."* | Permission embedded |
| **Never:** High-energy prompts |

### Shari visibility

| Context | Portrait |
|---------|----------|
| First visit, difficult day, six-week return | **Visible** — Host presence |
| Ordinary daily return | **Optional** — voice in text sufficient |
| Low energy / late night | **Hidden** — room carries safety |

## Beat 2 — Today's Reality™ dialogue

### Opening questions (one only)

| Context | Question |
|---------|----------|
| Morning, ordinary | *"How are you arriving today?"* |
| After absence | *"What's today actually like?"* |
| Difficult | *"What's the truest thing about today?"* |
| Exciting | *"What's the good news — and what else is true today?"* |
| Low energy | *"How much do you actually have in the tank?"* |

### Clarify (max one)

| If vague | Follow-up |
|----------|-----------|
| "Fine" | *"More steady, or more stretched?"* |
| "Bad" | *"More tired, or more heavy?"* |
| "Busy" | *"Good busy, or the kind that eats you?"* |

### Reality Echo (close)

| Guest said | Echo |
|------------|------|
| *"Slept badly, two hard calls, low steam"* | *"So — short tank, a couple of heavy calls, and we protect what we can."* |
| *"Great mood, big idea energy"* | *"So — you've got spark today. Let's not waste it on busywork."* |
| *"Overwhelmed"* | *"So — flooded. We simplify everything until breathing is easier."* |

### Never say (Today's Reality)

- *"Rate your energy 1–10"*
- *"Select your motivation level"*
- *"Complete your daily check-in"*
- *"Update Today's Reality in settings"*
- Field labels: Energy, Motivation, Vibe as UI chrome

## Beat 4 — One recommendation

**One sentence + one place name in homestead language — not section IDs.**

| Reality signal | Recommendation example |
|----------------|------------------------|
| Medium capacity, day shape needed | *"I think the Planning Table would fit today."* |
| Flooded / overwhelmed | *"Let's spend a few minutes at the Window Seat."* |
| Creative spark, high energy | *"The Creative Studio is calling — want to land that idea?"* |
| Continue thread exists | *"Want to pick up where we left off at the Planning Table?"* |
| Celebration | *"Want to sit in the Living Room and tell me more — or capture it in the Studio?"* — **still one primary button** |

**Never:**

- *"You could also try…"* + list
- *"Open Plan My Day"* as route language — use **Planning Table**
- Multiple equal CTAs

## Beat 5 — Transition line

| Destination | Walking line |
|-------------|--------------|
| Planning Table | *"I'll walk with you."* |
| Window Seat | *"This way — by the window."* |
| Creative Studio | *"Let's head to the studio."* |

---

# Deliverable 6 — Room Changes (Living Room Response)

**Principle:** The user **notices**. Shari does not announce preparation.

Scene Integrity Engine™ + hospitality objects — triggered by Today's Reality™ signals and time/weather — **never manual per route**.

| Signal | Environmental response | Announcement |
|--------|------------------------|--------------|
| Low energy / tired | Blanket draped on sofa arm; lamp warmer | None |
| Rain weather (engine) | Rain on glass intensifies slightly; lamp on | None |
| Morning + ordinary | Steam from spark mug on coffee table | None |
| Cold season | Fire brighter one step | None |
| Overwhelmed | Curtains close 10%; room contracts | None |
| Exciting / warm | Window light slightly brighter; mug present | None |
| Late night | Single lamp pool; fire low | None |
| Six-week return | Extra throw visible; mug out | None |

**Kinsey™ (optional):** Tail thump once on ordinary return — then asleep on rug. Never blocks safe text zone.

**Audio shifts:** Fire crackle up one notch in winter low-energy; rain audio if glass has rain — guest may not have sound on.

**Forbidden:**

- Toast: *"Shari prepared the room for you"*
- Badge or icon indicating hospitality
- Object appearing with bounce animation
- Changes that contradict season/weather integrity

---

# Deliverable 7 — ADHD Review

| Challenge | How this experience helps | Violation to guard |
|-----------|---------------------------|-------------------|
| **Executive function** | One beat at a time; state machine prevents parallel asks | Showing greeting + form + recommendation simultaneously |
| **Working memory** | Reality Echo mirrors back — guest doesn't hold fields in head | Hidden state guest must remember |
| **Overwhelm** | Window Seat path when flooded; 30s soft complete | Full reality interview when dysregulated |
| **Decision fatigue** | One door; Not today is valid | Room picker grid |
| **Attention** | Fireplace anchors gaze; UI only in safe zone | Motion everywhere |
| **Emotional regulation** | Pause before copy; difficult-day short lines | Productivity push at entry |
| **Time blindness** | 30–60s bounded arc — guest knows it won't become a 10-min survey | Unbounded onboarding |
| **Rejection sensitivity** | No absence guilt; recovery greeting | "You haven't checked in…" |

### Hard maximums (arrival only)

| Dimension | Max |
|-----------|-----|
| Visible primary decisions | 1 |
| Simultaneous cards / panels | 1 |
| Questions in flight | 1 |
| Hero motion elements | 1 |
| Competing accent colors | 2 |
| Auto-open workspaces | 0 |
| Feature names in first 8 seconds | 0 |

**Behavior audit alignment:** No feature mall · no premature routing · relationship before tools · intent → permission → action.

---

# Deliverable 8 — Mobile-First Review

| Concern | Design response |
|---------|-----------------|
| **Viewport** | Design at 375×667 first; scale up |
| **Hero** | Fireplace band ≥45% height — emotional anchor on small screens |
| **Portrait** | Hidden <768px — text carries Host presence |
| **Touch** | Full-width primary; 44px min; no hover-only affordances |
| **Keyboard** | Input sticky; safe zone scrolls; hero partially visible |
| **Thumb zone** | Primary action in lower third |
| **Performance** | Photograph LCP target <2.5s; motion deferred until paint |
| **Orientation** | Portrait primary; landscape — safe zone widens, hero left |
| **One hand** | All arrival actions reachable without reach to top corners |

---

# Deliverable 9 — Accessibility Review

| Requirement | Implementation intent |
|-------------|----------------------|
| **Screen readers** | `aria-live="polite"` on greeting and Reality Echo; scene `aria-label` describes room not software |
| **Focus order** | Greeting (read) → input when visible → primary button → escape link |
| **Focus visible** | Warm ring — not browser default only |
| **Reduced motion** | `prefers-reduced-motion` disables hero loop and parallax walk |
| **Contrast** | Scrim ensures 4.5:1 on all conversation text |
| **No color-only state** | Reality understood = text echo, not green check alone |
| **Captions** | N/A for arrival — no required video |
| **Voice input** | Mic optional on input — not required path |
| **Cognitive** | Plain language; no timed mandatory responses — soft complete at 30s |
| **Skip** | Persistent House Map allows exit to any room — arrival never traps |

**Never:** Autoplay audio without user preference · seizure-inducing flash on fire · essential info only in photograph with no text alternative.

---

# Deliverable 10 — React Implementation Strategy

**No production code in this pass.** Strategy only — maps to existing modules.

## Architectural shape

```
CompanionPageClient
  └─ when homeCalm && welcome-scene
       └─ FirstProductionArrivalExperience  (NEW — orchestrates beats)
            ├─ evaluateArrivalIntelligence()     (existing)
            ├─ evaluateWelcomePresenceIntelligence() (existing)
            ├─ composeLivingCompanionRoom()      (existing)
            ├─ evaluateCompanionEnvironmentIntelligence() (existing)
            ├─ evaluateConversationalReality()   (NEW — brain client)
            ├─ resolveArrivalRecommendation()    (NEW — wraps Decision Intelligence + Needs Intelligence)
            └─ CompanionWelcomeScene             (existing — extend phases)
                 ├─ LivingCompanionRoomLayers
                 ├─ ArrivalBeatRenderer (greet | reality | one-door)
                 └─ WelcomeLivingRoomInput (existing — gate by phase)
```

## Phase extension (`welcomeLivingRoom` phases)

Extend existing `living.phase` enum:

| Phase | Maps to beat |
|-------|--------------|
| `settle` | 0 |
| `greet` | 1 |
| `reality` | 2 |
| `respond` | 3 (environment flags) |
| `invite` | 4 |
| `walk` | 5 |
| `complete` | handoff to workspace |

`phaseShowsGreeting` / `phaseShowsInput` / `phaseShowsInvite` already exist — align to new beat map.

## New modules (proposed)

| Module | Responsibility |
|--------|----------------|
| `lib/arrivalExperience/arrivalBeatMachine.ts` | Pure state machine; testable transitions |
| `lib/arrivalExperience/conversationalReality.ts` | Turn-taking, echo generation, DayState extraction |
| `lib/arrivalExperience/arrivalRecommendation.ts` | One door — calls `companionNeedsIntelligence` + Decision Ladder |
| `lib/arrivalExperience/roomWalkTransition.ts` | Declarative transition spec per destination place |
| `components/companion/FirstProductionArrivalExperience.tsx` | Beat orchestrator — thin UI |
| `components/companion/ArrivalRealityExchange.tsx` | Conversational UI — not `AdjustMyDayPanel` |

## Reuse — do not rewrite

| Existing | Role |
|----------|------|
| `evaluateArrivalIntelligence` | Visitor kind, home state, chrome |
| `CompanionWelcomeScene` | Layer stack, atmosphere |
| `LivingCompanionRoomLayers` | Background + living + atmosphere |
| `Scene Integrity Engine™` | Room response triggers |
| `companionObjectRegistry` | Object identity in workspace after walk |
| `companionLayoutSystem` | Immersion profiles on arrival at destination |
| `welcomePresenceIntelligence` / greeting libraries | Greeting selection — extend categories for difficult/exciting |

## Deprecate for arrival path (not delete globally)

| Current | Why |
|---------|-----|
| `AdjustMyDayPanel` on arrival | Form UX — keep for in-workspace tune-up only |
| Auto-focus input on every FIRST_VISIT | Wait until reality beat |
| `RETURNING_ACTIVE` → standard layout skip | Returning guests still deserve settle beat — compress don't skip |
| Multiple continue buttons (`showContinueList`) | Replace with one door + "see all" behind explicit ask |

## Data flow

```
ArrivalIntelligence
  + ConversationalRealityResult { dayState, echo, turnsUsed }
  + ArrivalRecommendation { placeId, label, rationaleLine }
  + HospitalityDelta { objectIds, lightingShift, audioShift }
       ↓
FirstProductionArrivalExperience renders beat
       ↓
On accept → setActiveSection / openWorkspace(placeId) WITH walk animation
       ↓
Workspace receives carried context (dayState, echo, emotional tone) — no re-ask
```

## Testing strategy

| Layer | Tests |
|-------|-------|
| `arrivalBeatMachine` | All transitions; early intent override; decline paths |
| `conversationalReality` | One-word complete; clarify max one; 30s soft complete |
| `arrivalRecommendation` | Always exactly one; flooded → window-seat |
| Behavior audit | No feature mall on arrival; no auto workspace |
| Visual | Storybook beats 0–5 with reduced motion variant |

## Feature flags

- `FIRST_PRODUCTION_EXPERIENCE=1` — gates new orchestrator vs legacy welcome
- Rollout: internal → founder → 10% → 100%
- Rollback: flag off returns to current `CompanionWelcomeScene` path

## Implementation order (post-approval)

1. Beat machine + tests  
2. Conversational reality client (brain prompt — no form fields)  
3. Extend welcome phases in `CompanionWelcomeScene`  
4. Arrival recommendation (one door)  
5. Room walk transition animation  
6. Wire `CompanionPageClient` home path  
7. Behavior audit + arrival-specific audit cases  
8. Mobile + a11y pass  
9. Remove arrival dependency on `AdjustMyDayPanel`  

---

# Companion Communication Anchor™

**Non-negotiable:** Every primary screen must preserve a way for the guest to speak to Shari.

| Rule | Implementation |
|------|----------------|
| Text input always reachable | `CompanionCommunicationAnchor` + `data-testid="companion-communication-input"` |
| Mic always reachable | Never disabled during room transitions (tier may gate voice) |
| Send always reachable | `data-testid="companion-communication-send"` |
| Arrival pause | `quiet` mode — visible, no auto-focus, mic live |
| Active conversation | `full` mode — reality, invite, staying |
| Life layers | Living Change Engine must not block pointer events on anchor |
| Decorative overlays | `pointer-events: none` on scene layers; anchor `z-index: 12` |

Component: `components/companion/CompanionCommunicationAnchor.tsx`  
Invariants: `lib/companionCommunicationAnchor/`  
Audit: `lib/companionCommunicationAnchor/companionCommunicationAnchor.test.ts`

---

# Approval Gate

Before production implementation:

- [ ] First Production Experience™ approved
- [ ] Today's Reality™ conversational protocol approved (replaces form-at-arrival)
- [ ] One-door recommendation aligns with Decision Intelligence™
- [ ] Room response table approved by look book + Scene Integrity
- [ ] ADHD maximums signed off
- [ ] Mobile + accessibility checklists signed off
- [ ] Screen Composition Guide™ Living Room sheet still valid
- [ ] Behavior audit cases drafted for arrival journey

**After approval:** Implement on `FIRST_PRODUCTION_EXPERIENCE` flag before redesigning other rooms.

---

## Final Principle

> The app opens to a room, not a dashboard.  
> Today's Reality is a conversation, not a form.  
> The house responds without announcing.  
> Shari offers one door.  
> The guest walks there — and on the hundredth visit, still feels glad they came.
