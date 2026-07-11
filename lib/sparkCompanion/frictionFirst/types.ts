/**
 * Friction First — diagnose the obstacle before prescribing a path.
 *
 * @see docs/spark-estate/Friction First (V4 constitution)
 */

export const FRICTION_FIRST_GOVERNING_QUESTION =
  "What is making this difficult today?" as const;

export const FRICTION_FIRST_CORE_BELIEF = [
  "People are not broken.",
  "People are not lazy.",
  "Most struggle is friction — not lack of effort.",
  "Remove friction; progress becomes easier.",
] as const;

export type FocusSituation =
  | "want_focus_cant"
  | "resistance_not_want"
  | "unknown";

export type FrictionBarrierId =
  | "mind_full"
  | "mentally_exhausted"
  | "worrying"
  | "task_too_big"
  | "dont_know_start"
  | "dont_want_to"
  | "attention_pulled"
  | "something_else";

export type FrictionDomain =
  | "focus"
  | "writing"
  | "decision"
  | "research"
  | "planning"
  | "learning"
  | "business"
  | "general";

export type FrictionBarrier = {
  id: FrictionBarrierId;
  emoji: string;
  label: string;
  /** One barrier → one next step (member-facing) */
  nextStep: string;
  /** Optional internal capability hint for routing layer */
  capabilityHint?: string;
};

export type FrictionFirstDecision = {
  active: boolean;
  domain: FrictionDomain;
  focusSituation: FocusSituation;
  reason: string;
};

export type FrictionFirstSession = {
  domain: FrictionDomain;
  focusSituation: FocusSituation;
  barrierIds: readonly FrictionBarrierId[];
  offeredAtTurn: number;
  originalUserText: string;
};

export type ResolveFrictionBarrierInput = {
  userText: string;
  session: FrictionFirstSession;
};

export type ResolveFrictionBarrierResult =
  | { kind: "matched"; barrier: FrictionBarrier; reply: string }
  | { kind: "something_else"; reply: string }
  | { kind: "unrecognized"; reply: string | null };
