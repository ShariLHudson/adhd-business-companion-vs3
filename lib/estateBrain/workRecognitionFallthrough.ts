/**
 * Universal Work Recognition — the additive fallthrough seam (2026-08-06).
 *
 * Analysis: docs/create-experience/UNIVERSAL_WORK_RECOGNITION_ARCHITECTURE_ANALYSIS.md
 * Approved scope: Step 1 only. Recognition + the understanding conversation.
 * Never opens a workspace (that convergence is explicitly Step 2, deferred).
 *
 * This module is called from exactly ONE place: the final fallthrough in
 * resolveFrictionlessActionImpl (lib/frictionlessActionLayer.ts), immediately
 * before it gives up and returns category: "none". By construction, every
 * other recognizer (goal classification, discoveryMode's 4 topics,
 * capabilityRegistry, universal creation, coaching, navigation, emotional
 * support, …) has already run and failed to match by the time this fires —
 * so this can never preempt or regress a currently-working route. handleSend
 * is not modified; Chamber inherits this for free because it shares
 * handleSend's pipeline verbatim (verified in the architecture analysis).
 *
 * No new conversation engine: the actual multi-turn walk reuses
 * lib/createEstate/entranceUnderstanding.ts's exact exported functions —
 * the same question data, prefill, acknowledgment, and skip logic Create's
 * own entrance already uses and already tests. This module adds only what
 * chat needs on top: (1) a detector that recognizes work from REQUEST SHAPE
 * rather than literal create/plan/develop/build/improve keywords — the
 * "I need to know how to X" ADHD-context intelligence the founder asked
 * for, not a keyword list — and (2) a small chat-native session so the
 * conversation survives across message round-trips (mirrors
 * discoveryMode.ts's saveDiscoverySession/loadDiscoverySession pattern
 * exactly, under its own storage key so the two never collide).
 */

import {
  advanceEntranceUnderstanding,
  startEntranceUnderstanding,
  type EntranceUnderstandingSession,
  type EntranceUnderstandingStep,
} from "@/lib/createEstate/entranceUnderstanding";
import { DISCOVERY_QUESTIONS } from "@/lib/estateBrain/discoveryRegistry";

// ---------------------------------------------------------------------------
// Shape detection — request shapes, not keywords.
// ---------------------------------------------------------------------------

export type WorkRecognitionVerb = "create" | "plan" | "develop" | "build" | "improve";

export type WorkRecognitionMatch = {
  verb: WorkRecognitionVerb;
  /** Spoken before the first question — recognizes the work, not a generic intro. */
  acknowledgment: string;
};

// Excluded first — a factual/definitional question is never work, however
// the shapes below might otherwise brush against its wording.
const FACTUAL_QUESTION_RE =
  /^(?:what|who|when|where|which)\s+(?:is|are|was|were|does|do|did)\b/i;
const FACTUAL_HOW_QUANTITY_RE = /\bhow\s+(?:old|many|much|long|far|often)\b/i;

// "I need to know how to X" / "I want to learn how to X" — procedural
// framing NOT covered by the existing HOW_TO_OPENER_RE (which only matches
// "how do I / how can I / show me how to…"). This is the exact Loom-example
// shape: the member isn't asking a trivia question, they're describing
// something they'll need to do again — a repeatable process.
const PROCEDURAL_HOWTO_RE =
  /\b(?:i need to know|i want to know|i need to learn|i want to learn|i'?d like to learn|can you teach me|someone (?:needs?|has) to teach me)\s+how to\b/i;

// "I need a better way to X" / ongoing friction with something already
// being done — improving an existing process, not starting one.
const IMPROVE_BETTER_WAY_RE = /\bi need a better way to\b/i;
const IMPROVE_STRUGGLE_RE =
  /\b(?:i'?m struggling to|i keep forgetting to|it'?s hard(?: for me)? to)\b[\s\S]{0,40}\b(?:keep|stay|track|organi[sz]e|manage|remember|follow up|follow through|keep up)\b/i;
const IMPROVE_BROKEN_RE =
  /\bmy \w+(?:\s+\w+){0,3}\s+(?:isn'?t working|keeps? falling apart|is a mess|is chaos|is a disaster)\b/i;

// "I need help organizing X" / "I need a system for X" — building a system
// or structure, not answering a question about one.
const BUILD_SYSTEM_HELP_RE =
  /\bi (?:need|want)(?: some)? help (?:organizing|managing|structuring|systemizing|setting up|keeping track of)\b/i;
const BUILD_SYSTEM_FOR_RE =
  /\bi (?:need|want) (?:a|an) (?:system|process|workflow|routine|structure) for\b/i;

// Explicit develop/build/improve verbs — today recognized NOWHERE (the
// existing goal classifier has "create" and "plan_strategy" categories but
// none for these three; confirmed in the architecture analysis).
const EXPLICIT_VERB_RE =
  /\b(?:i (?:need|want)(?: to)?|help me|i'?d like to)\s+(develop|build|improve)\b/i;

function acknowledgmentFor(verb: WorkRecognitionVerb): string {
  switch (verb) {
    case "develop":
      return "It sounds like you want a repeatable process for this — not a one-time answer. Let's build that together.";
    case "build":
      return "That sounds like something worth setting up as a real system, not something to figure out fresh every time.";
    case "improve":
      return "Sounds like the way you're doing this now isn't quite working. Let's make it better, together.";
    case "plan":
      return "Let's think this through together before diving in.";
    case "create":
      return "I'd love to help you create that.";
  }
}

/**
 * Recognizes work from request SHAPE — the ADHD-context intelligence layer.
 * Returns null for anything that isn't clearly work-shaped, including every
 * pure factual/definitional question. Order matters: explicit verbs are the
 * most confident signal and are checked first; the rest are checked in a
 * fixed, deterministic order (a message need only match one shape).
 */
export function detectWorkRecognitionShape(
  text: string,
): WorkRecognitionMatch | null {
  const t = text.trim();
  if (!t) return null;
  if (FACTUAL_QUESTION_RE.test(t) || FACTUAL_HOW_QUANTITY_RE.test(t)) {
    return null;
  }

  const explicitVerb = EXPLICIT_VERB_RE.exec(t);
  if (explicitVerb) {
    const verb = explicitVerb[1]!.toLowerCase() as WorkRecognitionVerb;
    return { verb, acknowledgment: acknowledgmentFor(verb) };
  }

  if (PROCEDURAL_HOWTO_RE.test(t)) {
    return { verb: "develop", acknowledgment: acknowledgmentFor("develop") };
  }

  if (
    IMPROVE_BETTER_WAY_RE.test(t) ||
    IMPROVE_STRUGGLE_RE.test(t) ||
    IMPROVE_BROKEN_RE.test(t)
  ) {
    return { verb: "improve", acknowledgment: acknowledgmentFor("improve") };
  }

  if (BUILD_SYSTEM_HELP_RE.test(t) || BUILD_SYSTEM_FOR_RE.test(t)) {
    return { verb: "build", acknowledgment: acknowledgmentFor("build") };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Chat-native session persistence — mirrors discoveryMode.ts's
// save/loadDiscoverySession exactly, own storage key so the two never
// collide (this holds an EntranceUnderstandingSession, not a DiscoverySession).
// ---------------------------------------------------------------------------

const STORAGE_KEY = "estate-work-recognition-session-v1";

function saveWorkRecognitionSession(
  session: EntranceUnderstandingSession | null,
): void {
  if (typeof window === "undefined") return;
  if (!session) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function loadWorkRecognitionSession(): EntranceUnderstandingSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as EntranceUnderstandingSession;
  } catch {
    return null;
  }
}

export function clearWorkRecognitionSession(): void {
  saveWorkRecognitionSession(null);
}

export function resetWorkRecognitionSessionForTests(): void {
  saveWorkRecognitionSession(null);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Built from the LIVE create_general prompts, never hand-copied — this
// cannot silently drift if that question set's wording ever changes.
const WORK_RECOGNITION_MARKER_RE = new RegExp(
  DISCOVERY_QUESTIONS.create_general.map((q) => escapeRegExp(q.prompt)).join("|"),
  "i",
);

/** Was the previous assistant turn one of THIS module's own questions? */
export function isWorkRecognitionMessage(text: string): boolean {
  return WORK_RECOGNITION_MARKER_RE.test(text);
}

// ---------------------------------------------------------------------------
// The seam.
// ---------------------------------------------------------------------------

export type WorkRecognitionTurnResult =
  | {
      kind: "question";
      message: string;
      session: EntranceUnderstandingSession;
    }
  | { kind: "understood"; message: string };

function messageForConfirmLikeOutcome(
  outcome: Extract<
    EntranceUnderstandingStep,
    { kind: "classify" }
  >["outcome"],
): string {
  if (
    outcome.kind === "confirm" ||
    outcome.kind === "clarify" ||
    outcome.kind === "error"
  ) {
    return outcome.message;
  }
  // Defensive — resolveCreateBeginOutcome no longer returns "open"
  // (entranceUnderstanding.ts's own comment); kept exhaustive for the type.
  return "It sounds like you're ready to build this.";
}

function applyStep(
  step: EntranceUnderstandingStep,
  firstAcknowledgment: string | null,
): WorkRecognitionTurnResult {
  if (step.kind === "question") {
    saveWorkRecognitionSession(step.session);
    // First question of a NEW conversation: lead with the verb-specific
    // recognition line instead of entranceUnderstanding's generic shared
    // intro (that intro is Create-entrance copy, reused as data here, not
    // restyled — the recognition line is this module's own).
    const message =
      firstAcknowledgment !== null
        ? [firstAcknowledgment, step.question.prompt]
            .filter((p) => Boolean(p?.trim()))
            .join("\n\n")
        : [step.acknowledgment, step.question.prompt]
            .filter((p) => Boolean(p?.trim()))
            .join("\n\n");
    return { kind: "question", message, session: step.session };
  }

  // classify — recognition + confirmation only. Never opens a workspace;
  // that convergence is Step 2, explicitly deferred.
  clearWorkRecognitionSession();
  const message = [
    step.acknowledgment,
    messageForConfirmLikeOutcome(step.outcome),
    "When you're ready, we can start shaping this together.",
  ]
    .filter((p) => Boolean(p?.trim()))
    .join("\n\n");
  return { kind: "understood", message };
}

/**
 * The one function frictionlessActionLayer.ts calls, and only at the final
 * fallthrough. Returns null for anything not recognized as work OR not a
 * continuation of an in-flight recognition conversation — callers should
 * treat null exactly like "no match, continue current behavior."
 */
export function resolveWorkRecognitionFallthrough(
  userText: string,
  lastAssistantText?: string | null,
): WorkRecognitionTurnResult | null {
  const text = userText.trim();
  if (!text) return null;

  if (lastAssistantText && isWorkRecognitionMessage(lastAssistantText)) {
    const stored = loadWorkRecognitionSession();
    if (stored) {
      const step = advanceEntranceUnderstanding(stored, text);
      return applyStep(step, null);
    }
  }

  const shape = detectWorkRecognitionShape(text);
  if (!shape) return null;

  const step = startEntranceUnderstanding(text);
  if (!step) return null;
  return applyStep(step, shape.acknowledgment);
}
