# UX Punch List™

**P0.57 — UX Polish & Screen Certification**

**P0.58 — Governed by the [Product Constitution™](./PRODUCT_CONSTITUTION.md)**

**Development decisions:** [Development Governance™](./DEVELOPMENT_GOVERNANCE.md)

Living tracker for polish issues and **Future Opportunities** breadcrumbs per screen.

**Process:** [Screen Certification Sprint™](./SCREEN_CERTIFICATION.md) — one screen at a time until production-ready.

**Governing law:** [Product Constitution™](./PRODUCT_CONSTITUTION.md) — Gate 10 required for every certification.

**Certification order:** Daily execution first (Plan My Day → Visual Thinking → Projects → Create → Focus → Reminders), then Growth (Vault → Wins → Evidence → Portfolio → Journey → Goals), then Settings → Chat → Today.

---

## How to use this document

1. **One screen at a time.** Do not batch changes across the app.
2. **Follow the [certification order](./SCREEN_CERTIFICATION.md#recommended-certification-order).** Do not skip ahead.
3. **Don't leave a screen until COMPLETE** — all **10 gates** + the [final impress question](./SCREEN_CERTIFICATION.md#the-final-question).
4. **Gate 10:** verify [Constitution Compliance™](./PRODUCT_CONSTITUTION.md) (all 7 articles + conversation scenarios if applicable).
5. Mark punch items `[x]` when done. Add new items as you notice them in live use.
6. **On certification:** capture or update **Future Opportunities** for that screen.
7. Update the **Screen Completion Log** and `SCREEN_CERTIFICATION.md` master log.
8. Run `npm run audit:companion` and `npx vitest run` before marking COMPLETE.

**Before any new feature:** [Development Governance™](./DEVELOPMENT_GOVERNANCE.md) (12 rules) + [Future Development Rule](./PRODUCT_CONSTITUTION.md#future-development-rule).

**Last updated:** 2026-06-24

**Current focus:** Plan My Day™ (#1)

---

## Plan My Day™

*Certification status: Not started*

### Punch list

- [ ] Live walkthrough: How To Use collapsed → Today's Reality → add form → chips → Pull From Clear My Mind → Task View → Today's Focus visible
- [ ] Label **Layout** (Balanced / Chat Focus / Workspace Focus) vs **Task View** (List / Timeline / Kanban / Cards)
- [ ] Today's Focus immediately visible in all task views
- [ ] No Brain Dump entry point (Clear My Mind = long-term capture)
- [ ] Pull From Clear My Mind: guided copy and empty state
- [ ] Remove duplicate back/close controls
- [ ] Help article matches live layout
- [ ] **Certification:** all workflows + browser walkthrough + tests

### Future Intelligence Readiness (review at certification)

- [ ] Tasks stored with structured fields (type, time, goal link, category, status)
- [ ] `createdAt` / completion timestamps on plan items
- [ ] Source traceable (manual, Clear My Mind pull, chat)
- [ ] Linkable to Outcome Goals and Projects

### Future Opportunities

*Breadcrumbs only — do not build during certification.*

- Recommend tasks based on historical completion times
- Suggest moving low-energy tasks to better times of day
- Surface unfinished items from related projects
- Identify recurring tasks that should become templates
- Show "This task moved your business forward" after completion

---

## Visual Thinking™

*Certification status: Not started (partial Phase 2 polish)*

### Punch list

- [x] Default hub: only "What are you trying to do?" intent choices
- [x] Continue Thinking™ + Browse Visual Tools collapsed by default
- [x] Category dropdowns (one open, alphabetized, compact cards)
- [x] Removed Client Avatar™, Clear My Mind™, Calendar Planner™, Workflow Map™ from catalog
- [x] Content Ecosystem™ = repurposing copy
- [ ] Soften "Show Other Options" full-grid handoff
- [ ] Live verify: nothing open on first hub visit
- [ ] Help describes guided assistant, not tool library
- [ ] **Certification:** intent flow, open/save/delete map, continue thinking

### Future Opportunities

- Recommend visual tool from past map usage and outcomes
- Surface "continue where you left off" with context from linked project/goal
- Suggest converting decision maps into Plan My Day tasks or Projects
- Pattern: which thinking modes precede completed goals

---

## Projects™

*Certification status: Not started*

### Punch list

- [x] Continue Working On™ (top 10 by `updatedAt`)
- [x] New Project cards: Blank / Template / Strategy / Clear My Mind
- [ ] A–Z sort works live
- [ ] Continue Working On / All Projects expand-collapse obvious
- [ ] Audit inactive-looking controls
- [ ] Help: "Recent Projects" → "Continue Working On™"
- [ ] **Certification:** create, detail, sort, search, delete, time blocks

### Future Opportunities

- Suggest next project action from stalled status + last activity
- Link project momentum to Outcome Goals progress automatically
- Recommend templates from similar completed projects
- Surface projects that align with today's Plan My Day focus

---

## Create™

*Certification status: Not started*

### Punch list

- [ ] Catalog browse: collapsed categories, one section open
- [ ] Draft resume: Continue Working pattern consistent with My Work
- [ ] Export copy matches Settings → Connections
- [ ] Remove stale workspace mode references in visible UI
- [ ] **Certification:** new draft, template, save, export, Google/social flow

### Future Opportunities

- Suggest content type from chat context and Growth Portfolio gaps
- Repurpose finished drafts into Content Ecosystem plans
- Recommend Snippets/Templates from repeated Create patterns
- Connect published content to Evidence Bank impact entries

---

## Focus™

*Certification status: Not started*

### Punch list

- [ ] Single clear entry: Clear My Mind vs Focus Session (no duplicate Brain Dump)
- [ ] Progressive disclosure in session UI
- [ ] Relief clusters / end session: emotionally safe copy
- [ ] No duplicate timer or capture controls
- [ ] Help aligns with Focus flyout routes
- [ ] **Certification:** start, capture, relief, end, resume

### Future Opportunities

- Detect overwhelm patterns from capture frequency and session length
- Suggest Focus timing from Plan My Day energy patterns
- Route captured items to Plan My Day / Projects with one-tap acceptance
- Surface "you've cleared this before" when recurring themes appear

---

## Reminder Center™

*Certification status: Not started (partial P0.51 polish)*

### Punch list

- [x] Upcoming / Recurring / Completed lists; collapsed rows; toast on save
- [ ] One reminder expanded at a time (live verify)
- [ ] Consistent collapsed subtitles (e.g. "Weekdays • 3 reminders/day")
- [ ] Calm empty states per list
- [ ] **Certification:** create, edit, pause/resume, complete, delete
- [ ] **Chat intake:** [REMINDER_CHAT_INTAKE.md](./REMINDER_CHAT_INTAKE.md) golden path in browser

### Future Opportunities

- Suggest reminder times from completion history (e.g. hydration gaps)
- Link reminders to Plan My Day tasks and Outcome Goal trackers
- Detect missed reminders and offer gentler reschedule (not guilt)
- Pattern: which reminders actually get completed vs dismissed

---

## Growth Vault™ (hub)

*Certification status: Not started (partial Phase 2 polish)*

### Punch list

- [x] 2×2 colorful vault boxes + Quick Save™
- [x] Per-section How To Use (not on hub)
- [ ] One vault section open at a time; Back returns to hub
- [ ] Box status previews accurate after saves
- [ ] **Certification:** Quick Save all four destinations + open each box

### Future Opportunities

- Unified Growth timeline across Wins / Evidence / Portfolio / Journey
- Quick Save auto-classification confidence scores for review
- Surface "growth streak" and reflection prompts at vault hub
- Cross-vault search ("show everything about launching my course")

---

## My Wins™

*Certification status: Not started (partial Phase 2 polish)*

### Punch list

- [x] Date groups; one group / one win open; simplified Growth Inbox
- [x] More menu for print/export/attach; Collapse All
- [ ] Collapse All resets all state (live verify)
- [ ] Help updated (no archive-period bar)
- [ ] **Certification:** inbox → save flows; attach; search

### Future Opportunities

- Auto-suggest wins from Plan My Day completions and Project milestones
- Weekly win summary pushed to Chat with encouragement
- Detect win themes (courage, consistency, revenue) for Insights tab
- Link wins to Evidence entries when impact story is missing

---

## Evidence Bank™

*Certification status: Not started*

### Punch list

- [x] How To Use; More menu; Collapse All
- [ ] Date/category groups (like My Wins)
- [ ] Archive chips hidden until entries exist
- [ ] One entry expanded at a time
- [ ] **Certification:** create, edit, delete, attach, search, archive

### Future Opportunities

- Surface evidence during imposter moments in Chat
- Suggest evidence entries when goals stall or portfolio items ship
- Compare impact categories quarter-over-quarter in Outcome Goals Insights
- Pattern: which evidence types correlate with goal completion

---

## Portfolio™

*Certification status: Not started*

### Punch list

- [x] Per-section How To Use
- [ ] More menu; date/asset-type grouping; Collapse All
- [ ] Inbox → Portfolio prefill works
- [ ] **Certification:** create, edit, delete, goal links

### Future Opportunities

- Suggest showcasing portfolio items in Create / marketing workflows
- Link shipped assets to win + evidence auto-prompts
- Identify portfolio gaps relative to stated Outcome Goals
- Timeline view of "what you've built" for Insights reports

---

## My Journey™

*Certification status: Not started (partial Phase 2 polish)*

### Punch list

- [x] No marketing hero box; More menu; filter chips when entries exist
- [ ] One entry expanded at a time; Collapse All useful
- [ ] **Certification:** add, timeline/chapters, search, delete

### Future Opportunities

- Chapter summaries generated from entries (user-approved)
- Connect journey milestones to Outcome Goals life/business arcs
- Surface journey wisdom in Chat during hard decisions
- Pattern: recurring lesson themes across chapters

---

## Outcome Goals™

*Certification status: Not started*

### Punch list

- [x] New Goal collapsed; one expanded; Target date; Insights copy; mark complete
- [ ] Tracker on collapsed row; Record Progress persists
- [ ] Completed section receives goals; Activity tab no duplicates
- [ ] **Certification:** Goals / Activity / Insights; create, progress, complete

### Future Opportunities

- Predict goal completion based on current pace
- Show relationships between trackers
- Compare current progress to previous quarters
- Recommend next actions based on stalled metrics

---

## Settings™

*Certification status: Not started*

### Punch list

- [x] Google vs social copy in companionPrompt
- [ ] Help points to Settings → Connections
- [ ] OAuth vs profile URLs visually distinct
- [ ] Pattern awareness toggle clear in live app
- [ ] **Certification:** every section saves/persists

### Future Opportunities

- Adaptive defaults from usage (notification quiet hours, layout preference)
- Connection health dashboard (Google token expiry, broken social links)
- Privacy summary: what data powers future intelligence (user-controlled)

---

## Chat™

*Certification status: Not started*

### Punch list

- [ ] New Chat vs New Day's Chat distinct
- [ ] Workspace open/close predictable
- [ ] Companion tone; teaching vs active workflow boundaries
- [ ] **Certification:** send, workspace offers, resume, export

### Future Opportunities

- Proactive nudges from structured data (not generic motivation)
- Thread summaries linked to Projects and Goals
- Detect when user is circling and offer the right workspace
- Surface Evidence/Wins in conversational encouragement

---

## Today™

*Certification status: Not started — panel may be unmounted*

### Punch list

- [ ] Product decision: mount `TodayPanel` or fold into Plan My Day / Chat
- [ ] If mounted: certify; if deprecated: remove from nav + help

### Future Opportunities

- Pending product decision on Today vs Plan My Day scope

---

## Global / cross-cutting

*Resolve during the screen being certified.*

### Copy and help

- [x] Growth hub map in main areas help
- [x] Wins / Evidence tips: Portfolio not My Highlights in vault context
- [ ] Retire or redirect My Highlights help article
- [ ] `howDoIHelpTypes.ts` Growth line update
- [ ] Grep: Growth Reports, Growth Center landing, stale Visual Thinking copy

### Dead UI (clean up when safe)

- [ ] `GrowthCenterPanel`, `GrowthReportsPanel`, `TodayPanel`, `ConfidenceVaultPanel`
- [ ] `GrowthHubInboxStrip`, `GrowthReflectionCard`, `GrowthSaveSuggestionBanner`
- [ ] `GoalSupportingActivityBlock`, `OutcomeGoalDashboardStrip`

---

## Screen completion log

Synced with [SCREEN_CERTIFICATION.md](./SCREEN_CERTIFICATION.md).

**Only mark COMPLETE when:** all 10 gates pass (including [Constitution Compliance™](./PRODUCT_CONSTITUTION.md)) + impress question = yes + Future Opportunities captured.

| # | Screen | Status | Certified |
|---|--------|--------|-----------|
| 1 | Plan My Day™ | Not started | — |
| 2 | Visual Thinking™ | Not started | — |
| 3 | Projects™ | Not started | — |
| 4 | Create™ | Not started | — |
| 5 | Focus™ | Not started | — |
| 6 | Reminder Center™ | Not started | — |
| 7 | Growth Vault™ | Not started | — |
| 8 | My Wins™ | Not started | — |
| 9 | Evidence Bank™ | Not started | — |
| 10 | Portfolio™ | Not started | — |
| 11 | My Journey™ | Not started | — |
| 12 | Outcome Goals™ | Not started | — |
| 13 | Settings™ | Not started | — |
| 14 | Chat™ | Not started | — |
| 15 | Today™ | Not started | — |

**0 / 15 certified**

---

## Adding new items

```markdown
- [ ] What feels wrong + what "finished" looks like
```

For intelligence ideas (build later):

```markdown
### Future Opportunities (add under the screen)
- …
```
