# Estate Registry™

**Status:** BINDING · **Authority:** `lib/estateExperiences/` · **Golden Rule:** `navigationPhilosophy.ts`

> **The user should never need to know where a feature lives. Spark knows the Estate. The user simply shares what they want to accomplish. Spark guides them to the most appropriate space, offers alternatives when more than one space fits, and naturally suggests the next best place when it adds value.**

## Migration freeze (effective now)

**Stop adding new features** until every remaining legacy workspace, menu, route, prompt, and launcher has either been **removed** or **mapped** in this registry and `lib/estateExperiences/legacyWorkspaceMap.ts`.

When adding capability, ask: *What is the user trying to accomplish, and where in the Estate would that feel most natural?* — **not** *Which menu should this go under?*

---

## Three layers (not “rooms” in code)

| Layer | Meaning | Example |
|-------|---------|---------|
| **Experience** | What the member is trying to accomplish | Create |
| **Estate Space** | Visual environment (`placeId`) | `creative-studio` |
| **Tool** | Panel/object that opens inside (`AppSection` or catalog item) | `content-generator` → Email |

**Routing flow:** Intent → Experience → Navigate to Space → Open Tool → Conversation

**Confidence:** High → navigate immediately · Medium → max 3 choices · Low → one question first

---

## Master registry — every feature appears exactly once

| Experience | Estate Space | Primary tools | Arrival prompt |
|------------|--------------|---------------|----------------|
| **Create** | Create Studio (`creative-studio`) | Email, Newsletter, SOP, Proposal, Social Post, Blog, Presentation, Template, Mind Map, Whiteboard, AI Image, Vision Board, Brainstorm, New Project (creation only) | *What would you like to bring to life today?* |
| **Momentum** | Momentum Room (`goals-projects`, `momentum-builder`) | Active Projects, Weekly Plan, Quarterly Plan, Marketing Plan, Goals, Roadmap, Milestones, Next Actions | *What are we moving forward today?* |
| **Focus** | Focus Room (`focus-studio`) | Pomodoro, Deep work, Body doubling, Focus music, Focus timer, Resume last task | *What would help you concentrate?* |
| **Restore** | Sunroom / Peaceful Places (`peaceful-places`, `clear-my-mind`) | Breathing, Meditation, Grounding, Soundscapes, Clear My Mind | *What kind of calm would help most?* |
| **Think** | Decision Compass · Study Hall (`decision-compass`, `study-hall`) | Decision Compass, Pros & Cons, SWOT, Research, Great Thinkers, Courses, Notes | *What are we working through?* |
| **Journal** | Journal Gazebo (`journal`) | Reflection, Gratitude, Accomplishment, Prayer, Memory | *What would you like to capture today?* |
| **Grow** | Evidence Vault · Greenhouse (`evidence-vault`, `greenhouse`) | Evidence Vault, Hall of Accomplishments, Growth Profile, Institute Cabinet, Seeds Planted, Timeline | *What growth feels worth noticing?* |
| **Celebrate** | Celebration Hall · Garden (`celebration-room`, `celebration-garden`) | Wins, Rewards, Accomplishment recording | *(quiet celebration — no dashboard)* |
| **Play** | Game Room · Art Studio · Conservatory (`game-room`, `art-studio`, `conservatory`) | Games, Music, Art, Butterfly Conservatory | *What sounds fun right now?* |
| **Business** | Boardroom (`round-table`) | Client Avatars, Products, Services, Offers, Pricing, Funnels, CRM, Marketing Calendar, Sales, Launches, Analytics, Content Library, SOP Library | *What part of the business needs you?* |
| **Explore** | Homestead · Map (`homestead`, `welcome-home`) | Estate Map, Visit Another Room, Guidebook, Seasonal discoveries | *Where should we wander?* |

**Learn** is a member-facing name for the **Think** experience at **Study Hall** — not a separate twelfth pillar.

---

## Legacy workspace audit

Disposition key: ✅ **Keep** (tool stays, remapped under experience) · 🔄 **Move** (retire legacy shell/label, route via experience) · 🗑 **Remove** (duplicate or dashboard — delete)

| Legacy name | Disp. | Maps to |
|-------------|-------|---------|
| Creative Studio™ | 🔄 | Create → `creative-studio` → `content-generator` |
| Documents (Create panel title) | 🔄 | Create (rename user-facing title) |
| Email Workspace / `email-generator` | 🗑 | Create → Email tool |
| Marketing Workspace | 🗑 | Business or Momentum (by intent) |
| SOP Workspace | 🗑 | Create → SOP |
| Proposal Workspace | 🗑 | Create → Proposal |
| Content Types | 🗑 | Create catalog categories |
| Templates Library (top-level) | 🔄 | Create → Templates tool |
| Saved Work / Created Content | 🔄 | Create → recent work *(or Business library — one canonical home)* |
| Workshop Builder | 🔄 | Create |
| Strategy Builder | 🔄 | Business |
| Momentum Builder™ (as workspace brand) | 🔄 | Momentum |
| Plan My Day (standalone launcher) | 🔄 | Momentum → Weekly Plan |
| Projects (active work) | ✅ | Momentum → Projects |
| Client Avatar Builder | 🔄 | Business |
| Business Profile | 🔄 | Business |
| Playbook / Strategies | 🔄 | Business |
| Google Workspace bridge | 🔄 | Business |
| How Do I | 🗑 | Guidebook + conversation |
| Welcome Home dashboard cards | 🗑 | Explore → conversational arrival |
| Workspace offer cards (“Step into…”) | 🗑 | High-confidence: navigate immediately |
| `WORKSPACE_SECTIONS` menu list | 🔄 | Internal only — never member-facing |

Machine-readable: `lib/estateExperiences/legacyWorkspaceMap.ts`

---

## Legacy language → Estate language

| Retire (member-facing) | Use instead |
|------------------------|-------------|
| Workspace | *(omit — name the experience or place)* |
| Open Workspace | Navigate to [Experience] |
| Switch Workspace | Let's head to [Experience] |
| Module | Experience or tool |
| Builder | Tool inside [Experience] *(or omit)* |
| Launch / Launching | *(navigate silently or “Let's head to…”) |
| Step into… | Open [Experience] / Let's head to… |
| Creative Studio™ | Create |
| Dashboard | *(never — scene + conversation)* |
| Menu / launcher grid | Arrival suggestions or one question |

---

## Technical debt — appears twice (must merge)

| Feature | Current duplicates | Canonical home |
|---------|-------------------|----------------|
| Email | `content-generator` + `email-generator` | Create → Email |
| Create / Documents | `content-generator` title “Documents” | Create |
| Marketing plan | Create artifact + Momentum + Institute | Momentum (plan) · Business (strategy) |
| Funnel | Create artifact + Business tools | Business (ops) · Create (draft assets) |
| Portfolio / Gallery | `growth-portfolio`, `the-gallery`, Art Studio cross-links | Grow → Portfolio; Create for making |
| Celebration | `wins-this-week`, `growth-reports`, Celebration Garden/Hall | Grow / Celebrate experience |
| Study / Learn | `momentum-institute`, `study-hall`, Observatory | Think → Study Hall |
| Focus calm | `focus-audio`, `peaceful-places`, Restore | Intent: Focus vs Restore |

---

## Implementation map (`AppSection` → Experience)

| `AppSection` | Experience | Space |
|--------------|------------|-------|
| `content-generator` | Create | `creative-studio` |
| `projects`, `plan-my-day`, `momentum-builder` | Momentum | `goals-projects` / `momentum-builder` |
| `focus`, `focus-timer`, `visual-focus` *(concentration)* | Focus | `focus-studio` |
| `brain-dump`, `breathe`, `focus-audio` *(calm)* | Restore | `clear-my-mind` / `peaceful-places` |
| `decision-compass`, `momentum-institute`, `grow-observatory` | Think | `decision-compass` / `study-hall` |
| `growth-journal` | Journal | `journal` |
| `evidence-bank`, `growth-greenhouse`, `confidence-vault`, `my-journey` | Grow | `evidence-vault` / `greenhouse` |
| `wins-this-week`, `growth-reports` | Celebrate | `celebration-garden` / `celebration-room` |
| `quick-recharge`, `games` | Play | `game-room` |
| `client-avatars`, `business-profile`, `playbook`, `google-workspace` | Business | `round-table` |
| `welcome-room`, `home` | Explore | `welcome-home` / `homestead` |

Shell mapping: `lib/estate/directory/shell.ts` · Experience routing: `lib/estateExperiences/`

---

## Cross-place suggestions (not menus)

Tone: **“While you're here…”** · **“You might also enjoy…”**

After completion: permission-based bridges (e.g. Create email → Momentum launch plan).  
See `lib/estateExperiences/crossSuggestions.ts`.

---

## Related authority

- `docs/estate/ESTATE_ARCHITECTURAL_AUTHORITY.md`
- `docs/estate/ESTATE_BRAIN.md` — **Estate Brain** (internal knowledge, triggers, search)
- `lib/estateBrain/` — runtime Estate Brain
- `lib/estateExperiences/navigationPhilosophy.ts`
- `lib/estateExperiences/registry.ts`
- `companion-app/AGENTS.md` (Golden Rule)

---

*If a feature does not fit anywhere in this table — design discussion. If it appears twice — technical debt.*
