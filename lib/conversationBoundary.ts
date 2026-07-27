/**
 * Soft-Boundary Conversation Architecture — Stage S1 (PURE, UNWIRED).
 *
 * This module is intentionally NOT imported by any production code. It proves
 * that one small, deterministic decision can classify a conversational
 * transition BEFORE any existing state machine acts. No behavior changes.
 *
 * ── Contract boundary (client-readiness matrix) ─────────────────────────────
 * The Boundary Decision owns the TRANSITION TYPE. Each existing machine stays
 * the owner of its DOMAIN EXECUTION and its explicit safeguards, becoming a
 * CLIENT of this decision at wiring time (later stages):
 *
 *   Machine   | Client type | Boundary owns                    | Machine keeps (never delegated)
 *   ----------|-------------|----------------------------------|--------------------------------
 *   Topics    | full        | rebind/suspend/clear/restore     | topic store + slot
 *   Workflow  | full        | answer/continue/park/new-intent  | strategy classification + parse
 *   Pending   | partial     | is-this-an-answer-at-all         | which option (selection parse)
 *   Create    | full        | route/park/exit/resume           | draft + createLifecycle mechanics
 *   Offers    | partial     | invalidate-on-switch             | explicit accept/decline detection
 *
 * The decision is computed ONCE, early in the turn, from prior-state snapshots
 * + the message only (it never consumes the machines' outputs → no cycle).
 *
 * S1 uses conservative, explainable, deterministic evidence. Each local marker
 * helper below maps to an existing detector at wiring time (noted per helper);
 * the two substantive classifiers (deliverable vs errand) already exist and are
 * reused directly, to demonstrate the client model rather than duplicate logic.
 */

import { detectRegistryArtifact } from "./artifactRegistry";

export type ConversationBoundaryDecisionKind =
  | "continue_current_topic"
  | "expand_current_topic"
  | "answer_pending_question"
  | "interrupt_and_suspend"
  | "switch_topic"
  | "return_to_suspended_topic"
  | "cancel_current_workflow"
  | "unclear";

export type ConversationBoundaryDecision = {
  decision: ConversationBoundaryDecisionKind;
  confidence: "high" | "medium" | "low";
  /** Explainable: which evidence signals fired, in order. */
  evidence: string[];
  /** For return_to_suspended_topic — which suspended item to restore. */
  returnTargetId?: string;
  /** For switch/interrupt — park current work rather than destroy it. */
  suspend?: boolean;
};

// ── Input snapshots (plain data — no store coupling, fully testable) ─────────

export type BoundaryActiveTopic = {
  topicId: string;
  /** userGoal — what the topic is about. */
  goal: string;
  unresolvedNeed?: string;
  resolved: boolean;
  startedAtTurn: number;
  updatedAtTurn: number;
};

export type BoundaryActiveWork = {
  kind: "workflow" | "create";
  id: string;
  goal?: string;
  artifactType?: string;
  awaitingAnswer?: boolean;
  /** True when there's a draft / in-progress work worth preserving on interrupt. */
  suspendable: boolean;
};

export type BoundaryPendingQuestion = {
  kind: "menu" | "confirmation" | "strategy_disambiguation" | "scheduling" | "open";
  /** The SHAPE of answer this question expects. */
  expects: "selection" | "yes_no" | "date_or_day" | "free";
  choices?: string[];
};

export type BoundarySuspendedItem = {
  id: string;
  summary: string;
  suspendedAtTurn: number;
};

export type BoundaryTurnInput = {
  userText: string;
  turn: number;
  activeTopic?: BoundaryActiveTopic | null;
  activeWork?: BoundaryActiveWork | null;
  pendingQuestion?: BoundaryPendingQuestion | null;
  pendingOffer?: { summary: string; offeredAtTurn: number } | null;
  suspended?: BoundarySuspendedItem[] | null;
  lastAssistantText?: string;
};

// ── Evidence helpers (conservative, explainable) ─────────────────────────────

// Maps at wiring time to: isOverwhelmProblem / detectMemberEmotionalSignals.
const EMOTIONAL_URGENCY_RE =
  /\b(?:overwhelmed|really overwhelmed|so overwhelmed|anxious|panicking|freaking out|can'?t cope|can'?t handle|falling apart|breaking down|too much right now|so stressed|i'?m stressed|shutting down)\b/i;

// Maps to: outcomeThread topicChangeClearsThread / CANCEL_RE.
const EXPLICIT_CANCEL_RE =
  /\b(?:never ?mind|forget (?:it|that|this)|cancel (?:that|this|it)|scrap (?:it|that|this)|drop it|don'?t worry about (?:it|that)|let'?s not)\b/i;

// Maps to: createTurnRelationship EXPLICIT_RETURN_RE / matchResumeIntent (generalized).
const EXPLICIT_RETURN_RE =
  /\b(?:back to|return to|get back to|resume (?:the|my)|continue (?:with )?(?:the|my)|where (?:were|was) we|as i was saying|anyway,?\s+back)\b/i;

// Maps to: createTurnRelationship temporary-detour detection.
const TEMPORARY_DETOUR_RE =
  /\b(?:before we (?:continue|go on|move on)|quick (?:thing|question|aside)|one (?:quick )?(?:sec|second|thing)|hold on|real quick|side note|first,?\s+(?:let me|remind)|remind me)\b/i;

// Maps to: an expansion marker (new — not currently modeled anywhere).
const EXPANSION_MARKER_RE =
  /\b(?:i also (?:need|want)|also need|and i (?:also )?(?:need|want)|plus i|on top of that|as well|another thing i)\b/i;

// Maps to: activeTopicGate isExplicitTopicChangeRequest + Stage 1B pivot markers.
const NEW_SUBJECT_MARKER_RE =
  /\b(?:thinking about|what about|how about|switching gears|different (?:question|topic|subject)|by the way|unrelated)\b/i;

const PRIORITIZATION_GOAL_RE =
  /\b(?:what should i (?:do|tackle|focus on)|prioriti[sz]e|do first|where (?:do|should) i (?:start|begin)|what to do first|most important)\b/i;

const PRIORITY_ANSWER_RE =
  /\b(?:most urgent|urgent(?:est)?|first|priority|start with|begin with|do .* first|is the (?:most|one))\b/i;

const CONTENT_STOPWORDS = new Set([
  "about", "actually", "again", "already", "always", "because", "been",
  "before", "being", "could", "does", "doing", "done", "from", "have",
  "having", "into", "just", "like", "more", "most", "much", "need", "only",
  "over", "really", "should", "some", "still", "such", "than", "that", "their",
  "them", "then", "there", "these", "they", "thing", "things", "think",
  "thinking", "this", "those", "though", "through", "very", "want", "were",
  "what", "when", "where", "which", "while", "will", "with", "would", "your",
  "going", "maybe", "might", "also", "today", "urgent",
]);

function contentWords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !CONTENT_STOPWORDS.has(w)),
  );
}

export function sharesContentWord(a: string, b: string): boolean {
  const wb = contentWords(b);
  if (!wb.size) return false;
  for (const w of contentWords(a)) if (wb.has(w)) return true;
  return false;
}

export function hasEmotionalUrgency(t: string): boolean {
  return EMOTIONAL_URGENCY_RE.test(t);
}
export function hasExplicitCancel(t: string): boolean {
  return EXPLICIT_CANCEL_RE.test(t);
}
export function hasExplicitReturn(t: string): boolean {
  return EXPLICIT_RETURN_RE.test(t);
}
export function hasTemporaryDetourMarker(t: string): boolean {
  return TEMPORARY_DETOUR_RE.test(t);
}
export function hasExpansionMarker(t: string): boolean {
  return EXPANSION_MARKER_RE.test(t);
}
/** Reuses the artifact registry — the added item NAMES a real deliverable
 * (checklist/email/proposal/…), distinguishing "also need a packing checklist"
 * (expand) from "also need to call the dentist" (switch). */
export function mentionsDeliverable(t: string): boolean {
  return detectRegistryArtifact(t) !== null;
}

/** A substantive new statement (subject+predicate), not a short ack/answer. */
export function isSubstantiveNewSubject(t: string): boolean {
  const words = t.trim().split(/\s+/).filter(Boolean);
  if (words.length < 4) return false;
  if (/^\s*(?:yes|yeah|yep|sure|ok(?:ay)?|no|nope|not now)\b/i.test(t)) return false;
  return true;
}

function matchesPendingExpectedShape(
  t: string,
  q: BoundaryPendingQuestion,
): boolean {
  const text = t.trim();
  switch (q.expects) {
    case "date_or_day":
      return /\b(?:mon|tues|wednes|thurs|fri|satur|sun)day\b|\btomorrow\b|\btonight\b|\bnext week\b|\b\d{1,2}(?:st|nd|rd|th)?\b/i.test(
        text,
      );
    case "yes_no":
      return /^\s*(?:yes|yeah|yep|sure|ok(?:ay)?|no|nope|not now|please do|go ahead)\b/i.test(
        text,
      );
    case "selection": {
      if (/^\s*(?:\d+|first|second|third|fourth|last|the \w+)\s*$/i.test(text)) {
        return true;
      }
      const choices = q.choices ?? [];
      return choices.some((c) => text.toLowerCase().includes(c.toLowerCase()));
    }
    case "free":
      // Conservative: a short response that is not a new subject.
      return !isSubstantiveNewSubject(text);
    default:
      return false;
  }
}

function isDirectAnswerToOpenTopic(t: string, topic: BoundaryActiveTopic): boolean {
  if (topic.resolved) return false;
  if (!PRIORITIZATION_GOAL_RE.test(topic.goal)) return false;
  return PRIORITY_ANSWER_RE.test(t);
}

function continuesActiveWork(t: string, work: BoundaryActiveWork): boolean {
  // S1: only an explicit continuation counts (conservative). Wiring maps this to
  // resolveWorkflowResumeDecision / classifyCreateTurnRelationship high-confidence.
  if (!work.artifactType) return false;
  const re = new RegExp(`\\b${work.artifactType}\\b`, "i");
  return re.test(t) && (EXPLICIT_RETURN_RE.test(t) || work.awaitingAnswer === true);
}

function matchReturnTarget(
  t: string,
  suspended: BoundarySuspendedItem[],
): BoundarySuspendedItem | null {
  for (const item of suspended) {
    if (sharesContentWord(t, item.summary)) return item;
  }
  // Fallback: most recently suspended.
  return suspended.length
    ? suspended.reduce((a, b) => (b.suspendedAtTurn > a.suspendedAtTurn ? b : a))
    : null;
}

function decide(
  decision: ConversationBoundaryDecisionKind,
  confidence: ConversationBoundaryDecision["confidence"],
  evidence: string[],
  extra: Partial<ConversationBoundaryDecision> = {},
): ConversationBoundaryDecision {
  return { decision, confidence, evidence, ...extra };
}

/**
 * The single deterministic transition decision. Precedence (highest first):
 *   1 emotional urgency → interrupt_and_suspend
 *   2 explicit cancel   → cancel_current_workflow
 *   3 explicit return   → return_to_suspended_topic
 *   4 temporary detour  → interrupt_and_suspend
 *   5 direct pending answer (shape-compatible) → answer_pending_question
 *   6 active work continuation → continue_current_topic
 *   7 related expansion (marker + overlap|deliverable) → expand_current_topic
 *   8 topic continuity (overlap | answers open topic) → continue_current_topic
 *   9 substantive new subject → switch_topic
 *  10 else → unclear
 */
export function resolveConversationBoundary(
  input: BoundaryTurnInput,
): ConversationBoundaryDecision {
  const t = input.userText.trim();
  const topic = input.activeTopic ?? null;
  const work = input.activeWork ?? null;
  const suspendable =
    Boolean(work?.suspendable) || Boolean(topic && !topic.resolved);

  if (!t) return decide("unclear", "low", ["empty_message"]);

  // 1 — emotional urgency
  if (hasEmotionalUrgency(t)) {
    return decide("interrupt_and_suspend", "high", ["emotional_urgency"], {
      suspend: suspendable,
    });
  }
  // 2 — explicit cancel
  if (hasExplicitCancel(t)) {
    return decide("cancel_current_workflow", "high", ["explicit_cancel"]);
  }
  // 3 — explicit return
  if (input.suspended?.length && hasExplicitReturn(t)) {
    const target = matchReturnTarget(t, input.suspended);
    if (target) {
      return decide(
        "return_to_suspended_topic",
        "high",
        ["explicit_return", "return_target_match"],
        { returnTargetId: target.id },
      );
    }
  }
  // 4 — temporary detour (suspend current, do the quick thing)
  if (suspendable && hasTemporaryDetourMarker(t)) {
    return decide("interrupt_and_suspend", "high", ["temporary_detour_marker"], {
      suspend: true,
    });
  }
  // 5 — direct pending answer (shape must match; not a new subject)
  if (
    input.pendingQuestion &&
    matchesPendingExpectedShape(t, input.pendingQuestion) &&
    !isSubstantiveNewSubject(t)
  ) {
    return decide("answer_pending_question", "high", [
      "pending_answer_shape_match",
    ]);
  }
  // 6 — active work continuation
  if (work && continuesActiveWork(t, work)) {
    return decide("continue_current_topic", "medium", ["artifact_continuity"]);
  }
  // 7 — related expansion
  if (topic && hasExpansionMarker(t)) {
    const overlap = sharesContentWord(t, `${topic.goal} ${topic.unresolvedNeed ?? ""}`);
    if (overlap || mentionsDeliverable(t)) {
      return decide("expand_current_topic", "medium", [
        "expansion_marker",
        overlap ? "topic_overlap" : "deliverable_addition",
      ]);
    }
  }
  // 8 — topic continuity
  if (topic && !topic.resolved) {
    if (sharesContentWord(t, `${topic.goal} ${topic.unresolvedNeed ?? ""}`)) {
      return decide("continue_current_topic", "medium", ["topic_overlap"]);
    }
    if (isDirectAnswerToOpenTopic(t, topic)) {
      return decide("continue_current_topic", "medium", [
        "answers_open_topic_question",
      ]);
    }
  }
  // 9 — substantive new subject
  if (isSubstantiveNewSubject(t) || NEW_SUBJECT_MARKER_RE.test(t)) {
    return decide("switch_topic", "medium", ["substantive_new_subject", "no_overlap"], {
      suspend: suspendable,
    });
  }
  // 10 — insufficient evidence
  return decide("unclear", "low", ["insufficient_evidence"]);
}
