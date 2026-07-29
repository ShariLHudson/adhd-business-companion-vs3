/**
 * Creation Turn Envelope — the immutable per-turn Create routing contract.
 *
 * Computed ONCE at the start of a turn from the shared Create authority
 * (creationExecutionEligibility) plus explicit hard-navigation. Later systems —
 * frictionlessActionLayer, Business Profile gating, answer-first blocking,
 * certification — may ENRICH the response but may NOT contradict these fields.
 * There is no second classifier here; this only composes the existing authority.
 */

import {
  isCreationExecutionRequest,
  type CreationEligibilityOptions,
  type CreationProvenance,
} from "./creationExecutionEligibility";
import { resolveHardNavigationCommand } from "@/lib/hardNavigationCommands";
import { understandUniversalRequest } from "@/lib/universalRequestOutcome/understandRequest";

export type CreationTurnEnvelope = {
  turnId: string;
  /** "go to create" / "open create" (incl. bounded typos) — highest precedence. */
  explicitCreateNavigation: boolean;
  /** An immediate creation request the system should execute. */
  createEligible: boolean;
  /** A descriptive / exploratory / evaluative use of create — stay in conversation. */
  exploratoryCreation: boolean;
  /** The deliverable the member named ("Marketing Plan"), preserved as context. */
  intendedArtifact: string | null;
  routingProvenance: CreationProvenance;
  decisionOwner: "creationTurnEnvelope";
};

function isHardNavToCreate(userText: string): boolean {
  const cmd = resolveHardNavigationCommand(userText);
  return cmd?.target.kind === "workspace" && cmd.target.section === "create";
}

/** Resolve the immutable Create decision for a turn. Call once per turn. */
export function resolveCreationTurnEnvelope(
  userText: string,
  turnId: string,
  opts?: CreationEligibilityOptions,
): CreationTurnEnvelope {
  const elig = isCreationExecutionRequest(userText, opts);
  const explicitCreateNavigation =
    elig.explicitNavigation || isHardNavToCreate(userText);
  const createEligible = elig.eligible || explicitCreateNavigation;
  // Exploratory-CREATION only when the turn is actually about creating — the
  // shared veto's framing (e.g. "how do I …") also matches ordinary how-to
  // questions, which must keep full certification.
  const mentionsCreate = /\bcreat(?:e|es|ing|ed)\b/i.test(userText);
  const exploratoryCreation =
    elig.exploratory && !createEligible && mentionsCreate;

  // Detect the named artifact independently of eligibility framing: pass the
  // handoff flag so an aspirational phrasing ("i want to create a marketing
  // plan") still yields "Marketing Plan" instead of null. This only NAMES the
  // artifact — it does not change createEligible/exploratory above.
  let intendedArtifact: string | null = null;
  try {
    intendedArtifact =
      understandUniversalRequest(userText, { explicitCreateHandoff: true })
        .createArtifactType ?? null;
  } catch {
    intendedArtifact = null;
  }

  return {
    turnId,
    explicitCreateNavigation,
    createEligible,
    exploratoryCreation,
    intendedArtifact,
    routingProvenance: explicitCreateNavigation
      ? "explicit_navigation"
      : elig.provenance,
    decisionOwner: "creationTurnEnvelope",
  };
}

/**
 * True when the turn's Create decision is "locked" — any Create-related turn
 * (eligible, explicit navigation, or exploratory). Such a turn must NOT pass
 * through the reflective certification spine (topic-continuity /
 * buildNaturalTopicReturn), which would overwrite the answer with
 * "you're still deciding whether … makes sense" or reuse a stale topic anchor.
 */
export function isCreateLockedTurn(
  envelope: CreationTurnEnvelope | null | undefined,
): boolean {
  return Boolean(
    envelope &&
      (envelope.createEligible ||
        envelope.explicitCreateNavigation ||
        envelope.exploratoryCreation),
  );
}

/** Minimal shape of a frictionless decision the envelope governs. */
export type EnvelopeGovernableDecision = {
  category?: string;
  localReply?: string | null;
  immediateCreateOpen?: unknown;
  immediateEstatePlaceNavigate?: unknown;
};

/** True when a frictionless decision would open Create. */
export function frictionlessDecisionOpensCreate(
  decision: EnvelopeGovernableDecision,
): boolean {
  return Boolean(
    decision.immediateCreateOpen ||
      decision.immediateEstatePlaceNavigate ||
      decision.category === "universal_creation",
  );
}

/**
 * Enforce the envelope on a frictionlessActionLayer decision. The frictionless
 * layer consumes this instead of independently deciding Create intent:
 *  - exploratory creation may NOT open Create — collapse to a conversational
 *    decision so the turn answers the question instead.
 * Eligible / explicit-navigation turns are left intact (they SHOULD open Create,
 * and the single-placeholder arrival ownership governs their rendering).
 */
export function governFrictionlessDecisionByEnvelope<
  T extends EnvelopeGovernableDecision,
>(decision: T, envelope: CreationTurnEnvelope | null | undefined): T {
  if (!envelope) return decision;
  if (
    envelope.exploratoryCreation &&
    frictionlessDecisionOpensCreate(decision)
  ) {
    return {
      ...decision,
      category: "none",
      localReply: null,
      immediateCreateOpen: undefined,
      immediateEstatePlaceNavigate: undefined,
    };
  }
  return decision;
}
