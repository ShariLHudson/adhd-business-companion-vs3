import type {
  AggregatedSignal,
  ProductCategory,
  ProductOpportunity,
  PriorityLevel,
} from "./types";

type OpportunityPattern = {
  id: string;
  title: string;
  hypothesis: string;
  category: ProductCategory;
  patterns: RegExp[];
  minCount: number;
};

const OPPORTUNITY_PATTERNS: OpportunityPattern[] = [
  {
    id: "opp-doc-workflow",
    title: "Improve document workflow and onboarding",
    hypothesis:
      "Users repeatedly ask where documents are saved — clearer save flow and onboarding would reduce confusion.",
    category: "google_docs",
    patterns: [
      /where.*(document|doc|save)/i,
      /document.*(go|saved|find)/i,
      /google doc/i,
    ],
    minCount: 2,
  },
  {
    id: "opp-create-blank",
    title: "Make Create start clean unless user resumes",
    hypothesis:
      "Stale draft content on Create confuses users — default to blank with explicit resume.",
    category: "create",
    patterns: [/old content/i, /stale/i, /opens old/i, /previous draft/i],
    minCount: 1,
  },
  {
    id: "opp-timeblock-context",
    title: "Preserve project context in Time Block",
    hypothesis:
      "Time Block loses project context — linking blocks to active project would reduce friction.",
    category: "time_block",
    patterns: [/time\s*block/i, /project context/i, /not saving/i],
    minCount: 1,
  },
  {
    id: "opp-focus-audio",
    title: "Stabilize Focus Audio entry point",
    hypothesis:
      "Focus Audio fails to open for some users — reliability and discoverability need work.",
    category: "focus",
    patterns: [/focus audio/i, /audio.*(open|play|start)/i],
    minCount: 1,
  },
  {
    id: "opp-integrations",
    title: "Expand integrations users are asking for",
    hypothesis:
      "Repeated integration requests signal demand for calendar, mobile, or template expansion.",
    category: "integrations",
    patterns: [/calendar/i, /mobile app/i, /integration/i, /templates?/i],
    minCount: 2,
  },
  {
    id: "opp-dashboard-nav",
    title: "Clarify workspace navigation",
    hypothesis:
      "Missing or confusing workspace buttons create navigation dead-ends.",
    category: "dashboard",
    patterns: [/button.*disappear/i, /navigation/i, /sidebar/i, /workspace button/i],
    minCount: 1,
  },
];

function impactFromCount(count: number): PriorityLevel {
  if (count >= 4) return "high";
  if (count >= 2) return "medium";
  return "low";
}

export function identifyOpportunities(
  frustrations: AggregatedSignal[],
  requests: AggregatedSignal[],
): ProductOpportunity[] {
  const combined = [...frustrations, ...requests];
  const opportunities: ProductOpportunity[] = [];

  for (const pattern of OPPORTUNITY_PATTERNS) {
    const matches = combined.filter((s) =>
      pattern.patterns.some((re) => re.test(s.text)),
    );
    const totalCount = matches.reduce((sum, m) => sum + m.count, 0);
    if (totalCount < pattern.minCount) continue;

    opportunities.push({
      id: pattern.id,
      title: pattern.title,
      hypothesis: pattern.hypothesis,
      evidence: matches.slice(0, 4).map((m) => `${m.text} (×${m.count})`),
      category: pattern.category,
      relatedSignalKeys: matches.map((m) => m.key),
      potentialImpact: impactFromCount(totalCount),
    });
  }

  return opportunities.sort((a, b) => {
    const rank = { high: 3, medium: 2, low: 1 };
    return rank[b.potentialImpact] - rank[a.potentialImpact];
  });
}
