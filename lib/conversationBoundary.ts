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

import { namesDeliverableTerm } from "./artifactRegistry";

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

/**
 * General semantic role of a pending answer — workflow-agnostic. A Create
 * workflow's discovery slot (what/why/who/success) is mapped to one of these by
 * the wiring adapter; the Boundary evaluates role conformance structurally and
 * never contains domain vocabulary.
 */
export type PendingAnswerRole =
  | "recipient"
  | "goal"
  | "subject"
  | "outcome"
  | "tone"
  | "date"
  | "decision"
  | "quantity"
  | "freeform";

export type BoundaryPendingQuestion = {
  kind: "menu" | "confirmation" | "strategy_disambiguation" | "scheduling" | "open";
  /** The SHAPE of answer this question expects. */
  expects: "selection" | "yes_no" | "date_or_day" | "free";
  choices?: string[];
  /** S4.1 — semantic role of the pending slot (Create discovery). */
  role?: PendingAnswerRole;
  /**
   * Roles of slots still outstanding in this Create discovery. A member may
   * answer a slot that was not the one just asked ("the purpose" while "who" is
   * pending); the reply fills the pending Create if it plausibly satisfies ANY
   * outstanding role.
   */
  outstandingRoles?: readonly PendingAnswerRole[];
  /**
   * Authored answer affordances from the outstanding discovery questions
   * (each workflow's own signalPatterns). Passed as data; the Boundary matches
   * them but never defines domain words itself.
   */
  affordances?: readonly RegExp[];
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

// A bare hesitation / incomplete pivot ("Actually…", "Um…", "Wait") — the member
// is reconsidering, not answering. Matches the marker ALONE (optionally with
// trailing punctuation/ellipsis); "Actually, make it warmer" carries content and
// does NOT match, so genuine corrections still flow through normally.
const BARE_HESITATION_RE =
  /^\s*(?:actually|hmm+|umm*|uh+|er+|well|wait|hold on|let me think|one sec|hang on)[\s.,!?…]*$/i;

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

// ── General role-shape evidence (S4.1) — structural only, no domain words ─────

/** Purpose / accomplishment: "to <verb>…", "so that…", "because…", "for…". */
const GOAL_SHAPE_RE =
  /^\s*(?:to|so(?:\s+that)?|because|in order to|for)\b|\bi (?:want|need|hope|plan|would like|am trying) to\b/i;
/** A finite verb — marks a full clause, so the reply is NOT a bare entity/topic. */
const CLAUSE_VERB_RE =
  /\b(?:is|are|was|were|be|been|being|am|has|have|had|do|does|did|will|would|can|could|should|must|need|needs|want|wants|threw|broke|ruined|got|get|goes|went|feel|feels|feeling|happened|left|said)\b/i;
/** Temporal expression — a day, relative day, month, or a bare date number. */
const DATE_SHAPE_RE =
  /\b(?:mon|tues|wednes|thurs|fri|satur|sun)day\b|\b(?:tomorrow|tonight|today|this (?:morning|afternoon|evening|week|month)|next (?:week|month)|morning|afternoon|evening|noon)\b|\b\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i;
const QUANTITY_SHAPE_RE =
  /\b\d+\b|\b(?:one|two|three|four|five|six|seven|eight|nine|ten|several|a few|a couple|dozen|hundred|thousand)\b/i;

function isBriefReply(t: string): boolean {
  return t.trim().split(/\s+/).filter(Boolean).length <= 5;
}

/**
 * Does the reply STRUCTURALLY fit a general answer role? No domain vocabulary —
 * shape only. Weak/open roles (subject, outcome, freeform) return false here and
 * rely on the workflow's authored affordances instead of broad guessing.
 */
function fitsRole(t: string, role: PendingAnswerRole): boolean {
  const text = t.trim();
  switch (role) {
    case "goal":
      return GOAL_SHAPE_RE.test(text);
    case "date":
      return DATE_SHAPE_RE.test(text);
    case "quantity":
      return QUANTITY_SHAPE_RE.test(text);
    case "decision":
      return /^\s*(?:yes|yeah|yep|sure|ok(?:ay)?|no|nope|not now|please do|go ahead|let'?s|do it|neither|both)\b/i.test(
        text,
      );
    case "recipient":
    case "tone":
      // A brief entity/descriptor — not a full clause (which signals a narrative
      // interruption like "the carpet is ruined").
      return isBriefReply(text) && !CLAUSE_VERB_RE.test(text);
    case "subject":
    case "outcome":
    case "freeform":
    default:
      return false;
  }
}

/**
 * Whether the message FILLS the pending slot (S4.1 — slot-aware ownership).
 *
 * Explicit shapes (selection / yes-no / date) remain a shape match. For a Create
 * discovery question, the reply fills the slot when it (1) matches an authored
 * affordance (the workflow's own signalPatterns), or (2) structurally fits the
 * pending or any outstanding role, or — only when no role metadata is present
 * (legacy non-Create free questions) — is a short non-new-subject reply. A bare
 * hesitation ("Actually…") never fills a slot; goal/content overlap is not used.
 */
function answerFillsPendingSlot(
  t: string,
  q: BoundaryPendingQuestion,
): boolean {
  const text = t.trim();
  if (!text) return false;
  if (BARE_HESITATION_RE.test(text)) return false;

  if (q.expects !== "free") {
    return matchesPendingExpectedShape(t, q) && !isSubstantiveNewSubject(t);
  }

  // 1 — authored affordance (each workflow's own signalPatterns, passed as data).
  if (q.affordances?.some((re) => re.test(text))) return true;

  // 2 — general role shape: the pending slot OR any still-outstanding slot
  // (members often answer a slot other than the one just asked).
  const roles = [q.role, ...(q.outstandingRoles ?? [])].filter(
    (r): r is PendingAnswerRole => Boolean(r),
  );
  if (roles.some((role) => fitsRole(text, role))) return true;

  // 3 — legacy non-Create free question (no role metadata): conservative short answer.
  if (roles.length === 0) return !isSubstantiveNewSubject(text);

  return false;
}

// A short answer-shaped reply (article/hedge lead-in or a bare selection).
const SHORT_ANSWER_SHAPE_RE =
  /^\s*(?:the|a|an|my|our|probably|maybe|i think|i'?d say|it'?s|it is|that'?d be|let'?s do|do the|start with)\b/i;

/**
 * NARROW continuation evidence — deliberately named for what it covers. It only
 * recognizes a short answer to an unresolved PRIORITIZATION / open-choice topic
 * ("what should I do first?"); it does NOT handle all open questions. Requires
 * the prioritization context, so a short noun phrase without such a context is
 * NOT treated as continuation, and long statements are excluded.
 */
function answersPrioritizationTopic(t: string, topic: BoundaryActiveTopic): boolean {
  if (topic.resolved) return false;
  if (!PRIORITIZATION_GOAL_RE.test(topic.goal)) return false;
  if (NEW_SUBJECT_MARKER_RE.test(t)) return false;
  if (t.trim().split(/\s+/).filter(Boolean).length > 8) return false;
  return PRIORITY_ANSWER_RE.test(t) || SHORT_ANSWER_SHAPE_RE.test(t);
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
  // 5 — direct pending answer (slot-aware, S4.1). The Boundary is the single
  // authority on whether a turn fills the pending discovery slot: an authored
  // affordance, or a structural fit for the pending/outstanding role. An
  // unrelated substantive statement falls through to interrupt/switch below.
  if (input.pendingQuestion && answerFillsPendingSlot(t, input.pendingQuestion)) {
    return decide("answer_pending_question", "high", ["pending_slot_fill"]);
  }
  // 6 — active work continuation
  if (work && continuesActiveWork(t, work)) {
    return decide("continue_current_topic", "medium", ["artifact_continuity"]);
  }
  // 7 — related expansion
  if (topic && hasExpansionMarker(t)) {
    const overlap = sharesContentWord(t, `${topic.goal} ${topic.unresolvedNeed ?? ""}`);
    if (overlap || namesDeliverableTerm(t)) {
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
    if (answersPrioritizationTopic(t, topic)) {
      return decide("continue_current_topic", "medium", [
        "answers_prioritization_topic",
      ]);
    }
  }
  // 9 — substantive new subject. A CLEAR switch needs real substance: an explicit
  // new-subject marker, or a substantive statement carrying ≥2 content words ("my
  // dog threw up on the carpet"). A short substantive fragment with <2 content
  // words ("they need to know") is genuinely ambiguous — it neither fills the slot
  // nor clearly switches — so it falls through to unclear (clarify), never a
  // silent switch/park.
  if (
    NEW_SUBJECT_MARKER_RE.test(t) ||
    (isSubstantiveNewSubject(t) && contentWords(t).size >= 2)
  ) {
    return decide("switch_topic", "medium", ["substantive_new_subject", "no_overlap"], {
      suspend: suspendable,
    });
  }
  // 10 — insufficient evidence
  return decide("unclear", "low", ["insufficient_evidence"]);
}
