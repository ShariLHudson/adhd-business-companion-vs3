/**
 * Business Canvas™ architecture — user experience vs internal frameworks.
 *
 * Part of the Visual Thinking™ Companion Intelligence™ stack:
 * Intelligence → Framework → Visual Output → Insights → Learning → Future Intelligence
 *
 * RULE: Users interact with Business Canvas™ only.
 * Business Model Canvas™, Lean Canvas™, etc. are Companion Intelligence™
 * framework choices — selected after permission, never as the primary UI label.
 */

import type { BusinessCanvasTypeId } from "./types";

/** The only user-facing product name for the visual business thinking experience. */
export const BUSINESS_CANVAS_USER_LABEL = "Business Canvas™";

export type CanvasFrameworkMeta = {
  id: BusinessCanvasTypeId;
  /** Companion Intelligence™ only — do not surface in studio, My Work, or map headers. */
  companionFrameworkLabel: string;
  description: string;
  available: boolean;
  situationPatterns: RegExp[];
};

/** Internal framework registry. `available: false` = future canvas types. */
export const CANVAS_FRAMEWORK_REGISTRY: CanvasFrameworkMeta[] = [
  {
    id: "business-model",
    companionFrameworkLabel: "Business Model Canvas™",
    description:
      "Nine-section view of audience, value, channels, revenue, activities, resources, partners, and costs.",
    available: true,
    situationPatterns: [
      /\bsales?\s+(?:are\s+)?slow/i,
      /\brevenue\b/i,
      /\baudience\b.*\b(?:offer|marketing|revenue)\b/i,
      /\bhow\s+(?:my\s+)?business\s+works?\b/i,
      /\bbusiness\s+(?:change|pivot)\b/i,
      /\bwhy\s+(?:isn't|isnt|aren't|arent)\s+.*\bsell/i,
    ],
  },
  {
    id: "lean",
    companionFrameworkLabel: "Lean Canvas™",
    description: "Startup validation — problem, solution, unfair advantage.",
    available: false,
    situationPatterns: [
      /\b(?:startup|validate|mvp|product.?market)\b/i,
      /\bnew\s+(?:idea|venture)\b/i,
    ],
  },
  {
    id: "value-proposition",
    companionFrameworkLabel: "Value Proposition Canvas™",
    description: "Customer problems and solution fit.",
    available: false,
    situationPatterns: [
      /\bvalue\s+prop/i,
      /\bpositioning\b/i,
      /\bwhy\s+(?:should|would)\s+(?:they|people)\s+choose\b/i,
    ],
  },
  {
    id: "customer-journey",
    companionFrameworkLabel: "Customer Journey Canvas™",
    description: "Experience from awareness to loyalty.",
    available: false,
    situationPatterns: [
      /\bcustomer\s+journey\b/i,
      /\bonboarding\b/i,
      /\bretention\b/i,
      /\bexperience\b/i,
    ],
  },
  {
    id: "offer",
    companionFrameworkLabel: "Offer Canvas™",
    description: "Product and service design.",
    available: false,
    situationPatterns: [
      /\bnew\s+offer\b/i,
      /\bpackage\s+(?:my|the)\s+offer\b/i,
      /\bproduct\s+design\b/i,
    ],
  },
  {
    id: "ecosystem",
    companionFrameworkLabel: "Ecosystem Canvas™",
    description:
      "Relationships across business, audience, offers, content, and revenue.",
    available: false,
    situationPatterns: [
      /\becosystem\b/i,
      /\bhow\s+everything\s+connects\b/i,
      /\brelationships?\s+across\b/i,
    ],
  },
];

export function userFacingCanvasLabel(): string {
  return BUSINESS_CANVAS_USER_LABEL;
}

/** @internal Companion Intelligence™ — framework name for a canvas type id. */
export function companionFrameworkLabelForType(
  id: BusinessCanvasTypeId,
): string {
  return (
    CANVAS_FRAMEWORK_REGISTRY.find((f) => f.id === id)?.companionFrameworkLabel ??
    "Business Model Canvas™"
  );
}

/**
 * Select the best internal framework AFTER user permission.
 * Defaults to business-model when no stronger signal or framework unavailable.
 */
export function selectCanvasFrameworkAfterPermission(
  text: string,
): BusinessCanvasTypeId {
  const t = text.trim();
  if (!t) return "business-model";

  for (const framework of CANVAS_FRAMEWORK_REGISTRY) {
    if (!framework.available) continue;
    if (framework.situationPatterns.some((re) => re.test(t))) {
      return framework.id;
    }
  }

  for (const framework of CANVAS_FRAMEWORK_REGISTRY) {
    if (framework.available) continue;
    if (framework.situationPatterns.some((re) => re.test(t))) {
      return "business-model";
    }
  }

  return "business-model";
}

export function availableCanvasFramework(
  id: BusinessCanvasTypeId,
): CanvasFrameworkMeta | undefined {
  return CANVAS_FRAMEWORK_REGISTRY.find((f) => f.id === id && f.available);
}
