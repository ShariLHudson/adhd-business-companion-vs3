/**
 * ADHD Decision Compass — chat routing and prefill.
 * Recommend the compass for decision intent; never auto-open Create.
 */

import type { DecisionCompassPrefill } from "./decisionCompass";

export type DecisionCompassOffer = {
  prefill: DecisionCompassPrefill;
  companionLine: string;
};

const SESSION_DISMISS_KEY = "companion-decision-compass-offer-dismiss-v1";

const DECISION_COMPASS_OFFER_RE =
  /\b(?:i need to make a decision|i need help deciding|help me decide|help me choose|i don'?t know where to start with this decision|compare two options|i need help choosing|should i .+ or .+)\b/i;

const EXPLICIT_OPEN_RE =
  /\b(?:open|start|launch|show|take me to)\s+(?:the\s+)?(?:adhd\s+)?decision compass\b/i;

const ACCEPT_OPEN_RE =
  /\b(?:open decision compass|yes.{0,24}decision compass|let'?s use (?:the )?decision compass)\b/i;

export function isDecisionCompassOfferSignal(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (
    /\bi don'?t know where to start\b/i.test(t) &&
    !/\bdecision\b/i.test(t)
  ) {
    return false;
  }
  return DECISION_COMPASS_OFFER_RE.test(t);
}

export function isExplicitDecisionCompassRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return EXPLICIT_OPEN_RE.test(t) || ACCEPT_OPEN_RE.test(t);
}

export function isDecisionCompassOfferDismissedForSession(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(SESSION_DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissDecisionCompassOfferForSession(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_DISMISS_KEY, "1");
  } catch {
    /* ignore */
  }
}

function cleanOption(raw: string): string {
  return raw.replace(/^(?:the|a|an)\s+/i, "").trim();
}

/** Pull decision text and optional A/B options from the user's message. */
export function extractDecisionCompassPrefill(text: string): DecisionCompassPrefill {
  const decision = text.trim();
  const patterns = [
    /\bshould i\s+(.+?)\s+or\s+(.+?)(?:[?.!,]|$)/i,
    /\b(?:between|either)\s+(.+?)\s+(?:and|or)\s+(.+?)(?:[?.!,]|$)/i,
    /\bchoose between\s+(.+?)\s+and\s+(.+?)(?:[?.!,]|$)/i,
    /\b(.+?)\s+vs\.?\s+(.+?)(?:[?.!,]|$)/i,
  ];

  for (const re of patterns) {
    const m = decision.match(re);
    if (!m) continue;
    const optionA = cleanOption(m[1]!);
    const optionB = cleanOption(m[2]!);
    if (
      optionA.length > 1 &&
      optionB.length > 1 &&
      optionA.length < 80 &&
      optionB.length < 80
    ) {
      return { decision, optionA, optionB };
    }
  }

  return { decision };
}

export function buildDecisionCompassOffer(text: string): DecisionCompassOffer {
  return {
    prefill: extractDecisionCompassPrefill(text),
    companionLine:
      "It sounds like you're trying to work through a decision. Would you like to open ADHD Decision Compass?",
  };
}

export function shouldOfferDecisionCompass(text: string): boolean {
  if (!isDecisionCompassOfferSignal(text)) return false;
  if (isExplicitDecisionCompassRequest(text)) return false;
  if (isDecisionCompassOfferDismissedForSession()) return false;
  return true;
}

export function decisionCompassOfferHintForChat(): string {
  return [
    "DECISION COMPASS OFFER (handled in UI — do NOT name tools or open Create):",
    'A card below will offer "Open Decision Compass", "Talk it through here", and "Not now".',
    "Acknowledge the decision in 1–2 warm sentences. Do NOT open Create, drafts, or content builder.",
    "Do NOT say you are opening a tool — the buttons handle that.",
  ].join(" ");
}

export function decisionCompassOpenAck(): string {
  return "Opening Decision Compass beside us — chat and the compass share one decision.";
}

export function decisionCompassFullPageBoundary(): string {
  return "Decision Compass works best beside chat. Open it from Focus → Guided Exercises to use the split view.";
}

export function decisionCompassTalkThroughAck(): string {
  return "No problem — tell me more about the decision and we'll think it through together here.";
}
