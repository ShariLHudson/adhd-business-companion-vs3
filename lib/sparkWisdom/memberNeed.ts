/**
 * Spec 120 — Wisdom Before Information™
 */

import type { MemberNeedAssessment, MemberNeedKind } from "./types";

const NEED_PATTERNS: readonly {
  kind: MemberNeedKind;
  pattern: RegExp;
  rationale: string;
}[] = [
  {
    kind: "encouragement",
    pattern:
      /\b((\d+|fifteen|several|many)\s+(things|tasks|options|projects).*(important|priority|urgent)|every one of them feels important|too many (things|tasks|priorities))\b/i,
    rationale:
      "Cognitive overload — reduce load and prioritize gently before tactics",
  },
  {
    kind: "encouragement",
    pattern:
      /\b(overwhelm|scared|afraid|anxious|exhausted|can't|stuck|failing|doubt)\b/i,
    rationale: "Emotional weight present — encouragement before tactics",
  },
  {
    kind: "decision_partner",
    pattern:
      /\b(should i|which one|vs\.?|versus|between .+ and|can't decide|decide whether)\b/i,
    rationale: "Choosing between paths — partner, don't decide for them",
  },
  {
    kind: "coaching",
    pattern:
      /\b(procrastinat|can't get(?: myself)? started|can't make myself|avoiding (?:it|this|that)|putting .+ off|haven't (?:been able to )?start|know what .+ but .+ avoid)\b/i,
    rationale:
      "Activation friction — explore emotional blocker before strategy or tools",
  },
  {
    kind: "coaching",
    pattern:
      /\b(help me think|coach|stuck on|don't know how|work through|figure out)\b/i,
    rationale: "Explicit coaching request",
  },
  {
    kind: "perspective",
    pattern:
      /\b(another way|different angle|reframe|big picture|step back|perspective)\b/i,
    rationale: "Seeking a wider or alternate view",
  },
  {
    kind: "information",
    pattern:
      /\b(how do i|how to|what is|explain|research|look up|statistics|compare)\b/i,
    rationale: "Factual or instructional need",
  },
  {
    kind: "clarification",
    pattern: /\b(i need (?:an? |the )?.{2,40})\b/i,
    rationale: "Proxy deliverable request — clarify real outcome first",
  },
];

export function assessMemberNeed(message: string): MemberNeedAssessment {
  const trimmed = message.trim();
  for (const entry of NEED_PATTERNS) {
    if (entry.pattern.test(trimmed)) {
      return { primary: entry.kind, rationale: entry.rationale };
    }
  }
  if (trimmed.endsWith("?")) {
    return {
      primary: "information",
      rationale: "Direct question — answer only after checking if coaching fits better",
    };
  }
  return {
    primary: "coaching",
    rationale: "Default to coaching — wisdom before information",
  };
}

export function memberNeedLabel(kind: MemberNeedKind): string {
  const labels: Record<MemberNeedKind, string> = {
    information: "Information",
    coaching: "Coaching",
    perspective: "Perspective",
    encouragement: "Encouragement",
    clarification: "Clarification",
    decision_partner: "Decision partner",
  };
  return labels[kind];
}
