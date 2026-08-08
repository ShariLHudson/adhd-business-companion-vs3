/**
 * Work Identity — Slice 1B: attaching a `WorkId` at the exact, single
 * moment a new Universal Creation session is built.
 *
 * `buildInitialSession` (`lib/universalCreation/orchestrator.ts`) is the
 * sole constructor of a fresh `UniversalCreationSession` — confirmed
 * before writing this function: it is a private, non-exported function
 * with exactly one caller (`startUniversalCreationTurn`), and no other
 * function in `lib/universalCreation/` builds a session object from
 * scratch (every other reference spreads an existing session). This is
 * the "clear Work Recognition → Create path" the request scoped this
 * slice to — attaching identity here, and only here, is what makes "no
 * duplicate records" structural rather than a convention to remember.
 *
 * Recomputes the Support Gate tier internally rather than requiring the
 * caller to thread it through `startUniversalCreationTurn`'s and
 * `buildInitialSession`'s signatures — a deliberate, smallest-safe-change
 * choice: `resolveSupportGate` is a cheap, pure, side-effect-free
 * function already computed once upstream in the live conversation turn
 * (Slice 1A's own call site), so recomputing it here costs nothing and
 * keeps this slice's change contained to a single call site rather than
 * threading a new parameter through every function between the live turn
 * and session construction. It also means this guarantee holds for any
 * caller path that reaches session creation, not only the one already
 * reviewed.
 *
 * Fully gated by `isWorkIdentityV1Enabled()` — with the flag off, this
 * always returns `undefined`, and `buildInitialSession`'s output is
 * byte-identical to before this slice (an explicit `workId: undefined`
 * key is dropped by `JSON.stringify`, so the persisted session shape is
 * unchanged either way).
 */

import { detectEmotionalState } from "../companionEmotions";
import { isWorkIdentityV1Enabled } from "../intelligence-layer/featureFlags";
import { resolveSupportGate } from "../workStatePriority/resolveSupportGate";
import { mintWorkId } from "./mintWorkId";
import { resolveCommitmentGate } from "./resolveCommitmentGate";
import type { WorkId } from "./types";

/**
 * Returns a freshly minted `WorkId` only when the founder's own language,
 * for this exact turn, crosses the commitment boundary
 * (COMMITMENT_RECOGNITION_DESIGN_REVIEW.md §7) — `undefined` for
 * exploration, for a Support Gate PAUSE, or when the flag is off. The
 * caller (session construction) is responsible for calling this exactly
 * once, at creation — never on every subsequent turn of an already-live
 * session, which would re-evaluate commitment for text that already has
 * an identity.
 */
export function attachWorkIdentityAtCreation(userText: string): WorkId | undefined {
  if (!isWorkIdentityV1Enabled()) return undefined;

  const supportGateTier = resolveSupportGate(userText, detectEmotionalState(userText));
  const decision = resolveCommitmentGate({ userText, supportGateTier });
  if (decision.outcome !== "commit") return undefined;

  return mintWorkId();
}
