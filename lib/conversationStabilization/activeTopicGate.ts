/**
 * CB-022 — Active topic lifecycle + fallback / writer gates.
 * Call once per user turn from the main send path before Chamber NAVIGATE,
 * arrival greetings, openers, acks, kernel early-exits, and generic fallbacks.
 */

import { resolveChamberMemberFromText } from "@/lib/chamber/chamberMemberAliases";
import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";
import {
  clearActiveTopic,
  getActiveTopic,
  isActiveTopicUnresolved,
  patchActiveTopic,
  saveActiveTopic,
  setActiveTopicStatus,
} from "./activeTopicStore";
import type { ActiveTopicState } from "./activeTopicTypes";
import {
  isExplicitChamberNavigationRequest,
  mayNavigateToChamberMember,
  type ChamberNavigateGateInput,
  type ChamberNavigateGateResult,
} from "./chamberNavigateGate";

const EXPLICIT_TOPIC_CHANGE_RE =
  /\b(?:actually|instead)\b[\s\S]{0,40}\b(?:reminder|reminders|clear my mind|plan my day|adapt my day)\b|\b(?:set|create|make)\s+(?:a\s+)?reminder\b|\b(?:open|take me to|go to)\s+(?:clear my mind|plan my day|reminders?)\b/i;

/** Help/goal questions that must keep a durable topic even without a Chamber alias hit. */
const DOMAIN_GOAL_RE =
  /\b(?:how (?:do|can|should) i|i want to|i need (?:to|help)|what (?:is|are|should|type)|why do i|help me|don't know where to start)\b/i;

function looksLikeDomainGoalQuestion(userText: string): boolean {
  const t = userText.trim();
  if (t.split(/\s+/).length < 5) return false;
  if (isExplicitChamberNavigationRequest(t)) return false;
  return DOMAIN_GOAL_RE.test(t);
}

const GENERIC_FALLBACK_SNIPPETS = [
  "What would help you move forward today?",
  "I'm here — tell me what you need and we'll take it from there.",
  "I'm here—tell me what you need",
  "Tell me what you're trying to do — settings, reminders, Clear My Mind",
  "Tell me what you're trying to do—settings, reminders, Clear My Mind",
  "I'm here. Tell me what would help most.",
] as const;

export type ProcessActiveTopicTurnInput = {
  userText: string;
  turn: number;
  /** Valid pending-choice selection of a Chamber member. */
  menuSelectedMemberId?: string | null;
  lastAssistantText?: string | null;
  /** Currently activated Chamber member (UI). */
  activeChamberMemberId?: string | null;
};

export type ProcessActiveTopicTurnResult = {
  topic: ActiveTopicState | null;
  navigateGate: ChamberNavigateGateResult;
  /** Domain alias hit but navigate denied — keep chat answer path. */
  preserveChatForDomainQuestion: boolean;
  /** Clarification menu text to show (ambiguous members). */
  clarificationQuestion?: string;
  explicitTopicChange: boolean;
  /** Skip arrival greeting / opener / Of-course ack writers. */
  suppressChamberIntroWriters: boolean;
  /** Same member already active — do not re-append opener. */
  skipRepeatChamberActivation: boolean;
};

function newTopicId(): string {
  return `topic-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isExplicitTopicChangeRequest(userText: string): boolean {
  return EXPLICIT_TOPIC_CHANGE_RE.test(userText.trim());
}

export function shouldBlockGenericFallback(
  topic: ActiveTopicState | null = getActiveTopic(),
): boolean {
  return isActiveTopicUnresolved(topic);
}

export function isBlockedGenericFallbackText(
  text: string,
  topic: ActiveTopicState | null = getActiveTopic(),
): boolean {
  if (!shouldBlockGenericFallback(topic)) return false;
  const t = text.trim();
  if (!t) return false;
  if (GENERIC_FALLBACK_SNIPPETS.some((s) => t === s || t.startsWith(s))) {
    return true;
  }
  if (/^I'm\s+.+\s+Intelligence\b/i.test(t)) return true;
  if (/^Of course — here's\s+/i.test(t)) return true;
  if (
    /\btell me what you're trying to do\b/i.test(t) &&
    /\bsettings\b/i.test(t) &&
    /\bclear my mind\b/i.test(t)
  ) {
    return true;
  }
  return false;
}

/** Topic-preserving substitute when a generic fallback would have fired. */
export function topicPreservingFallbackLine(
  topic: ActiveTopicState | null = getActiveTopic(),
): string {
  const goal = topic?.userGoal?.trim();
  if (goal) {
    const short = goal.length > 120 ? `${goal.slice(0, 117)}…` : goal;
    return `Still with you on this — ${short}. What part should we tackle first?`;
  }
  return "Still with you on what you just shared. What part should we tackle first?";
}

export function markActiveTopicAnswered(turn: number): ActiveTopicState | null {
  return setActiveTopicStatus("answered", turn);
}

export function markActiveTopicCompleted(turn: number): ActiveTopicState | null {
  return setActiveTopicStatus("completed", turn);
}

export function acceptClarificationForActiveTopic(
  userText: string,
  turn: number,
  memberId?: string,
): ActiveTopicState | null {
  const current = getActiveTopic();
  if (!current || current.status !== "awaiting_clarification") return current;
  return patchActiveTopic({
    status: "ready_to_answer",
    updatedAtTurn: turn,
    unresolvedNeed: userText.trim() || current.unresolvedNeed,
    chamberMemberId: memberId ?? current.chamberMemberId,
    selectedKnowledgeSources:
      memberId && !current.selectedKnowledgeSources.includes(memberId)
        ? [...current.selectedKnowledgeSources, memberId]
        : current.selectedKnowledgeSources,
  });
}

/**
 * Authoritative per-turn processing. Call once at the start of handleSend
 * before estate kernel / Chamber navigation side effects.
 */
export function processActiveTopicOnUserTurn(
  input: ProcessActiveTopicTurnInput,
): ProcessActiveTopicTurnResult {
  const userText = input.userText.trim();
  const turn = input.turn;
  const gateInput: ChamberNavigateGateInput = {
    userText,
    menuSelectedMemberId: input.menuSelectedMemberId,
  };
  const navigateGate = mayNavigateToChamberMember(gateInput);

  const explicitTopicChange = isExplicitTopicChangeRequest(userText);
  if (explicitTopicChange) {
    clearActiveTopic();
    // Explicit destination change (reminder / CMM / etc.) — do not re-identify
    // the change utterance as a new domain topic in the same turn.
    return {
      topic: null,
      navigateGate,
      preserveChatForDomainQuestion: false,
      clarificationQuestion: undefined,
      explicitTopicChange: true,
      suppressChamberIntroWriters: true,
      skipRepeatChamberActivation: false,
    };
  }

  let topic = getActiveTopic();

  // Ambiguous short reply while awaiting clarification ("yes", "1", "sales")
  if (
    topic?.status === "awaiting_clarification" &&
    !explicitTopicChange &&
    !navigateGate.allow
  ) {
    const short = userText.length <= 48;
    if (short) {
      const menuMember = input.menuSelectedMemberId;
      topic =
        acceptClarificationForActiveTopic(userText, turn, menuMember ?? undefined) ??
        topic;
    }
  }

  // Domain question (alias hit or clear goal language) — identify topic, keep chat
  const preserveChatForDomainQuestion =
    (!navigateGate.allow && navigateGate.reason === "domain_question_alias") ||
    (!navigateGate.allow &&
      navigateGate.reason !== "ambiguous_needs_clarify" &&
      looksLikeDomainGoalQuestion(userText));

  if (preserveChatForDomainQuestion) {
    const memberId = navigateGate.memberId;
    if (!topic || explicitTopicChange || !isActiveTopicUnresolved(topic)) {
      topic = {
        topicId: newTopicId(),
        domain: memberId,
        userGoal: userText,
        unresolvedNeed: userText,
        selectedKnowledgeSources: memberId ? [memberId] : [],
        responseOwner: "shari",
        status: "ready_to_answer",
        confidence: memberId ? "high" : "medium",
        startedAtTurn: turn,
        updatedAtTurn: turn,
        chamberMemberId: memberId,
      };
      saveActiveTopic(topic);
    } else {
      topic =
        patchActiveTopic({
          userGoal: topic.userGoal || userText,
          unresolvedNeed: userText,
          updatedAtTurn: turn,
          status:
            topic.status === "awaiting_clarification"
              ? "ready_to_answer"
              : topic.status,
          chamberMemberId: topic.chamberMemberId ?? memberId,
          selectedKnowledgeSources: memberId
            ? Array.from(
                new Set([...topic.selectedKnowledgeSources, memberId]),
              )
            : topic.selectedKnowledgeSources,
        }) ?? topic;
    }
  }

  // Ambiguous Chamber options — clarification, not navigate
  let clarificationQuestion: string | undefined;
  if (
    !navigateGate.allow &&
    navigateGate.reason === "ambiguous_needs_clarify" &&
    navigateGate.resolved.kind === "ambiguous"
  ) {
    clarificationQuestion = navigateGate.resolved.clarifyQuestion;
    topic = {
      topicId: topic?.topicId ?? newTopicId(),
      domain: "chamber",
      userGoal: userText,
      unresolvedNeed: userText,
      selectedKnowledgeSources: navigateGate.resolved.options.map((o) => o.memberId),
      responseOwner: "shari",
      status: "awaiting_clarification",
      confidence: "medium",
      startedAtTurn: topic?.startedAtTurn ?? turn,
      updatedAtTurn: turn,
    };
    saveActiveTopic(topic);
  }

  // Explicit navigation — lightweight topic for the destination
  if (navigateGate.allow) {
    topic = {
      topicId: topic?.topicId ?? newTopicId(),
      domain: navigateGate.memberId,
      userGoal: userText,
      selectedKnowledgeSources: [navigateGate.memberId],
      responseOwner: "shari",
      status: "identified",
      confidence: "high",
      startedAtTurn: turn,
      updatedAtTurn: turn,
      chamberMemberId: navigateGate.memberId,
    };
    saveActiveTopic(topic);
  }

  // Follow-up while unresolved — keep topic, advance toward answer
  if (
    topic &&
    isActiveTopicUnresolved(topic) &&
    !preserveChatForDomainQuestion &&
    !navigateGate.allow &&
    !clarificationQuestion &&
    !explicitTopicChange
  ) {
    topic =
      patchActiveTopic({
        unresolvedNeed: userText,
        updatedAtTurn: turn,
        status:
          topic.status === "awaiting_clarification"
            ? "ready_to_answer"
            : topic.status === "identified"
              ? "ready_to_answer"
              : topic.status,
      }) ?? topic;
  }

  const activeMember = input.activeChamberMemberId ?? null;
  const skipRepeatChamberActivation = Boolean(
    activeMember &&
      navigateGate.allow &&
      navigateGate.memberId === activeMember,
  );

  const suppressChamberIntroWriters =
    isActiveTopicUnresolved(topic) ||
    skipRepeatChamberActivation ||
    preserveChatForDomainQuestion ||
    (navigateGate.allow && !isExplicitChamberNavigationRequest(userText) && !input.menuSelectedMemberId);

  // Always suppress specialist self-intro / Of-course ack for CB-022 ownership
  const suppressAllChamberIntros = true;

  return {
    topic: getActiveTopic(),
    navigateGate,
    preserveChatForDomainQuestion,
    clarificationQuestion,
    explicitTopicChange,
    suppressChamberIntroWriters: suppressAllChamberIntros || suppressChamberIntroWriters,
    skipRepeatChamberActivation,
  };
}

export function chamberNavigateGateForText(
  userText: string,
  menuSelectedMemberId?: string | null,
): ChamberNavigateGateResult {
  return mayNavigateToChamberMember({
    userText,
    menuSelectedMemberId,
  });
}

export function shouldAllowChamberKernelExemption(userText: string): boolean {
  return mayNavigateToChamberMember({ userText }).allow;
}

export function resolveKnowledgeMemberForTopic(
  userText: string,
): ChamberMemberId | null {
  const topic = getActiveTopic();
  if (topic?.chamberMemberId) return topic.chamberMemberId as ChamberMemberId;
  const resolved = resolveChamberMemberFromText(userText);
  if (resolved.kind === "match") return resolved.match.memberId;
  return null;
}
