/**
 * Chamber member natural-language aliases and routing (CONV: member before room).
 * Members live in the Chamber of Momentum — users never need official display names.
 */

import {
  CHAMBER_MEMBERS,
  getChamberMemberById,
  type ChamberMemberId,
} from "./chamberMemberRegistry";

/** Explicit aliases per member (lowercase). Longer phrases match first. */
export const CHAMBER_MEMBER_ALIASES: Record<ChamberMemberId, readonly string[]> = {
  marketing: [
    "marketing intelligence",
    "marketing",
    "social media",
    "advertising",
    "promotions",
    "branding",
    "campaign",
    "campaigns",
    "email marketing",
    "promotion",
  ],
  sales: [
    "sales intelligence",
    "sales",
    "selling",
    "objections",
    "closing",
    "proposals",
    "pricing",
    "close deals",
  ],
  finance: [
    "finance intelligence",
    "finance",
    "financial",
    "bookkeeping",
    "accounting",
    "invoices",
    "invoice",
    "invoicing",
    "cash flow",
    "profit",
    "expenses",
    "money",
    "budget",
  ],
  "ai-technology": [
    "ai & technology",
    "ai and technology",
    "ai technology",
    "artificial intelligence",
    "chatgpt",
    "claude",
    "automation",
    "technology",
    "cursor",
    "coding",
    "gpt",
    "ai",
  ],
  leadership: [
    "leadership intelligence",
    "leadership",
    "leader",
    "leading",
    "management coaching",
  ],
  research: [
    "research & intelligence",
    "research and intelligence",
    "research intelligence",
    "research",
    "market research",
    "competitive research",
  ],
  content: [
    "content strategy",
    "content intelligence",
    "content",
    "copywriting",
    "blogging",
    "newsletter writing",
  ],
  "project-management": [
    "project management",
    "project manager",
    "projects management",
    "pm",
    "milestones",
    "deadlines",
  ],
  networking: [
    "networking intelligence",
    "networking",
    "network",
    "connections",
    "meet people",
  ],
  "client-relationships": [
    "client relationships",
    "client relationship",
    "client care",
    "clients",
    "customer relationships",
    "crm conversations",
  ],
  strategy: ["strategy intelligence", "strategy", "strategic", "priorities"],
  systems: ["systems intelligence", "systems", "workflows", "processes", "sops"],
  wellness: ["wellness intelligence", "wellness", "burnout", "energy management"],
  learning: ["learning intelligence", "learning", "study", "skill building"],
  presentations: [
    "presentations intelligence",
    "presentations",
    "presentation",
    "speaking",
    "slides",
  ],
  "data-analytics": [
    "data & analytics",
    "data and analytics",
    "data analytics",
    "analytics",
    "metrics",
    "kpi",
  ],
  events: ["events intelligence", "events", "event planning", "webinars"],
  partnerships: ["partnerships", "partners", "collaboration deals"],
  "people-culture": ["people & culture", "people and culture", "culture", "team culture"],
  "knowledge-management": [
    "knowledge management",
    "knowledge",
    "documentation systems",
  ],
  "creative-studio": ["creative studio", "creative direction", "creative"],
  innovations: ["innovations", "innovation", "new ideas"],
  horizons: ["horizons", "future vision", "long-term vision"],
  momentum: ["momentum intelligence", "momentum member", "keep moving"],
};

export type ChamberMemberMatch = {
  memberId: ChamberMemberId;
  matchedAlias: string;
  confidence: "high" | "medium";
};

export type ChamberMemberResolveResult =
  | { kind: "match"; match: ChamberMemberMatch }
  | {
      kind: "ambiguous";
      options: ChamberMemberMatch[];
      clarifyQuestion: string;
    }
  | { kind: "none" };

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9&\s+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Strip navigation verbs so "take me to marketing" → "marketing". */
export function stripChamberNavigationPhrases(text: string): string {
  return normalize(text)
    .replace(
      /^(?:please\s+)?(?:take me to|bring me to|go to|open|show me|show|visit|head to|let(?:'s| us) (?:go to|talk to|ask|see)|i (?:want|need) (?:to )?(?:talk to|see|ask|open)|talk to|ask|i need help with|help (?:me )?(?:with )?|i need)\s+/i,
      "",
    )
    .replace(/\b(?:chamber member|member|please)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function aliasListSorted(id: ChamberMemberId): string[] {
  return [...CHAMBER_MEMBER_ALIASES[id]].sort((a, b) => b.length - a.length);
}

function findAliasHits(haystack: string): ChamberMemberMatch[] {
  const hits: ChamberMemberMatch[] = [];
  const chamberRoomPhrase =
    /\bchamber of momentum\b/.test(haystack) ||
    /\bmomentum institute\b/.test(haystack);

  for (const member of CHAMBER_MEMBERS) {
    for (const alias of aliasListSorted(member.id)) {
      const a = normalize(alias);
      if (!a) continue;
      // Never treat the room name as the Momentum chamber member.
      if (
        chamberRoomPhrase &&
        member.id === "momentum" &&
        (a === "momentum" || a === "momentum member")
      ) {
        continue;
      }
      const re = new RegExp(
        `(?:^|\\b)${a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+")}(?:\\b|$)`,
        "i",
      );
      if (re.test(haystack)) {
        hits.push({
          memberId: member.id,
          matchedAlias: alias,
          confidence: a.length >= 6 || a === member.id ? "high" : "medium",
        });
        break;
      }
    }
    // Also match official display name fragments
    const display = normalize(member.displayName.replace(/ intelligence$/i, ""));
    if (
      display.length >= 4 &&
      !(chamberRoomPhrase && member.id === "momentum" && display === "momentum") &&
      new RegExp(
        `(?:^|\\b)${display.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\b|$)`,
        "i",
      ).test(haystack) &&
      !hits.some((h) => h.memberId === member.id)
    ) {
      hits.push({
        memberId: member.id,
        matchedAlias: member.displayName,
        confidence: "high",
      });
    }
  }
  return hits;
}

/** Prefer longer alias matches when multiple members hit. */
function dedupeBestHits(hits: ChamberMemberMatch[]): ChamberMemberMatch[] {
  const byId = new Map<ChamberMemberId, ChamberMemberMatch>();
  for (const hit of hits) {
    const prev = byId.get(hit.memberId);
    if (!prev || hit.matchedAlias.length > prev.matchedAlias.length) {
      byId.set(hit.memberId, hit);
    }
  }
  return [...byId.values()].sort(
    (a, b) => b.matchedAlias.length - a.matchedAlias.length,
  );
}

/**
 * Resolve which Chamber member the member is asking for.
 * Handles ambiguous business intents (e.g. "need more clients").
 */
export function resolveChamberMemberFromText(
  userText: string,
): ChamberMemberResolveResult {
  const raw = userText.trim();
  if (!raw) return { kind: "none" };

  const full = normalize(raw);
  const stripped = stripChamberNavigationPhrases(raw);

  // Room-only: Chamber of Momentum / Momentum Institute (no specific member)
  if (/\b(?:chamber of momentum|momentum institute)\b/.test(full)) {
    const remainder = full
      .replace(/\b(?:the\s+)?chamber of momentum\b/g, " ")
      .replace(/\b(?:the\s+)?momentum institute\b/g, " ")
      .replace(
        /\b(?:take me to|bring me to|go to|open|show me|show|visit|head to|let(?:'s| us) go to)\b/g,
        " ",
      )
      .replace(/\s+/g, " ")
      .trim();
    if (!remainder) {
      return { kind: "none" };
    }
  }

  // Ambiguous: need more clients → Sales or Client Relationships
  if (
    /\b(?:need|want|get|find|attract)\s+more\s+clients?\b/i.test(raw) ||
    /\bmore\s+clients?\b/i.test(raw)
  ) {
    return {
      kind: "ambiguous",
      options: [
        {
          memberId: "sales",
          matchedAlias: "sales",
          confidence: "medium",
        },
        {
          memberId: "client-relationships",
          matchedAlias: "client relationships",
          confidence: "medium",
        },
      ],
      clarifyQuestion:
        "Would Sales help you attract new people, or Client Relationships for the ones you already have?\n1. Sales\n2. Client Relationships",
    };
  }

  const haystacks = [stripped, full].filter(Boolean);
  let hits: ChamberMemberMatch[] = [];
  for (const h of haystacks) {
    hits = dedupeBestHits(findAliasHits(h));
    if (hits.length) break;
  }

  if (hits.length === 0) return { kind: "none" };

  // Single clear hit
  if (hits.length === 1) {
    return { kind: "match", match: hits[0]! };
  }

  // Multiple: if one alias is clearly longer / more specific, prefer it
  const [first, second] = hits;
  if (
    first &&
    second &&
    first.matchedAlias.length >= second.matchedAlias.length + 4
  ) {
    return { kind: "match", match: first };
  }

  if (first && first.matchedAlias.length >= 3) {
    const nonTiny = hits.filter((h) => h.matchedAlias.length >= 3);
    if (nonTiny.length === 1) {
      return { kind: "match", match: nonTiny[0]! };
    }
  }

  const labels = hits
    .slice(0, 3)
    .map((h, i) => {
      const m = getChamberMemberById(h.memberId);
      return `${i + 1}. ${m?.displayName.replace(/ Intelligence$/, "") ?? h.memberId}`;
    })
    .join("\n");

  return {
    kind: "ambiguous",
    options: hits.slice(0, 3),
    clarifyQuestion: `A few Chamber members could help — which one feels right?\n${labels}`,
  };
}

/** True when text is clearly asking for a chamber member (not just mentioning a topic casually). */
export function isChamberMemberRequest(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (
    /\b(?:take me to|bring me to|go to|open|show(?:\s+me)?|talk to|ask|let(?:'s| us) (?:talk to|ask|see)|i (?:want|need) (?:to )?(?:talk to|see|ask)|help (?:me )?(?:with )?)\b/i.test(
      t,
    )
  ) {
    return resolveChamberMemberFromText(t).kind !== "none";
  }
  // Bare member name: "Marketing" / "Finance"
  const stripped = stripChamberNavigationPhrases(t);
  if (stripped.split(/\s+/).length <= 4) {
    const result = resolveChamberMemberFromText(t);
    return result.kind === "match";
  }
  return false;
}

export function chamberMemberShortLabel(memberId: ChamberMemberId): string {
  const m = getChamberMemberById(memberId);
  return m?.displayName.replace(/ Intelligence$/, "") ?? memberId;
}
