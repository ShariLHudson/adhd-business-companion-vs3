// Founder Ecosystem — Phase 5 Advisor Routing Engine.
// Decides which advisors should weigh in on a founder message. Scored by
// message keywords + signals from the Phase 4 intelligence layer. Pure.

import type { AdvisorId, AdvisorRouting } from "./advisorTypes";
import { ALL_ADVISOR_IDS } from "./advisorTypes";
import type { FounderIntelligence } from "../intelligence/intelligenceTypes";

const KEYWORDS: Record<AdvisorId, RegExp> = {
  sales:
    /\b(clients?|customers?|revenue|sell|sale|prospect|lead|close|pitch|money|income|book(ing)?s?|paying|outreach|follow.?up)\b/i,
  marketing:
    /\b(marketing|audience|visibility|content|reach|followers?|post|find me|grow|funnel|brand|email list)\b/i,
  ceo: /\b(priorit|too many ideas|which (one|thing)|strateg|vision|goal|direction|big picture|decide what|focus on what|long.?term)\b/i,
  operations:
    /\b(system(ize|ise|s)?|process|repetitive|bottleneck|automat|document|sop|workflow|efficien|streamline)\b/i,
  productivity:
    /\b(what (should|do) i (work on|do)|what to work on|don'?t know what to work on|next step|overwhelmed?|too much|stuck|can'?t start|can'?t focus|focus|today|momentum|get going|where (do|to) (i )?start|avoid(ing)?|keep putting off|procrastinat)\b/i,
  accountability:
    /\b(unfinished|didn'?t finish|behind|overdue|commit|promise|follow.?through|keep starting|never finish|fell off|haven'?t (done|finished))\b/i,
  wellness:
    /\b(tired|exhaust|burn(t|ed|out)?|energy|capacity|stress|drained|overwhelm|too much|need a break|can'?t keep up|running on empty)\b/i,
};

// When scoring is sparse, fill secondaries with sensible companions.
const COMPANIONS: Record<AdvisorId, AdvisorId[]> = {
  productivity: ["wellness", "ceo", "accountability"],
  sales: ["marketing", "ceo"],
  ceo: ["operations", "productivity"],
  marketing: ["sales", "ceo"],
  operations: ["productivity", "ceo"],
  accountability: ["productivity", "ceo"],
  wellness: ["productivity", "accountability"],
};

// Tie-break priority for the primary slot.
const PRIORITY: AdvisorId[] = [
  "productivity",
  "ceo",
  "sales",
  "marketing",
  "accountability",
  "operations",
  "wellness",
];

export function routeAdvisors(
  message: string,
  intel?: FounderIntelligence,
): AdvisorRouting {
  const score: Record<AdvisorId, number> = {
    ceo: 0,
    marketing: 0,
    sales: 0,
    operations: 0,
    productivity: 0,
    accountability: 0,
    wellness: 0,
  };

  for (const id of ALL_ADVISOR_IDS) {
    if (KEYWORDS[id].test(message)) score[id] += 2;
  }

  // Intelligence-informed boosts (a softer nudge than direct keywords).
  if (intel) {
    const riskTypes = new Set(intel.risks.map((r) => r.type));
    const patternTypes = new Set(intel.patterns.map((p) => p.type));
    if (riskTypes.has("no-sales-activity")) score.sales += 1;
    if (riskTypes.has("no-marketing-activity")) score.marketing += 1;
    if (riskTypes.has("repeated-overwhelm")) score.wellness += 1;
    if (
      riskTypes.has("unfinished-priorities") ||
      patternTypes.has("unfinished-tasks") ||
      patternTypes.has("focus-abandonment")
    )
      score.accountability += 1;
    if (patternTypes.has("project-switching")) score.ceo += 1;
  }

  // Primary: highest score, tie-broken by PRIORITY. Default to productivity.
  const anyScore = ALL_ADVISOR_IDS.some((id) => score[id] > 0);
  const primary: AdvisorId = anyScore
    ? PRIORITY.reduce((best, id) => (score[id] > score[best] ? id : best), PRIORITY[0]!)
    : "productivity";

  // Secondary: companions first, then other advisors that scored.
  const secondary: AdvisorId[] = [];
  for (const c of COMPANIONS[primary]) {
    if (secondary.length >= 2) break;
    if (c !== primary && !secondary.includes(c)) secondary.push(c);
  }
  for (const id of ALL_ADVISOR_IDS.filter((aid) => aid !== primary && score[aid] > 0).sort(
    (a, b) => score[b] - score[a],
  )) {
    if (secondary.length >= 2) break;
    if (!secondary.includes(id)) secondary.push(id);
  }

  // Outreach avoidance: productivity leads pacing; sales still weighs in on the emails.
  if (
    primary === "productivity" &&
    /\boutreach\b/i.test(message) &&
    /\b(avoid(ing)?|procrastinat|putting off)\b/i.test(message) &&
    !secondary.includes("sales")
  ) {
    if (secondary.length >= 2) secondary.pop();
    secondary.unshift("sales");
  }

  return { primary, secondary: secondary.slice(0, 2) };
}
