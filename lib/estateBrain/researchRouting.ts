/**
 * Research level detection — Spark chooses depth automatically.
 */

import type { EstateResearchLevel } from "./intelligenceTypes";

const RESEARCH_INTENT_RE =
  /\b(?:research|look up|look into|find out|investigate|explore (?:the|what)|study (?:the|up on)|compare|competitors?|pricing|ideas? for)\b/i;

export function isResearchIntent(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (RESEARCH_INTENT_RE.test(t)) return true;
  if (/\b(?:latest|newest|recent)\b.*\b(?:tools?|trends?|news)\b/i.test(t)) {
    return true;
  }
  return false;
}

export function detectResearchLevel(userText: string): EstateResearchLevel {
  const t = userText.toLowerCase();

  if (
    /\b(?:watch|monitor|notify|keep me posted|track updates|alert me when)\b/.test(
      t,
    )
  ) {
    return 4;
  }

  if (
    /\b(?:compare|versus| vs |market report|comprehensive analysis|in-depth|multiple sources|evaluate (?:five|5|three|3)|crm systems)\b/.test(
      t,
    )
  ) {
    return 3;
  }

  if (
    /\b(?:latest|newest|recent|current|trending|this year|2024|2025|2026|today's)\b/.test(
      t,
    )
  ) {
    return 2;
  }

  if (
    /\b(?:explain|what is|what are|teach me|how does|define|help me understand)\b/.test(
      t,
    )
  ) {
    return 1;
  }

  return 2;
}

export function researchCapabilityIdForLevel(
  level: EstateResearchLevel,
): string {
  switch (level) {
    case 1:
      return "research.known";
    case 2:
      return "research.current";
    case 3:
      return "research.deep";
    case 4:
      return "research.monitor";
  }
}
