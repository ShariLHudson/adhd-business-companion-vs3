/**
 * AI-language cleanup shared across experiences.
 * Unlike Talk It Out's scrubShariAiTells, advisory mode never strips recommendations.
 */

import { TALK_IT_OUT_STOCK_LINE_BANS } from "@/lib/talkItOut/shariResponseEngine";

const AI_TELLS: RegExp[] = [
  /\bas an ai\b/i,
  /\bi(?:'m| am) here to help\b/i,
  /\bi(?:'m| am) not able to\b/i,
  /\bit sounds like (?:you(?:'re| are) )?feeling\b/i,
  /\blet(?:'s| us) unpack\b/i,
  /\blet(?:'s| us) dive in\b/i,
  /\blet(?:'s| us) explore\b/i,
  /\bgreat question\b/i,
  /\bthat makes total sense\b/i,
  /\bi hear you\b/i,
  /\bi(?:'m| am) going to (?:ask|reflect)\b/i,
  /\blet me know if there(?:'s| is) anything else\b/i,
  /\bthank you for sharing\b/i,
  /\bi understand this is difficult\b/i,
];

/** Permanent failure phrases — never deliver (shared with TIO package 206). */
export const CERTIFIED_PERMANENT_BAN_PHRASES: readonly RegExp[] = [
  /\btake your time(?: with that)?\b/i,
  /\bquieter question underneath\b/i,
  /\bsomething around does\b/i,
  /\baround does\b/i,
  /\blet\'?s stay with\b/i,
  /\bwhat part feels most useful\b/i,
  /\bi(?:'m| am) here — tell me what you need\b/i,
  /\bstill with you on this\b/i,
  /\bi(?:'m| am) listening — what(?:'s| is) your question\b/i,
  /\bwhich platform matters most for the people you want to reach\b/i,
];

/** Reflective coaching patterns Chamber must not over-use. */
export const CHAMBER_REFLECTIVE_BAN_PHRASES: readonly RegExp[] = [
  /\bwhat feels unfinished\b/i,
  /\bwhat else wants your attention\b/i,
  /\bwhat part of you\b/i,
  /\bafraid this might mean\b/i,
  /\bwho you want to be\b/i,
  /\bwhat(?:'s| is) the quieter question\b/i,
  /\byou are sitting with a real decision\b/i,
  /\bwhat part of the choice feels murkiest\b/i,
  /\bfeels murkiest right now\b/i,
  /\bdo not want to rush it\b/i,
  /\bwhat still feels murkiest\b/i,
];

/** True when a certified reply collapsed into reflective coaching. */
export function isReflectiveConversationShell(text: string): boolean {
  const t = text.trim();
  if (containsChamberReflectiveBan(t)) return true;
  const beforeQ = t.split("?")[0] ?? t;
  const words = beforeQ.trim().split(/\s+/).filter(Boolean).length;
  const qCount = (t.match(/\?/g) ?? []).length;
  // Short empathic lead + question, no specialty substance
  if (qCount >= 1 && words < 22 && !/\b(?:recommend|phase|trade-?off|instead|because|risk|budget|audience|launch|feature)\b/i.test(t)) {
    return true;
  }
  return false;
}

export function scrubCertifiedAiLanguage(
  text: string,
  opts?: { stripAdviceMarkers?: boolean },
): string {
  let out = text.trim();
  for (const re of AI_TELLS) {
    out = out.replace(re, "").replace(/\s{2,}/g, " ").trim();
  }
  if (opts?.stripAdviceMarkers) {
    out = out
      .replace(
        /\b(?:you should|you need to|have you considered|here(?:'s| are) (?:a few )?options)\b/i,
        "",
      )
      .replace(/\s{2,}/g, " ")
      .trim();
  }
  for (const ban of TALK_IT_OUT_STOCK_LINE_BANS) {
    out = out.replace(
      new RegExp(ban.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"),
      "",
    );
  }
  for (const re of CERTIFIED_PERMANENT_BAN_PHRASES) {
    if (re.test(out)) {
      out = out.replace(re, "").replace(/\s{2,}/g, " ").trim();
    }
  }
  return out.replace(/\s{2,}/g, " ").trim();
}

export function containsPermanentBanPhrase(text: string): boolean {
  return CERTIFIED_PERMANENT_BAN_PHRASES.some((re) => re.test(text));
}

export function containsChamberReflectiveBan(text: string): boolean {
  return CHAMBER_REFLECTIVE_BAN_PHRASES.some((re) => re.test(text));
}

/** Keep at most one question mark / question clause. */
export function limitToOneQuestion(text: string): string {
  const marks = (text.match(/\?/g) ?? []).length;
  if (marks <= 1) return text.trim();
  const first = text.indexOf("?");
  return `${text.slice(0, first + 1).trim()}`;
}
