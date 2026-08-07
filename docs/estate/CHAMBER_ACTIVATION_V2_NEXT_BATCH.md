# Chamber Intelligence — I-4 Batch 1 (Strategy, Client Relationships)

| Field | Value |
|-------|-------|
| **Status** | Implemented. |
| **Date** | 2026-08-07 |
| **Instruction this fulfills** | "Expand the remaining 20 experts using the same evidence-driven process. Do not add all 24 at once." |
| **Batch size** | 2 experts (Strategy, Client Relationships) — deliberately small, per the explicit instruction. |

---

## 1. Why these two, not any other two

Not arbitrary. Selected by tallying which non-pilot experts actually appeared — as primary, supporting, or co-primary — across the two founder-language validation rounds (40 realistic scenarios) plus the original founders corpus (36 entries), the same evidence this whole delivery has used throughout:

| Expert | Appearances across all validation scenarios |
|--------|----------------------------------------------|
| **Strategy** | 12+ — the most frequent supporting/possible expert by far, and the most frequent generalist tiebreak participant |
| **Client Relationships** | 8+ — appears across onboarding, retention, ghosting, and event-audience scenarios |
| Finance | 4 |
| Sales | 3 |
| Project Management | 3 |
| *(all others)* | 0–2 each |

Strategy and Client Relationships are, by a clear margin, the two most-activated experts still on the plain thinking-pattern-only fallback. Migrating them first means the deep-intelligence upgrade (real frameworks, ADHD translations, targeted questions — not just a name and a thinking-pattern sentence) reaches the *largest number of real conversations* per expert migrated, which is the same "smallest useful intelligence wins" principle this whole thread has followed since I-1.

## 2. What was built (identical process to I-2's Marketing/Systems/Events)

- `lib/chamberIntelligence/experts/STR.ts` and `CR.ts` — compiled from each expert's markdown Expert Intelligence Profile: thinking-pattern facets (§2), 5 frameworks each with real trigger phrases (§4), 2 signature questions (§5), 2 ADHD translations (§7), and knowledge-source volatility/trust/research-trigger fields (§10).
- Registered in `lib/chamberIntelligence/intelligenceRegistry.ts` (now 5 migrated experts: MKT, SYS, EVT, STR, CR).
- Added to the profile-drift regression suite (`__tests__/profileDrift.test.ts`) — every framework name, `sparkExplanation`, ADHD `traditional` phrase, signature question, and thinking-pattern summary verified to trace back to the markdown verbatim (quote-normalized).
- Added to the Expert Value Test (`__tests__/expertValueTest.test.ts`) — both new experts verified to add genuine, concrete value (a framework, translation, or question) beyond the bare name/thinking-pattern baseline, for on-topic requests.
- Updated `pilotIntegration.test.ts`'s two tests that had (correctly, at the time) used Client Relationships and Strategy as examples of "still-unmigrated, falls back" experts — they now demonstrate the deep-selection path instead, with Finance and Sales taking over as the "still-unmigrated" examples.

## 3. Verification

- Profile drift: 30/30 passing (6 checks × 5 experts), zero drift.
- Expert Value Test: 18/18 passing, including the two new experts.
- Full chamber suite: 414/414 passing — no regression in either founder-language validation round, the corpus, or the composer integration tests.
- `tsc --noEmit` and `eslint`: clean.

## 4. What is still deferred

The remaining **19 experts** (all but MKT, SYS, EVT, STR, CR) remain on the thinking-pattern-only fallback — unchanged, not worse off, exactly as the migration architecture (`docs/estate/CHAMBER_INTELLIGENCE_SYSTEM_ARCHITECTURE.md` §6) always intended for a partial-registry state. The next batch, whenever authorized, should repeat this exact process: tally activation frequency from the (by then larger) validation corpus, pick the next 2–3 highest-frequency experts, compile from their markdown, verify against profile drift and the Expert Value Test. Likely next candidates by current frequency: Finance, Sales, Project Management.
