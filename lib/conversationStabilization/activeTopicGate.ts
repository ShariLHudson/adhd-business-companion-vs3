/**
 * CB-022 — Active topic lifecycle + fallback / writer gates.
 * Call once per user turn from the main send path before Chamber NAVIGATE,
 * arrival greetings, openers, acks, kernel early-exits, and generic fallbacks.
 */

import { resolveChamberMemberFromText } from "@/lib/chamber/chamberMemberAliases";
import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";
import {
  buildAnswerFirstFailSafeReply,
  decideShariResponse,
} from "@/lib/shariAnswerFirst";
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

/**
 * Permanently disabled canned substitutes — never emit from fallback paths,
 * and always treat as blocked if they appear as recovery text.
 */
export const DISABLED_CANNED_FALLBACKS = [
  "Which platform matters most for the people you want to reach right now?",
] as const;

const CLIENT_NEED_RE =
  /\b(client|clients|relationships?|trust|deadline|scope|follow[- ]?up|guilt)\b/i;
const CONTENT_NEED_RE =
  /\b(content|instagram|facebook|linkedin|post|platform|audience|caption|newsletter)\b/i;
const FINANCE_NEED_RE =
  /\b(price|pricing|money|invoice|cash|budget|profit|revenue)\b/i;

/** Specialty-voice clarifying questions — used only for the active companion. */
const SPECIALTY_CLARIFY: Record<string, string> = {
  content: "What are you trying to say or create — and who is it for?",
  finance:
    "What part of the money decision feels murkiest — the number, the timing, or saying it out loud?",
  "client-relationships":
    "What's the relationship pressure you feel most right now — repairing trust, setting a boundary, or following up?",
  "ai-technology":
    "What are you trying to accomplish — and where is the tech part feeling murky?",
  "creative-studio":
    "What are you making or imagining — and what's getting in the way of the next step?",
  "data-analytics":
    "What decision are you hoping clearer numbers would help you make?",
  events: "What gathering are you shaping — and what's the first decision you need?",
  horizons: "What future are you curious about — and what feels hard to see clearly?",
  innovations: "What new idea is pulling at you — and what's the smallest test that would tell you something?",
  marketing:
    "Who are you trying to reach — and what do you want them to understand first?",
  operations:
    "Which part of the system feels heaviest right now — the process, the people, or the follow-through?",
  partnerships:
    "Are you exploring a collaboration or already in one — and what's unclear?",
  sales:
    "Where are you in the conversation — finding the right people, or knowing what to say next?",
  strategy:
    "What decision are you trying to get clearer on before you move?",
  "time-energy":
    "What part of your time or energy feels hardest to protect right now?",
};

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

export type TopicPreservingFallbackOptions = {
  /** Live Chamber UI member — wins over a stale stored topic domain. */
  activeChamberMemberId?: string | null;
};

function newTopicId(): string {
  return `topic-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function needMatchesDomain(need: string, domain: string): boolean {
  if (!need) return false;
  switch (domain) {
    case "client-relationships":
      return CLIENT_NEED_RE.test(need);
    case "content":
      return CONTENT_NEED_RE.test(need);
    case "finance":
      return FINANCE_NEED_RE.test(need);
    default:
      // Unknown specialty — only treat as match when the domain token itself appears.
      return need.includes(domain.replace(/-/g, " ")) || need.includes(domain);
  }
}

function specialtyClarifyQuestion(domain: string): string | null {
  return SPECIALTY_CLARIFY[domain] ?? null;
}

export function isExplicitTopicChangeRequest(userText: string): boolean {
  return EXPLICIT_TOPIC_CHANGE_RE.test(userText.trim());
}

// Stage 1B — conservative subject-pivot detection.
// The user linguistically ANNOUNCES a new subject ("thinking about…",
// "what about…", "by the way…"). Required, not sufficient — see
// isNewConversationalSubject for the full gate.
const SUBJECT_PIVOT_MARKER_RE =
  /\b(?:thinking about|think(?:ing)? i (?:might|should|could|want)|considering|i (?:might|may) (?:enter|start|try|do|join|sign up|go)|what about|how about|switch(?:ing)? gears|chang(?:e|ing) the subject|different (?:question|topic|subject|thing)|another (?:question|topic|thing)|new (?:question|topic|subject)|unrelated|by the way|on a (?:different|another|separate) note)\b/i;

// Function/modal words ignored when checking topical overlap. Kept intentionally
// SMALL so the overlap check stays sensitive — a shared content word blocks the
// pivot, which biases toward preserving a genuine follow-up.
const SUBJECT_PIVOT_STOPWORDS = new Set([
  "about", "actually", "again", "already", "always", "because", "been",
  "before", "being", "could", "does", "doing", "done", "from", "have",
  "having", "into", "just", "like", "more", "most", "much", "only", "over",
  "really", "should", "some", "still", "such", "than", "that", "their",
  "them", "then", "there", "these", "they", "thing", "things", "think",
  "thinking", "this", "those", "though", "through", "very", "want", "were",
  "what", "when", "where", "which", "while", "will", "with", "would", "your",
  "going", "maybe", "might",
]);

function subjectContentWords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !SUBJECT_PIVOT_STOPWORDS.has(w)),
  );
}

function sharesSubjectContentWord(a: string, b: string): boolean {
  const wb = subjectContentWords(b);
  if (!wb.size) return false;
  for (const w of subjectContentWords(a)) {
    if (wb.has(w)) return true;
  }
  return false;
}

/**
 * Conservative subject-pivot detector (Stage 1B). True ONLY when the current
 * message obviously introduces a new conversational subject that must not be
 * rebound onto a stale unresolved topic:
 *  - there is an unresolved stored topic,
 *  - the message is substantive (>= 5 words — never a short ack/answer),
 *  - it linguistically announces a new subject (pivot marker),
 *  - it is an answer-first declarative, not a reflective continuation,
 *  - it does not belong to the stored topic's domain, and
 *  - it shares no meaningful content word with the stored topic.
 * Deliberately narrow: it prefers to MISS a pivot rather than clear a genuine
 * follow-up. Broader semantic divergence is left to the later soft-boundary
 * stage.
 */
export function isNewConversationalSubject(
  userText: string,
  topic: ActiveTopicState | null = getActiveTopic(),
): boolean {
  if (!topic || !isActiveTopicUnresolved(topic)) return false;
  const t = userText.trim();
  if (t.split(/\s+/).length < 5) return false;
  if (!SUBJECT_PIVOT_MARKER_RE.test(t)) return false;
  // Still clearly within the stored topic's domain — treat as a follow-up.
  if (topic.domain && needMatchesDomain(t.toLowerCase(), topic.domain)) {
    return false;
  }
  const stored = `${topic.userGoal ?? ""} ${topic.unresolvedNeed ?? ""}`.trim();
  if (sharesSubjectContentWord(t, stored)) return false;
  const decision = decideShariResponse(t);
  if (
    !decision.directAnswerRequired ||
    decision.primaryHelpMode === "reflective_thinking" ||
    decision.explicitDestinationRequested
  ) {
    return false;
  }
  return true;
}

export function shouldBlockGenericFallback(
  topic: ActiveTopicState | null = getActiveTopic(),
): boolean {
  return isActiveTopicUnresolved(topic);
}

export function isDisabledCannedFallback(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return DISABLED_CANNED_FALLBACKS.some((s) => t === s || t.startsWith(s));
}

export function isBlockedGenericFallbackText(
  text: string,
  topic: ActiveTopicState | null = getActiveTopic(),
): boolean {
  const t = text.trim();
  if (!t) return false;
  // Permanently disabled — never allow these as recovery / substitute replies.
  if (isDisabledCannedFallback(t)) return true;
  if (!shouldBlockGenericFallback(topic)) return false;
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

/**
 * Topic-preserving substitute when a generic fallback would have fired.
 * Talk It Out posture: one clarifying question tied to the latest situation
 * and the active companion's specialty. Never emits DISABLED_CANNED_FALLBACKS.
 */
export function topicPreservingFallbackLine(
  topic: ActiveTopicState | null = getActiveTopic(),
  userText?: string,
  opts?: TopicPreservingFallbackOptions,
): string {
  const activeMember =
    opts?.activeChamberMemberId?.trim()?.toLowerCase() || null;
  const topicMember = (
    topic?.chamberMemberId ??
    topic?.domain ??
    ""
  )
    .toString()
    .trim()
    .toLowerCase();

  // Live companion wins — stale prior-member topics must not own the reply.
  const domain =
    activeMember ||
    (topicMember && topicMember !== "chamber" ? topicMember : "") ||
    "";

  const latestRaw =
    userText?.trim() ||
    // Only reuse stored need when it still belongs to the active companion
    (domain && topicMember && domain !== topicMember
      ? ""
      : topic?.unresolvedNeed?.trim() || topic?.userGoal?.trim() || "");
  const need = latestRaw.toLowerCase();

  const safe = (line: string): string => {
    if (!isDisabledCannedFallback(line)) return line;
    return (
      specialtyClarifyQuestion(domain) ??
      "What feels like the hardest part of that for you right now?"
    );
  };

  // Answer-first: general how-to beats clarify-only topic fallbacks.
  // Stale Chamber domain on a prior topic must not swallow unrelated how-tos
  // (e.g. vendor booth after a client-relationships topic).
  if (userText?.trim()) {
    const answerFirst = decideShariResponse(userText);
    const latestMatchesDomain = Boolean(domain) && needMatchesDomain(need, domain);
    const domainFlavored =
      latestMatchesDomain ||
      CLIENT_NEED_RE.test(userText) ||
      CONTENT_NEED_RE.test(userText) ||
      FINANCE_NEED_RE.test(userText);
    if (
      !domainFlavored &&
      answerFirst.directAnswerRequired &&
      answerFirst.primaryHelpMode !== "reflective_thinking"
    ) {
      const substantive = buildAnswerFirstFailSafeReply(userText);
      if (substantive) return substantive;
    }
  }

  // Situational matches from the latest message — specialty-agnostic signals.
  // Never return DISABLED_CANNED_FALLBACKS (platform line is permanently off).
  if (CLIENT_NEED_RE.test(need)) {
    if (/\b(trust|missed|dropped|late|repair|guilt)\b/i.test(need)) {
      return safe(
        "What would rebuilding trust look like for you in the next conversation with them?",
      );
    }
    if (/\b(boundar|scope|creep|extra|said yes)\b/i.test(need)) {
      return safe(
        "What boundary feels hardest to name out loud with this client?",
      );
    }
    if (
      /\b(follow|reply|email|avoid|putting off|call|conversation)\b/i.test(need)
    ) {
      return safe(
        "What's making the follow-up feel heavy — the words, the timing, or what they might say back?",
      );
    }
    return safe(
      "What's the relationship pressure you feel most right now — repairing trust, setting a boundary, or following up?",
    );
  }

  if (CONTENT_NEED_RE.test(need)) {
    // Situation-tied Content clarify — never the disabled platform canned line.
    if (/\b(instagram|facebook|linkedin)\b/i.test(need)) {
      return safe(
        "What are you trying to get those posts to do for you right now?",
      );
    }
    return safe("What are you trying to say or create — and who is it for?");
  }

  if (FINANCE_NEED_RE.test(need)) {
    return safe(
      "What part of the money decision feels murkiest — the number, the timing, or saying it out loud?",
    );
  }

  // Specialty clarify in the active companion's voice — never a mismatched domain default.
  if (domain && (!need || needMatchesDomain(need, domain))) {
    const specialty = specialtyClarifyQuestion(domain);
    if (specialty) return safe(specialty);
  }

  if (need) {
    // Latest message exists but doesn't map cleanly — ask in-voice, not canned domain.
    const specialty = specialtyClarifyQuestion(domain);
    if (specialty) {
      return safe(specialty);
    }
    return safe("What feels like the hardest part of that for you right now?");
  }

  return safe(
    specialtyClarifyQuestion(domain) ??
      "What part of this should we look at first?",
  );
}

/** True when user text alone is enough to refuse the generic recovery bridge. */
export function userTextBlocksGenericFallback(userText: string): boolean {
  const t = userText.trim();
  if (t.split(/\s+/).length < 6) return false;
  return (
    /\b(client|deadline|trust|guilt|avoid(?:ing)?|follow[- ]?up|invoice|boundary|scope)\b/i.test(
      t,
    ) ||
    /\b(worried|scared|afraid|anxious|overwhelm|stuck|shame|embarrassed)\b/i.test(
      t,
    )
  );
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
  const activeMember = input.activeChamberMemberId?.trim() || null;

  // Companion switch — prior member's topic must not drive this companion's turn.
  if (
    activeMember &&
    topic?.chamberMemberId &&
    topic.chamberMemberId !== activeMember
  ) {
    clearActiveTopic();
    topic = null;
  }

  // Already inside a Chamber member chat — keep a durable topic so fail-safes
  // cannot collapse to the generic recovery bridge.
  if (
    activeMember &&
    !explicitTopicChange &&
    userText.split(/\s+/).length >= 4 &&
    (!topic || !isActiveTopicUnresolved(topic) || !topic.chamberMemberId)
  ) {
    topic = {
      topicId: topic?.topicId ?? newTopicId(),
      domain: activeMember,
      userGoal: topic?.userGoal || userText,
      unresolvedNeed: userText,
      selectedKnowledgeSources: Array.from(
        new Set([...(topic?.selectedKnowledgeSources ?? []), activeMember]),
      ),
      responseOwner: "shari",
      status: "ready_to_answer",
      confidence: "high",
      startedAtTurn: topic?.startedAtTurn ?? turn,
      updatedAtTurn: turn,
      chamberMemberId: activeMember,
    };
    saveActiveTopic(topic);
  }

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

  // Answer-first general help (no Chamber alias / domain flavor) should not
  // create an unresolved topic that forces clarify-only fail-safes.
  const skipTopicForAnswerFirstGeneral = (() => {
    if (navigateGate.memberId) return false;
    if (navigateGate.reason === "domain_question_alias") return false;
    if (userText.split(/\s+/).length < 6) return false;
    if (
      CLIENT_NEED_RE.test(userText) ||
      CONTENT_NEED_RE.test(userText) ||
      FINANCE_NEED_RE.test(userText)
    ) {
      return false;
    }
    const d = decideShariResponse(userText);
    if (
      !d.directAnswerRequired ||
      d.primaryHelpMode === "reflective_thinking" ||
      d.explicitDestinationRequested
    ) {
      return false;
    }
    // Only skip topic creation for clear general-help modes — not short acks.
    return (
      d.primaryHelpMode === "how_to_guidance" ||
      d.primaryHelpMode === "explanation" ||
      d.primaryHelpMode === "troubleshooting" ||
      d.primaryHelpMode === "brainstorming" ||
      d.primaryHelpMode === "comparison" ||
      d.primaryHelpMode === "simple_planning" ||
      d.primaryHelpMode === "advice"
    );
  })();

  // Clear a stale unresolved topic when this turn is ordinary answer-first help
  // so fail-safes cannot keep asking clarify questions from an old domain.
  // Stage 1B: also clear when the message obviously pivots to a NEW subject, so
  // it is not rebound onto (and later replayed from) the stale topic. Excluded
  // inside a Chamber member chat, which intentionally keeps a durable topic.
  const pivotToNewSubject =
    !skipTopicForAnswerFirstGeneral &&
    !activeMember &&
    isNewConversationalSubject(userText, topic);
  if (
    (skipTopicForAnswerFirstGeneral || pivotToNewSubject) &&
    topic &&
    isActiveTopicUnresolved(topic)
  ) {
    clearActiveTopic();
    topic = null;
  }

  // Domain question (alias hit or clear goal language) — identify topic, keep chat
  const preserveChatForDomainQuestion =
    !skipTopicForAnswerFirstGeneral &&
    ((!navigateGate.allow && navigateGate.reason === "domain_question_alias") ||
      (!navigateGate.allow &&
        navigateGate.reason !== "ambiguous_needs_clarify" &&
        looksLikeDomainGoalQuestion(userText)));

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
