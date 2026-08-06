# Chamber Expert Activation — Phase A & B Summary

| Field | Value |
|-------|-------|
| **Status** | Phase A + B implemented — **not connected to the LLM prompt stack** |
| **Date** | 2026-08-06 |
| **Depends on** | `docs/estate/CHAMBER_EXPERT_ACTIVATION_ARCHITECTURE.md` (approved direction) |
| **Next** | Phase C — wire into the hint stack (separate, reviewed change) |

---

## Created files

| File | Purpose |
|------|---------|
| `lib/chamberExpertise/types.ts` | Shared types — `ChamberExpertId` (24 canonical prefixes), registry entry shape, activation input/output shapes |
| `lib/chamberExpertise/chamberExpertRegistry.ts` | **Phase A** — canonical registry, all 24 Chamber Experts, compiled from the Expert Intelligence Profiles |
| `lib/chamberExpertise/legacyExpertAliasMap.ts` | **Phase A** — maps Phase 33 (6) and Estate Brain (15) expert IDs to canonical prefixes. Does not modify or delete either legacy registry. |
| `lib/chamberExpertise/resolveChamberExpertActivation.ts` | **Phase B** — composition function: fuses signals into `{ primary, supporting, possible, confidence }` |
| `lib/chamberExpertise/index.ts` | Barrel export |
| `lib/chamberExpertise/chamberExpertRegistry.test.ts` | Registry + alias map sanity tests (11 tests) |
| `lib/chamberExpertise/resolveChamberExpertActivation.test.ts` | Composition function tests, incl. the three worked examples (10 tests) |

**Not touched:** `app/api/companion-chat/route.ts`, `lib/companionPrompt.ts`, `CompanionPageClient.tsx`, `lib/estate/sparkEstateExpertTeamAndChamberMemberCollaborationArchitecture.ts`, `lib/estateBrain/expertRegistry.ts`. Nothing imports this new module yet — it ships dark, exactly as Phase A/B were scoped.

**Test result:** 21/21 passing. `npx tsc --noEmit` and `npx eslint lib/chamberExpertise` both clean.

---

## Data structure

### `ChamberExpertRegistryEntry` (Phase A)

```ts
type ChamberExpertRegistryEntry = {
  id: ChamberExpertId;                       // canonical prefix, e.g. "SYS"
  name: string;                              // "Systems Intelligence"
  category: ChamberExpertCategory;           // lightweight domain grouping (10 buckets)
  expertiseAreas: readonly string[];         // from profile §3 "Core expertise"
  activationSignals: readonly string[];      // compiled from profile §0 "Invite when"
  supportingRelationships: readonly ChamberExpertId[]; // core collaboration cast
  possibleRelationships: readonly ChamberExpertId[];   // secondary collaboration cast
  intentAffinities: readonly IntentCategory[];         // ties to lib/intentRoutingIntelligence.ts
  estateCategories: readonly EstateCapabilityCategory[]; // ties to lib/estateBrain/
  profilePath: string;                       // source of truth markdown
};
```

All 24 entries are populated — one per canonical Chamber Member from `docs/visual-spark-studios/MEMBER_INDEX.md`.

### Legacy alias map (Phase A)

```ts
PHASE_33_TO_CANONICAL: Record<string, ChamberExpertId>       // 6 entries
ESTATE_BRAIN_TO_CANONICAL: Record<string, ChamberExpertId>   // 15 entries
resolveLegacyExpertId(id) / resolveLegacyExpertIds(ids)
```

Both legacy registries (`SPARK_ESTATE_EXPERT_TEAM_MEMBERS`, `ESTATE_EXPERTS`) are untouched and continue running exactly as before. This map is purely additive.

### `ChamberExpertActivation` (Phase B output)

```ts
type ChamberExpertActivation = {
  primary: ChamberExpertId | null;
  supporting: readonly ChamberExpertId[];
  possible: readonly ChamberExpertId[];
  confidence: "high" | "medium" | "low";
  signals: readonly ChamberExpertSignalResult[]; // per-expert debug detail, never shown to members
};
```

---

## Activation logic

### Signals fused (per the task's requirement — never a single keyword)

| Signal | Source | Weight |
|--------|--------|--------|
| Topic match | `userText` vs. registry `activationSignals` + `expertiseAreas` (multi-word phrase = all significant words present; single word = exact match) | 35 (phrase) / 15 (keyword only) / +10 bonus if both |
| Intent category | `intentCategory` input vs. `intentAffinities` | 25 |
| Estate category | `estateCategory` input vs. `estateCategories` | 20 |
| Legacy expert ID | `legacyExpertIds` input, resolved via alias map | 40 |

### Anti-single-keyword rule (hard requirement)

An expert becomes **primary** only if it accumulates matches from **at least 2 of the 4 signal groups above** (topic, intent, estate category, legacy expert ID). A topic match alone — no matter how many phrases hit — is never sufficient. This is enforced by `PRIMARY_MIN_SIGNAL_GROUPS = 2` in `resolveChamberExpertActivation.ts` and directly tested (see below).

### Supporting / possible

Once a primary is found, `supporting` and `possible` come from that expert's own curated `supportingRelationships` / `possibleRelationships` (authored from each profile's §11 Cross-Chamber Collaboration section), filtered to drop any collaborator with zero signal for this specific request (falling back to the curated list if the filter would remove everyone — the collaboration relationship is a stable domain fact, not solely derived from one message's wording).

### Journey stage

`journeyStage` is accepted in the input shape (for forward compatibility with `ConversationSession.currentStage` / Universal Creation Journey steps) but is **not yet used** in scoring — Phase B intentionally keeps this informational-only until there's a live caller to validate against.

---

## Tests

### Worked examples (all pass)

| Input | intentCategory | estateCategory | primary | supporting (contains) | possible (contains) |
|-------|-----------------|------------------|---------|------------------------|----------------------|
| "I need to create a client onboarding process." | build | business | **SYS** | CR | KMG |
| "I need a marketing strategy." | plan | business | **MKT** | STR, CR | — |
| "I want to plan a two-day ADHD business retreat." | plan | business | **EVT** | MKT, CR | — |

Tests assert `primary` **exactly** and `supporting`/`possible` via **containment** (`toContain`), not exact-set equality — documented as a deliberate choice (see Risks below).

### Anti-single-keyword tests

- Bare topic word with no other signal → `primary: null`
- Many topic phrase hits, still no intent/estate signal → `primary: null`
- Topic match **plus** intent category → activates
- Legacy expert ID alone (1 signal group) → `primary: null`
- Legacy expert ID **plus** topic match → activates the aliased canonical expert
- Empty input → `primary: null`, `confidence: "low"`
- Determinism: same input → same output (referenced object equality via `toEqual`)

---

## Risks

| Risk | Status / mitigation |
|------|----------------------|
| **Exact tier boundaries (supporting vs. possible) involve editorial judgment**, not a fully general derivable rule | Documented explicitly here and in code comments. The three worked examples could not be satisfied simultaneously by a single generic per-request scoring rule for supporting-vs-possible (Client Relationships needed to be "supporting" in one example via direct text evidence and in another via pure domain pairing with zero text overlap) — resolved by curating `supportingRelationships`/`possibleRelationships` per expert (the actual domain knowledge already authored in each profile's §11), with per-request scoring only filtering out zero-signal entries. Tests use containment checks accordingly. |
| **`activationSignals` are a compiled digest, not the verbatim profile text** | Documented in `chamberExpertRegistry.ts` file header. If a profile's §0 signals change substantially, the registry should be reviewed for drift — no automated sync exists (intentionally; Phase A avoided runtime markdown parsing per the architecture doc). |
| **`category` field is a new, lightweight taxonomy** (10 buckets) not present anywhere else in the codebase | Purely a lookup convenience; not consumed by any scoring logic. Low risk — can be changed later without breaking the composition function. |
| **Near-universal `estateCategory: "business"` weakens its discriminating power** | By design — `estateCategory` corroborates but the topic+intent signals do the real narrowing. Documented in the composition function's inline comments. |
| **No live caller yet means this can silently drift from real usage patterns** | Intentional for Phase A/B (task explicitly said not to wire it yet). Flagged here so Phase C review re-validates the registry against real conversation examples, not just the three worked examples, before wiring. |
| **`journeyStage` is accepted but unused** | Documented above; will need real design once a live caller exists (Phase C or later). |
| **Legacy alias map is a best-effort mapping**, especially for role-shaped Estate Brain experts (e.g. `adhd-coach` → `MOM`, `career-advisor` → `STR`) | These are judgment calls, not 1:1 semantic matches. Documented inline in `legacyExpertAliasMap.ts`. Should be reviewed if Phase E (registry consolidation) proceeds. |

---

## Explicit non-goals (unchanged)

- No runtime wiring into `app/api/companion-chat/route.ts` or the `intentHint` stack
- No changes to Phase 33 or Estate Brain registries
- No separate agents, chat systems, or memory stores
- No UI/Chamber card changes

## Next step (after review)

**Phase C** — add a `chamberExpertiseHintForChat`-style function (mirroring `appFeatureKnowledgeHintForChat`) that calls `resolveChamberExpertActivation` with real `intentCategory`/`estateCategory` from the live pipeline and appends a short hint to `intentHint`. Should be its own reviewed change, confidence-gated (e.g. only fire when `confidence !== "low"`), per `docs/estate/CHAMBER_EXPERT_ACTIVATION_ARCHITECTURE.md` §7 Phase C.
