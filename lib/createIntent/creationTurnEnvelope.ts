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
  const exploratoryCreation = elig.exploratory && !createEligible;

  let intendedArtifact: string | null = null;
  try {
    intendedArtifact = understandUniversalRequest(userText).createArtifactType ?? null;
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
