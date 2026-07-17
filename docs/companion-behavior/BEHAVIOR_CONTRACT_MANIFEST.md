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
| CB-018 | Cursor Audit CB-017 Conversation Progression | `prompts/018_CURSOR_AUDIT_CB_017_CONVERSATION_PROGRESSION.md` |
| (file 022) | Cursor Audit CB-021 Advisory Handoff | `prompts/022_CURSOR_AUDIT_CB_021_ADVISORY_HANDOFF.md` |
| CB-022 audit | Cursor Audit Global Chamber Topic Ownership | `prompts/080_CURSOR_AUDIT_GLOBAL_CHAMBER_TOPIC_OWNERSHIP.md` |
| CB-022 implement | Cursor Implement Global Chamber Topic Ownership Gate | `prompts/082_CURSOR_IMPLEMENT_GLOBAL_CHAMBER_TOPIC_OWNERSHIP_GATE.md` |

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
| CB-017 | Conversation Progression & Redundant Question Prevention | `contracts/017_CONVERSATION_PROGRESSION_AND_REDUNDANT_QUESTION_PREVENTION_CONTRACT.md` | **ready_for_audit** | TBD — recommend `lib/conversationStabilization/` progression boundary | **gap_map_complete** | **not_started** | **unverified** |
| CB-021 | Advisory Handoff, Identity Continuity & Single-Response Ownership | `contracts/021_ADVISORY_HANDOFF_IDENTITY_CONTINUITY_AND_SINGLE_RESPONSE_OWNERSHIP_CONTRACT.md` | **ready_for_audit** | TBD — recommend advisory orchestration boundary before Chamber writers | **gap_map_complete** | **not_started** | **unverified** |
| **CB-022** | **Global Chamber Topic Ownership & Context Preservation** | `contracts/022_GLOBAL_CHAMBER_TOPIC_OWNERSHIP_AND_CONTEXT_PRESERVATION_CONTRACT.md` | **active** (preview) | `lib/conversationStabilization/activeTopicGate.ts` + `chamberNavigateGate.ts` | **gap_map_complete** | **partial** (`activeTopicOwnership.test.ts`) | **unverified** |

Audit report for CB-007: `audits/007_NEW_CHAT_AND_CONTEXT_ISOLATION_GAP_MAP.md`  
Live verification checklist: `audits/016_CB_007_AUTHENTICATED_PREVIEW_VERIFICATION_CHECKLIST.md`  
Preview (`332d634`): https://adhd-business-companion-vs3-g80zvv8xp-shari-hudsons-projects.vercel.app  

CB-017 gap map: `audits/017_CONVERSATION_PROGRESSION_GAP_MAP.md` · checklist `verification/019_…`  
CB-021 gap map: `audits/021_ADVISORY_HANDOFF_AND_RESPONSE_OWNERSHIP_GAP_MAP.md` · checklist `verification/023_…`  
CB-022 package note: `audits/084_GLOBAL_CHAMBER_TOPIC_OWNERSHIP_MANIFEST_UPDATE.md` · checklist `verification/083_…` · audit prompt `prompts/080_…`  
Governed by **CB-015**. CB-021 depends on CB-017. **CB-022** works with CB-017 + CB-021 as one global topic-ownership fix. Do not phrase-patch Finance/Content/Client Relationships intros or generic fallbacks alone.

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
| `lib/sparkConversation/coachingFallback.ts` `GENERIC_RECOVERY_BRIDGE` | CB-017 | Exact incident reset; must be gated by progression, not rewritten alone |
| Help Me Choose stay-in-chat cues (`helpMeChooseNeeds.ts`) | CB-017 / CB-009 | Open questions without ActiveConversationStep registration |
| Phase A `buildConversationDecision` | CB-017 | Closest spine; missing `answerStatus` / ProgressionDecision |
| Chamber Finance `activationOpener` + alias `"money"` | CB-021 INC-001 | Topic keyword → navigate + intro; defeats Shari ownership |
| Chamber Content `activationOpener` + alias `"content"` | CB-021 INC-002 | Same path — Instagram content question unanswered |
| `estateCommandAckLine` (“Of course — here's Finance/Content.”) | CB-021 | Handoff ack as second visible writer |
| Chamber NAVIGATE exempt from continuity `blockKernelNavigation` | CB-021 | Turn 2+ re-introduces specialist |
| Generic help router / arrival greeting / kernel early-exit after Chamber select | **CB-022** (+ CB-017 / CB-021) | Active topic lost; question unanswered — **one global fix**, not per-member |

---

## Next contract to implement

1. **CB-007** live preview verification still required before `live_verified`.  
2. **CB-022** — Global Chamber Topic Ownership: **gap map complete**; implement only via `prompts/082_…` after acceptance. One Conversation Engine active-topic owner for all Chamber members. Do **not** create member-specific patches.  
3. **CB-017** / **CB-021** (INC-001 Finance + INC-002 Content) — shared Chamber handoff path mapped; coordinate with CB-022 (topic preservation + single response owner). Voice must satisfy **CB-015**. No Phase B composer migration.  
4. **Behavioral OS Packages 2–7** — Package 2 knowledge map complete; Package 3 conversation-engine gap map started with Content incident. Do not implement until shared boundary is approved.
