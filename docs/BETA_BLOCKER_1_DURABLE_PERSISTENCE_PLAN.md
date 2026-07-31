# Beta Blocker 1 — Durable Persistence Implementation Plan

**Date:** 2026-07-31
**Branch:** `audit/beta-experience-readiness`
**Status:** PLANNING ONLY — no production code, schema, tests, or existing docs modified in this pass.
**Governing sources:** `docs/BETA_EXPERIENCE_READINESS_AUDIT_2026-07-31.md`; Constitutions 117 (Trust & Memory), 130 (One Creation Rule), 131 (Create Intent), 132 (Momentum Protection); Spark Estate Experience Acceptance Standard.

**Scope guardrails (from the mission):** Do not implement. Do not broadly replace every localStorage use. Do not redesign member-facing experiences. Do not combine with the Trust Kernel / sole-egress repair (Blocker 2). Goal = the **smallest safe persistence foundation** that protects beta-critical member work.

---

## 0. First — verification of the audit finding (with a correction)

The audit's Blocker 1 said *"no database and no server-side persistence."* **That wording is wrong and must be corrected.** Evidence:

- **A Supabase backend is fully configured and operational.** `package.json:29` (`@supabase/supabase-js ^2.108.1`); browser client `lib/supabase/companionClient.ts:282-291`; project URL `lib/supabase/resolveCompanionSupabaseEnv.ts:9-10`; service-role admin `lib/supabase/founderServer.ts:5-25`. `.env.local` carries `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- **A stable, server-authoritative member identifier exists:** the Supabase Auth `user.id` (UUID), available at runtime (`components/companion/CompanionAuthProvider.tsx:62,414,421`) and already used as a row-owner key (`lib/creationDurable/repository.ts:113-124`; `lib/billing/fastpay/entitlementStore.ts:107,127`).
- **A verified durable per-member persistence layer already exists in production** for the flagship Create flow: `companion_creation_workspaces` via `lib/creationDurable/repository.ts` (write → read-back → verify → receipt), RLS-scoped, guarded by `lib/universalWorkEngine/boundaries/durableAccessGuard.ts`.

**Why the audit grep missed it:** the earlier check scanned only `app/api/**`; member persistence runs through the **browser** Supabase client (`lib/creationDurable/`, RLS-scoped), not an API route.

**The accurate finding (still real, narrower):** *Most* beta-critical member work is **localStorage-only**, while a proven durable pattern already exists next to it, unused by those stores. This is a **migration-in-progress**, not greenfield.

**Answer to "intentional or accidental?"** Intentional development-phase choice that has hardened into a production risk. Supporting evidence: versioned keys (`*-v1`), consistent typed stores, one domain already migrated to durable Supabase (Creation), and reusable quota-recovery infra (`lib/companionStorageRecovery.ts`) — all signs of a deliberate, staged transition whose remaining slices were never completed.

### Verification checklist (all confirmed with evidence)

| Question | Finding | Evidence |
|---|---|---|
| Which member records are localStorage-only? | ~25 Tier-A stores (see §1) | §1 table |
| Which write utilities swallow/hide failures? | Most Tier-A stores silently swallow; 4 throw uncaught | §1, §4 |
| Any current server-side persistence? | Yes — `companion_creation_workspaces`, `voice_plan_entitlements` | `lib/creationDurable/repository.ts:127-235`; `lib/billing/fastpay/entitlementStore.ts:98-161` |
| Stable member identifier? | Yes — Supabase Auth `user.id` UUID | `lib/creationDurable/repository.ts:113-124` |
| Supabase / backend configured? | Yes — fully | `package.json:29`; `lib/supabase/*` |
| Data durable / session / cache / preference / reconstructable? | Classified | §1, §2 |
| Which records must never be lost? | Tier A (see §2) | §2 |

**Do-not-over-migrate note:** Not every localStorage entry belongs in the database. Tiers B/C/D (preferences, caches, ephemeral UI) stay local by design.

---

## 1. Verified storage inventory (Deliverable 1)

"Swallows" = `catch` discards the error, caller cannot tell the write failed. "THROWS" = no try/catch, quota error propagates (can break render). "Signals" = returns a boolean/result.

| Store (file) | STORAGE_KEY | Failure handling | Signals? | Tier |
|---|---|---|---|---|
| `savedWorkStore.ts` | `companion-saved-work-v1` | swallow L57 | No | **A** |
| `createDraftLibrary.ts` | `companion-create-draft-library-v1` | swallow L65 | No | **A** |
| `createSessionStore.ts` | `companion-create-session-v1` | swallow L47 | No | **A** |
| `creationWorkspace/persistence.ts` | `companion-creation-workspace-store-v1` (+active) | swallow L27 | No | **A** |
| `clearMyMindSessionStore.ts` | `spark.clearMyMind.activeSession.v1` | swallow L41 | No | **A** |
| `clearMyMind/captureDraft.ts` | `companion-clear-my-mind-draft-v2` | returns `{ok}` L64 | **Yes** + UI label | **A** |
| `companionStore.ts` (brain dumps) | `companion-brain-dumps-v1` | round-trip verify L397-407 | **Yes** | **A** |
| `brainDumpCustomCategories.ts` | `brain-dump-custom-categories-v1` | **THROWS** L36 | No | **A/B** |
| `planMyDay/planDayItems.ts` | `companion-plan-my-day-items-v1[:owner]` (+deferred) | swallow L93/173 | No | **A** |
| `planMyDay/planTaskCompletion.ts` | `companion-plan-completion-history-v1` (+project) | swallow L53/78 | No | **A** |
| `planMyDay/completePlanWorkflow.ts` | `companion-plan-my-day-workflow-v1:{date}` | swallow L150 | No | **A** (per-day) |
| `planMyDay/todaysPlanReorder.ts` | `companion-plan-schedule-prefs-v1` | swallow L301 | No | **B** |
| `planMyDay/previousDay.ts` | `companion-plan-previous-day-prompt-v1` | swallow L86 | No | **D** |
| `dailyAdaptation/storage.ts` | `spark-daily-adaptation-check-in-v1` | swallow L48 | No | **D** (self-expires) |
| `companionProjectsStore.ts` | `companion-projects-v1` (+items) | `safeLocalStorageSet`→bool | **Yes** (`persisted`) | **A** |
| `projectContinuityStore.ts` | `companion-project-continue-v1` | swallow L30 | No | **D** |
| `projectConversations.ts` | `companion-project-conversations-v1` | **THROWS** L39 | No | **A** |
| `tomorrowFocus.ts` | `companion-tomorrow-focus-v1` | **THROWS** L40 | No | **A** |
| `journalGazebo/store.ts` | `companion-journal-gazebo-configs-v1` (+session) | localStorage→sessionStorage, bool | **Yes** | **A**/D |
| `growthJournalStore.ts` | `companion-growth-journal-v1` | localStorage→sessionStorage, bool | **Yes** (`ok`) | **A** |
| `evidenceBankStore.ts` | `companion-evidence-bank-v1` | swallow L126 | No | **A** |
| `growthPortfolioStore.ts` | `companion-growth-portfolio-v1` | swallow L85 | No | **A** |
| `confidenceVaultStore.ts` | `companion-confidence-vault-v1` | swallow L103 | No | **A** |
| `profile/businessEstateProfile.ts` | `companion-business-profile-v1` | swallow L333 | No | **A** |
| `decisionCompassSessionStore.ts` | `companion-decision-compass-session-v1` | swallow L137 | No | **A** |
| `strategyChamber/strategyWorkItemStore.ts` | `spark:strategy-work-items:v1` (+conn/active) | swallow L55 | No | **A** |
| `strategyChamber/memory/strategicMemoryStore.ts` | `spark:strategy-decision-memory:v1` | swallow L30-40 | No | **A** |
| `boardroom/store.ts` | `spark.boardroom.discussions.v1` | **THROWS** L33 | No | **A** |
| `companionOutcomeThread.ts` | `companion-outcome-thread-v1` | swallow L53 | No | **C** |
| `estate/chamberOfMomentumMemory.ts` | `chamber-momentum-{patterns,blockers,preferences}-v1` | swallow | No | **A/C** |
| `currentFocus` runtime records | `spark.runtimeCreationRecords.v1` etc. | `safeLocalStorageSet` + verify | via diagnostics | **A** (local cache of durable) |
| **`companion_creation_workspaces` (Supabase)** | — | **verified receipt** | **Yes** | **A — already durable** |
| `estate/experienceControlPrefs.ts` | `spark:estate:experience-controls:v1` | swallow L83 | No | **B** |
| `estate/estateAudioSettings.ts` | `spark:estate:audio-settings:v2` | swallow L80 | No | **B** |
| `workspaceViewSize.ts` | `companion-workspace-view-size-v1` | swallow L98 | No | **D** |
| `chatBackdrop/chatBackdropPreference.ts` | `spark.chatBackdropId.v1` (+2) | swallow L91/177 | No | **D/B** |

**Siblings to inventory before implementing** (referenced, not fully traced): `lib/currentFocus/creationRecord.ts` + `lib/activeWorkspaceRegistry/*`, `lib/journalGazebo/journalPageStorage.ts`, `lib/strategyChamber/decisionRecord.ts` + `pendingHandoffStore.ts`, `lib/createWorkflowRecordStore.ts`, `lib/profile/businessEstateResearch.ts`.

---

## 2. Beta-critical data classification (Deliverable 2)

**Tier A — Durable member work (must survive refresh, sign-out/in, device change, cache clear, storage failure, app update). Migration targets, prioritized:**

| Priority | Domain | Store(s) | Why beta-critical |
|---|---|---|---|
| A1 | **Saved Work / My Work** | `savedWorkStore.ts` | Headline false-"Saved" case; the Create output members are told is safe |
| A2 | **Business profile & foundational intelligence** | `businessEstateProfile.ts` | The member's business identity; feeds everything downstream |
| A3 | **Clear My Mind captures (thoughts)** | `companionStore.ts` brain dumps, `clearMyMindSessionStore.ts`, `captureDraft.ts` | Emotionally core capture; "nothing valuable disappears" |
| A4 | **Projects & project items** | `companionProjectsStore.ts` | Ongoing work spine; continuity anchor |
| A5 | **Plan My Day items + completion history** | `planMyDay/planDayItems.ts`, `planTaskCompletion.ts` | Daily momentum + achievement record |
| A6 | **Journal & Growth entries** | `growthJournalStore.ts`, `journalGazebo` configs | Reflection record; irreplaceable |
| A7 | **Evidence / Portfolio / Confidence** | `evidenceBankStore.ts`, `growthPortfolioStore.ts`, `confidenceVaultStore.ts` | Proof/achievement; used to rebuild confidence |
| A8 | **Decisions & Chamber outputs** | `decisionCompassSessionStore.ts`, `strategyChamber/*`, `boardroom/store.ts` | Intentionally preserved thinking outputs |
| A9 | **Create drafts / sessions / workspaces** | `createDraftLibrary.ts`, `createSessionStore.ts`, `creationWorkspace/persistence.ts` | Unfinished creation continuity |
| — | **Current Focus / runtime creation** | `companion_creation_workspaces` | **Already durable — reference model, not a migration target** |

**Tier B — Durable preferences** (nice to sync, not beta-blocking): `todaysPlanReorder.ts`, `experienceControlPrefs.ts`, `estateAudioSettings.ts`, `brainDumpCustomCategories.ts` (member taxonomy — borderline A).

**Tier C — Reconstructable cache** (may stay local): `companionOutcomeThread.ts` (rebuildable from chat), chamber pattern aggregates, `currentFocus` local runtime cache (projection of durable).

**Tier D — Ephemeral UI** (stay local): `projectContinuityStore.ts`, `previousDay.ts`, `dailyAdaptation/storage.ts` (self-expiring), `workspaceViewSize.ts`, `chatBackdrop`, journal-gazebo session flags.

**Ephemeral state that still needs crash/refresh recovery (stays local, but must not be lost mid-session):** `clearMyMind/captureDraft.ts` (in-progress capture text) and `createSessionStore.ts` (in-progress creation) — keep as local recovery cache even after durable migration; they are the "work still on screen" the receipt language refers to.

---

## 3. Current read/write flow map (Deliverable 3)

Full per-journey traces are captured in the evidence appendix (this pass). Summary of the beta-critical write behavior and the false-confirmation hotspots:

| Journey | Write destination | Verified? | Member told "saved"? | Duplicate risk | Cross-device today |
|---|---|---|---|---|---|
| 1 Clear My Mind → My Thoughts | `companion-brain-dumps-v1` (commit); routing → other stores | **commit: yes** (round-trip); routing: **no** (`brainDumpRouting.ts:67-74` hard `ok:true`) | Yes (both) | Yes on retry after false-negative verify | No |
| 2 Create → My Work | `companion-saved-work-v1` | **No** (`savedWorkStore.ts:52-59,140`) | **Yes — unverified** (`createDraftPersistence.ts:16-23`) | Yes (pre-propagation of `existingId`) | No |
| 3 Plan My Day | `companion-plan-my-day-items-v1[:owner]` | No (swallow) | Yes via routing (unverified) | Single-add: yes; batch: dedup | No |
| 4 Adapt My Day | same plan store (in-place) + check-in side record | No | No explicit | No (id-mapped edits) | No |
| 5 Projects | `companion-projects-v1` | **Direct: yes** (`persisted`); **routing: no** | Routing: yes unverified | Routing path: yes (no id) | No |
| 6 Current Focus | **Supabase `companion_creation_workspaces`** | **Yes — receipt** | **Only when durable** | Guarded (upsert `onConflict:id`) | **Yes** |
| 7 Return after absence | reads `buildContinuityManifest` (mostly local) | n/a (reads) | n/a | n/a | Only Creation projection |
| 8 Saved work retrieval | reads `companion-saved-work-v1` | n/a | shows `savedLocation` label | n/a | No |
| 9 Business profile | `companion-business-profile-v1` (singleton) | No (swallow) | implicit | Low (singleton) | No |
| 10 Chamber/preserved outputs | various `spark:*` / `companion-*` | No (some THROW) | none/implicit | mostly id-keyed | No |

**False-confirmation hotspots (told "saved" with no verified persist):** Create "Saved to My Work" (`createDraftPersistence.ts:16-23`), brain-dump routing "Added/Saved to…" (`brainDumpRouting.ts:67-74,131-241`), Plan "Added to Plan My Day" (`brainDumpRouting.ts:236-241`), project routing "Created project" (`brainDumpRouting.ts:192-213`), `tomorrowFocusTrustMessage` (`tomorrowFocus.ts:81-92`). *Note: fixing the member-facing copy is Blocker 2 (Trust Kernel) work; this plan makes the store return honest receipts so Blocker 2 has something truthful to consume.*

---

## 4. Root-cause analysis (Deliverable 4)

1. **Persistence was staged and left unfinished.** One domain (Creation) was migrated to a verified Supabase store; the other ~25 Tier-A stores still write to localStorage. The durable pattern, the auth identity, and the quota-recovery infra all already exist — they simply weren't extended.
2. **localStorage is not durable for a business tool.** Device-local, ~5–10 MB quota, cleared by cache-clear/private mode, never cross-device. Contradicts Constitution 117 ("Never lose user work") and the manifesto ("Spark Estate remembers so members don't have to").
3. **Failure is invisible.** Most Tier-A writes swallow errors and return in-memory success objects; four (`brainDumpCustomCategories`, `projectConversations`, `tomorrowFocus`, `boardroom/store`) throw uncaught on quota and can break the render. Either way, the member is told (or shown) success that didn't happen.
4. **The good pattern is not the default.** Only 3 of ~25 Tier-A stores signal failure; only Creation is truly durable+verified. The discipline exists (`creationDurable`, `safeLocalStorageSet`, `captureDraft`, projects `persisted`) but is applied ad hoc.

---

## 5. Recommended persistence architecture (Deliverable 5)

**Recommendation: a staged hybrid — one generalized durable-record contract behind a single generic table for the first migrations, with domain tables added later only where query patterns demand it.**

Extract the proven `creationDurable` machinery into a reusable `lib/durableRecords/` core:
- A generic `DurableRecordStore<T>` contract mirroring `lib/creationDurable/repository.ts` (resolve user → `upsert(onConflict:id)` → read-back verify id+version → optional second read-back → mark verified → write optional local cache → **only then `ok`**).
- The typed `DurableMutationResult<T>` receipt (from `lib/creationDurable/types.ts:6-21`) as the universal return.
- An in-session verified registry (`lib/creationDurable/verifiedRegistry.ts` pattern) so memory/localStorage can never signal durability.
- Reuse `savePipeline.classifyCreatePersistencePath` taxonomy (`durable_pipeline` / `local_recovery_only` / `local_bookmark_only` / `domain_projection`, `savePipeline.ts:104-129`) generalized to all domains.
- Local writes continue via `safeLocalStorageSet` (`lib/companionStorageRecovery.ts`) as a **recovery cache**, never as the success signal.

### Options evaluated

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **Unified single JSONB table** (`companion_member_records`: user_id, domain, record_id, payload, version, status, timestamps) | Smallest to stand up; one RLS policy; one repository; covers all Tier-A shapes; matches "smallest safe foundation"; idempotent via unique(user_id,domain,record_id) | Weaker per-domain query/index (e.g. full-text search of saved work); large payloads possible; must be disciplined about domain namespacing | **Chosen for beta** — start here |
| Several domain-specific tables | Best query/index per domain; strong typing at DB | 20+ schemas + RLS to write/maintain; duplicated verify logic; slow to reach beta | Defer; promote a domain only when query need is proven |
| Staged hybrid (generic table + promote hot domains) | Beta-fast now, room to specialize later | Two patterns to reason about eventually | **This is the recommendation** (generic first, promote later) |
| Leave localStorage + add sync daemon | Least code churn | Sync-after-the-fact keeps the false-completion window; hard to make truthful | Rejected |

**Why generic-table-first is safest for beta:** it lets us reuse one verified repository across A1–A9 without per-domain schema churn, keeps RLS uniform and auditable, and preserves the receipt contract Blocker 2 will later consume. `companion_creation_workspaces` stays as-is (already durable, query-shaped) — the generic store learns from it, doesn't replace it. Promotion to a dedicated table (e.g. `companion_saved_work`) becomes a later, evidence-driven decision recorded in §12.

---

## 6. Schema proposal (Deliverable 6) — PROPOSAL ONLY, not applied

New file (proposed): `supabase/companion_member_records_schema.sql`, applied via a script mirroring `scripts/apply-companion-creation-workspaces-schema.mjs`.

```sql
-- PROPOSAL — do not apply during planning pass
create table if not exists public.companion_member_records (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  domain        text not null,                 -- 'saved_work' | 'business_profile' | 'thought' | 'project' | ...
  record_id     text not null,                 -- app-stable id (e.g. sw-… ), 'singleton' for envelopes
  status        text not null default 'active',-- 'active' | 'archived' | 'deleted'
  version       integer not null default 1,    -- optimistic concurrency
  payload       jsonb not null,                -- the domain record
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, domain, record_id)          -- idempotency / dedupe key
);

create index if not exists idx_cmr_user_domain
  on public.companion_member_records (user_id, domain, status, updated_at desc);

alter table public.companion_member_records enable row level security;

create policy "own rows - select" on public.companion_member_records
  for select using (auth.uid() = user_id);
create policy "own rows - insert" on public.companion_member_records
  for insert with check (auth.uid() = user_id);
create policy "own rows - update" on public.companion_member_records
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- deletes are soft (status='deleted'); no hard-delete policy for members.

-- updated_at trigger (mirror existing schema conventions)
```

Notes: `unique(user_id, domain, record_id)` gives idempotent upserts (`onConflict`), preventing the duplicate-write class seen in Journeys 2/3/5. `version` supports stale-conflict detection. Soft-delete honors Constitution 117 ("allow review and correction", never lose work).

---

## 7. Authentication & ownership model (Deliverable 7)

- **Owner key = Supabase Auth `user.id`** (UUID). Resolve exactly as the reference does: `supabase.auth.getUser()` → `data.user.id`; no user → `AUTH_REQUIRED` receipt (`lib/creationDurable/repository.ts:113-124`).
- **Access control = RLS** (`auth.uid() = user_id`), enforced at the DB; client uses the anon key + RLS (no service role in the browser), matching `companion_creation_workspaces`.
- **Never** use the per-browser random ids (`estateDiscovery/memberId.ts`, `ecosystem/ecosystemUserId.ts`, `shariMemberSince.ts`) as owners — they are anonymous/telemetry, per-browser, lost on cache clear.
- **Dev auth bypass caveat:** `lib/companionAuthBypass.ts:11-16` returns true in `NODE_ENV==="development"`, so `user.id` is absent locally. Plan: the durable store must degrade to the in-memory/local test backend (the `setCreationDurableBackendForTests` pattern) when unauthenticated, clearly marked **non-durable** (never emit a durable receipt). Durable dev testing requires `NEXT_PUBLIC_COMPANION_AUTH_DISABLED=false` + a real session.

---

## 8. Migration strategy (Deliverable 8)

**Principle: no existing member work may be discarded. Local stays until durable is verified.**

Per-domain, on first authenticated launch after the update:

1. **Detect** local records for the domain (read existing localStorage key).
2. **Guard against re-run:** check a per-domain migration marker — both a durable server marker row (`domain='migration_marker'`) and a local flag `spark.migrated.<domain>.v1`. Migrate only if the server marker is absent.
3. **Dedupe:** upsert each record by `(user_id, domain, record_id)`. App-stable ids (`sw-…`, project ids, avatar ids) map directly; singleton envelopes use `record_id='singleton'`. Content-hash fallback for records lacking stable ids (e.g. some brain dumps) to avoid re-import duplicates.
4. **Conflict handling:** if a durable row already exists, compare `version`/`updated_at`; server-newer wins (keep server), local-newer updates server; equal → skip. Never overwrite a newer durable row with a stale local one.
5. **Verify:** each upsert must return a durable receipt (read-back). Only receipted records count as migrated.
6. **Represent partial migration:** track per-record success; a domain is "migrated" only when all records receipted. Unmigrated records remain local and are retried next launch.
7. **Keep local copies** until the domain marker is set AND a read-back of the domain from the server matches. Then localStorage may be **demoted to recovery cache** (not deleted immediately — retained ~30 days as a safety net, then cleared by a later cleanup commit, §11 step 7).
8. **Failed migration recovery:** on any failure, leave local intact, show nothing alarming (migration is silent/background), retry on next launch. Never block the member.
9. **Idempotency:** the server marker + unique constraint make re-runs safe (no duplicates).

Migration runs **per domain, lazily** on first access to that domain (not a big-bang boot migration) to protect momentum (132) and spread load.

---

## 9. Failure & recovery behavior (Deliverable 9)

**Law (carried from `lib/creationDurable/types.ts:1-4`):** *Memory / localStorage never constitute durable success.* The store returns `DurableMutationResult` — success `{ok:true, durable:true, record, version, persistedAt}` or failure `{ok:false, errorCode, retryable, message}`. **The interface must not say work was saved unless a durable receipt was returned.** (Consuming the receipt in member copy = Blocker 2; this plan only guarantees the receipt is honest.)

| Failure mode | errorCode | retryable | Member-facing (calm, one action) | Local recovery |
|---|---|---|---|---|
| Network unavailable | `NETWORK_UNAVAILABLE` | yes | "I couldn't reach the safe-save layer just now. Your work is right here — I'll keep it and try again." | keep local cache |
| Auth unavailable / signed out | `AUTH_REQUIRED` | yes | "Sign in so I can keep this safe across your devices. It's still here on screen." | keep local cache |
| Server write failure | `DB_WRITE_FAILED` | yes | "That didn't finish saving. Your work is still on screen — Retry." | keep local cache |
| DB constraint failure | `CONSTRAINT_FAILED` | no | "Something about this didn't fit. Your work is safe here — I'll help sort it." | keep local cache |
| Quota / payload too large | `PAYLOAD_TOO_LARGE` | no | "This is a big one — let me save it a little differently." (chunk/compress path) | keep local cache |
| Stale version conflict | `VERSION_CONFLICT` | yes | "This was updated elsewhere. I've kept both — want to pick which to keep?" | keep both |
| Partial save | `PARTIAL_SAVE` | yes | silent retry of the unsaved parts; never claim full save | keep unsaved parts local |
| Duplicate submission | (idempotent no-op) | — | none — upsert dedupes | — |
| Local fallback failure (quota throw) | `LOCAL_CACHE_FAILED` | yes | "Your device storage is full — let me save to your account instead." (prefer server) | attempt server-first |
| Later sync failure | `SYNC_DEFERRED` | yes | silent; retry on next launch | keep local, mark pending |

Also: fix the four **uncaught-throw** stores (`brainDumpCustomCategories`, `projectConversations`, `tomorrowFocus`, `boardroom/store`) so quota can never break the render — even before their full durable migration (cheap safety win, §11 step 7 / can be pulled earlier).

---

## 10. Testing strategy (Deliverable 10)

Model on `lib/creationDurable/*.test.ts` and `lib/trustKernel/t1SoleEgress.test.ts`. Every durable path gets an in-memory backend that **still enforces write + read-back** (like `createMemoryCreationDurableBackend`).

| Test file (proposed) | Proves |
|---|---|
| `lib/durableRecords/repository.test.ts` | upsert→read-back→verify; never `ok` without read-back; `AUTH_REQUIRED`/`VERIFY_MISMATCH`/`DB_EMPTY_RETURN` paths |
| `lib/durableRecords/receipt.test.ts` | `DurableMutationResult` union shape; `durableOk`/`durableFail` invariants; memory/localStorage never yield `durable:true` |
| `lib/durableRecords/idempotency.test.ts` | duplicate submit → single row (unique constraint / onConflict); the Journey 2/3/5 duplicate classes cannot recur |
| `lib/durableRecords/migration.test.ts` | detect→dedupe→conflict(server-newer wins)→verify→marker; re-run is a no-op; partial migration retried; local retained until verified |
| `lib/durableRecords/failurePaths.test.ts` | each §9 failure mode → correct code, retryable flag, local preserved |
| `lib/durableRecords/quotaThrow.test.ts` | the four uncaught-throw stores no longer throw; degrade to server-first |
| `lib/durableRecords/savedWork.durable.test.ts` (slice 1) | Saved Work create/update/list/delete round-trips durably; cross-user isolation via RLS mock |
| `lib/durableRecords/truthfulness.test.ts` | store returns failure receipt when write fails — no success object on failure (contrast current `savedWorkStore.ts:140`) |
| `lib/durableRecords/authenticatedIntegration.test.ts` (gated) | against a real/staging Supabase: write on "device A" id, read on "device B" session → same rows (cross-device) |
| `lib/savedWorkStore.test.ts` (regression) | existing local behaviors still hold during hybrid phase |

Member-facing truthfulness tests here assert the **receipt**, not the chat copy (copy is Blocker 2).

---

## 11. Contained commit sequence (Deliverable 11)

Each commit is small, independently revertible, and leaves the app shippable.

**1. Persistence contracts & record classification**
- Purpose: extract reusable `DurableRecordStore` contract + `DurableMutationResult` + tier taxonomy from `creationDurable`.
- Files: new `lib/durableRecords/{types,contract,verifiedRegistry}.ts`; no store rewired yet.
- Deps: none. Risks: low (additive). Tests: `receipt.test.ts`. Acceptance: contract compiles, memory backend passes verify tests. Rollback: delete new dir.

**2. Database schema & access controls**
- Purpose: propose+apply `companion_member_records` with RLS.
- Files: `supabase/companion_member_records_schema.sql`, `scripts/apply-companion-member-records-schema.mjs`.
- Deps: 1. Risks: RLS misconfig → data exposure (mitigate: RLS tests, least-privilege, mirror creation-table policy). Tests: RLS policy tests. Acceptance: table + policies live in staging; cross-user read denied. Rollback: drop table (no member data yet).

**3. Durable storage service with explicit receipts**
- Purpose: generic Supabase backend (`upsertAndReadBack`, `fetchById`, `listForDomain`) + in-memory backend.
- Files: `lib/durableRecords/repository.ts`, `memoryBackend.ts`.
- Deps: 1,2. Risks: low. Tests: `repository.test.ts`, `failurePaths.test.ts`, `idempotency.test.ts`. Acceptance: never `ok` without read-back; all failure codes covered. Rollback: revert; nothing consumes it yet.

**4. Local migration & recovery layer**
- Purpose: per-domain detect/dedupe/conflict/verify/marker; local retained as recovery cache.
- Files: `lib/durableRecords/migration.ts`, `localRecoveryCache.ts`.
- Deps: 3. Risks: duplicate/lost work if dedupe wrong (mitigate: `migration.test.ts`, keep-local-until-verified). Tests: `migration.test.ts`. Acceptance: re-run no-op; partial retried; nothing deleted. Rollback: disable migration flag; local untouched.

**5. First beta-critical vertical slice — Saved Work / My Work (A1)**
- Purpose: route `savedWorkStore` writes through the durable store behind a feature flag; keep local as recovery cache; return receipts.
- Files: `lib/savedWorkStore.ts` (add durable adapter), `lib/createDraftPersistence.ts` (return the receipt instead of unconditional object — do NOT change chat copy yet), slice migration for `saved_work`.
- Deps: 3,4. Risks: regressions in My Work list (mitigate: regression test, flag). Tests: `savedWork.durable.test.ts`, `truthfulness.test.ts`. Acceptance: create on one session, retrieve on another (cross-device); failed write returns failure receipt (no false success object). Rollback: feature flag off → pure local.

**6. Additional slices, one at a time** (A2 business profile → A3 thoughts/Clear My Mind → A4 projects → A5 plan → A6 journal → A7 evidence/portfolio/confidence → A8 decisions/chamber → A9 create drafts).
- Each: same shape as step 5, own migration + tests + flag. Deps: 3,4 and prior slice. Risks: per-domain; contained by flag. Acceptance: per-domain cross-device + honest receipt.

**7. Remove/demote unsafe legacy writes**
- Purpose: fix the four uncaught-throw stores; demote migrated localStorage keys to recovery cache; schedule local cleanup (~30 days post-verify).
- Files: `brainDumpCustomCategories.ts`, `projectConversations.ts`, `tomorrowFocus.ts`, `boardroom/store.ts`, migrated stores.
- Deps: 5,6. Risks: premature local deletion (mitigate: only after verified read-back + retention window). Tests: `quotaThrow.test.ts`. Acceptance: no uncaught throw; no local delete before durable verify. Rollback: restore local writes.
- *(Consider pulling the four throw-fixes earlier as a standalone safety commit — cheap, independent of the rest.)*

**8. Final continuity & cross-device certification**
- Purpose: verify Return-after-absence (Journey 7) reconstructs from durable stores across devices; extend `buildContinuityManifest` to read durable.
- Files: `lib/continuityManifest.ts` (durable reads), cert tests.
- Deps: 5–7. Risks: continuity gaps for un-migrated domains (mitigate: manifest reads durable-first, local fallback). Tests: `authenticatedIntegration.test.ts`, continuity cert. Acceptance: sign in on new device → prior work + "continue where I left off" reconstruct. Rollback: manifest local-first.

---

## 12. Risks & unresolved decisions (Deliverable 12)

**Risks**
- **RLS misconfiguration** = cross-member data exposure. Highest risk; gate every table behind policy tests before any write.
- **Migration dedupe correctness** for id-less records (some brain dumps, chamber history) — content-hash strategy needs validation to avoid re-import duplicates or missed records.
- **Payload size** for large domains (journal bodies, business envelope with images) vs JSONB/row limits — may need chunking or object storage for `businessImage`/attachments.
- **Offline / flaky network** — members expect to keep working; local-first-cache + deferred sync is essential, but "deferred sync" reopens a truthfulness window (must never claim durable until receipted).
- **Dev auth bypass** — durable paths untested locally unless the flag is flipped; risk of "works in dev, fails in prod." Add a dev durable smoke path.

**Unresolved decisions (need owner input)**
1. **Generic table vs. promote hot domains** — start generic (recommended); which domains (if any) get dedicated tables at beta (candidate: Saved Work for search)?
2. **Attachment/image storage** — inline in JSONB vs Supabase Storage bucket. Likely bucket for images; decide before A2/A6.
3. **Offline posture for beta** — is "must be online to durably save" acceptable for beta, with local recovery + retry? Or is offline-first required?
4. **Local retention window** before clearing migrated localStorage (proposed ~30 days).
5. **Audit doc correction** — the audit's Blocker 1 wording ("no database") needs an accuracy fix; do it as a separate doc edit (not this pass).
6. **Handoff to Blocker 2** — once the store returns honest receipts, who wires them into member-facing "saved" copy (the Trust Kernel repair)? Sequencing decision.

---

## 13. Recommended first implementation slice (Deliverable 13)

**Start with Saved Work / My Work (Tier A1)** as the first vertical slice, after the foundation commits (1–4).

Why this slice first:
- It is the **headline false-completion case** the audit cited (`buildDraftSavedAnnouncement` "Saved to My Work" over a swallowing store) — fixing it delivers the most trust per unit of work.
- The record is **clean and id'd** (`SavedWorkItem`, `sw-…` id), list-shaped — ideal for exercising the generic store, idempotent upsert, and list retrieval.
- **Cross-device value is immediately demonstrable** ("create on laptop, open on phone") — the clearest proof the foundation works.
- **Blast radius is contained** — one store, one panel (My Work), fully behind a feature flag.

Deliverable of the slice: create/update/list/delete of Saved Work routed through the durable store with honest receipts, `saved_work` migration of existing local records, cross-device retrieval proven, and a failing write proven to return a failure receipt (never a success object). **Chat copy is untouched** — that truthful-messaging step belongs to Blocker 2.

*Strong alternative if you'd rather prove the singleton shape first:* Business Profile (A2) — one envelope, foundational data, no list/dedupe complexity.

---

*Plan complete. No production code, schema, tests, or existing documentation were modified in this pass.*
