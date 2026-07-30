/**
 * Chamber of Momentum — conversational intake matching (Phase 1A).
 *
 * A THIN, DETERMINISTIC layer that composes the existing canonical systems.
 * It performs topic + need matching only — there is no AI evaluation here.
 * It introduces no new member registry and no second recommendation engine:
 *   - specific topic / need language  → resolveChamberMemberFromText()  (aliases)
 *   - broad need language             → an existing perspective choice
 *                                       → recommendChamberMembersForPerspective()
 *
 * Returns at most three members (one primary + up to two additional
 * perspectives), or a single gentle follow-up question when confidence is too
 * low. It never falls back to displaying all 24 members.
 */

import {
  resolveChamberMemberFromText,
} from "./chamberMemberAliases";
import {
  recommendChamberMembersForPerspective,
  type ChamberMemberRecommendation,
  type ChamberPerspectiveChoiceId,
} from "./chamberPerspectiveGuide";
import {
  getChamberMemberById,
  type ChamberMember,
} from "./chamberMemberRegistry";

/** The single gentle follow-up shown when a request is too broad to match. */
export const CHAMBER_INTAKE_FOLLOW_UP =
  "What feels hardest right now: choosing between options, making a plan, or getting started?";

export type ChamberIntakeMatch =
  | {
      kind: "recommendations";
      /** How the match was derived — for honest, non-AI wording. */
      basis: "topic" | "perspective" | "cross-specialty";
      primary: ChamberMemberRecommendation;
      /** Up to two additional perspectives (may be empty for a single clear match). */
      additional: ChamberMemberRecommendation[];
    }
  | {
      kind: "follow_up";
      question: string;
    };

/**
 * Broad need-language → an existing perspective choice. Evaluated in order;
 * first match wins. These map the member's OWN words onto the perspective
 * buckets that already exist in chamberPerspectiveGuide.ts — we do not invent
 * new categories. The follow-up answers ("choosing between options", "making a
 * plan", "getting started") are covered here so a follow-up reply resolves.
 */
const PERSPECTIVE_PATTERNS: {
  choiceId: ChamberPerspectiveChoiceId;
  pattern: RegExp;
}[] = [
  {
    choiceId: "market-sell",
    pattern:
      /\b(?:marketing|market|advertis\w*|ads?|campaign\w*|promot\w*|audience|brand\w*|sell|selling|sales|lead\w*|customer\w*|messaging|copy|content)\b/i,
  },
  {
    choiceId: "organize-process",
    pattern:
      /\b(?:process\w*|workflow\w*|system\w*|operation\w*|sops?|automat\w*|bottleneck\w*|streamline\w*|repeatable)\b/i,
  },
  {
    choiceId: "decide",
    pattern:
      /\b(?:decid\w*|decision\w*|choose|choosing|choice\w*|torn|weigh\w*|whether to|should i|can'?t decide|between options|two options|which option)\b/i,
  },
  {
    choiceId: "plan",
    pattern:
      /\b(?:plan\w*|roadmap|strateg\w*|sequenc\w*|timeline|prioriti\w*|next steps?)\b/i,
  },
  {
    choiceId: "confidence-momentum",
    pattern:
      /\b(?:stuck|overwhelm\w*|momentum|motivat\w*|procrastinat\w*|paralysis|burn(?:ed|t)?\s?out|energy|confidence|too many ideas|where (?:to|do i) start|getting started|get started|can'?t start|keep going|falling behind)\b/i,
  },
];

/** Normalize for length / emptiness checks (matching itself uses raw text). */
function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function reasonForTopic(member: ChamberMember): string {
  return `${member.displayName} focuses on ${member.specialty.toLowerCase()} — a direct fit for what you described.`;
}

function reasonForCrossSpecialty(member: ChamberMember): string {
  return `${member.displayName} could help here — ${member.specialty.toLowerCase()}.`;
}

function toRecommendation(
  member: ChamberMember,
  whyFits: string,
): ChamberMemberRecommendation {
  return { member, whyFits, canHelpWith: member.howTheyHelp };
}

/** Cap to primary + up to two additional (never more than three total). */
function shape(
  basis: "topic" | "perspective" | "cross-specialty",
  recommendations: ChamberMemberRecommendation[],
): ChamberIntakeMatch {
  const [primary, ...rest] = recommendations;
  if (!primary) {
    return { kind: "follow_up", question: CHAMBER_INTAKE_FOLLOW_UP };
  }
  return {
    kind: "recommendations",
    basis,
    primary,
    additional: rest.slice(0, 2),
  };
}

/**
 * Match a natural-language request to Chamber members.
 * Topic/need matching only — never an AI evaluation.
 */
export function matchChamberIntake(userText: string): ChamberIntakeMatch {
  const normalized = normalize(userText);
  if (!normalized) {
    return { kind: "follow_up", question: CHAMBER_INTAKE_FOLLOW_UP };
  }

  // 1 + 2. Direct specialty / need language → a specific member (aliases).
  const resolved = resolveChamberMemberFromText(userText);

  if (resolved.kind === "match") {
    const member = getChamberMemberById(resolved.match.memberId);
    if (member) {
      // One clear match → a single primary recommendation.
      return shape("topic", [toRecommendation(member, reasonForTopic(member))]);
    }
  }

  if (resolved.kind === "ambiguous") {
    // The situation crosses specialties → primary + additional (2–3).
    const recs = resolved.options
      .map((opt) => getChamberMemberById(opt.memberId))
      .filter((m): m is ChamberMember => Boolean(m))
      .map((m) => toRecommendation(m, reasonForCrossSpecialty(m)));
    if (recs.length >= 2) {
      return shape("cross-specialty", recs);
    }
    if (recs.length === 1) {
      return shape("topic", recs);
    }
  }

  // 3 + 4. Broad need language → an existing perspective bucket.
  for (const { choiceId, pattern } of PERSPECTIVE_PATTERNS) {
    if (pattern.test(userText)) {
      return shape(
        "perspective",
        recommendChamberMembersForPerspective(choiceId),
      );
    }
  }

  // 7 + 8. Too broad to match confidently → one gentle follow-up question.
  // Never fall back to showing all 24 members.
  return { kind: "follow_up", question: CHAMBER_INTAKE_FOLLOW_UP };
}
