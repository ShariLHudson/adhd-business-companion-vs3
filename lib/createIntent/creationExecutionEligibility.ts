/**
 * Canonical natural-language Create eligibility authority.
 *
 * ONE place decides whether ordinary user text may open the Create workspace.
 * Every deterministic natural-language Create-opening path must consult this —
 * `classifyConversationGoal`, `understandUniversalRequest`,
 * `shouldEnterUniversalCreation`, and the `messageClassification` auto-open path
 * — so they can never disagree. Callers must not open Create once this authority
 * marks a turn exploratory (`isExploratoryCreation`) unless they carry trusted
 * provenance (an explicit UI action or a research→creation handoff).
 *
 * The exploratory framing regex lives here and ONLY here — it was moved out of
 * `understandUniversalRequest` so no caller recreates its own copy.
 *
 * Product rule: a *mention* of creation stays conversational; an *immediate
 * request for the system to produce a concrete thing now* may open Create.
 * The word "create", a bare deliverable noun, or a broad create-capability
 * classification are individually NOT sufficient, and a concrete deliverable
 * noun never overrides obvious exploratory framing
 * ("what kind of report could I create from this?" stays conversational).
 */

import {
  isCreateRejection,
  mentionsCreateDeliverable,
} from "@/lib/createIntentVocabulary";

export type CreationProvenance =
  | "ui_handoff"
  | "research_handoff"
  | "explicit_navigation"
  | "none";

export type CreationEligibility = {
  /** May this natural-language turn open Create on its own? */
  eligible: boolean;
  /** Descriptive / aspirational / exploratory / evaluative / capability framing. */
  exploratory: boolean;
  /** "Open Create" / "take me to Create" style navigation. */
  explicitNavigation: boolean;
  /** Imperative instruction to the system to produce something now. */
  immediateProduction: boolean;
  /** A concrete deliverable/artifact noun is present. */
  concreteDeliverable: boolean;
  /** Why the decision was reached (source of authority). */
  provenance: CreationProvenance;
  reason: string;
};

export type CreationEligibilityOptions = {
  /** The member pressed an explicit Create UI control. Carries action provenance. */
  uiActionHandoff?: boolean;
  /** Explicit "Use This Research → build" handoff. Carries action provenance. */
  researchHandoff?: boolean;
};

/**
 * The member is *talking about* creating, not commanding it now: aspiration
 * ("I want to", "my goal is to"), consideration ("thinking about",
 * "considering"), evaluation ("whether to", "should I", "help me decide",
 * "what would it take to"), ideation / capability ("what could I", "ideas for",
 * "how can I", "could I create"), and attribution ("who created", "this could
 * create"). A creation family or deliverable noun inside such a sentence names
 * a KIND of thing and must NOT open Create.
 */
const EXPLORATORY_CREATION_FRAMING_RE =
  /\b(?:i\s+(?:want|'?d\s+like|would\s+like|hope|'?d\s+love|would\s+love|plan|intend|aim|wish)\s+to|my\s+goal\s+is\s+to|i'?m\s+(?:hoping|planning|thinking|wanting)\s+(?:to|about)|i'?ve\s+(?:been\s+(?:thinking|wanting)|always\s+wanted)|thinking\s+about|think\s+i\s+(?:might|could|should|want)|considering|toying\s+with|maybe\s+i|whether\s+(?:to|i\s+should)|should\s+i|help\s+me\s+decide|deciding\s+whether|trying\s+to\s+decide|is\s+it\s+worth|do\s+you\s+think\s+i\s+should|what\s+(?:could|should|can|do|would|kind\s+of|type\s+of)\s+i|what\s+kinds?\s+of\b|ideas?\s+(?:for|to)\b|brainstorm|how\s+(?:can|do|would|should)\s+i|what\s+(?:does|would|will|might)\s+it\s+take\s+to|what\s+goes\s+into|what'?s\s+involved\s+in|(?:could|can|should|would|do|might)\s+i\s+(?:create|make|build|write|draft|design|produce|generate|come\s+up\s+with)|who\s+(?:created|made|makes|built|designed)|(?:this|that|it)\s+(?:could|would|might|can)\s+(?:create|cause))\b/i;

/** Descriptive present-tense self-description ("I create handmade journals"). */
const DESCRIPTIVE_CREATE_RE =
  /^(?:i|we)\s+(?:create|make|build|sell|craft|design|produce|hand-?make|offer)\b/i;

/** Trusted "open Create" / "take me to Create" navigation. */
const EXPLICIT_CREATE_NAV_RE =
  /\bopen\s+(?:the\s+)?create\b|\b(?:take\s+me|bring\s+me|go|head)\s+(?:to\s+)?(?:the\s+)?create\b/i;

/** Imperative production command directed at the system, with a real object. */
const IMPERATIVE_PRODUCTION_RE =
  /^(?:please\s+)?(?:create|draft|make|build|write|generate|design|produce|compose|put\s+together)\s+(?:me\s+)?(?:(?:a|an|the|my|our|your|some|this|that|these|those)\s+\w|(?:this|that|it|these|those)\b)/i;

/** "Turn / make / put these notes into a report" — a transform-to-deliverable. */
const TRANSFORM_PRODUCTION_RE =
  /\b(?:turn|make|put|format|convert)\s+(?:this|that|these|those|it|them|the|my)\b[\s\S]*\binto\s+(?:a|an|the)?\s*\w/i;

/**
 * First-person intent to produce something now ("I want to create …",
 * "I need to build …"). On its own this is aspirational, but PAIRED WITH A
 * CONCRETE DELIVERABLE NOUN it is an execution request ("I want to create a
 * marketing plan"). Kept separate from the exploratory veto: aspiration without
 * a deliverable ("I want to create AI innovations") stays exploratory.
 */
const ASPIRATION_TO_PRODUCE_RE =
  /\b(?:i\s+)?(?:want|'?d\s+like|would\s+like|need|going|planning|gonna|wanna)\s+to\s+(?:create|make|build|draft|write|design|produce|put\s+together)\b/i;

/**
 * The canonical exploratory veto every natural-language caller consults. When
 * true (and no trusted provenance), no deterministic path may open Create.
 */
export function isExploratoryCreation(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (DESCRIPTIVE_CREATE_RE.test(t)) return true;
  return EXPLORATORY_CREATION_FRAMING_RE.test(t);
}

/** True when the user asks to open / navigate to Create. */
export function isExplicitCreateNavigation(text: string): boolean {
  return EXPLICIT_CREATE_NAV_RE.test(text.trim());
}

/** True when the user issues an immediate instruction to produce something now. */
export function hasImmediateProductionInstruction(text: string): boolean {
  const t = text.trim();
  return IMPERATIVE_PRODUCTION_RE.test(t) || TRANSFORM_PRODUCTION_RE.test(t);
}

/**
 * The single authority. Returns the full eligibility breakdown; callers that
 * only need the veto use `isExploratoryCreation`.
 */
export function isCreationExecutionRequest(
  text: string,
  opts?: CreationEligibilityOptions,
): CreationEligibility {
  const raw = text.trim();
  const exploratory = isExploratoryCreation(raw);
  const explicitNavigation = isExplicitCreateNavigation(raw);
  const immediateProduction = hasImmediateProductionInstruction(raw);
  const concreteDeliverable = mentionsCreateDeliverable(raw);

  const make = (
    eligible: boolean,
    provenance: CreationProvenance,
    reason: string,
  ): CreationEligibility => ({
    eligible,
    exploratory,
    explicitNavigation,
    immediateProduction,
    concreteDeliverable,
    provenance,
    reason,
  });

  // 1. Trusted provenance overrides all natural-language restrictions.
  if (opts?.uiActionHandoff) return make(true, "ui_handoff", "ui_action_handoff");
  if (opts?.researchHandoff) {
    return make(true, "research_handoff", "research_to_creation_handoff");
  }

  // 2. Explicit navigation to Create is always eligible.
  if (explicitNavigation) {
    return make(true, "explicit_navigation", "explicit_create_navigation");
  }

  // 3. A sentence that rejects Create is never eligible.
  if (isCreateRejection(raw)) return make(false, "none", "create_rejection");

  // 4. First-person intent to produce a CONCRETE deliverable is an execution
  //    request even under otherwise-exploratory framing ("I want to create a
  //    marketing plan"). Aspiration without a deliverable stays exploratory (5).
  if (ASPIRATION_TO_PRODUCE_RE.test(raw) && concreteDeliverable) {
    return make(true, "none", "aspiration_to_produce_deliverable");
  }

  // 5. Exploratory / descriptive framing vetoes natural-language create — even
  //    when a concrete deliverable noun is present in a question/evaluation form.
  if (exploratory) return make(false, "none", "exploratory_framing");

  // 5. An immediate production instruction directed at the system is eligible.
  if (immediateProduction) return make(true, "none", "immediate_production");

  // 6. Otherwise the create signal is too weak (bare verb / lone deliverable /
  //    capability mention) — stay in conversation.
  return make(false, "none", "insufficient_execution_signal");
}
