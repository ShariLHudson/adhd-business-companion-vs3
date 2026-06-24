/**
 * Explain-first workspace offers — sell the result, not the tool.
 */

import type { AppSection } from "@/lib/companionUi";
import type { VisualFocusMode } from "@/lib/visualFocus/types";
import { BUSINESS_CANVAS_USER_LABEL } from "@/lib/visualFocus/businessCanvas/architecture";
import { studioCardTitleForMode } from "@/lib/visualFocus/studioCards";

export type ExplainFirstOffer = {
  whatItIs: string;
  whyItHelps: string;
  outcomes: string[];
  permissionQuestion: string;
};

const VISUAL_FOCUS_OUTCOMES: Record<VisualFocusMode, string[]> = {
  "mind-map": [
    "A visual map",
    "Key themes",
    "Important connections",
    "Suggested priorities",
    "Recommended next steps",
  ],
  "decision-tree": [
    "A visual path map",
    "Possible outcomes",
    "Risks and opportunities",
    "Things that could change the outcome",
    "Suggested next steps",
  ],
  "strategy-map": [
    "A visual strategy map",
    "Key leverage points",
    "Missing steps",
    "Suggested priorities",
    "Recommended next steps",
  ],
  "relationship-map": [
    "A visual relationship map",
    "Dependency analysis",
    "Bottlenecks",
    "Opportunities",
    "Recommended actions",
  ],
  "project-map": [
    "A visual project map",
    "Major phases",
    "Missing pieces",
    "Suggested priorities",
    "Recommended next steps",
  ],
  "visual-kanban": [
    "Organized idea columns",
    "Grouped themes",
    "Clear next moves",
    "Suggested priorities",
  ],
  "business-canvas": [
    "A visual business canvas",
    "Business analysis",
    "Opportunities",
    "Risks",
    "Board of Directors™ observations",
    "Recommendations",
    "Ripple-effect analysis",
  ],
};

export function explainFirstOfferForBusinessCanvas(
  situationSummary?: string,
): ExplainFirstOffer {
  const situation = situationSummary?.trim();
  return {
    whatItIs: `I have a visual way to help us look at that in ${BUSINESS_CANVAS_USER_LABEL}.`,
    whyItHelps: situation
      ? `It can map how your audience, offers, marketing, and revenue connect around "${situation}", surface possible gaps, and provide recommendations.`
      : "It can show how your audience, offers, marketing, and revenue connect, identify possible gaps, and provide recommendations.",
    outcomes: VISUAL_FOCUS_OUTCOMES["business-canvas"],
    permissionQuestion: "Would you like to try it?",
  };
}

const SECTION_OFFERS: Partial<Record<AppSection, ExplainFirstOffer>> = {
  "brain-dump": {
    whatItIs: "Clear My Mind™ is a calm place to unload thoughts without fixing everything at once.",
    whyItHelps: "It reduces mental clutter so you can see what you are carrying.",
    outcomes: [
      "Captured thoughts",
      "Grouped clusters",
      "A calmer headspace",
      "Optional next view when you are ready",
    ],
    permissionQuestion: "Would you like to open Clear My Mind™ beside us?",
  },
  "decision-compass": {
    whatItIs:
      "Decision Compass™ helps compare options and determine which path appears strongest based on what matters most to you.",
    whyItHelps: "It walks the decision step by step instead of piling pros and cons in chat.",
    outcomes: [
      "A recommendation",
      "Pros and cons",
      "Risks and opportunities",
      "Alternative paths",
      "Suggested next steps",
    ],
    permissionQuestion: "Would you like to explore that?",
  },
  "plan-my-day": {
    whatItIs: "Plan My Day™ shapes today around what is realistic for your energy and priorities.",
    whyItHelps: "It turns a crowded to-do feeling into a doable plan for today.",
    outcomes: [
      "A realistic today plan",
      "Clear priorities",
      "Energy-aware task view",
      "Suggested next step",
    ],
    permissionQuestion: "Would you like to open Plan My Day™ beside us?",
  },
  "visual-focus": {
    whatItIs: "Visual Focus™ is a studio for thinking visually — maps, paths, and connections.",
    whyItHelps: "It helps you see structure instead of holding everything in your head.",
    outcomes: [
      "A visual map",
      "Key themes",
      "Important connections",
      "Suggested priorities",
      "Recommended next steps",
    ],
    permissionQuestion: "Would you like to build one together?",
  },
};

export function explainFirstOfferForVisualMode(
  mode: VisualFocusMode,
  whyItHelps?: string,
): ExplainFirstOffer {
  if (mode === "business-canvas") {
    return explainFirstOfferForBusinessCanvas();
  }

  const title = studioCardTitleForMode(mode);
  return {
    whatItIs: `${title} helps you think through this visually so patterns and next steps are easier to see.`,
    whyItHelps:
      whyItHelps ??
      "You get structure without learning diagram software — the map builds as you think.",
    outcomes: VISUAL_FOCUS_OUTCOMES[mode] ?? VISUAL_FOCUS_OUTCOMES["mind-map"],
    permissionQuestion: `Would you like to open ${title} beside us?`,
  };
}

export function explainFirstOfferForSection(
  section: AppSection,
  featureLabel: string,
  whyItHelps?: string,
): ExplainFirstOffer {
  const base = SECTION_OFFERS[section];
  if (base) {
    return {
      ...base,
      whyItHelps: whyItHelps ?? base.whyItHelps,
    };
  }
  return {
    whatItIs: `${featureLabel} was built for situations like this.`,
    whyItHelps: whyItHelps ?? "It gives you a dedicated space beside chat.",
    outcomes: ["Guided structure", "Clear next steps", "Space to think with Shari"],
    permissionQuestion: `Would you like to open ${featureLabel} beside us?`,
  };
}

export function formatExplainFirstOfferMessage(offer: ExplainFirstOffer): string {
  const bullets = offer.outcomes.map((o) => `• ${o}`).join("\n");
  return [
    offer.whatItIs,
    offer.whyItHelps,
    "",
    "When we're finished you'll have:",
    bullets,
    "",
    offer.permissionQuestion,
  ].join("\n");
}
