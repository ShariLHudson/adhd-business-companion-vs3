# Evidence Vault™ & Hall of Accomplishments™ — Navigation Audit

**Status:** Audit only — no features built  
**Date:** 2026-07-09  
**Scope:** `companion-app` runtime + `ESTATE_PLACE_MASTER_MANIFEST.json`

**Related:** [153 Room Access Matrix](./recognition/library/153_SPARK_ESTATE_ROOM_ACCESS_MATRIX.md) — per-room Wander / Welcome / Chat / Direct / Search / Menu scores.

**Verdict:** Both rooms are reachable mainly by chat, luck, or developer knowledge — not by normal UI chrome. A first-time member has no reliable map, menu, or hub link to either archive.

---

## Identity (post-152)

| Member name | Place id | Section | Wander | Opened panel title |
|-------------|----------|---------|--------|--------------------|
| Evidence Vault™ | `evidence-vault` | `evidence-bank` | **Excluded (Draft)** | Evidence Bank / Vault mix |
| Hall of Accomplishments™ | `portfolio` | `growth-portfolio` | Included (Live) | Still **Portfolio™** |
| Gallery™ | `gallery-of-firsts` | `home` | Included | Scene only — no exhibit UI |

---

## 1. Every way to Evidence Vault™

| # | Entry path | Status | Notes |
|---|------------|--------|-------|
| 1 | Chat/voice: “evidence vault” / “evidence bank” | **Works** | Manifest alias → `goToPlace` → `EvidenceBankPanel` |
| 2 | Chat: proof / impact phrases | **Works** | `WINS_AND_PROOF_RULES` |
| 3 | Recognition lifecycle offer | **Works** | Preserve-first when trigger fires |
| 4 | Collection / capture “preserve” offers | **Works** | Conversation + permission |
| 5 | Growth capture / celebration “Save to Vault” | **Works** | In-flow only |
| 6 | Chamber of Momentum contextual route | **Works** | Contextual, not general discovery |
| 7 | How Do I → “Evidence Bank” | **Works** | Opens vault shell; wrong label |
| 8 | `/companion?section=evidence-bank` | **Dev-only** | Direct URL |
| 9 | Profile menu action `evidence-vault` | **Hidden** | Id exists; not in visible dropdown |
| 10 | Growth Profile estate cards | **Hidden** | Overlay also hidden from Welcome Home |
| 11 | Wander | **Broken** | Draft → excluded from Wander pool |
| 12 | Homestead / sidebar / Your Story hub | **Missing** | `SIDEBAR_NAV` / `MORE_NAV` empty |
| 13 | Welcome Home map / Peaceful Places | **Missing** | No entry |

---

## 2. Every way to Hall of Accomplishments™

| # | Entry path | Status | Notes |
|---|------------|--------|-------|
| 1 | Chat/voice: “hall of accomplishments” | **Works** | Opens `portfolio` shell; panel still Portfolio™ |
| 2 | Chat: “portfolio” / “my portfolio” | **Works** | Same shell under Portfolio vocabulary |
| 3 | Recognition Hall induction | **Works** | Lifecycle → `portfolio` |
| 4 | Wander random pick | **Works** | Live; chrome says Hall of Accomplishments |
| 5 | Growth capture → `growth-portfolio` | **Works** | Suggestion copy often mislabeled |
| 6 | `/companion?section=growth-portfolio` | **Dev-only** | Direct URL |
| 7 | Profile menu action `portfolio` | **Hidden** | Not in visible menu |
| 8 | Growth Profile “Visit Portfolio” | **Hidden** | Overlay not reachable |
| 9 | Homestead / Your Story / cross-links | **Missing** | `GROWTH_CROSS_LINKS` never rendered |
| 10 | Chat/Wander: “gallery” | **Broken** | `gallery-of-firsts` → home scene-only |

---

## 3. Which methods actually work

**Evidence Vault:** chat aliases, proof phrases, recognition/collection offers, capture saves, Chamber context, How Do I (mislabeled), programmatic `goToPlace`.

**Hall:** chat “hall of accomplishments” / portfolio aliases, recognition induction, Wander, capture saves, programmatic open of `growth-portfolio`.

---

## 4. Which methods are broken

- Evidence Vault **Wander** (Draft status).
- **Gallery** as a destination (Live in Wander → `home` with no exhibit UI).
- Stale catalogs still tying “hall of accomplishments” to `gallery-of-firsts` in some fallback paths.
- **Label mismatch:** Wander/chrome say Hall; `GrowthPortfolioPanel` still titles **Portfolio™**.
- How Do I / help still say **Evidence Bank**.

---

## 5. Which routes are hidden

- `evidence-vault` and `portfolio` estate menu action ids (programmatic only).
- Growth Profile estate place cards (Personalization / growth-profile not in Welcome Home menu).
- `GROWTH_CROSS_LINKS` (defined, never rendered).

---

## 6. Which routes require developer knowledge

- `?section=evidence-bank`
- `?section=growth-portfolio`
- Internal `goToPlace` / `openGrowthDestinationCore` / `handleEstateMenuAction` with place ids

---

## 7. Which routes should exist but do not

- Homestead / Room menu / Estate Directory entries for Vault and Hall
- Visible archive items in member chrome
- Your Story / Grow hub cards
- Evidence Vault in Wander (until intentionally Live)
- Consistent Hall labeling inside the portfolio panel
- Dedicated Gallery exhibit UI
- First-visit onboarding that names these archives

---

## 8. Why a first-time member fails

1. No visible chrome lists either room.
2. Discovery depends on exact chat phrasing, recognition offers, or (Hall only) Wander luck.
3. Evidence Vault is Draft → never appears while exploring rooms.
4. Label schizophrenia (Hall vs Portfolio; Vault vs Bank).
5. Gallery vs Hall trap can land on a home scene with no accomplishments UI.

---

## Recommended ONE navigation model

**Estate Directory (single discoverable list).**

- One surface: **Rooms** / Estate Directory from Room chrome and Welcome Home.
- Short fixed groups; Archives first: Evidence Vault™ · Hall of Accomplishments™ · Celebration Garden™.
- Chat and Wander remain shortcuts — not the only doors.
- Panel titles must match directory names.
- Draft rooms stay out of Directory and Wander until Live.
- No second competing archive menu.

**Do not implement until this audit is accepted.**

---

## Key files

| Concern | Path |
|---------|------|
| Manifest | `docs/estate/ESTATE_PLACE_MASTER_MANIFEST.json` |
| Wander filter | `lib/estate/manifest/estateWanderMode.ts` |
| Shell | `lib/estate/directory/shell.ts` |
| Visible menu | `lib/estateMenu/menuConfig.ts` |
| Hall panel | `components/.../GrowthPortfolioPanel.tsx` (title Portfolio™) |
| Vault panel | Evidence Bank panel via `evidence-bank` section |
| Dead cross-links | `lib/growthNavigation.ts` `GROWTH_CROSS_LINKS` |
