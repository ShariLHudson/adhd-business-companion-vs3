import type { BusinessCanvasSectionId } from "../types";
import type { RelationshipWeightLevel } from "./types";
import { RELATIONSHIP_WEIGHT_NUMERIC } from "./types";

export type SectionRelationship = {
  target: BusinessCanvasSectionId;
  weight: RelationshipWeightLevel;
};

/** Internal relationship weight matrix — future ripple / simulation layer. */
export const BUSINESS_CANVAS_RELATIONSHIP_MATRIX: Record<
  BusinessCanvasSectionId,
  SectionRelationship[]
> = {
  "customer-segments": [
    { target: "value-proposition", weight: "high" },
    { target: "channels", weight: "high" },
    { target: "customer-relationships", weight: "medium" },
    { target: "revenue-streams", weight: "medium" },
  ],
  "value-proposition": [
    { target: "customer-segments", weight: "high" },
    { target: "revenue-streams", weight: "high" },
    { target: "channels", weight: "medium" },
    { target: "key-activities", weight: "medium" },
  ],
  channels: [
    { target: "customer-segments", weight: "high" },
    { target: "customer-relationships", weight: "medium" },
    { target: "revenue-streams", weight: "medium" },
  ],
  "customer-relationships": [
    { target: "customer-segments", weight: "high" },
    { target: "revenue-streams", weight: "medium" },
    { target: "key-activities", weight: "medium" },
  ],
  "revenue-streams": [
    { target: "value-proposition", weight: "high" },
    { target: "customer-segments", weight: "medium" },
    { target: "key-activities", weight: "medium" },
    { target: "cost-structure", weight: "high" },
  ],
  "key-activities": [
    { target: "value-proposition", weight: "medium" },
    { target: "key-resources", weight: "high" },
    { target: "cost-structure", weight: "medium" },
  ],
  "key-resources": [
    { target: "key-activities", weight: "high" },
    { target: "key-partners", weight: "medium" },
    { target: "cost-structure", weight: "medium" },
  ],
  "key-partners": [
    { target: "key-activities", weight: "medium" },
    { target: "key-resources", weight: "medium" },
    { target: "cost-structure", weight: "low" },
  ],
  "cost-structure": [
    { target: "revenue-streams", weight: "high" },
    { target: "key-activities", weight: "medium" },
    { target: "key-resources", weight: "medium" },
  ],
};

export function relationshipWeightNumeric(
  level: RelationshipWeightLevel,
): number {
  return RELATIONSHIP_WEIGHT_NUMERIC[level];
}

export function connectedSectionIds(
  sectionId: BusinessCanvasSectionId,
): BusinessCanvasSectionId[] {
  return BUSINESS_CANVAS_RELATIONSHIP_MATRIX[sectionId].map((r) => r.target);
}
