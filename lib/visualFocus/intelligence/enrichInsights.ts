/**
 * Enrich plain-text intelligence items with section links and priority badges.
 */

import type { BusinessCanvasSectionId } from "../businessCanvas/types";
import { BUSINESS_CANVAS_SECTION_GUIDANCE } from "../businessCanvas/guidance";
import { themeForSection } from "../businessCanvas/sectionTheme";
import type { IntelligenceCategoryId } from "./themes";
import type { VisualFocusAnalysis } from "../types";

export type IntelligenceBadgeId =
  | "high_risk"
  | "growth_opportunity"
  | "emerging_pattern"
  | "strong_connection"
  | "strategic_observation"
  | "action_priority";

export type IntelligenceBadge = {
  id: IntelligenceBadgeId;
  label: string;
  emoji: string;
  bg: string;
  text: string;
};

export const INTELLIGENCE_BADGES: Record<IntelligenceBadgeId, IntelligenceBadge> = {
  high_risk: {
    id: "high_risk",
    label: "High Risk",
    emoji: "⚠️",
    bg: "#fef2f2",
    text: "#b91c1c",
  },
  growth_opportunity: {
    id: "growth_opportunity",
    label: "Growth Opportunity",
    emoji: "🚀",
    bg: "#f0fdf4",
    text: "#15803d",
  },
  emerging_pattern: {
    id: "emerging_pattern",
    label: "Emerging Pattern",
    emoji: "📈",
    bg: "#f0fdfa",
    text: "#0f766e",
  },
  strong_connection: {
    id: "strong_connection",
    label: "Strong Connection",
    emoji: "🔗",
    bg: "#f5f3ff",
    text: "#6d28d9",
  },
  strategic_observation: {
    id: "strategic_observation",
    label: "Strategic Observation",
    emoji: "🧠",
    bg: "#f0f4f4",
    text: "#1e4f4f",
  },
  action_priority: {
    id: "action_priority",
    label: "Action Priority",
    emoji: "✅",
    bg: "#fffbeb",
    text: "#b45309",
  },
};

export type EnrichedInsightItem = {
  text: string;
  sectionId?: BusinessCanvasSectionId;
  sectionLabel?: string;
  sectionEmoji?: string;
  sectionColor?: string;
  badge?: IntelligenceBadge;
};

const SECTION_MATCHERS: { id: BusinessCanvasSectionId; patterns: RegExp[] }[] = [
  {
    id: "customer-segments",
    patterns: [
      /\bcustomer segments?\b/i,
      /\baudience\b/i,
      /\bwho you serve\b/i,
    ],
  },
  {
    id: "value-proposition",
    patterns: [/\bvalue proposition\b/i, /\bwhat you promise\b/i],
  },
  {
    id: "channels",
    patterns: [/\bchannels?\b/i, /\bvisibility\b/i, /\bmarketing\b/i, /\bpinterest\b/i, /\blinkedin\b/i],
  },
  {
    id: "customer-relationships",
    patterns: [/\bcustomer relationships?\b/i, /\bsupport\b/i, /\bretention\b/i],
  },
  {
    id: "revenue-streams",
    patterns: [/\brevenue streams?\b/i, /\brevenue\b/i, /\bincome\b/i, /\bpricing\b/i],
  },
  {
    id: "key-activities",
    patterns: [/\bkey activities\b/i, /\bactivities\b/i],
  },
  {
    id: "key-resources",
    patterns: [/\bkey resources\b/i, /\bresources\b/i],
  },
  {
    id: "key-partners",
    patterns: [/\bkey partners\b/i, /\bpartners\b/i],
  },
  {
    id: "cost-structure",
    patterns: [/\bcost structure\b/i, /\bcosts?\b/i, /\bprofitabilit/i],
  },
];

function detectExplicitSectionPrefix(text: string): BusinessCanvasSectionId | undefined {
  const trimmed = text.trim();
  for (const id of Object.keys(BUSINESS_CANVAS_SECTION_GUIDANCE) as BusinessCanvasSectionId[]) {
    const title = BUSINESS_CANVAS_SECTION_GUIDANCE[id].title;
    if (
      trimmed.startsWith(title) ||
      trimmed.toLowerCase().startsWith(title.toLowerCase())
    ) {
      return id;
    }
  }
  return undefined;
}

function detectSection(text: string): BusinessCanvasSectionId | undefined {
  const explicit = detectExplicitSectionPrefix(text);
  if (explicit) return explicit;
  for (const { id, patterns } of SECTION_MATCHERS) {
    if (patterns.some((re) => re.test(text))) return id;
  }
  return undefined;
}

function defaultBadgeForCategory(
  category: IntelligenceCategoryId,
  text: string,
): IntelligenceBadge | undefined {
  switch (category) {
    case "risks":
      return INTELLIGENCE_BADGES.high_risk;
    case "opportunities":
      return INTELLIGENCE_BADGES.growth_opportunity;
    case "patterns":
      return INTELLIGENCE_BADGES.emerging_pattern;
    case "key_relationships":
      return INTELLIGENCE_BADGES.strong_connection;
    case "board_observations":
      return INTELLIGENCE_BADGES.strategic_observation;
    case "recommendations":
    case "next_steps":
      return INTELLIGENCE_BADGES.action_priority;
    case "what_if":
      return /\bripple\b/i.test(text)
        ? INTELLIGENCE_BADGES.emerging_pattern
        : undefined;
    default:
      return undefined;
  }
}

export function enrichInsightText(
  text: string,
  category: IntelligenceCategoryId,
): EnrichedInsightItem {
  const sectionId = detectSection(text);
  const badge = defaultBadgeForCategory(category, text);
  if (!sectionId) {
    return { text, badge };
  }
  const guidance = BUSINESS_CANVAS_SECTION_GUIDANCE[sectionId];
  const theme = themeForSection(sectionId);
  return {
    text,
    sectionId,
    sectionLabel: guidance.title,
    sectionEmoji: theme.emoji,
    sectionColor: theme.color,
    badge,
  };
}

export function enrichInsightList(
  items: string[],
  category: IntelligenceCategoryId,
): EnrichedInsightItem[] {
  return items.filter(Boolean).map((text) => enrichInsightText(text, category));
}

export type IntelligencePanelSections = {
  summary: EnrichedInsightItem[];
  keyRelationships: EnrichedInsightItem[];
  patterns: EnrichedInsightItem[];
  risks: EnrichedInsightItem[];
  opportunities: EnrichedInsightItem[];
  recommendations: EnrichedInsightItem[];
  boardObservations: EnrichedInsightItem[];
  whatIfNotes: EnrichedInsightItem[];
  nextSteps: EnrichedInsightItem[];
};

export function buildIntelligencePanelSections(
  analysis: VisualFocusAnalysis,
): IntelligencePanelSections {
  return {
    summary: enrichInsightList(
      analysis.summary ? [analysis.summary] : [],
      "summary",
    ),
    keyRelationships: enrichInsightList(analysis.keyRelationships, "key_relationships"),
    patterns: enrichInsightList(analysis.patterns, "patterns"),
    risks: enrichInsightList(analysis.risks, "risks"),
    opportunities: enrichInsightList(analysis.opportunities, "opportunities"),
    recommendations: enrichInsightList(analysis.recommendations, "recommendations"),
    boardObservations: enrichInsightList(
      analysis.boardObservations ?? [],
      "board_observations",
    ),
    whatIfNotes: enrichInsightList(analysis.whatIfNotes ?? [], "what_if"),
    nextSteps: enrichInsightList(analysis.nextSteps, "next_steps"),
  };
}

/** Collect section ids referenced across all intelligence items — for canvas highlight bridge. */
export function sectionIdsFromIntelligence(
  sections: IntelligencePanelSections,
): BusinessCanvasSectionId[] {
  const ids = new Set<BusinessCanvasSectionId>();
  for (const group of Object.values(sections)) {
    for (const item of group) {
      if (item.sectionId) ids.add(item.sectionId);
    }
  }
  return [...ids];
}
