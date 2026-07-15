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
};

export const CHAMBER_PERSPECTIVE_CHOICES: readonly ChamberPerspectiveChoice[] = [
  { id: "decide", label: "Help me decide" },
  { id: "plan", label: "Help me plan" },
  { id: "market-sell", label: "Help me market or sell" },
  { id: "organize-process", label: "Help me organize or improve a process" },
  { id: "confidence-momentum", label: "Help me regain confidence or momentum" },
  { id: "not-sure", label: "I’m not sure" },
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
  switch (choiceId) {
    case "decide":
      return `${member.displayName} is a strong fit when you need a clear choice and the reasoning behind it.`;
    case "plan":
      return `${member.displayName} helps turn a big intention into a workable sequence.`;
    case "market-sell":
      return `${member.displayName} is oriented toward message, offer, and reaching the right people.`;
    case "organize-process":
      return `${member.displayName} is good at simplifying systems so less has to live in your head.`;
    case "confidence-momentum":
      return `${member.displayName} helps restore steadiness and forward motion without pressure.`;
    case "not-sure":
      return `${member.displayName} is a gentle starting place when you are still naming the need.`;
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
