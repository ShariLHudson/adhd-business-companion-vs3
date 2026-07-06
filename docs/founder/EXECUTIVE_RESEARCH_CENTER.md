# Executive Research Center™

**Your private executive research department — Build Sprint 1**

| | |
|---|---|
| **Status** | Product — Build Sprint 1 |
| **Route** | `/companion/founder/executive-research` |
| **Authority** | [Founder Experience Constitution™](./FOUNDER_EXPERIENCE_CONSTITUTION.md) · [Executive Execution System™](./EXECUTIVE_EXECUTION_SYSTEM.md) |
| **Engine** | `lib/research/` · Bridge: `lib/founder/services/researchBridge.ts` |
| **V1.0** | Sprint 1 architecture complete — live data per [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) Phase 1–3 |

> **Not Google. Not ChatGPT. A research department that understands Visual Spark Studios.**

---

## Primary goal

When Shari asks a question, Founder returns:

```
The Answer
    ↓
The Evidence
    ↓
Why It Matters
    ↓
How It Applies to Spark
    ↓
Recommended Actions
    ↓
Prepared Implementation
```

Founder **never stops at information.**

---

## Complete experience flow

### 1. Shari opens Executive Research Center

- **Room nav** or direct URL: `/companion/founder/executive-research`
- **Room header:** eyebrow, title, question, purpose — calm executive tone
- **First surface:** search zone — not a feed of raw articles

### 2. What she sees first (no active session)

| Zone | Content | Rule |
|------|---------|------|
| **Search** | Natural language input + Research button | Primary action |
| **Suggested questions** | ≤ 6 chips from sample queries | One-click start |
| **Significant findings** | ≤ 3 alerts (Rule of Three) | So What? filtered |
| **Categories** | Expandable grid (23+ topics) | Orientation only |

### 3. Shari asks a question

Examples:

- “What are ADHD founders struggling with this month?”
- “What AI tools could save us time?”
- “What products should Spark build next?”

**Behind the scenes:** `composeResearchSession()` matches query → full executive report. Weak So What? scores are **not shown**.

### 4. What she sees in the report

**Open by default:** Answer · Executive summary · Explain like I'm busy · Why this matters · Recommended next steps

**Progressive disclosure (collapsible):** Evidence · Spark application · Member/business/personal impact · Opportunities & risks · Executive board · Outside the box · Value metrics · Sources

### 5. What happens next

**Prepared for you — drafts only** panel lists:

- Mission update · Cursor prompt · Development plan · PostCraft campaign · Marketing strategy · Workshop · Executive brief · Decision comparison

**Nothing executes until Shari approves** (Constitution Control Principle).

### 6. Return flow

**← New question** clears the report and returns to search — conversation continues, no guilt.

---

## Founder alerts

Significant findings only. Each alert includes:

- What happened · Why it matters  
- Suggested action: **Adopt · Test · Watch · Ignore**  
- Rationale in plain English  

---

## The So What? Rule

Every report has `soWhatScore` and `passesSoWhatRule`. Below threshold → not surfaced to Shari.

---

## Spark application

Every report maps to ecosystem targets: Founder, Companion, PostCraft, Listening Rooms, Team Hub, marketing, automation, member success, etc.

---

## Executive board (optional per report)

Perspectives: CEO · Marketing · Customer · Innovation · Operations · Financial · ADHD · Technology

Founder summarizes into **one recommendation**.

---

## Personalization defaults

- Large readable sections  
- Plain English · minimal jargon  
- Executive summary first  
- Deep dives on request (collapsible panels)  
- Teach intelligent entrepreneur — not engineer  

---

## Value metrics (per report)

Research time saved · Implementation time saved · Strategic importance · Member impact · Automation potential · Competitive advantage  

---

## Success test

When Shari finishes a session she should feel:

1. **“I understand this.”**  
2. **“I know why it matters.”**  
3. **“I know what to do.”**  
4. **“I already have the first draft prepared.”**  

**Research becomes action. Not information.**

---

## Engineering map

| Layer | Path |
|-------|------|
| Types & samples | `lib/research/types/` · `lib/research/sample/` |
| Service | `lib/research/services/researchService.ts` |
| Room bootstrap | `lib/founder/researchCenter/` |
| Founder bridge | `lib/founder/services/researchBridge.ts` |
| UI | `components/founderStudio/FounderExecutiveResearch.tsx` · `research/*` |
| Room registry | `lib/founderStudio/rooms.ts` → `executive-research` |

---

**Version:** 1.0 — Build Sprint 1  
**Established:** 2026
