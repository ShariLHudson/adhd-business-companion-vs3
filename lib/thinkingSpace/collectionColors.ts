/**
 * My Thoughts™ collection color system — recognition without overwhelm.
 * Each collection gets a distinct identity; custom collections take the next slot.
 */

import type { ThoughtCollection } from "./types";

export type CollectionColorPalette = {
  id: string;
  bg: string;
  bgGradient: string;
  border: string;
  text: string;
  chipBg: string;
  chipText: string;
};

/** Named slots — avoid reusing colors when possible. */
export const COLLECTION_COLOR_PALETTE: CollectionColorPalette[] = [
  {
    id: "business",
    bg: "#eff6ff",
    bgGradient: "linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)",
    border: "#93c5fd",
    text: "#1e3a5f",
    chipBg: "#dbeafe",
    chipText: "#1e40af",
  },
  {
    id: "health",
    bg: "#ecfdf5",
    bgGradient: "linear-gradient(145deg, #ecfdf5 0%, #d1fae5 100%)",
    border: "#6ee7b7",
    text: "#064e3b",
    chipBg: "#d1fae5",
    chipText: "#047857",
  },
  {
    id: "personal",
    bg: "#fdf4ff",
    bgGradient: "linear-gradient(145deg, #fdf4ff 0%, #fae8ff 100%)",
    border: "#e9d5ff",
    text: "#581c87",
    chipBg: "#f3e8ff",
    chipText: "#7e22ce",
  },
  {
    id: "learning",
    bg: "#fffbeb",
    bgGradient: "linear-gradient(145deg, #fffbeb 0%, #fef3c7 100%)",
    border: "#fcd34d",
    text: "#92400e",
    chipBg: "#fef3c7",
    chipText: "#b45309",
  },
  {
    id: "projects",
    bg: "#f0fdfa",
    bgGradient: "linear-gradient(145deg, #f0fdfa 0%, #ccfbf1 100%)",
    border: "#5eead4",
    text: "#134e4a",
    chipBg: "#ccfbf1",
    chipText: "#0f766e",
  },
  {
    id: "finance",
    bg: "#f7fee7",
    bgGradient: "linear-gradient(145deg, #f7fee7 0%, #ecfccb 100%)",
    border: "#bef264",
    text: "#365314",
    chipBg: "#ecfccb",
    chipText: "#4d7c0f",
  },
  {
    id: "family",
    bg: "#fff1f2",
    bgGradient: "linear-gradient(145deg, #fff1f2 0%, #ffe4e6 100%)",
    border: "#fda4af",
    text: "#9f1239",
    chipBg: "#ffe4e6",
    chipText: "#be123c",
  },
  {
    id: "clients",
    bg: "#eef2ff",
    bgGradient: "linear-gradient(145deg, #eef2ff 0%, #e0e7ff 100%)",
    border: "#a5b4fc",
    text: "#312e81",
    chipBg: "#e0e7ff",
    chipText: "#4338ca",
  },
  {
    id: "ideas",
    bg: "#f5f3ff",
    bgGradient: "linear-gradient(145deg, #f5f3ff 0%, #ede9fe 100%)",
    border: "#c4b5fd",
    text: "#4c1d95",
    chipBg: "#ede9fe",
    chipText: "#6d28d9",
  },
  {
    id: "travel",
    bg: "#ecfeff",
    bgGradient: "linear-gradient(145deg, #ecfeff 0%, #cffafe 100%)",
    border: "#67e8f9",
    text: "#164e63",
    chipBg: "#cffafe",
    chipText: "#0e7490",
  },
  {
    id: "creative",
    bg: "#fff7ed",
    bgGradient: "linear-gradient(145deg, #fff7ed 0%, #ffedd5 100%)",
    border: "#fdba74",
    text: "#9a3412",
    chipBg: "#ffedd5",
    chipText: "#c2410c",
  },
  {
    id: "admin",
    bg: "#f8fafc",
    bgGradient: "linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)",
    border: "#94a3b8",
    text: "#334155",
    chipBg: "#e2e8f0",
    chipText: "#475569",
  },
  {
    id: "website-tech",
    bg: "#f0f9ff",
    bgGradient: "linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%)",
    border: "#7dd3fc",
    text: "#0c4a6e",
    chipBg: "#e0f2fe",
    chipText: "#0369a1",
  },
  {
    id: "marketing",
    bg: "#fdf2f8",
    bgGradient: "linear-gradient(145deg, #fdf2f8 0%, #fce7f3 100%)",
    border: "#f9a8d4",
    text: "#831843",
    chipBg: "#fce7f3",
    chipText: "#be185d",
  },
  {
    id: "still-finding",
    bg: "#faf7f2",
    bgGradient: "linear-gradient(145deg, #ffffff 0%, #f0ebe3 100%)",
    border: "#d4cdc3",
    text: "#3d3630",
    chipBg: "#f0ebe3",
    chipText: "#5a5248",
  },
];

const PALETTE_BY_ID = new Map(
  COLLECTION_COLOR_PALETTE.map((p) => [p.id, p]),
);

/** Starter catalog — suggestions when creating collections. */
export const DEFAULT_COLLECTION_CATALOG: ReadonlyArray<{
  label: string;
  icon: string;
  colorId: string;
}> = [
  { label: "Business", icon: "💼", colorId: "business" },
  { label: "Health", icon: "💚", colorId: "health" },
  { label: "Personal", icon: "🌿", colorId: "personal" },
  { label: "Website / Tech", icon: "💻", colorId: "website-tech" },
  { label: "Family", icon: "👨‍👩‍👧", colorId: "family" },
  { label: "Clients", icon: "🤝", colorId: "clients" },
  { label: "Learning", icon: "📚", colorId: "learning" },
  { label: "Projects", icon: "🎯", colorId: "projects" },
  { label: "Travel", icon: "✈️", colorId: "travel" },
  { label: "Ideas", icon: "💡", colorId: "ideas" },
  { label: "Finance", icon: "💰", colorId: "finance" },
  { label: "Creative", icon: "🎨", colorId: "creative" },
  { label: "Admin", icon: "📋", colorId: "admin" },
  { label: "Marketing", icon: "📣", colorId: "marketing" },
];

function normalizeLabel(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, " ");
}

/** AI taxonomy / legacy labels → catalog collection names */
const COLLECTION_LABEL_ALIASES: Record<string, string> = {
  work: "Business",
  other: "Ideas",
  worries: "Personal",
  "client work": "Clients",
  "learning / research": "Learning",
  "product / services": "Projects",
  "personal errands": "Personal",
  "someday / maybe": "Ideas",
  "follow up": "Clients",
  sales: "Business",
  content: "Creative",
  admin: "Admin",
};

export function catalogEntryForLabel(
  label: string,
): (typeof DEFAULT_COLLECTION_CATALOG)[number] | undefined {
  const norm = normalizeLabel(label);
  const aliased = COLLECTION_LABEL_ALIASES[norm] ?? label;
  return DEFAULT_COLLECTION_CATALOG.find(
    (c) => normalizeLabel(c.label) === normalizeLabel(aliased),
  );
}

export function paletteForColorId(colorId: string): CollectionColorPalette {
  return (
    PALETTE_BY_ID.get(colorId) ??
    COLLECTION_COLOR_PALETTE[
      Math.abs(hashString(colorId)) % COLLECTION_COLOR_PALETTE.length
    ]!
  );
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}

/** Next unused palette slot — custom collections avoid duplicates when possible. */
export function assignNextColorId(
  existing: Pick<ThoughtCollection, "colorId">[],
): string {
  const used = new Set(
    existing.map((c) => c.colorId).filter((id): id is string => Boolean(id)),
  );
  const available = COLLECTION_COLOR_PALETTE.find((p) => !used.has(p.id));
  if (available) return available.id;
  return `custom-${existing.length % COLLECTION_COLOR_PALETTE.length}`;
}

export type CollectionVisual = {
  icon: string;
  colorId: string;
  palette: CollectionColorPalette;
};

export function resolveCollectionVisual(
  collection: Pick<ThoughtCollection, "label" | "icon" | "colorId"> & {
    id?: string;
  },
  existing: Pick<ThoughtCollection, "colorId">[] = [],
): CollectionVisual {
  const catalog = catalogEntryForLabel(collection.label);
  const colorId =
    collection.colorId ??
    catalog?.colorId ??
    assignNextColorId(existing.length ? existing : [collection]);
  const icon = collection.icon ?? catalog?.icon ?? "📂";
  return {
    icon,
    colorId,
    palette: paletteForColorId(colorId),
  };
}
