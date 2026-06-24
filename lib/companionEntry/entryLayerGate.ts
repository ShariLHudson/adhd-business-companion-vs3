/**
 * Companion Intelligence™ Entry Layer — P-1a gates.
 * Understand before suggesting; no keyword-first workspace jumps.
 */

import { isOverwhelmTodayRoutingExempt } from "../overwhelmTodayRouting";
import { companionBusinessCanvasEntryHintForChat } from "./businessCanvasEntry";

/** Situations that need clarification before any workspace recommendation. */
const DEFER_KEYWORD_OFFER_PATTERNS: RegExp[] = [
  /\b(?:i'?m |i am )?overwhelm(?:ed|ing)?\b/i,
  /\b(?:i have|i'?ve got) (?:\d+|many|lots of|too many|so many) ideas?\b/i,
  /\b(?:15|many|lots of|too many) ideas?\b/i,
  /\bthinking about hiring\b/i,
  /\bhiring a va\b/i,
  /\bshould i hire\b/i,
  /\btoo much on my mind\b/i,
  /\bmy (?:head|brain) (?:is |feels )?(?:full|crowded)\b/i,
  /\bmental clutter\b/i,
  /\bcan'?t decide\b/i,
  /\bstuck between\b/i,
  /\btoo many (?:things|options)\b/i,
  /\b(?:new product(?:\s+line)?|add(?:ing)? (?:a )?(?:new )?(?:product|offer|service|line)|expand(?:ing)? (?:my )?(?:product|offer|line))\b/i,
];

const CLARIFY_OVERWHELMED_OPTIONS = [
  "Too many things competing for attention",
  "Not sure what to do first",
  "A difficult decision",
  "Low energy or motivation",
  "Something else",
];

export function shouldDeferKeywordWorkspaceOffer(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isOverwhelmTodayRoutingExempt(t)) return false;
  return DEFER_KEYWORD_OFFER_PATTERNS.some((re) => re.test(t));
}

function deferEntryLayerHint(text: string): string {
  if (/\boverwhelm/i.test(text)) {
    return [
      "UNDERSTAND BEFORE SUGGESTING™ (mandatory):",
      "User sounds overwhelmed. DO NOT name or offer a workspace tool on this turn.",
      "Ask ONE question: When you think about what's overwhelming you most right now, what feels hardest?",
      `Offer these options in plain language: ${CLARIFY_OVERWHELMED_OPTIONS.join("; ")}.`,
      "Stay in chat until you understand the actual need. No tool is a valid outcome.",
    ].join("\n");
  }

  if (/\bideas?\b/i.test(text)) {
    return [
      "UNDERSTAND BEFORE SUGGESTING™ (mandatory):",
      "User mentioned many ideas. DO NOT jump to Mind Map™ or any workspace yet.",
      "Clarify first: organize ideas, choose the best one, see how they connect, plan a path, or just talk?",
      "Recommend ONE path only after they answer. Permission before opening any workspace.",
    ].join("\n");
  }

  if (/\bhir(e|ing)\b/i.test(text)) {
    return [
      "UNDERSTAND BEFORE SUGGESTING™ (mandatory):",
      "User is exploring hiring. DO NOT jump to Decision Compass™ yet.",
      "Clarify: want a recommendation, explore consequences, see business impact, or talk it through in chat?",
      "Decision Compass™ = which option is best. Decision Tree™ = what happens if I choose this.",
    ].join("\n");
  }

  if (
    /\b(?:new product(?:\s+line)?|add(?:ing)? (?:a )?(?:new )?(?:product|offer|line)|expand(?:ing)? (?:my )?(?:product|offer|line))\b/i.test(
      text,
    )
  ) {
    return [
      "UNDERSTAND BEFORE SUGGESTING™ (mandatory):",
      "User is exploring product or offer expansion — a BUSINESS EXPANSION decision, not a simple product pick.",
      "DO NOT list options or solutions on this turn. DO NOT open Decision Compass™ yet.",
      "Ask 2–4 high-value questions only — e.g. current customers, revenue source, relationship between offers, pricing difference, audience overlap, risk tolerance, business goals.",
      "After enough context: offer Decision Compass™ with permission to compare keep / replace / both / phased.",
    ].join("\n");
  }

  return [
    "UNDERSTAND BEFORE SUGGESTING™ (mandatory):",
    "Message is broad or emotionally loaded. Clarify the actual need before any workspace offer.",
    "DO NOT route on keywords alone. Stay in chat if that is the best path.",
  ].join("\n");
}

/** Hint for companion-chat — defer gates first, then Business Canvas™ explain-first. */
export function companionEntryLayerHintForChat(text: string): string | null {
  if (shouldDeferKeywordWorkspaceOffer(text)) {
    return deferEntryLayerHint(text);
  }

  return companionBusinessCanvasEntryHintForChat(text);
}
