import type { BusinessCanvasSectionId } from "./types";

/** Permanent section colors — used by canvas, layout, and future Living Canvas / ripple UX. */
export type BusinessCanvasSectionTheme = {
  id: BusinessCanvasSectionId;
  gridArea: string;
  emoji: string;
  color: string;
  bg: string;
  ring: string;
};

export const BUSINESS_CANVAS_GRID_TEMPLATE = `
  "partners activities value relationships segments"
  "partners resources value channels segments"
  "costs costs revenue revenue revenue"
`;

export const BUSINESS_CANVAS_GRID_CELLS: BusinessCanvasSectionTheme[] = [
  {
    id: "customer-segments",
    gridArea: "segments",
    emoji: "🟣",
    color: "#7c3aed",
    bg: "#f5f3ff",
    ring: "#c4b5fd",
  },
  {
    id: "value-proposition",
    gridArea: "value",
    emoji: "🔵",
    color: "#2563eb",
    bg: "#eff6ff",
    ring: "#93c5fd",
  },
  {
    id: "channels",
    gridArea: "channels",
    emoji: "🟢",
    color: "#16a34a",
    bg: "#f0fdf4",
    ring: "#86efac",
  },
  {
    id: "customer-relationships",
    gridArea: "relationships",
    emoji: "🟠",
    color: "#ea580c",
    bg: "#fff7ed",
    ring: "#fdba74",
  },
  {
    id: "revenue-streams",
    gridArea: "revenue",
    emoji: "🟡",
    color: "#ca8a04",
    bg: "#fefce8",
    ring: "#fde047",
  },
  {
    id: "key-activities",
    gridArea: "activities",
    emoji: "🟩",
    color: "#059669",
    bg: "#ecfdf5",
    ring: "#6ee7b7",
  },
  {
    id: "key-resources",
    gridArea: "resources",
    emoji: "🔷",
    color: "#0891b2",
    bg: "#ecfeff",
    ring: "#67e8f9",
  },
  {
    id: "key-partners",
    gridArea: "partners",
    emoji: "🟤",
    color: "#92400e",
    bg: "#fffbeb",
    ring: "#fcd34d",
  },
  {
    id: "cost-structure",
    gridArea: "costs",
    emoji: "🔴",
    color: "#dc2626",
    bg: "#fef2f2",
    ring: "#fca5a5",
  },
];

export const BUSINESS_CANVAS_SECTION_COLORS: Record<BusinessCanvasSectionId, string> =
  Object.fromEntries(
    BUSINESS_CANVAS_GRID_CELLS.map((c) => [c.id, c.color]),
  ) as Record<BusinessCanvasSectionId, string>;

export function themeForSection(
  id: BusinessCanvasSectionId,
): BusinessCanvasSectionTheme {
  const theme = BUSINESS_CANVAS_GRID_CELLS.find((c) => c.id === id);
  if (!theme) throw new Error(`Unknown section: ${id}`);
  return theme;
}
