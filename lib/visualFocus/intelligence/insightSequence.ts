/**
 * Progressive-disclosure sequencing for Companion Insights.
 *
 * The intelligence panel used to render all nine categories at once (a
 * "dashboard scream"). Progressive disclosure reveals insights one at a
 * time — First Insight → Next → Risk → Opportunity — so the member is never
 * dumped a full grid on arrival. These pure helpers flatten a
 * VisualFocusAnalysis into an ordered sequence and count so the UI can
 * offer a calm "I've found N things that might help" invite.
 */

import type { VisualFocusAnalysis } from "../types";
import {
  buildIntelligencePanelSections,
  type EnrichedInsightItem,
  type IntelligencePanelSections,
} from "./enrichInsights";
import {
  INTELLIGENCE_CATEGORY_ORDER,
  INTELLIGENCE_CATEGORY_THEMES,
  type IntelligenceCategoryId,
  type IntelligenceCategoryTheme,
} from "./themes";

/** Maps a category id to its enriched item list within built sections. */
const CATEGORY_ITEMS: Record<
  IntelligenceCategoryId,
  (sections: IntelligencePanelSections) => EnrichedInsightItem[]
> = {
  summary: (s) => s.summary,
  key_relationships: (s) => s.keyRelationships,
  patterns: (s) => s.patterns,
  risks: (s) => s.risks,
  opportunities: (s) => s.opportunities,
  recommendations: (s) => s.recommendations,
  board_observations: (s) => s.boardObservations,
  what_if: (s) => s.whatIfNotes,
  next_steps: (s) => s.nextSteps,
};

export type SequencedInsight = {
  categoryId: IntelligenceCategoryId;
  theme: IntelligenceCategoryTheme;
  item: EnrichedInsightItem;
};

/**
 * Flatten an analysis into an ordered, member-facing sequence of insights.
 * Order follows INTELLIGENCE_CATEGORY_ORDER (Summary first, then
 * Relationships, Patterns, Risks, Opportunities, …) so the reveal reads
 * like a calm walkthrough rather than a data dump.
 */
export function sequenceIntelligenceInsights(
  analysis: VisualFocusAnalysis,
): SequencedInsight[] {
  const sections = buildIntelligencePanelSections(analysis);
  const sequence: SequencedInsight[] = [];
  for (const categoryId of INTELLIGENCE_CATEGORY_ORDER) {
    const items = CATEGORY_ITEMS[categoryId](sections);
    for (const item of items) {
      if (!item.text?.trim()) continue;
      sequence.push({
        categoryId,
        theme: INTELLIGENCE_CATEGORY_THEMES[categoryId],
        item,
      });
    }
  }
  return sequence;
}

/** How many real insights this analysis holds — for the "N things" invite. */
export function countIntelligenceInsights(
  analysis: VisualFocusAnalysis,
): number {
  return sequenceIntelligenceInsights(analysis).length;
}

/**
 * Calm, plain-language phrasing for the insights invite.
 * Never a dashboard count badge — always Shari's voice.
 */
export function insightInviteLine(count: number): string {
  if (count <= 0) {
    return "I've had a look. Nothing urgent stands out — your map reads clearly.";
  }
  if (count === 1) {
    return "I've found one thing that might help.";
  }
  return `I've found ${count} things that might help.`;
}
