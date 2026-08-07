/**
 * Universal Work Recognition (2026-08-06). Two entry points, called from two
 * different priorities in resolveFrictionlessActionImpl
 * (lib/frictionlessActionLayer.ts):
 *
 * - resolveWorkRecognitionResumption — called EARLY, right after the
 *   highest-priority structural checks (pending choices, casual updates)
 *   and before goal classification / capability routing run. "If the
 *   member is already inside an active reasoning journey, their response
 *   belongs to that journey unless they explicitly request a different
 *   direction" (AT-5.7 fix). Returns null immediately unless a session is
 *   genuinely already open — a message with no active journey is entirely
 *   unaffected and falls through to every existing detector unchanged.
 * - resolveWorkRecognitionNewRecognition — called LATE, at the final
 *   fallthrough, only after every other recognizer (including the early
 *   resumption call above) has already failed to match. This is the
 *   original Step 1 seam: by construction it can never preempt or regress
 *   a currently-working route.
 *
 * Analysis: docs/create-experience/UNIVERSAL_WORK_RECOGNITION_ARCHITECTURE_ANALYSIS.md
 * Approved scope: recognition + the understanding conversation only. Never
 * opens a workspace (that convergence is explicitly Step 2, deferred).
 * handleSend is not modified in either case; Chamber inherits both for free
 * because it shares handleSend's pipeline verbatim (verified in the
 * architecture analysis).
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
  armEntranceUnderstandingHandoff,
  startEntranceUnderstanding,
  startEntranceUnderstandingForCatalogType,
  type EntranceUnderstandingSession,
  type EntranceUnderstandingStep,
} from "@/lib/createEstate/entranceUnderstanding";
import { DISCOVERY_QUESTIONS } from "@/lib/estateBrain/discoveryRegistry";
import { isExplicitNavigationIntent } from "@/lib/conversationStabilization/goalClassifier";
import { resolveCreateFoundationClassification } from "@/lib/creationIdentity/createFoundationRouting";
import { SIMPLE_CREATE_VERB_RE } from "@/lib/universalCreation/createFastPath";

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

// Explicit create/plan/develop/build/improve verbs, checked here ONLY at
// the last-resort fallthrough — by construction (see file header) this can
// only fire when nothing earlier in the pipeline already claimed the turn.
//
// Phase B (2026-08-07) — added create/plan. Confirmed by direct pipeline
// trace before landing: "I want to create a workshop." and "I need to plan
// a...retreat." both fall through completely unclaimed today (event-domain
// requests are explicitly excluded from lib/universalCreation's document
// classification — see orchestrator.ts's detectUniversalDocumentType — and
// have no other positive claimant), so widening this regex is safe for
// those shapes. It does NOT reach every create-shaped request: a request
// whose document type resolves to Create Foundation directly (newsletter,
// SOP, proposal, checklist, ...) is claimed several steps earlier in
// lib/frictionlessActionLayer.ts (the isSimpleCreateRequest / Create
// Foundation gate) and never reaches this file at all — a distinct,
// larger-blast-radius gap tracked separately, not fixed here.
// See docs/create-experience/WORK_RECOGNITION_ACCEPTANCE_TESTS.md.
const EXPLICIT_VERB_RE =
  /\b(?:i (?:need|want)(?: to)?|help me|i'?d like to)\s+(create|plan|develop|build|improve)\b/i;

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
  | {
      kind: "understood";
      message: string;
      /**
       * Phase C-2 (2026-08-07) — set only once the member has given the
       * explicit go-ahead after the confirm message (see
       * CREATE_FOUNDATION_READY_LINE below). Present only for typed
       * (catalogTypeLabel) sessions — Work Recognition's own untyped path
       * still never opens a workspace, unchanged from Phase 1. Consumed by
       * lib/frictionlessActionLayer.ts -> FrictionlessActionDecision's
       * immediateCreateFoundationOpen -> CompanionPageClient.tsx's
       * startFreshCreateFromEstate — the SAME function the Create entrance
       * catalog's own confirm click already calls.
       */
      openWorkspace?: { artifactType: string; initialPrompt: string };
    };

// Fixed, markable closing line for a typed (Create Foundation) confirm —
// distinct from the generic "When you're ready..." line below so a
// follow-up reply can be recognized as answering THIS specific prompt.
// The 130 One Creation Rule / entranceUnderstanding.ts's own header
// comment ("this module only ever returns the classifier's own
// confirm/clarify outcomes — it cannot open Work") means an explicit
// member gesture is required before startFreshCreateFromEstate runs — this
// line, and the member's reply to it, is that gesture's chat-side
// equivalent to CreateEstateEntrancePanel.tsx's confirm button click.
const CREATE_FOUNDATION_READY_LINE =
  "Say the word and I'll get your workspace ready.";

function isCreateFoundationReadyMessage(text: string): boolean {
  return text.includes(CREATE_FOUNDATION_READY_LINE);
}

// Deliberately NOT importing frictionlessActionLayer.ts's own
// isFrictionlessAffirmation/AFFIRMATION_RE — that file imports FROM this
// one (resolveCreateFoundationRecognition et al.), so importing back would
// be circular. A small, self-contained pattern, same spirit as the other
// locally-defined shape regexes in this file.
const SIMPLE_AFFIRMATION_RE =
  /^(?:yes(?:\s+please)?|yep|yeah|yup|sure|ok(?:ay)?|please|do that|let'?s do (?:it|that)|go ahead|sounds good|that works|start|create it|open it)\.?$/i;

function isSimpleAffirmation(text: string): boolean {
  return SIMPLE_AFFIRMATION_RE.test(text.trim());
}

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

  // Phase C-2 — a typed (Create Foundation) confirm is one explicit "yes"
  // away from opening the workspace. Keep the session alive (do not clear)
  // so resolveWorkRecognitionResumption can recognize that reply next
  // turn; the untyped Work Recognition path below is completely unchanged.
  if (step.session.catalogTypeLabel && step.outcome.kind === "confirm") {
    saveWorkRecognitionSession(step.session);
    const message = [
      step.acknowledgment,
      messageForConfirmLikeOutcome(step.outcome),
      CREATE_FOUNDATION_READY_LINE,
    ]
      .filter((p) => Boolean(p?.trim()))
      .join("\n\n");
    return { kind: "understood", message };
  }

  // classify — Work Recognition's own untyped path. Recognition +
  // confirmation only, never opens a workspace (unchanged from Phase 1 —
  // this module still has no way to know what the member meant well
  // enough to open Work on its own for a non-catalog, non-classified
  // request).
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
 * Priority fix (2026-08-06) — "if the member is already inside an active
 * reasoning journey, their response belongs to that journey unless they
 * explicitly request a different direction." Call this EARLY — before goal
 * classification / capability routing get a chance to hijack the reply
 * (frictionlessActionLayer.ts's insertion point sits right after the
 * highest-priority structural checks — pending choices, casual updates —
 * and before routingPipeline/executeEstateIntelligence run). This is the
 * fix for AT-5.7 (Research Inside Creation): "No but need help with some
 * research" mid-newsletter-journey previously matched isResearchIntent's
 * literal "research" pattern before this module ever got a chance to see
 * it was a continuation.
 *
 * Deliberately narrow: returns non-null ONLY when a session is genuinely
 * already open (isWorkRecognitionMessage(lastAssistantText) AND a stored
 * session) — a message with no active journey behind it always returns
 * null here, unaffected, and falls through to every existing detector
 * exactly as before (research routing included). Explicit redirects
 * (isExplicitNavigationIntent) are honored — the member's own "take me
 * to…" wins over an in-flight journey, exactly as instructed.
 *
 * Scope, exactly as approved: priority only. No research choices, no
 * research execution, no new UI — the member's reply is recorded through
 * entranceUnderstanding.ts's own existing answer/skip logic, unchanged.
 */
export function resolveWorkRecognitionResumption(
  userText: string,
  lastAssistantText?: string | null,
): WorkRecognitionTurnResult | null {
  const text = userText.trim();
  if (!text) return null;
  if (!lastAssistantText) return null;

  // Phase C-2 — the explicit "yes" to a typed confirm's ready-line is what
  // actually arms the handoff and opens the workspace. Checked BEFORE the
  // question-marker check below: the ready-line is not one of
  // DISCOVERY_QUESTIONS' prompts, so isWorkRecognitionMessage would reject
  // it otherwise. A non-affirmative reply (or no stored session) falls
  // through to null — normal chat routing handles it, and the session is
  // left in place rather than force-opened or silently discarded.
  if (isCreateFoundationReadyMessage(lastAssistantText)) {
    const stored = loadWorkRecognitionSession();
    if (stored?.catalogTypeLabel && isSimpleAffirmation(text)) {
      armEntranceUnderstandingHandoff(stored);
      clearWorkRecognitionSession();
      return {
        kind: "understood",
        message: `Opening your ${stored.catalogTypeLabel} now.`,
        openWorkspace: {
          artifactType: stored.catalogTypeLabel,
          initialPrompt: stored.originalText || "",
        },
      };
    }
    return null;
  }

  if (!isWorkRecognitionMessage(lastAssistantText)) {
    return null;
  }
  const stored = loadWorkRecognitionSession();
  if (!stored) return null;

  // "Unless they explicitly request a different direction" — an explicit
  // navigation signal wins; let normal routing handle it this turn. The
  // session is left in place (not cleared) — a genuine redirect, not a
  // reason to lose the journey's gathered context.
  if (isExplicitNavigationIntent(text)) return null;

  const step = advanceEntranceUnderstanding(stored, text);
  return applyStep(step, null);
}

/**
 * New-recognition only — called from the LATE fallthrough, after every
 * existing recognizer (including resolveWorkRecognitionResumption's own
 * early call — session continuation never reaches here, it already
 * returned) has failed to match. Unchanged from Step 1 except that
 * continuation logic now lives in resolveWorkRecognitionResumption instead
 * of being duplicated here.
 */
export function resolveWorkRecognitionNewRecognition(
  userText: string,
): WorkRecognitionTurnResult | null {
  const text = userText.trim();
  if (!text) return null;

  const shape = detectWorkRecognitionShape(text);
  if (!shape) return null;

  const step = startEntranceUnderstanding(text);
  if (!step) return null;
  return applyStep(step, shape.acknowledgment);
}

/**
 * Phase C-1 (2026-08-07) — Create Foundation convergence. A chat message
 * that resolveCreateFoundationClassification classifies as a Create
 * Foundation direct type (newsletter, SOP, checklist, proposal, ...)
 * previously reached a dead "none" decision several steps before this
 * module's own shape-based fallthrough ever got a chance (see
 * EXPLICIT_VERB_RE's own comment, and
 * docs/create-experience/WORK_RECOGNITION_ACCEPTANCE_TESTS.md case 2).
 *
 * This hands off to the SAME typed conversation the working Create-entrance
 * catalog pick already uses (startEntranceUnderstandingForCatalogType) —
 * no new classifier, no new conversation logic, no new engine. The
 * classification label IS the catalog label; it is trusted, never
 * re-derived, exactly like a real catalog pick.
 *
 * Safety: resolveCreateFoundationClassification alone is NOT a safe gate on
 * its own — deriveCreationIdentity's fallback classifies literally any text
 * as at least "Document" (a Create Foundation direct label), so this
 * function requires SIMPLE_CREATE_VERB_RE (an explicit create/plan/
 * develop/build/... + article verb phrase) rather than trusting the caller.
 * Deliberately NOT the narrower isSimpleCreateRequest: that function's own
 * ARTIFACT_INFERENCE list doesn't recognize "checklist" (or several other
 * Create Foundation direct labels) as a document type at all, so gating on
 * it would silently exclude legitimate Create Foundation types from ever
 * reaching this function, even standalone. SIMPLE_CREATE_VERB_RE is
 * imported, not re-derived — the same pattern createFastPath.ts's own
 * broader permissive branch already relies on for the same reason.
 *
 * Scope, exactly as approved for C-1: only the hard-exit call site inside
 * resolveFrictionlessActionImpl itself is wired to this function.
 * resolveCreateFastPathAction (a separately certified boundary — see
 * docs/create-experience/standards/076_CREATE_FOUNDATION_CERTIFICATION.md)
 * and tryUniversalCreationFlow's own internal declines are deliberately
 * left untouched — narrower than originally scoped in
 * CREATE_FOUNDATION_PHASE_C_PLAN.md, once 076's certification weight on
 * that function was found. Flagged as a possible follow-up, not required
 * for the reported bug (a bare chat message reaches the hard-exit site
 * this function is wired to).
 */
export function resolveCreateFoundationRecognition(
  userText: string,
): WorkRecognitionTurnResult | null {
  const text = userText.trim();
  if (!text) return null;
  if (!SIMPLE_CREATE_VERB_RE.test(text)) return null;

  const classification = resolveCreateFoundationClassification(text);
  if (!classification.routeDirectlyToCreateFoundation) return null;

  const step = startEntranceUnderstandingForCatalogType(
    classification.classificationType,
    text,
  );
  return applyStep(step, acknowledgmentFor("create"));
}
