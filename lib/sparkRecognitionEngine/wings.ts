/**
 * Estate Wings — organizational structure for recognition records.
 * @see docs/estate/recognition standards (031)
 */

export const ESTATE_WING_IDS = [
  "beginnings",
  "growth",
  "building",
  "service",
  "leadership",
  "faith",
  "health",
  "relationships",
  "creativity",
  "legacy",
] as const;

export type EstateWingId = (typeof ESTATE_WING_IDS)[number];

export const ESTATE_WING_LABELS: Record<EstateWingId, string> = {
  beginnings: "Beginnings",
  growth: "Growth",
  building: "Building",
  service: "Service",
  leadership: "Leadership",
  faith: "Faith",
  health: "Health",
  relationships: "Relationships",
  creativity: "Creativity",
  legacy: "Legacy",
};
