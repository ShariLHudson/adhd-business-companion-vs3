# 045 — Separate Editable Profile Destinations Implementation Report

**Repository:** `spark-ecosystem-v4/companion-app`  
**Branch:** `deploy/companion-app-v3`  
**Date:** 2026-07-11  
**Prior work:** `044_PROFILE_DROPDOWN_CORRECTION_IMPLEMENTATION_REPORT.md`

---

## 1. Executive Summary

My Business Estate and People I Help are now **separate Profile destinations** with distinct purposes, navigation, and editing flows.

- **My Business Estate** — six editable section cards with View/Edit/Save/Cancel; Business Snapshot uses **approved fields only**
- **People I Help** — reuses `IdealClientBuilder` with Estate styling and People I Help navigation labels
- **No combined landing** — removed “From here” cross-link from My Business Estate to People I Help
- **Naming** — Profile UI labels use **My Business Estate** and **People I Help** (no ™ in Profile dropdown, titles, or section chrome)

---

## 2. Scope Followed

| Area | Changed? |
|------|----------|
| SH → Profile dropdown (2 items) | Yes — labels without ™ |
| My Business Estate editable sections | Yes |
| People I Help adapter + avatar flow headers | Yes |
| Business Snapshot data safety | Yes |
| Welcome Home, Experiences, Settings | No |
| Journal Gazebo, Vault, Hall, Cartographer, Chamber | No |
| New Supabase tables / duplicate stores | No |

---

## 3. My Business Estate

### Overview screen
- Business Snapshot (approved data only)
- Six section cards: Business Identity, What I Offer, Brand and Message, Business Direction, How I Work Best, Business Tools and Systems
- Each card: name, summary, status (Not started / Started / Ready to review / Updated), Open or Edit

### Editing
- `BusinessEstateSectionEditor` — per-section form with Save, Cancel, save confirmation
- Fields use `VoiceAnswerField` (voice-capable text areas)
- Imported legacy values show a calm review notice before user approval

### Data
- Extended `companion-business-profile-v1` with nested `estate` envelope (same key)
- Field-level `approval` map — only approved values appear in Business Snapshot
- Legacy `role`, `sells`, `goals`, `tone` migrated with conversational-import heuristics
- `saveBusinessProfile()` now **preserves** the `estate` envelope when syncing legacy fields

---

## 4. People I Help

- Separate overlay destination (`people-i-help`)
- **Close** on main screen returns to prior app state (not My Business Estate)
- Avatar builder list: **Client Avatars**, **+ New Avatar**
- New/edit avatar flow: **Back to People I Help**, **New Client Avatar** header
- Existing avatar CRUD, research, primary, duplicate, delete preserved

---

## 5. Snapshot Root Cause & Fix

**Cause:** `MyBusinessEstatePanel` echoed raw `getBusinessProfile()` values (`role`, `sells`, `goals`) populated by phase-1 onboarding and discovery from **conversation text**.

**Fix:**
- `buildApprovedBusinessSnapshot()` reads only `approval === true` section fields
- Conversational imports flagged via `looksLikeConversationalImport()` → **Ready to review**, excluded from snapshot until user saves

---

## 6. Files Created

| File | Purpose |
|------|---------|
| `lib/profile/businessEstateProfile.ts` | Section schema, CRUD, status, migration |
| `lib/profile/businessEstateSectionFields.ts` | Field definitions per section |
| `lib/profile/businessSnapshot.ts` | Approved-only snapshot builder |
| `lib/profile/businessSnapshot.test.ts` | Snapshot + migration tests |
| `components/companion/business-estate/BusinessEstateSectionEditor.tsx` | Section edit UI |

---

## 7. Files Changed

| File | Change |
|------|--------|
| `components/companion/MyBusinessEstatePanel.tsx` | Section overview + editors; no People I Help link |
| `components/companion/PeopleIHelpPanel.tsx` | Close nav, presentation props |
| `components/companion/IdealClientBuilder.tsx` | Optional `presentation` for People I Help chrome |
| `lib/profile/profileDestination.ts` | Removed cross-destination cards; menu labels |
| `lib/estateMenu/menuConfig.ts` | Labels without ™ |
| `lib/estate/sparkEstateTopNavigationAndProfileMenu.ts` | Labels without ™ |
| `app/companion/CompanionPageClient.tsx` | Separate back behavior; panel props |
| `app/companion/my-business-estate.css` | Section cards + editor styles |
| `lib/companionStore.ts` | `saveBusinessProfile` preserves `estate` envelope |
| Profile tests | Updated for new behavior |

---

## 8. Tests & Build

```bash
npx vitest run lib/profile lib/estateMenu/welcomeHomeMenuVerification.test.ts
npm run build
```

All profile tests pass. Production build succeeds.

---

## 9. Known Limitations

- Section fields are informational text — no live Google/integration connections in Tools section
- “Help me answer this” / AI draft per field not yet wired (Save/Cancel/approval foundation in place)
- `BusinessProfilePanel` 7-step wizard still exists under workspace `business-profile`
- Full 11-step avatar flow unchanged structurally (audited, preserved)

---

## 10. Founder Review

1. SH → Profile → confirm **My Business Estate** and **People I Help** (no ™)
2. Open **My Business Estate** — six section cards, no “From here” / People I Help card
3. Edit a section → Save → confirm snapshot updates with approved text only
4. If legacy chat text exists, confirm **Ready to review** status and review banner in editor
5. Open **People I Help** — Client Avatars list, **+ New Avatar**
6. Start new avatar — **Back to People I Help** (not Back to Profile)
7. Close People I Help — returns to conversation, not My Business Estate
8. Regression: Settings, Welcome Home, Experiences unchanged

---

## Explicit Non-Changes

Welcome Home, Experiences, Settings, Journal Gazebo, Evidence Vault, Hall of Accomplishments, Estate Cartographer, Chamber — not modified in this cycle.
