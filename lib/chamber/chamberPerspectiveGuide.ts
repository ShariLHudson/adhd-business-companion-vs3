/**
 * Chamber of Momentum — recommendation-first entry.
 * Ask what kind of perspective would help, then suggest at most three members.
 */

import {
  CHAMBER_MEMBERS,
  getChamberMemberById,
  type ChamberMember,
  type ChamberMemberId,
} from "@/lib/chamber/chamberMemberRegistry";

export type ChamberPerspectiveChoiceId =
  | "decide"
  | "plan"
  | "market-sell"
  | "organize-process"
  | "confidence-momentum"
  | "not-sure";

export type ChamberPerspectiveChoice = {
  id: ChamberPerspectiveChoiceId;
  label: string;
  /** Optional one-line explanation under the label. */
  hint: string;
  /** Softer secondary treatment in the entry grid. */
  secondary?: boolean;
};

export const CHAMBER_PERSPECTIVE_CHOICES: readonly ChamberPerspectiveChoice[] = [
  {
    id: "decide",
    label: "Help Me Decide",
    hint: "Clarity when options compete",
  },
  {
    id: "plan",
    label: "Help Me Plan",
    hint: "Turn intention into a workable sequence",
  },
  {
    id: "market-sell",
    label: "Help Me Market or Sell",
    hint: "Message, offer, and reach",
  },
  {
    id: "organize-process",
    label: "Help Me Improve a Process",
    hint: "Simplify systems and workflows",
  },
  {
    id: "confidence-momentum",
    label: "Help Me Regain Momentum",
    hint: "Steadiness and forward motion",
  },
  {
    id: "not-sure",
    label: "Help Me Choose",
    hint: "A gentle start when the need is still forming",
    secondary: true,
  },
] as const;

const RECOMMENDATIONS: Record<
  ChamberPerspectiveChoiceId,
  readonly ChamberMemberId[]
> = {
  decide: ["strategy", "leadership", "research"],
  plan: ["project-management", "strategy", "systems"],
  "market-sell": ["marketing", "sales", "content"],
  "organize-process": ["systems", "project-management", "knowledge-management"],
  "confidence-momentum": ["momentum", "wellness", "leadership"],
  "not-sure": ["strategy", "momentum", "research"],
};

export type ChamberMemberRecommendation = {
  member: ChamberMember;
  whyFits: string;
  canHelpWith: string;
};

function whyForChoice(
  choiceId: ChamberPerspectiveChoiceId,
  member: ChamberMember,
): string {
  // Fold in each member's own specialty so 2–3 recommendations never share an
  // identical sentence — each reason names what THIS member brings.
  const focus = member.specialty.toLowerCase().replace(/\.$/, "");
  switch (choiceId) {
    case "decide":
      return `${member.displayName} brings ${focus} to help you reach a clear, well-reasoned choice.`;
    case "plan":
      return `${member.displayName} uses ${focus} to turn the intention into a workable sequence.`;
    case "market-sell":
      return `${member.displayName} works on ${focus} to sharpen your message and reach.`;
    case "organize-process":
      return `${member.displayName} applies ${focus} to simplify the work so less lives in your head.`;
    case "confidence-momentum":
      return `${member.displayName} draws on ${focus} to restore steadiness and forward motion.`;
    case "not-sure":
      return `${member.displayName} is a gentle starting place, grounded in ${focus}.`;
  }
}

/** Recommend at most three Chamber members for a perspective choice. */
export function recommendChamberMembersForPerspective(
  choiceId: ChamberPerspectiveChoiceId,
): ChamberMemberRecommendation[] {
  const ids = RECOMMENDATIONS[choiceId] ?? RECOMMENDATIONS["not-sure"];
  return ids
    .map((id) => getChamberMemberById(id))
    .filter((m): m is ChamberMember => Boolean(m))
    .slice(0, 3)
    .map((member) => ({
      member,
      whyFits: whyForChoice(choiceId, member),
      canHelpWith: member.howTheyHelp,
    }));
}

export function allChamberMembers(): readonly ChamberMember[] {
  return CHAMBER_MEMBERS;
}
