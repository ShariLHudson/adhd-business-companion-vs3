# Spark Estate Companion Behavior Foundation Manifest

**Package:** Spark Estate Companion Behavior Foundation — Updated  
**Authoritative root:** `docs/companion-behavior/`  
**Package index:** `docs/companion-behavior/MANIFEST.json`  
**Method:** `standards/003_REVERSE_ENGINEERING_AND_IMPLEMENTATION_METHOD.md`  
**Build order:** `standards/013_BEHAVIOR_LIBRARY_BUILD_ORDER.md`  
**Release gate:** `standards/012_LIVE_BEHAVIOR_RELEASE_GATE.md`

Do not duplicate these standards into `.cursor/rules/`. One source of truth.

## Governing note

Every visible user-facing response must comply with `standards/015_ONE_COMPANION_IDENTITY_AND_SHARI_VOICE_STANDARD.md`.

The package contains one authoritative copy of each document.

---

## Status legend

| Field | Values |
|-------|--------|
| Contract status | `draft` · `active` · `deferred` |
| Audit status | `not_started` · `gap_map_complete` · `in_progress` · `complete` |
| Implementation owner | Primary code home when known |
| Test status | `none` · `partial` · `adequate` · `unknown` |
| Live verification | `unverified` · `preview_partial` · `preview_pass` · `production_pass` |

---

## Governing standards (not contracts)

| ID | Title | Path | Status |
|----|-------|------|--------|
| CB-000 | Companion Success Standard | `standards/000_SPARK_ESTATE_COMPANION_SUCCESS_STANDARD.md` | active |
| CB-001 | Companion Behavior Engine Standard | `standards/001_COMPANION_BEHAVIOR_ENGINE_STANDARD.md` | active |
| CB-003 | Reverse Engineering & Implementation Method | `standards/003_REVERSE_ENGINEERING_AND_IMPLEMENTATION_METHOD.md` | active |
| CB-005 | Friction & Decision Fatigue Standard | `standards/005_FRICTION_AND_DECISION_FATIGUE_STANDARD.md` | active |
| CB-012 | Live Behavior Release Gate | `standards/012_LIVE_BEHAVIOR_RELEASE_GATE.md` | active |
| CB-013 | Behavior Library Build Order | `standards/013_BEHAVIOR_LIBRARY_BUILD_ORDER.md` | active |
| CB-015 | One Companion Identity & Shari Voice | `standards/015_ONE_COMPANION_IDENTITY_AND_SHARI_VOICE_STANDARD.md` | active |

## Prompts

| ID | Title | Path |
|----|-------|------|
| CB-004 | Cursor Global Reverse Engineering Prompt | `prompts/004_CURSOR_GLOBAL_REVERSE_ENGINEERING_PROMPT.md` |
| CB-014 | Cursor Start Here | `prompts/014_CURSOR_START_HERE_IMPLEMENTATION_PROMPT.md` |

## Behavior contracts

| Contract ID | Title | Path | Status | Implementation owner | Audit | Tests | Live |
|-------------|-------|------|--------|----------------------|-------|-------|------|
| CB-002 | Behavior Contract Template | `contracts/002_BEHAVIOR_CONTRACT_TEMPLATE.md` | active (template) | n/a | n/a | n/a | n/a |
| CB-006 | Default Competence & Progressive Personalization | `contracts/006_DEFAULT_COMPETENCE_AND_PROGRESSIVE_PERSONALIZATION_CONTRACT.md` | draft | TBD | not_started | unknown | unverified |
| CB-007 | New Chat & Context Isolation | `contracts/007_NEW_CHAT_AND_CONTEXT_ISOLATION_BEHAVIOR_CONTRACT.md` | active | `lib/conversationReset/resetActiveConversation.ts` (+ CPC UI adapter) | **in_progress** (temp clears shipped) | **adequate** (16 unit regressions) | **preview_partial** (deploy Ready; UI blocked by Vercel SSO) |
| CB-008 | Continue Where Left Off | `contracts/008_CONTINUE_WHERE_LEFT_OFF_BEHAVIOR_CONTRACT.md` | draft | `lib/companionLedContinue.ts` | not_started | partial | unverified |
| CB-009 | Help Me Choose Next Step | `contracts/009_HELP_ME_CHOOSE_NEXT_STEP_BEHAVIOR_CONTRACT.md` | draft | TBD | not_started | unknown | unverified |
| CB-010 | Overwhelm & Task Friction | `contracts/010_OVERWHELM_AND_TASK_FRICTION_BEHAVIOR_CONTRACT.md` | draft | frictionless + compound intent + Phase A decision | not_started | partial | preview_partial |
| CB-011 | Return After Absence | `contracts/011_RETURN_AFTER_ABSENCE_BEHAVIOR_CONTRACT.md` | draft | arrival / daily opening | not_started | unknown | unverified |

Audit report for CB-007: `audits/007_NEW_CHAT_AND_CONTEXT_ISOLATION_GAP_MAP.md`

---

## Recorded overlaps (do not delete or supersede yet)

| Existing artifact | Overlap with | Notes |
|-------------------|--------------|--------|
| Specs 105–131 + Observation Mode / Conversation Freeze | CB-001, all contracts | Architecture frozen; contracts govern *behavior verification*, not new specs |
| Phase A decision / pending / voice (`lib/conversationStabilization/`) | CB-001 one-decision rule; CB-007 pending; CB-010 | Keep Phase A separate until contracts audited |
| `.cursor/rules/estate-context-isolation.mdc` | CB-007 (narrow) | System-error isolation only — complementary, not a full new-chat contract |
| `lib/companionLedContinue.ts` + daily opening continue cards | CB-008 | Resume UX; must not fire without evidence (CB-007 prohibited) |
| CONV / ADHD intelligence libraries | CB-001 advise-only rule | Libraries must not independently control turns |
| SPARK-025 / 152 / 156 / 173 behavior testing docs | CB-001 / CB-012 | Subordinate regression material |
| `docs/ESTATE_BEHAVIORAL_CONSISTENCY.md`, `docs/V3_BEHAVIOR_RECOVERY.md` | CB-000 / CB-001 | Legacy consistency language — index only |
| `docs/THE_MEMBER_WINS.md`, Relationship Constitution, Friend DNA | CB-000 | Emotional/product authority remains; behavior contracts add executable gates |

---

## Next contract to implement

**CB-007** live preview verification (temp clears already shipped in `resetActiveConversation`). Voice on visible New Chat replies must satisfy **CB-015**. No Phase B composer migration.
