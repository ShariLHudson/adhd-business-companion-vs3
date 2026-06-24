/** Business Canvas™ — canvas types inside Visual Thinking™. */

export type BusinessCanvasTypeId =
  | "business-model"
  | "lean"
  | "value-proposition"
  | "customer-journey"
  | "offer"
  | "ecosystem";

export type BusinessCanvasSectionId =
  | "customer-segments"
  | "value-proposition"
  | "channels"
  | "customer-relationships"
  | "revenue-streams"
  | "key-activities"
  | "key-resources"
  | "key-partners"
  | "cost-structure";

export type BusinessCanvasSectionData = {
  items: string[];
};

export type BusinessCanvasData = {
  canvasType: BusinessCanvasTypeId;
  sections: Record<BusinessCanvasSectionId, BusinessCanvasSectionData>;
};

export type BusinessCanvasSectionGuidance = {
  id: BusinessCanvasSectionId;
  title: string;
  prompt: string;
  explanation: string;
  whyItMatters: string;
  examples: string[];
  suggestionSource: string;
  /** Ripple effects — prepares for Living Canvas™ / What-If Analysis. */
  changeRipples: string[];
};

/** @deprecated Use CANVAS_FRAMEWORK_REGISTRY — companion/internal framework metadata. */
export type FutureCanvasTypeMeta = {
  id: BusinessCanvasTypeId;
  label: string;
  description: string;
  available: boolean;
};

export const BUSINESS_CANVAS_SECTION_ORDER: BusinessCanvasSectionId[] = [
  "customer-segments",
  "value-proposition",
  "channels",
  "customer-relationships",
  "revenue-streams",
  "key-activities",
  "key-resources",
  "key-partners",
  "cost-structure",
];
