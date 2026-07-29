/**
 * Expertise-category routing for GENERAL Companion chat.
 *
 * Shari owns the relationship + voice. When a general-chat question clearly needs
 * business-specialist substance and no Chamber/Board member is already active,
 * this resolver names ONE expertise category and its owning Chamber member so the
 * caller can inject that member's existing `chamberMemberHintForChat` into the
 * single existing model call. The user never has to name a member.
 *
 * Conservative by design: only a clearly-dominant category resolves; ambiguous,
 * general, emotional, Create, or rejection turns return null → normal Shari chat.
 *
 * This module owns no biographies, prompts, or expertise descriptions — those
 * stay in the registry / member hint. It only maps category → member id + signals.
 */

import type { ChamberMemberId } from "./chamberMemberRegistry";
import { isExplicitCreationRequest } from "@/lib/messageClassification";
import { isCreateRejection } from "@/lib/createIntentVocabulary";

/** Canonical expertise categories — one primary per Chamber member. */
export type ExpertiseCategory =
  | "people-culture"
  | "leadership"
  | "finance"
  | "marketing"
  | "sales"
  | "strategy"
  | "operations"
  | "client-relationships"
  | "events"
  | "knowledge-management"
  | "project-management"
  | "content"
  | "creative"
  | "data-analytics"
  | "technology"
  | "research"
  | "networking"
  | "partnerships"
  | "presentations"
  | "learning"
  | "wellness"
  | "innovation"
  | "horizons"
  | "momentum";

export type ChamberExpertiseOwnership = {
  memberId: ChamberMemberId;
  primaryCategory: ExpertiseCategory;
  secondaryCategories?: readonly ExpertiseCategory[];
  /**
   * When true, a general-chat turn that resolves to this member's PRIMARY
   * category may auto-inject the member's expertise hint. Enabled only for
   * members the architecture audit rated "ready enough now" or "usable but thin".
   * Members with autoRoute:false remain reachable by direct selection but are
   * never chosen automatically until a later slice enables them.
   */
  autoRoute: boolean;
};

/**
 * Canonical ownership map — every current Chamber member has one primary category.
 * autoRoute reflects the audit's readiness classification:
 *   ready now:        client-relationships, knowledge-management, events
 *   usable but thin:  finance, marketing, sales, strategy, people-culture,
 *                     leadership, systems(operations), project-management
 *   underdeveloped:   the remainder → autoRoute:false (direct selection only)
 */
export const CHAMBER_EXPERTISE_OWNERSHIP: readonly ChamberExpertiseOwnership[] = [
  // --- ready now ---
  {
    memberId: "client-relationships",
    primaryCategory: "client-relationships",
    secondaryCategories: ["sales"],
    autoRoute: true,
  },
  { memberId: "knowledge-management", primaryCategory: "knowledge-management", autoRoute: true },
  { memberId: "events", primaryCategory: "events", autoRoute: true },
  // --- usable but thin ---
  {
    memberId: "people-culture",
    primaryCategory: "people-culture",
    secondaryCategories: ["leadership"],
    autoRoute: true,
  },
  {
    memberId: "leadership",
    primaryCategory: "leadership",
    secondaryCategories: ["people-culture", "strategy"],
    autoRoute: true,
  },
  {
    memberId: "finance",
    primaryCategory: "finance",
    secondaryCategories: ["strategy"],
    autoRoute: true,
  },
  {
    memberId: "marketing",
    primaryCategory: "marketing",
    secondaryCategories: ["content", "sales"],
    autoRoute: true,
  },
  {
    memberId: "sales",
    primaryCategory: "sales",
    secondaryCategories: ["client-relationships", "marketing"],
    autoRoute: true,
  },
  {
    memberId: "strategy",
    primaryCategory: "strategy",
    secondaryCategories: ["finance"],
    autoRoute: true,
  },
  {
    memberId: "systems",
    primaryCategory: "operations",
    secondaryCategories: ["project-management"],
    autoRoute: true,
  },
  {
    memberId: "project-management",
    primaryCategory: "project-management",
    secondaryCategories: ["operations"],
    autoRoute: true,
  },
  // --- underdeveloped: available by direct selection, not auto-routed yet ---
  { memberId: "content", primaryCategory: "content", secondaryCategories: ["marketing"], autoRoute: false },
  { memberId: "creative-studio", primaryCategory: "creative", autoRoute: false },
  { memberId: "data-analytics", primaryCategory: "data-analytics", autoRoute: false },
  { memberId: "ai-technology", primaryCategory: "technology", autoRoute: false },
  { memberId: "research", primaryCategory: "research", autoRoute: false },
  { memberId: "networking", primaryCategory: "networking", autoRoute: false },
  { memberId: "partnerships", primaryCategory: "partnerships", autoRoute: false },
  { memberId: "presentations", primaryCategory: "presentations", autoRoute: false },
  { memberId: "learning", primaryCategory: "learning", autoRoute: false },
  { memberId: "wellness", primaryCategory: "wellness", autoRoute: false },
  { memberId: "innovations", primaryCategory: "innovation", autoRoute: false },
  { memberId: "horizons", primaryCategory: "horizons", autoRoute: false },
  { memberId: "momentum", primaryCategory: "momentum", autoRoute: false },
];

/** category → owning member id, but only for auto-route-enabled owners. */
const AUTO_ROUTE_CATEGORY_OWNER: Partial<Record<ExpertiseCategory, ChamberMemberId>> =
  (() => {
    const owners: Partial<Record<ExpertiseCategory, ChamberMemberId>> = {};
    for (const entry of CHAMBER_EXPERTISE_OWNERSHIP) {
      if (entry.autoRoute) owners[entry.primaryCategory] = entry.memberId;
    }
    return owners;
  })();

/**
 * Conservative signal patterns per auto-routable category. Only categories with a
 * clear, ready owner and low-ambiguity signals are listed; every other category
 * has no general-chat signals and is never auto-selected from plain chat text.
 */
const CATEGORY_SIGNALS: Partial<Record<ExpertiseCategory, readonly RegExp[]>> = {
  "people-culture": [
    /\b(?:hir(?:e|ing)|recruit(?:ing)?|candidate|applicant|interview(?:ing)?|onboard(?:ing)?)\b/i,
    /\b(?:promot(?:e|ing|ion)|demote|fir(?:e|ing)|lay(?:ing)?\s*off|let\s+(?:her|him|them)\s+go)\b[^.?!]*\b(?:employee|team|staff|manager|report|someone|her|him|them)\b/i,
    /\b(?:employee|team member|staff member|direct report|my team\b|team dynamics|team conflict|workplace culture|team morale|people (?:issue|problem|leadership)|managing (?:my )?people)\b/i,
  ],
  finance: [
    /\b(?:cash\s*flow|profit(?:ability)?|margin|revenue|expenses?|budget|bookkeep(?:ing)?|accounting|invoic(?:e|ing)|pricing|how much (?:should i|to) charge|price my|afford|break[- ]?even|return on investment|\broi\b)\b/i,
    /\bshould i (?:spend|invest|pay)\b[^.?!]*(?:\$\s?\d|money|dollars?)/i,
    /\bfinanc(?:e|ial)\s+(?:class|course|training|coach|advisor|advice|decision)\b/i,
  ],
  marketing: [
    /\b(?:advertis(?:e|ed|es|ing|ement)|ads?\b|ad campaign|marketing|positioning|brand(?:ing)?|social media (?:marketing|posts?|strategy)|content marketing|seo\b|reach (?:new )?(?:customers|clients|people)|get the word out|grow (?:my )?audience|promote my (?:business|product|brand|offer|service)|market my (?:business|product|service))\b/i,
  ],
  sales: [
    /\b(?:close (?:the |more )?deals?|sales call|sales pitch|handle (?:my )?objections?|convert (?:leads|prospects)|sales funnel|follow up with (?:leads|prospects)|increase (?:my )?sales|cold (?:call|email|outreach)|discovery call|my sales process)\b/i,
  ],
  strategy: [
    /\b(?:business strategy|strategic (?:direction|plan|choice|priorit)|competitive (?:advantage|position)|which market|market to enter|business direction|long[- ]term direction|prioriti[sz]e (?:my )?business|pivot my business)\b/i,
  ],
  operations: [
    /\b(?:workflow|standard operating procedure|\bsop\b|streamline (?:my )?(?:process|operations|workflow)|business process|automate (?:my )?(?:workflow|process|business)|operational efficiency|systemi[sz]e|delegate (?:my )?(?:tasks|work))\b/i,
  ],
};

/**
 * Resolve a general-chat request to one expertise category + owning member, or
 * null. Returns null for Create requests, Create rejections, empty/general text,
 * and any turn without a single clearly-dominant category.
 */
export function resolveExpertiseCategory(
  userText: string,
): { category: ExpertiseCategory; memberId: ChamberMemberId } | null {
  const t = (userText ?? "").trim();
  if (!t) return null;
  // Create + rejection turns are owned elsewhere — never expertise routing.
  if (isCreateRejection(t)) return null;
  if (isExplicitCreationRequest(t)) return null;

  const scores: [ExpertiseCategory, number][] = [];
  for (const [category, patterns] of Object.entries(CATEGORY_SIGNALS) as [
    ExpertiseCategory,
    readonly RegExp[],
  ][]) {
    let hits = 0;
    for (const re of patterns) if (re.test(t)) hits += 1;
    if (hits > 0) scores.push([category, hits]);
  }
  if (scores.length === 0) return null;

  // Require a single, clearly-dominant category (strictly beats the runner-up).
  scores.sort((a, b) => b[1] - a[1]);
  const [topCategory, topScore] = scores[0]!;
  const secondScore = scores[1]?.[1] ?? 0;
  if (topScore <= secondScore) return null; // ambiguous → default to Shari

  const memberId = AUTO_ROUTE_CATEGORY_OWNER[topCategory];
  if (!memberId) return null; // category has no ready auto-route owner
  return { category: topCategory, memberId };
}

/**
 * Integration boundary for general chat. Preserves existing member ownership:
 * if a Chamber/Board member is already active or explicitly named this turn,
 * returns null (the existing owner wins). Otherwise returns the resolved
 * specialist member id, or null for general/ambiguous turns.
 */
export function selectGeneralChatExpertiseMember(input: {
  userText: string;
  hasActiveOrNamedMember: boolean;
}): ChamberMemberId | null {
  if (input.hasActiveOrNamedMember) return null;
  return resolveExpertiseCategory(input.userText)?.memberId ?? null;
}
