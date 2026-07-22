# 133 — Create Discovery Experience Redesign

**Status:** Binding Create discovery law  
**Date:** 2026-07-21  
**Parents:** Spec 128 · Spec 130 · Spec 131 · Spec 132 · Create 127–129  
**Report:** [`133_CREATE_DISCOVERY_EXPERIENCE_REDESIGN_REPORT.md`](./133_CREATE_DISCOVERY_EXPERIENCE_REDESIGN_REPORT.md)

---

## Constitutional Principle

**One Question. One Discovery Experience. Never multiple interfaces for the same problem.**

Users explore ideas. They never choose between Browse / Templates / Frameworks / Search as separate mental models.

---

## Binding with 128 · 131 · 132

| Spec | How 133 honors it |
|------|-------------------|
| **128** | Hide architecture; one calm surface; ADHD-safe progressive disclosure |
| **131** | Intent before artifact; ≤3 visible decision layers; confirm before Work (130) |
| **132** | Protect momentum; Ten-Second Rule; never surprise with duplicate filter chains |

Preserve **127–130**: Start Something New + confirm-before-create remain the default excellence path. Explore Ideas is optional discovery — never required navigation.

---

## Architecture — Explore Ideas

Replace **More Ways to Start (Optional)** with **Explore Ideas**.

### Section 1 — Continue Something

Near the top when Explore opens:

1. **Continue Working** — active Creation Workspaces (hidden when empty — 131 Rule 11)
2. **Recent Work** — recently touched kinds / resumes
3. **Previous Work** — older document drafts (teach when empty — 131 Rule 11)

Previous Work is **not** buried at the bottom.

### Section 2 — I Need Inspiration

**One search → one result list.**

Search spans: Templates · Frameworks · Ideas · Examples · Company · Personal · Recent · Relationships — as one unified result model, not separate tabs.

### Section 3 — Show Me Categories

Large visual cards (not dropdowns):

Marketing · Planning · Writing · Business · Events · Learning · Relationships

Click → same result list as search. Done.

### Section 4 — Recommended For Me

Context-aware, personal (not generic): Business Pulse · Current Project · Goals · Recent Work · Chamber · Board · season — using available Create suggestion context today; richer signals as they land.

---

## Remove / Eliminate

- Framework family tabs (Event / Marketing / Business) as a second mental model
- Duplicate filtering chains: Search → Filter → Category → Browse → Framework → Template
- Only: **Search OR Category → same result list**

---

## Explain Filters

Never bare Spark / Company / Personal. Use:

| Chip | Meaning |
|------|---------|
| ⭐ Spark Recommended | Built by Spark Estate |
| 🏢 Company | Created by your organization |
| 👤 Personal | Created by you |
| 🕘 Recent | Used recently |

---

## Visual Hierarchy (when Explore opens)

1. Continue Something  
2. Search (I Need Inspiration)  
3. Recommended For Me  
4. Categories  
5. Everything else — progressive; never dump all tools at once  

---

## Template / Idea Preview

Keep and improve preview fields:

- Who for  
- Time  
- Difficulty  
- Expected outcome  
- Best when…

Actions only: **Preview** (the view) · **Create** · **Back**

Create still hits Spec **130/131** confirm gate before Work opens.

---

## Discovery Rule

Browsing ideas — not configuring architecture. No Blueprint / Work Type / Registry jargon in member copy.

---

## Final Test (ship gate)

A brand-new user opens Explore Ideas and within **5 seconds** understands only:

1. Search  
2. Browse (categories)  
3. Continue  

Nothing else required to start.

---

## Runtime map

| Concern | Path |
|---------|------|
| Copy | `lib/createEstate/copy.ts` |
| Search / categories / recs / preview | `lib/createEstate/exploreIdeas/` |
| Panel | `components/companion/CreateExploreIdeasPanel.tsx` |
| Entrance | `components/companion/CreateEstateEntrancePanel.tsx` |
| Confirm gate | `resolveCreateBeginOutcome` / `resolveCatalogCreateConfirm` (unchanged) |
| Suggestion context | `lib/createEstate/contextAwareSuggestions.ts` |
