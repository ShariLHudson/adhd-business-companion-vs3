/**
 * Follow-up continuity — adapt the thread; never restart unnecessarily.
 */

import type { ShariConversationMode } from "./conversationModes";
import { conversationModeFromHelpMode } from "./conversationModes";
import { decideShariResponse } from "./decideShariResponse";
import type { ShariPrimaryHelpMode, ShariResponseDecision } from "./types";
import type { ShariProfessionalRole } from "./professionalRoles";

export const SHARI_CONVERSATION_THREAD_KEY =
  "companion-shari-conversation-thread-v1";

/**
 * Canonical conversation-thread binder (help-thread state).
 * Distinct from `lib/conversationContinuity/*` (workflow ownership).
 */
export type ShariConversationThread = {
  id: string;
  originalRequest: string;
  currentGoal: string;
  conversationMode: ShariConversationMode | null;
  primaryHelpMode: ShariPrimaryHelpMode;
  primaryProfessionalRole?: ShariProfessionalRole;
  supportingProfessionalRoles?: ShariProfessionalRole[];
  lastAnswer: string;
  topicKeywords: string[];
  memberContextNotes: string[];
  /** Stated assumptions used in prior answers */
  assumptions: string[];
  /** Member corrections that override prior memory for this thread */
  corrections: string[];
  relevantContextKeys: string[];
  updatedAt: string;
};

const FOLLOW_UP_RE =
  /^(?:also|and|but|ok|okay|thanks|yes|no|mine (?:is|are)|it(?:'s| is)|for (?:my|our|the)|i (?:sell|make|offer|run|teach|coach)|what about|how about|what should|where should|can you|could you)/i;

const RESTART_QUESTION_RE =
  /\b(?:what are you trying to create|what (?:are you|do you want to) (?:make|build|create)|tell me what you're (?:trying to|working on)|which (?:one|room|destination))\b/i;

function extractKeywords(text: string): string[] {
  const stop = new Set([
    "how",
    "do",
    "i",
    "a",
    "an",
    "the",
    "to",
    "for",
    "my",
    "and",
    "or",
    "of",
    "in",
    "on",
    "with",
    "what",
    "should",
    "can",
    "me",
    "is",
    "are",
  ]);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stop.has(w))
    .slice(0, 16);
}

function normalizeThread(
  raw: Partial<ShariConversationThread> | null,
): ShariConversationThread | null {
  if (!raw?.originalRequest || !raw.id) return null;
  return {
    id: raw.id,
    originalRequest: raw.originalRequest,
    currentGoal: raw.currentGoal ?? raw.originalRequest,
    conversationMode: raw.conversationMode ?? null,
    primaryHelpMode: raw.primaryHelpMode ?? "direct_answer",
    primaryProfessionalRole: raw.primaryProfessionalRole,
    supportingProfessionalRoles: raw.supportingProfessionalRoles,
    lastAnswer: raw.lastAnswer ?? "",
    topicKeywords: raw.topicKeywords ?? [],
    memberContextNotes: raw.memberContextNotes ?? [],
    assumptions: raw.assumptions ?? [],
    corrections: raw.corrections ?? [],
    relevantContextKeys: raw.relevantContextKeys ?? [],
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

export function peekShariConversationThread(): ShariConversationThread | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SHARI_CONVERSATION_THREAD_KEY);
    if (!raw) return null;
    return normalizeThread(JSON.parse(raw) as Partial<ShariConversationThread>);
  } catch {
    return null;
  }
}

export function storeShariConversationThread(
  thread: ShariConversationThread,
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      SHARI_CONVERSATION_THREAD_KEY,
      JSON.stringify(thread),
    );
  } catch {
    /* ignore */
  }
}

export function clearShariConversationThread(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(SHARI_CONVERSATION_THREAD_KEY);
  } catch {
    /* ignore */
  }
}

export function buildShariConversationThread(input: {
  decision: ShariResponseDecision;
  answer: string;
  prior?: ShariConversationThread | null;
  memberNote?: string | null;
  primaryProfessionalRole?: ShariProfessionalRole;
  supportingProfessionalRoles?: ShariProfessionalRole[];
  assumptions?: string[];
  relevantContextKeys?: string[];
  correction?: string | null;
}): ShariConversationThread {
  const notes = [...(input.prior?.memberContextNotes ?? [])];
  if (input.memberNote?.trim()) notes.push(input.memberNote.trim());
  const corrections = [...(input.prior?.corrections ?? [])];
  if (input.correction?.trim()) corrections.push(input.correction.trim());
  const assumptions = [
    ...(input.prior?.assumptions ?? []),
    ...(input.assumptions ?? []),
  ].filter((a, i, arr) => arr.indexOf(a) === i);

  return {
    id: input.prior?.id ?? input.decision.id,
    originalRequest: input.prior?.originalRequest ?? input.decision.rawRequest,
    currentGoal: input.decision.normalizedRequest,
    conversationMode: conversationModeFromHelpMode(
      input.decision.primaryHelpMode,
    ),
    primaryHelpMode: input.decision.primaryHelpMode,
    primaryProfessionalRole:
      input.primaryProfessionalRole ?? input.prior?.primaryProfessionalRole,
    supportingProfessionalRoles:
      input.supportingProfessionalRoles ??
      input.prior?.supportingProfessionalRoles,
    lastAnswer: input.answer.slice(0, 8000),
    topicKeywords: extractKeywords(
      [
        input.prior?.originalRequest ?? "",
        input.decision.rawRequest,
        ...notes,
        ...corrections,
      ].join(" "),
    ),
    memberContextNotes: notes.slice(-8),
    assumptions: assumptions.slice(-8),
    corrections: corrections.slice(-8),
    relevantContextKeys: (
      input.relevantContextKeys ??
      input.prior?.relevantContextKeys ??
      []
    ).slice(0, 16),
    updatedAt: new Date().toISOString(),
  };
}

/** Detect short corrective turns that override prior thread facts. */
export function extractThreadCorrection(userText: string): string | null {
  const t = userText.trim();
  if (
    /\b(?:actually|correction|i (?:don't|do not) sell|i sell|not journals?|instead)\b/i.test(
      t,
    ) &&
    t.split(/\s+/).length <= 40
  ) {
    return t;
  }
  return null;
}

/**
 * True when this turn continues the open Shari help thread.
 */
export function isShariConversationFollowUp(
  userText: string,
  thread: ShariConversationThread | null = peekShariConversationThread(),
): boolean {
  if (!thread?.originalRequest?.trim()) return false;
  const t = userText.trim();
  if (!t) return false;

  const decision = decideShariResponse(t);
  // Explicit commands start a new action thread.
  if (
    decision.explicitCreationRequested ||
    decision.explicitProjectRequested ||
    decision.explicitNavigationRequested ||
    decision.explicitResearchRequested
  ) {
    return false;
  }

  // Fresh how-to / new topic with enough substance usually starts new — unless
  // it clearly references the prior topic.
  const priorWords = new Set(thread.topicKeywords);
  const overlap = extractKeywords(t).filter((w) => priorWords.has(w)).length;
  const mentionsPriorTopic =
    overlap >= 1 ||
    thread.topicKeywords.some(
      (k) => k.length > 3 && t.toLowerCase().includes(k),
    );

  if (
    decision.primaryHelpMode === "how_to_guidance" &&
    t.length > 40 &&
    !mentionsPriorTopic
  ) {
    return false;
  }

  if (FOLLOW_UP_RE.test(t)) return true;
  if (t.split(/\s+/).length <= 14) return true;
  if (mentionsPriorTopic) return true;
  if (
    /\b(?:table|booth|display|signage|groups?|plan|form|video|loom|webinar)\b/i.test(
      t,
    ) &&
    thread.topicKeywords.some((k) =>
      /booth|vendor|facebook|strateg|form|loom|webinar|podcast|journal/.test(k),
    )
  ) {
    return true;
  }

  return false;
}

export function shariContinuityHintForChat(
  userText: string,
  thread: ShariConversationThread | null = peekShariConversationThread(),
): string {
  if (!thread || !isShariConversationFollowUp(userText, thread)) return "";
  const notes = thread.memberContextNotes.length
    ? `Member already shared: ${thread.memberContextNotes.join("; ")}.`
    : "";
  return [
    "SHARI CONVERSATION CONTINUITY (mandatory):",
    `This continues the open thread about: "${thread.originalRequest}".`,
    notes,
    "Adapt your answer to that thread. Do NOT restart.",
    "Do NOT ask what they are trying to create or which destination to open.",
    "Do NOT offer a room menu. Stay in the same helpful conversation.",
  ].join("\n");
}

/**
 * Adapt a follow-up locally when the prior thread is a known how-to topic.
 */
export function buildFollowUpAdaptedReply(
  userText: string,
  thread: ShariConversationThread | null = peekShariConversationThread(),
): string | null {
  if (!thread || !isShariConversationFollowUp(userText, thread)) return null;
  const t = userText.trim();
  const prior = `${thread.originalRequest} ${thread.memberContextNotes.join(" ")}`.toLowerCase();
  const combinedNotes = [...thread.memberContextNotes, t];

  // Vendor booth thread
  if (/\b(?:vendor|booth|table)\b/.test(prior)) {
    if (/\b(?:table|put on|display|what should)\b/i.test(t)) {
      const product =
        combinedNotes.find((n) =>
          /\b(?:sell|selling|journals?|books?|candles?|art|coaching)\b/i.test(n),
        ) ?? "";
      const productNote = /\bjournals?\b/i.test(product + " " + t)
        ? "Since you’re selling journals, lead with 3–5 open sample journals at different heights, a clear “flip through me” invitation, and one hero journal face-out."
        : "Lead with your clearest product or offer at eye level, keep secondary items lower, and leave one clear empty space so the table doesn’t feel crowded.";
      return [
        "For the table itself, think in layers:",
        "",
        productNote,
        "",
        "Add: a simple price sign, a small stack of takeaways or QR for the waitlist, payment visible but not dominating, and one object that invites touch.",
        "Keep the front edge clean so people can stand close without knocking things over.",
        "",
        "If you tell me booth size and whether you want leads or sales most, I can tighten this into a packing list.",
      ].join("\n");
    }
    if (/\b(?:sell|selling|journals?|books?|candles?)\b/i.test(t)) {
      return [
        "Got it — that changes the booth in a helpful way.",
        "",
        /\bjournals?\b/i.test(t)
          ? "For journals: show opened pages, vary heights, and make it easy to touch without creating a messy pile. One clear “start here” journal beats a flat grid of identical covers."
          : "Lead with one hero version of what you sell, then supporting pieces. People decide faster when the table answers “what is this?” in a glance.",
        "",
        "Want the table layout next, or the packing list for the event?",
      ].join("\n");
    }
  }

  // Loom / video thread
  if (/\b(?:loom|video|screen record)\b/.test(prior)) {
    if (/\b(?:spark estate|spark|companion|estate)\b/i.test(t)) {
      return [
        "Perfect — for a Spark Estate Loom, keep it short and human.",
        "",
        "Open with what the viewer will understand by the end. Show the Welcome / glass conversation first so it feels like a place, not a dashboard. Narrate what you’re doing in plain language — never “click the module.”",
        "",
        "Walk one real path (for example: ask Shari a question → get help → optional next step). End with one clear invitation.",
        "",
        "I can outline a 60–90 second script next if you want.",
      ].join("\n");
    }
  }

  // Facebook groups thread
  if (/\bfacebook groups?\b/.test(prior) && /\b(?:audience|adhd|coach|sell)\b/i.test(t)) {
    return [
      "We’ll aim the search language at the people you just named.",
      "",
      "Use their identity, problems, and stage in the search phrases — not your product category alone. Then filter for activity and rules before you post.",
      "",
      "Share a few words they use to describe themselves and I’ll draft search phrases.",
    ].join("\n");
  }

  // Generic continuity — never restart
  if (t.split(/\s+/).length <= 16 || FOLLOW_UP_RE.test(t)) {
    return [
      `Staying with ${thread.originalRequest.replace(/\?+$/, "")}.`,
      "",
      `I’ll use what you just said (“${t}”) to tailor the next piece.`,
      "Here’s the most useful adjustment from here: keep the same goal, apply your detail, and take the next concrete step without starting over.",
      "",
      "What part should we tighten next?",
    ].join("\n");
  }

  return null;
}

export function looksLikeConversationRestart(answer: string): boolean {
  return RESTART_QUESTION_RE.test(answer.trim());
}
