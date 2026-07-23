# Founder Daily Report — Minimal Slice

**Status:** Bridge implementation (not full FIRE)  
**Date:** 2026-07-23  
**Surface:** `/companion/founder` → existing `FounderHome` → `FireExecutivePortfolioView`

---

## What this slice implements

A thin path so Founder Studio home shows **one stable, dated FIRE brief for today**:

1. **Compose** a `FireExecutivePortfolio` from existing Founder bridges + sample adapters  
2. **Persist** one canonical portfolio per local date  
3. **Display** it through the unchanged FounderHome FIRE block (“Today’s Executive Brief”)

It is **not** the full FIRE reporting engine. It does **not** claim live company-state SPARK→FIRE intelligence, overnight automation, PDFs, Drive/email delivery, or a full archive product.

---

## Current data sources

| Source | Role | Live company state? |
|--------|------|---------------------|
| `prepareFounderMorningBrief` / `prepareFounderMorningSummary` | Mission focus, highlights, “while away” lines | No — overnight sample/bridge |
| `prepareFounderExecutiveJudgmentEngine` | Primary + supporting priorities | No — judgment sample/bridge |
| `prepareFounderRecommendations` | Extra priorities / decisions | No — overnight sample |
| `sampleBriefRepository.getTodayBrief()` | Fills gaps (priorities, opportunities) | No — sample FounderDailyBrief |
| `SAMPLE_FIRE_TODAY_PORTFOLIO` | Dashboard panel structure + last-resort copy | No — static adapter |

Honest UI note (existing alert slot): **“Prepared from Founder bridges”** — briefing is assembled from bridges/adapters, not a full live report. Status is **`draft`** (composed on demand), not a reviewed overnight FIRE run.

---

## When the report is composed

On `getFireExecutivePortfolio()`:

1. Resolve today’s local date key (`YYYY-MM-DD`)  
2. If a valid stored portfolio exists for that date → return it (capped)  
3. Else → `composeTodayFirePortfolio()` → store once → return (capped)

Re-renders / reopening the same day do **not** regenerate when a valid stored record exists.

---

## Storage

| Item | Value |
|------|--------|
| Namespace | `spark-estate:founder-fire-portfolios` |
| Module | `lib/founder/briefs/firePortfolioStorage.ts` |
| Shape | `{ [dateKey]: FireExecutivePortfolio }` |
| Seams | `localStorage` when available; in-process memory otherwise |
| SSR | No `window` crash; memory + deterministic compose |

Does not overwrite a valid portfolio for a date. Malformed JSON is ignored safely.

---

## Stable daily ID

- Date key: local `YYYY-MM-DD` via `toFounderLocalDateKey`  
- Portfolio id: `fire-YYYY-MM-DD`  
- Issue number: deterministic days-since-2024-01-01 from the date key  
- Section ids: date-scoped (`es-2026-07-23-1`, …) — not random, not wall-clock

---

## Date / timezone limitation

Uses the **runtime local calendar** (browser on client; Node process TZ on SSR). There is no separate founder-configured date boundary in the repo yet. Documented in `founderLocalDate.ts`. Prefer consistent local TZ for Founder Studio sessions.

---

## What FounderHome shows

Unchanged layout. The existing FIRE cover shows:

- Today’s `dateDisplay`  
- Stable `fire-YYYY-MM-DD` portfolio  
- Existing sections (summary, priorities, alerts, opportunities, decisions, panels)

No FounderHome redesign. No new rooms.

---

## What remains for full Priority 1

- Real company-state ingestion (SPARK → FIRE)  
- True overnight generation job (not first-open compose)  
- Durable cloud archive (Supabase / Drive)  
- PDF / email delivery  
- Full history UI, search, read/unread, notifications  
- Replace sample bridges with live intelligence

---

## Key files

| File | Role |
|------|------|
| `lib/founder/briefs/composeTodayFirePortfolio.ts` | Composer |
| `lib/founder/briefs/firePortfolioStorage.ts` | Daily persistence |
| `lib/founder/briefs/founderLocalDate.ts` | Date key / display |
| `lib/founder/briefs/firePortfolio.ts` | `getFireExecutivePortfolio` entry |
| `components/founderStudio/FounderHome.tsx` | Unchanged consumer |
