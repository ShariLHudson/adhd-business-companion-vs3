/**
 * Chamber of Momentum — conversational intake matching.
 *
 * A THIN, DETERMINISTIC layer over the canonical systems (no AI, no new
 * registry): the 24-member registry + aliases (resolveChamberMemberFromText)
 * plus a need→member COVERAGE MAP built entirely from canonical member ids.
 *
 * Contract: return exactly THREE credible members (a best starting point plus
 * two genuinely different perspectives from the same need area) when a need is
 * recognized, or ONE gentle follow-up question when it is not. It never pads
 * with weak matches and never lists all 24.
 */

import {
  resolveChamberMemberFromText,
} from "./chamberMemberAliases";
import type { ChamberMemberRecommendation } from "./chamberPerspectiveGuide";
import {
  getChamberMemberById,
  type ChamberMember,
  type ChamberMemberId,
} from "./chamberMemberRegistry";

/** The single gentle follow-up shown when a request is too broad to match. */
export const CHAMBER_INTAKE_FOLLOW_UP =
  "What feels hardest right now: choosing between options, making a plan, or getting started?";

export type ChamberIntakeMatch =
  | {
      kind: "recommendations";
      basis: "topic" | "coverage" | "cross-specialty";
      primary: ChamberMemberRecommendation;
      /** Up to two additional perspectives (materially different from primary). */
      additional: ChamberMemberRecommendation[];
    }
  | {
      kind: "follow_up";
      question: string;
    };

/**
 * Need coverage areas → an ordered list of credible canonical members
 * (best first, then two genuinely different perspectives). Every one of the 24
 * members appears in at least one area, so need-based language can surface all
 * of them — not just the eleven the old perspective buckets reached.
 */
type NeedCategory =
  | "decisions"
  | "planning"
  | "marketing-selling"
  | "process-systems"
  | "finance-pricing"
  | "customers-market"
  | "people-hiring"
  | "technology-ai"
  | "risk-resilience"
  | "values-trust"
  | "founder-wellbeing"
  | "momentum"
  | "strategy-growth"
  | "assumptions-blindspots"
  | "events"
  | "ideas-innovation"
  | "creative"
  | "presentations"
  | "learning"
  | "networking"
  | "partnerships"
  | "knowledge"
  | "data"
  | "horizons";

const CATEGORY_MEMBERS: Record<NeedCategory, ChamberMemberId[]> = {
  decisions: ["strategy", "leadership", "research"],
  planning: ["project-management", "strategy", "systems"],
  "marketing-selling": ["marketing", "sales", "content"],
  "process-systems": ["systems", "project-management", "knowledge-management"],
  "finance-pricing": ["finance", "strategy", "data-analytics"],
  "customers-market": ["client-relationships", "sales", "research"],
  "people-hiring": ["people-culture", "leadership", "learning"],
  "technology-ai": ["ai-technology", "systems", "data-analytics"],
  "risk-resilience": ["strategy", "wellness", "leadership"],
  "values-trust": ["client-relationships", "leadership", "partnerships"],
  "founder-wellbeing": ["wellness", "momentum", "leadership"],
  momentum: ["momentum", "wellness", "strategy"],
  "strategy-growth": ["strategy", "horizons", "marketing"],
  "assumptions-blindspots": ["research", "strategy", "data-analytics"],
  events: ["events", "project-management", "marketing"],
  "ideas-innovation": ["innovations", "creative-studio", "horizons"],
  creative: ["creative-studio", "content", "innovations"],
  presentations: ["presentations", "content", "marketing"],
  learning: ["learning", "knowledge-management", "people-culture"],
  networking: ["networking", "partnerships", "client-relationships"],
  partnerships: ["partnerships", "networking", "strategy"],
  knowledge: ["knowledge-management", "systems", "learning"],
  data: ["data-analytics", "research", "strategy"],
  horizons: ["horizons", "innovations", "strategy"],
};

/** Ordered detection — first match wins; specific areas precede broad ones. */
const CATEGORY_PATTERNS: { category: NeedCategory; pattern: RegExp }[] = [
  { category: "events", pattern: /\b(events?|retreat\w*|workshop\w*|seminar\w*|conference\w*|summit\w*|gathering\w*|webinar\w*|gala|convention|meetup|venue|agenda|attendees?|registration)\b/i },
  { category: "finance-pricing", pattern: /\b(financ\w*|money|budget\w*|cash\s*flow|pricing|price|profit\w*|revenue|cost\w*|invoic\w*|expenses?|bookkeep\w*|accounting)\b/i },
  { category: "people-hiring", pattern: /\b(hir\w*|recruit\w*|staff\w*|employee\w*|onboard\w*|candidate\w*|interview\w*|human resources|\bhr\b|talent|team\s*(?:culture|fit)|people\s*(?:and\s*culture|management))\b/i },
  { category: "technology-ai", pattern: /\b(\bai\b|a\.i\.|artificial intelligence|automat\w*|software|no[\s-]?code|integration\w*|\bapi\b|chatgpt|claude|tech(?:nology)?\s*(?:stack|tool|choice))\b/i },
  { category: "data", pattern: /\b(data|analytic\w*|metric\w*|\bkpis?\b|measure\w*|dashboard\w*|the numbers|reporting)\b/i },
  { category: "presentations", pattern: /\b(present\w*|slide\w*|\bdeck\b|pitch\w*|keynote|speaking|a\s+talk)\b/i },
  { category: "creative", pattern: /\b(creative\s*(?:direction|studio)?|design\w*|visual\w*|aesthetic\w*|look and feel|brand\s*visuals)\b/i },
  { category: "ideas-innovation", pattern: /\b(innovat\w*|invent\w*|new\s+(?:idea|product|service|concept)s?|experiment\w*|brainstorm\w*|too many ideas)\b/i },
  { category: "learning", pattern: /\b(learn\w*|skill\w*|study\w*|\bcourse\b|master\w*|training|upskill\w*|get better at)\b/i },
  { category: "networking", pattern: /\b(network\w*|connection\w*|meet people|introduction\w*|referral\w*)\b/i },
  { category: "partnerships", pattern: /\b(partner\w*|collaborat\w*|joint venture|alliance\w*|co[\s-]?found\w*|affiliate\w*)\b/i },
  { category: "knowledge", pattern: /\b(knowledge|documentation|second brain|organize (?:what i know|my (?:notes|information))|\bwiki\b|reference library)\b/i },
  { category: "marketing-selling", pattern: /\b(marketing|advertis\w*|ads?|campaign\w*|promot\w*|audience|brand\w*|selling|sales|lead\w*|messaging|\bcopy\b|social media|funnel|content)\b/i },
  { category: "customers-market", pattern: /\b(customer\w*|client\w*|competitor\w*|market research|buyer\w*|churn|retention)\b/i },
  { category: "process-systems", pattern: /\b(process\w*|workflow\w*|system\w*|operation\w*|sops?|bottleneck\w*|streamline\w*|repeatable|standard operating)\b/i },
  { category: "risk-resilience", pattern: /\b(risk\w*|resilien\w*|contingen\w*|worst[\s-]?case|downside|mitigat\w*|safeguard\w*|backup plan|what could go wrong)\b/i },
  { category: "values-trust", pattern: /\b(values?|trust|integrity|ethic\w*|authentic\w*|reputation|do the right thing|true to)\b/i },
  { category: "assumptions-blindspots", pattern: /\b(assumption\w*|blind\s?spot\w*|(?:what|am i) missing|overlook\w*|challenge my thinking|pressure[\s-]?test|poke holes|second opinion|another perspective)\b/i },
  { category: "founder-wellbeing", pattern: /\b(burn(?:ed|t)?\s?out|burnout|exhaust\w*|wellbeing|well-being|work[\s-]?life|boundaries|rest|self[\s-]?care|running on empty)\b/i },
  { category: "momentum", pattern: /\b(stuck|momentum|motivat\w*|procrastinat\w*|paralysis|where (?:to|do i) start|getting started|get started|can'?t start|keep going|falling behind|restart|lost steam)\b/i },
  { category: "planning", pattern: /\b(plan\w*|roadmap|sequenc\w*|timeline|prioriti\w*|next steps?|schedul\w*|deadline\w*|\bproject\b)\b/i },
  { category: "decisions", pattern: /\b(decid\w*|decision\w*|choose|choosing|choice\w*|torn|weigh\w*|whether to|should i|can'?t decide|between options|which option)\b/i },
  { category: "horizons", pattern: /\b(future|long[\s-]?term|trends?|what'?s next|five years|vision for|where (?:this|we) (?:is|are) (?:going|headed))\b/i },
  { category: "strategy-growth", pattern: /\b(strateg\w*|grow\w*|scal\w*|expand\w*|direction|\bvision\b|big picture)\b/i },
];

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function toRecommendation(
  member: ChamberMember,
  whyFits: string,
): ChamberMemberRecommendation {
  return { member, whyFits, canHelpWith: member.howTheyHelp };
}

/** Position-anchored, member-specific, materially-different reasons. */
function reasonForPosition(member: ChamberMember, index: number): string {
  const focus = member.specialty.toLowerCase().replace(/\.$/, "");
  if (index === 0) {
    return `${member.displayName} is the best starting point — ${focus} is exactly what this calls for.`;
  }
  if (index === 1) {
    return `${member.displayName} adds a useful second angle: ${focus}.`;
  }
  return `${member.displayName} brings a different lens worth considering — ${focus}.`;
}

function dedupeIds(ids: readonly ChamberMemberId[]): ChamberMemberId[] {
  return [...new Set(ids)];
}

/** First coverage area whose credible list contains this member. */
function categoryContaining(id: ChamberMemberId): NeedCategory | null {
  for (const category of Object.keys(CATEGORY_MEMBERS) as NeedCategory[]) {
    if (CATEGORY_MEMBERS[category].includes(id)) return category;
  }
  return null;
}

/** Build a three-member recommendation (or follow-up if <3 credible exist). */
function build(
  basis: "topic" | "coverage" | "cross-specialty",
  seedIds: readonly ChamberMemberId[],
  fillCategory: NeedCategory | null,
): ChamberIntakeMatch {
  const ids = dedupeIds([
    ...seedIds,
    ...(fillCategory ? CATEGORY_MEMBERS[fillCategory] : []),
  ]).slice(0, 3);

  const members = ids
    .map((id) => getChamberMemberById(id))
    .filter((m): m is ChamberMember => Boolean(m));

  // Credibility over slot-filling: fewer than three credible → follow-up.
  if (members.length < 3) {
    return { kind: "follow_up", question: CHAMBER_INTAKE_FOLLOW_UP };
  }

  const recs = members.map((m, i) => toRecommendation(m, reasonForPosition(m, i)));
  return {
    kind: "recommendations",
    basis,
    primary: recs[0]!,
    additional: recs.slice(1, 3),
  };
}

/**
 * Match a natural-language request to three Chamber members, or one follow-up.
 * Topic/need matching only — never an AI evaluation.
 */
export function matchChamberIntake(userText: string): ChamberIntakeMatch {
  const normalized = normalize(userText);
  if (!normalized) {
    return { kind: "follow_up", question: CHAMBER_INTAKE_FOLLOW_UP };
  }

  // 1. Direct member (alias) match → that member leads, filled by its area.
  const resolved = resolveChamberMemberFromText(userText);
  if (resolved.kind === "match") {
    const id = resolved.match.memberId;
    return build("topic", [id], categoryContaining(id));
  }
  if (resolved.kind === "ambiguous") {
    // Genuinely crosses specialties → seed with the options, fill to three.
    const optionIds = resolved.options.map((o) => o.memberId);
    return build("cross-specialty", optionIds, categoryContaining(optionIds[0]!));
  }

  // 2. Need-language → a coverage area (surfaces all 24 members).
  for (const { category, pattern } of CATEGORY_PATTERNS) {
    if (pattern.test(userText)) {
      return build("coverage", CATEGORY_MEMBERS[category], category);
    }
  }

  // 3. Too broad to place → one gentle follow-up. Never lists all 24.
  return { kind: "follow_up", question: CHAMBER_INTAKE_FOLLOW_UP };
}
