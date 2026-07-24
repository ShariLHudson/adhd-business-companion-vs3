/**
 * Critical-gap detection for creation turns.
 *
 * Ask only when one genuinely blocking fact would materially misdirect the draft.
 * Who + why (purpose) are the shared critical slots across artifact types.
 */

import type { UniversalCreationSession } from "@/lib/universalCreation/types";
import { pluginById } from "@/lib/universalCreation/documentRegistry";

export type CreationCriticalGapDecision = {
  canDraft: boolean;
  /** At most one blocking question — null when draft is allowed. */
  blockingQuestion: string | null;
  blockingQuestionId: string | null;
  knownFactIds: string[];
  missingCriticalIds: string[];
};

function answerFilled(
  answers: Readonly<Record<string, string>>,
  id: string,
): boolean {
  return Boolean(answers[id]?.trim());
}

/**
 * Decide whether a useful first draft is possible, or which single fact blocks it.
 */
export function evaluateCreationCriticalGap(
  session: UniversalCreationSession,
): CreationCriticalGapDecision {
  const plugin = pluginById(session.documentType);
  if (!plugin) {
    return {
      canDraft: false,
      blockingQuestion: "What are you trying to create?",
      blockingQuestionId: null,
      knownFactIds: [],
      missingCriticalIds: ["documentType"],
    };
  }

  const knownFactIds = plugin.discoveryQuestions
    .filter((q) => answerFilled(session.answers, q.id))
    .map((q) => q.id);

  // Email: recipient + purpose/ask are the only critical blockers.
  if (session.documentType === "email") {
    const recipient = session.answers["email-recipient"]?.trim();
    const purpose =
      session.answers["email-purpose"]?.trim() ||
      session.answers["email-ask"]?.trim();
    const missing: string[] = [];
    if (!recipient) missing.push("email-recipient");
    if (!purpose || purpose.length < 12) missing.push("email-purpose");
    if (missing.length === 0) {
      return {
        canDraft: true,
        blockingQuestion: null,
        blockingQuestionId: null,
        knownFactIds,
        missingCriticalIds: [],
      };
    }
    const firstMissing = missing[0]!;
    const q = plugin.discoveryQuestions.find((d) => d.id === firstMissing);
    return {
      canDraft: false,
      blockingQuestion: q?.prompt ?? "Who is this for, and what must they know?",
      blockingQuestionId: firstMissing,
      knownFactIds,
      missingCriticalIds: missing,
    };
  }

  // Shared rule across SOP, post, proposal, plan, checklist, script, agenda, summary, …
  // Critical = first unanswered who-slot, else first unanswered why-slot.
  const whoQs = plugin.discoveryQuestions.filter((q) => q.slot === "who");
  const whyQs = plugin.discoveryQuestions.filter((q) => q.slot === "why");
  const criticalOrdered = [...whoQs, ...whyQs];
  const missingCritical = criticalOrdered.filter(
    (q) => !answerFilled(session.answers, q.id),
  );

  if (missingCritical.length === 0 && (session.confidence.who || whoQs.length === 0)) {
    // who+why satisfied (or not required) — draft with what we have
    const hasWhy =
      whyQs.length === 0 ||
      whyQs.some((q) => answerFilled(session.answers, q.id)) ||
      session.confidence.why;
    const hasWho =
      whoQs.length === 0 ||
      whoQs.some((q) => answerFilled(session.answers, q.id)) ||
      session.confidence.who;
    if (hasWho && hasWhy) {
      return {
        canDraft: true,
        blockingQuestion: null,
        blockingQuestionId: null,
        knownFactIds,
        missingCriticalIds: [],
      };
    }
  }

  if (missingCritical.length === 0) {
    // Fall back: first unanswered discovery question only if who/why flags incomplete
    if (session.confidence.who && session.confidence.why) {
      return {
        canDraft: true,
        blockingQuestion: null,
        blockingQuestionId: null,
        knownFactIds,
        missingCriticalIds: [],
      };
    }
  }

  const blocker = missingCritical[0];
  if (!blocker) {
    return {
      canDraft: Boolean(session.confidence.who && session.confidence.why),
      blockingQuestion: session.confidence.who
        ? null
        : (whoQs[0]?.prompt ?? whyQs[0]?.prompt ?? null),
      blockingQuestionId: whoQs[0]?.id ?? whyQs[0]?.id ?? null,
      knownFactIds,
      missingCriticalIds: [],
    };
  }

  return {
    canDraft: false,
    blockingQuestion: blocker.prompt,
    blockingQuestionId: blocker.id,
    knownFactIds,
    missingCriticalIds: missingCritical.map((q) => q.id),
  };
}
