/**
 * Canonical Cartography wall map registry — names, order, and routing.
 * Single source of truth for wall labels, click routing, and mobile gallery order.
 */

export type CartographyWallRow = "top" | "bottom";

export type CartographyWallMapId =
  | "mind-map"
  | "decision-map"
  | "relationship-map"
  | "process-map"
  | "journey-map"
  | "timeline-map"
  | "strategy-map"
  | "opportunity-map"
  | "system-map"
  | "priority-map";

export type CartographyWallMap = {
  id: CartographyWallMapId;
  name: string;
  row: CartographyWallRow;
  position: 1 | 2 | 3 | 4 | 5;
  builderType: CartographyWallMapId;
};

/**
 * Exact wall order (left → right within each row).
 * Top: Mind, Decision, Relationship, Process, Journey
 * Bottom: Timeline, Strategy, Opportunity, System, Priority
 */
export const cartographyWallMaps: readonly CartographyWallMap[] = [
  { id: "mind-map", name: "Mind Map", row: "top", position: 1, builderType: "mind-map" },
  {
    id: "decision-map",
    name: "Decision Map",
    row: "top",
    position: 2,
    builderType: "decision-map",
  },
  {
    id: "relationship-map",
    name: "Relationship Map",
    row: "top",
    position: 3,
    builderType: "relationship-map",
  },
  {
    id: "process-map",
    name: "Process Map",
    row: "top",
    position: 4,
    builderType: "process-map",
  },
  {
    id: "journey-map",
    name: "Journey Map",
    row: "top",
    position: 5,
    builderType: "journey-map",
  },
  {
    id: "timeline-map",
    name: "Timeline Map",
    row: "bottom",
    position: 1,
    builderType: "timeline-map",
  },
  {
    id: "strategy-map",
    name: "Strategy Map",
    row: "bottom",
    position: 2,
    builderType: "strategy-map",
  },
  {
    id: "opportunity-map",
    name: "Opportunity Map",
    row: "bottom",
    position: 3,
    builderType: "opportunity-map",
  },
  {
    id: "system-map",
    name: "System Map",
    row: "bottom",
    position: 4,
    builderType: "system-map",
  },
  {
    id: "priority-map",
    name: "Priority Map",
    row: "bottom",
    position: 5,
    builderType: "priority-map",
  },
] as const;

/** Desktop hotspot boxes — percent of viewport, aligned to framed wall art. */
export const CARTOGRAPHY_WALL_HOTSPOTS: Record<
  CartographyWallMapId,
  { left: string; top: string; width: string; height: string }
> = {
  "mind-map": { left: "22%", top: "18%", width: "14%", height: "16%" },
  "decision-map": { left: "30%", top: "14%", width: "11%", height: "14%" },
  "relationship-map": { left: "42%", top: "14%", width: "11%", height: "14%" },
  "process-map": { left: "54%", top: "14%", width: "11%", height: "14%" },
  "journey-map": { left: "66%", top: "14%", width: "11%", height: "14%" },
  "timeline-map": { left: "18%", top: "30%", width: "11%", height: "14%" },
  "strategy-map": { left: "30%", top: "30%", width: "11%", height: "14%" },
  "opportunity-map": { left: "42%", top: "30%", width: "11%", height: "14%" },
  "system-map": { left: "54%", top: "30%", width: "11%", height: "14%" },
  "priority-map": { left: "66%", top: "30%", width: "11%", height: "14%" },
};

export function wallMapsInDisplayOrder(): readonly CartographyWallMap[] {
  return cartographyWallMaps;
}

export function wallMapsForRow(
  row: CartographyWallRow,
): readonly CartographyWallMap[] {
  return cartographyWallMaps
    .filter((m) => m.row === row)
    .slice()
    .sort((a, b) => a.position - b.position);
}

export function getWallMapById(
  id: CartographyWallMapId,
): CartographyWallMap | undefined {
  return cartographyWallMaps.find((m) => m.id === id);
}

export function assertWallMapRegistryComplete(): boolean {
  if (cartographyWallMaps.length !== 10) return false;
  const ids = new Set(cartographyWallMaps.map((m) => m.id));
  if (ids.size !== 10) return false;
  const top = wallMapsForRow("top").map((m) => m.name);
  const bottom = wallMapsForRow("bottom").map((m) => m.name);
  return (
    top.join("|") ===
      "Mind Map|Decision Map|Relationship Map|Process Map|Journey Map" &&
    bottom.join("|") ===
      "Timeline Map|Strategy Map|Opportunity Map|System Map|Priority Map"
  );
}
