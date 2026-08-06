/**
 * Chat-First Reasoning Phase 1 (2026-08-06) — the understanding conversation
 * the Create entrance runs BEFORE Build Type classification.
 *
 * Acceptance contract: docs/create-experience/UNIVERSAL_REASONING_JOURNEY_ACCEPTANCE_TESTS.md
 * (converts AT-1.1/1.2/1.3, AT-2.1/2.2, AT-B6, AT-B8 toward SATISFIED for
 * production Create). Implementation map:
 * docs/create-experience/CHAT_FIRST_REASONING_EXPERIENCE_HANDOFF.md
 *
 * Same reuse discipline as lib/currentFocus/sopDiscoveryFocus.ts: this module
 * authors no new discovery logic. It reuses discoveryRegistry.ts's questions
 * verbatim (pure data — no discoveryMode import, no chat routing, no
 * shouldEnterDiscoveryMode; leaf-only like resolveCreateBeginOutcome) and
 * adds only the sequencing the entrance needs: which question is next,
 * prefill from what the member already typed, a spoken acknowledgment for
 * each answer (Rule 4: reflect before moving forward), and the
 * classification handoff once understanding is complete.
 *
 * SOP-shaped requests use the already-authored create_sop question set — the
 * SAME question ids the Phase 2 in-focus gate reads — so a member who
 * answers them here is never asked again after the workspace opens (Rule 5).
 *
 * Classification runs on the enriched conversation (original wording +
 * answers) but the member's original wording remains the creation identity:
 * outcome.text is always what they typed, never the enriched blob.
 *
 * The 130 confirm gate is untouched: this module only ever returns the
 * classifier's own confirm/clarify outcomes — it cannot open Work.
 */

import {
  DISCOVERY_INTROS,
  DISCOVERY_QUESTIONS,
} from "@/lib/estateBrain/discoveryRegistry";
import type { DiscoveryQuestion } from "@/lib/estateBrain/discoveryTypes";
import {
  resolveCreateBeginOutcome,
  type CreateBeginOutcome,
} from "./resolveCreateBeginOutcome";

export type EntranceUnderstandingTopic = "create_sop" | "create_general";

export type EntranceUnderstandingSession = {
  topic: EntranceUnderstandingTopic;
  /** Exactly what the member typed — preserved as the creation identity. */
  originalText: string;
  answers: Record<string, string>;
  skippedIds: string[];
};

export type EntranceUnderstandingStep =
  | {
      kind: "question";
      /** Present only on the first question of a conversation. */
      intro: string | null;
      /** Reflection of the answer just given (Rule 4) — null on the first question or after a skip. */
      acknowledgment: string | null;
      question: DiscoveryQuestion;
      session: EntranceUnderstandingSession;
    }
  | {
      kind: "classify";
      acknowledgment: string | null;
      outcome: CreateBeginOutcome;
      session: EntranceUnderstandingSession;
    };

/**
 * Mirrors discoveryMode's SOP intent without importing discoveryMode
 * (leaf-only — that module carries chat routing with it).
 */
const SOP_TEXT_RE = /\bsops?\b|\bstandard operating procedure\b/i;

/** Rule 4 — every meaningful answer is reflected before the next question. */
const ANSWER_ACKNOWLEDGMENTS: Record<string, string> = {
  "create-goal": "Thank you — that gives me a real place to start.",
  "create-outcome":
    "That's a clear picture of what this should make possible.",
  "create-why": "That's the real reason we're doing this — worth holding onto.",
  "create-audience": "Good to know — that shapes how we write it.",
  "sop-audience-type": "Good to know — that changes how we shape it.",
  "sop-starting-point": "That helps me know where we're starting from.",
  "sop-audience-size": "That tells us the level of detail we need.",
};

export function entranceAcknowledgmentFor(questionId: string): string | null {
  return ANSWER_ACKNOWLEDGMENTS[questionId] ?? null;
}

function questionsFor(
  topic: EntranceUnderstandingTopic,
): readonly DiscoveryQuestion[] {
  return DISCOVERY_QUESTIONS[topic];
}

function isResolved(
  questionId: string,
  session: EntranceUnderstandingSession,
): boolean {
  return (
    Boolean(session.answers[questionId]?.trim()) ||
    session.skippedIds.includes(questionId)
  );
}

function nextQuestion(
  session: EntranceUnderstandingSession,
): DiscoveryQuestion | null {
  return (
    questionsFor(session.topic).find((q) => !isResolved(q.id, session)) ?? null
  );
}

function buildSession(
  topic: EntranceUnderstandingTopic,
  originalText: string,
): EntranceUnderstandingSession {
  const text = originalText.trim();
  const answers: Record<string, string> = {};
  if (topic === "create_general" && text) {
    // The typed request IS the goal — never ask what they already said.
    answers["create-goal"] = text;
  }
  // Same prefill rule as discoveryMode's extractPrefilledAnswers: a question
  // whose signals already appear in the request is already answered (AT-1.3).
  for (const q of questionsFor(topic)) {
    if (answers[q.id]) continue;
    if (q.signalPatterns?.some((re) => re.test(text))) {
      answers[q.id] = text;
    }
  }
  return { topic, originalText: text, answers, skippedIds: [] };
}

function memberText(session: EntranceUnderstandingSession): string {
  return session.originalText || session.answers["create-goal"]?.trim() || "";
}

/** Original wording + real answers — what classification actually reads. */
function enrichedText(session: EntranceUnderstandingSession): string {
  const base = memberText(session);
  const extras = questionsFor(session.topic)
    .map((q) => session.answers[q.id]?.trim() ?? "")
    .filter((a) => a && a !== base);
  return [base, ...extras].join(" ").trim();
}

function classifyStep(
  session: EntranceUnderstandingSession,
  acknowledgment: string | null,
): EntranceUnderstandingStep {
  const outcome = resolveCreateBeginOutcome(enrichedText(session));
  // Identity preservation — titles and originalRequest read outcome.text.
  if (outcome.kind === "confirm" || outcome.kind === "open") {
    return {
      kind: "classify",
      acknowledgment,
      outcome: { ...outcome, text: memberText(session) },
      session,
    };
  }
  return { kind: "classify", acknowledgment, outcome, session };
}

function stepFor(
  session: EntranceUnderstandingSession,
  opts?: { first?: boolean; acknowledgment?: string | null },
): EntranceUnderstandingStep {
  const acknowledgment = opts?.acknowledgment ?? null;
  const question = nextQuestion(session);
  if (!question) return classifyStep(session, acknowledgment);
  return {
    kind: "question",
    intro: opts?.first ? (DISCOVERY_INTROS[session.topic] ?? null) : null,
    acknowledgment,
    question,
    session,
  };
}

/**
 * Typed path — the member described what they want. Returns null for empty
 * text (callers keep today's empty-clarify handling). Returns a classify step
 * immediately when the request already answers every question (sufficient
 * context — no ceremony for a fully-formed ask).
 */
export function startEntranceUnderstanding(
  userText: string,
): EntranceUnderstandingStep | null {
  const text = userText.trim();
  if (!text) return null;
  const topic: EntranceUnderstandingTopic = SOP_TEXT_RE.test(text)
    ? "create_sop"
    : "create_general";
  return stepFor(buildSession(topic, text), { first: true });
}

/** Guided path — nothing typed yet; the conversation opens with the goal. */
export function startGuidedEntranceUnderstanding(): EntranceUnderstandingStep {
  return stepFor(buildSession("create_general", ""), { first: true });
}

/**
 * Record the member's reply (or an explicit skip) to the current question.
 * An empty reply is treated as a skip — never store blank answers.
 */
export function advanceEntranceUnderstanding(
  session: EntranceUnderstandingSession,
  reply: string,
  opts?: { skip?: boolean },
): EntranceUnderstandingStep {
  const current = nextQuestion(session);
  if (!current) return classifyStep(session, null);

  const trimmed = reply.trim();
  const skip = Boolean(opts?.skip) || !trimmed;

  // Guided path: the goal answer may reveal an SOP-shaped request — hand it
  // to the SOP question set now rather than asking generic questions first.
  if (
    !skip &&
    session.topic === "create_general" &&
    current.id === "create-goal" &&
    SOP_TEXT_RE.test(trimmed)
  ) {
    return stepFor(buildSession("create_sop", trimmed), {
      acknowledgment: entranceAcknowledgmentFor("create-goal"),
    });
  }

  const next: EntranceUnderstandingSession = skip
    ? {
        ...session,
        skippedIds: session.skippedIds.includes(current.id)
          ? session.skippedIds
          : [...session.skippedIds, current.id],
      }
    : { ...session, answers: { ...session.answers, [current.id]: trimmed } };

  return stepFor(next, {
    acknowledgment: skip ? null : entranceAcknowledgmentFor(current.id),
  });
}

// ---------------------------------------------------------------------------
// Answers handoff — armed-session pattern (see forceNewCreateSession.ts).
// The entrance arms right before the parent opens the workspace; the workflow
// seed site (CompanionPageClient.startFreshCreateFromEstate) consumes into
// RuntimeCreationRecord.discoveryAnswers + Working Memory via
// applyDiscoveryAnswerToRuntimeCreationRecord (Rule 8).
// ---------------------------------------------------------------------------

export type EntranceUnderstandingHandoff = {
  answers: Record<string, string>;
  skippedIds: string[];
};

let pendingHandoff: EntranceUnderstandingHandoff | null = null;

export function armEntranceUnderstandingHandoff(
  session: EntranceUnderstandingSession,
): void {
  const answers: Record<string, string> = {};
  for (const [id, value] of Object.entries(session.answers)) {
    // create-goal duplicates originalRequest — identity, not discovery.
    if (id === "create-goal") continue;
    const trimmed = value.trim();
    if (trimmed) answers[id] = trimmed;
  }
  const skippedIds = session.skippedIds.filter((id) => id !== "create-goal");
  if (Object.keys(answers).length === 0 && skippedIds.length === 0) {
    pendingHandoff = null;
    return;
  }
  pendingHandoff = { answers, skippedIds };
}

/** One-shot — consuming clears. */
export function consumeEntranceUnderstandingHandoff(): EntranceUnderstandingHandoff | null {
  const handoff = pendingHandoff;
  pendingHandoff = null;
  return handoff;
}

/** Clear on cancel / resume / failed open so answers never bleed elsewhere. */
export function clearEntranceUnderstandingHandoff(): void {
  pendingHandoff = null;
}

export function resetEntranceUnderstandingForTests(): void {
  pendingHandoff = null;
}
