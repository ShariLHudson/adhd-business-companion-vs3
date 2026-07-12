import type { AdvisoryMember, AdvisoryMemberId } from "@/lib/advisory/types";
import {
  ADVISORY_BOARD_MEMBERS,
  getBoardMemberDefinition,
} from "@/lib/advisory/members/boardMembers";

const KEYWORD_HINTS: { pattern: RegExp; members: AdvisoryMemberId[] }[] = [
  {
    pattern: /\b(price|pricing|revenue|offer|sell|sales|money|cost|budget|invest)\b/i,
    members: ["finance", "sales-director", "ceo", "strategist"],
  },
  {
    pattern: /\b(product|feature|ship|scope|roadmap|build|launch)\b/i,
    members: ["product-manager", "technology-advisor", "strategist", "ceo"],
  },
  {
    pattern: /\b(market|brand|campaign|content|audience|message)\b/i,
    members: ["marketing-director", "creative-director", "sales-director"],
  },
  {
    pattern: /\b(overwhelm|adhd|energy|focus|burnout|tired|stuck)\b/i,
    members: ["adhd-expert", "behavioral-psychology", "customer-experience"],
  },
  {
    pattern: /\b(team|hire|ops|process|system|automat)\b/i,
    members: ["operations", "technology-advisor", "ai-advisor"],
  },
  {
    pattern: /\b(learn|course|workshop|teach|training)\b/i,
    members: ["learning-designer", "community-builder", "research-analyst"],
  },
  {
    pattern: /\b(access|inclusive|voice|disability|readable)\b/i,
    members: ["accessibility-expert", "customer-experience", "adhd-expert"],
  },
  {
    pattern: /\b(vision|future|brand|feel|estate|experience)\b/i,
    members: ["visionary", "creative-director", "customer-experience"],
  },
];

const DEFAULT_BOARD: AdvisoryMemberId[] = [
  "ceo",
  "strategist",
  "finance",
  "adhd-expert",
  "customer-experience",
];

/** Recommend a balanced board from the situation text (5–7 members). */
export function recommendBestBoard(situation: string): AdvisoryMemberId[] {
  const scored = new Map<AdvisoryMemberId, number>();
  for (const id of DEFAULT_BOARD) scored.set(id, 2);

  for (const hint of KEYWORD_HINTS) {
    if (!hint.pattern.test(situation)) continue;
    hint.members.forEach((id, i) => {
      scored.set(id, (scored.get(id) ?? 0) + (4 - Math.min(i, 3)));
    });
  }

  const ranked = [...scored.entries()].sort((a, b) => b[1] - a[1]);
  const picked = ranked.slice(0, 6).map(([id]) => id);

  // Ensure diversity of core lenses
  const ensure: AdvisoryMemberId[] = ["strategist", "adhd-expert"];
  for (const id of ensure) {
    if (!picked.includes(id) && picked.length < 7) picked.push(id);
  }

  return picked.slice(0, 7);
}

export function resolveBoardMembers(
  ids: readonly AdvisoryMemberId[],
): AdvisoryMember[] {
  return ids
    .map((id) => getBoardMemberDefinition(id))
    .filter((m): m is AdvisoryMember => Boolean(m));
}

export function listAllBoardMembers(): AdvisoryMember[] {
  return [...ADVISORY_BOARD_MEMBERS];
}

export function memberPerspectiveLabel(member: AdvisoryMember): string {
  const firstExpertise = member.expertise[0] ?? member.role;
  return `${firstExpertise} — ${member.decisionStyle}`;
}
