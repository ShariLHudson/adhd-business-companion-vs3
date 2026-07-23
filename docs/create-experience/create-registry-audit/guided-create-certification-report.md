# Guided Create Certification Report

**Date:** 2026-07-23  
**Scope:** `event_plan` · `marketing_plan` · `business_plan` · `facebook_community`  
**Evidence pack:** `lib/createRegistry/__tests__/guidedCreateCertification.integration.test.ts`  
**Snapshots:** `lib/createRegistry/certification/guidedCreateCertification.ts`  
**Registry seeds:** `lib/createRegistry/items.seed.ts`

---

## Summary

| Registry ID | Route | Save | Reopen | Required actions | Project handoff | Lifecycle | Canonical visible |
|---|---|---|---|---|---|---|---|
| `event_plan` | partial | partial | partial | partial | partial | **testing** | **false** |
| `marketing_plan` | partial | partial | partial | partial | partial | **testing** | **false** |
| `business_plan` | partial | partial | partial | partial | partial | **testing** | **false** |
| `facebook_community` | partial | partial | partial | partial | partial | **testing** | **false** |

**Verification flags changed:** none set to `true`.  
**Lifecycle changed:** all four `needs-audit` → `testing`.  
**Master visibility rule:** unchanged — still requires `ready` + route/save/reopen/requiredActions verified.

Authenticated Estate / Founder journey browser status remains **NOT_RUN**. No type computes user-visible.

---

## Repairs made in this PR

1. **Business Plan Begin parity** — `isBusinessPlanDomain` on Create Begin outcomes; `CreateEstateEntrancePanel` calls `launchFromCreate` with `business_plan` (same Anywhere-Origin clarify path as Event / Marketing / Facebook).
2. **Certainty language** — Begin open progress no longer says “Saving your workspace securely…” before durable ack; uses `CREATE_BEGIN_PROGRESS_MESSAGE` (“Opening your workspace…”). Error copy says “couldn't open” rather than implying a failed save that never started.
3. **Reproducible integration pack** — open → domain → UWE work type → durable save → hydrate → Continue listing → lifecycle commands → Project link-once for all four types.
4. **Workshop routing proof** — Workshop Browse subtype opens `event_plan` (not a phantom `workshop` work type); remains folded into `event_plan` seed (`legacyCatalogLabels`).

---

## Per-type findings

### `event_plan`

| Dimension | Observed | Expected | Evidence | Repair / gap | Severity | Blocks Ready |
|---|---|---|---|---|---|---|
| Route | Begin + Anywhere-Origin + package resolve to `event_plan` | Correct guided type | jsdom integration | Authenticated Estate UI NOT_RUN | High | Yes |
| Save | Memory durable begin/draft ok; “Saved” only after durable | Durable success | jsdom + creationDurable | Live Supabase refresh NOT_RUN | High | Yes |
| Reopen | Hydrate restores workspace; Continue lists id | Same item | jsdom | Continue Working UI NOT_RUN | High | Yes |
| Required actions | Commands available + registry rename/archive/trash/restore | Full surface proof | jsdom | Toolbar/browser NOT_RUN | High | Yes |
| Project | Canonical link + connect-once | Explicit Project conversion | jsdom | Member UI conversion NOT_RUN | Medium | No* |
| Print / Export | Commands exist | Browser proof | not_run | — | Low | No |

\* Not part of canonical visibility gate.

### `marketing_plan`

Same pattern as Event Plan. Domain Begin already existed; integration pack extended save/reopen/actions/project. Browser NOT_RUN blocks Ready.

### `business_plan`

| Dimension | Observed | Expected | Evidence | Repair / gap | Severity | Blocks Ready |
|---|---|---|---|---|---|---|
| Route | Previously skipped Anywhere-Origin; now domain + launch | Parity with other guided types | Begin + entrance repair | Founder browser NOT_RUN; industry detector still skips bare wording without catalog label | High | Yes |
| Other dimensions | Shared pipelines | Same as peers | jsdom | Browser NOT_RUN | High | Yes |

### `facebook_community`

Live registration / foundation tests already strong. Integration pack covers shared durable/reopen/actions. Project bridge remains **explicit** (never auto-convert). Browser NOT_RUN blocks Ready.

---

## Event / Workshop routing

| Prompt / entry | Opens | Notes |
|---|---|---|
| Event Plan Begin / catalog | `event_plan` | Confirmed |
| Workshop Browse subtype (`event` → `workshop`) | `event_plan` + workshop blueprint | Not a separate registry id; not phantom/dead/generic SOP route |
| Future separate Workshop registry item | Not created | Documented only — no redesign |

---

## Project handoff findings

- Create remains content source of truth (`createToProjectBehavior` unchanged).
- `syncCanonicalWorkFromCreateWorkflow` + `connectCanonicalWorkToProjectHome` link once; repeated connect does not spawn a second Project.
- Canonical visible gate does **not** require `projectHandoffVerified`.
- Member-facing “Move to Project” / explicit conversion on guided UWE surfaces: **not browser-certified**.

---

## User-facing language

| Before | After / status |
|---|---|
| “Saving your workspace securely…” on Begin open | “Opening your workspace…” |
| “I couldn't save that creation yet…” when open fails | “I couldn't open that creation yet…” |
| Save label “Saved” | Unchanged — still reserved for durable ack (`labelForCreationSaveState`) |

---

## Remaining blockers for Ready (all four)

1. Authenticated founder/browser journey: Begin → confirm → open → edit → leave → Continue Working → reopen → refresh.
2. Required actions exercised on the live guided surface (not only command catalog / registry APIs).
3. Explicit Project conversion UI where applicable.
4. Print / export browser proof if product policy requires them before Ready (optional for visibility gate).

---

## Recommended next PR (do not start here)

**Founder Validation Mode authenticated journeys (J-001 style) for the four guided types**, recording evidence under `docs/create-experience/evidence/runs/`, then flip verification flags only when each journey passes — still without Browse 7→9 or Create home redesign.
