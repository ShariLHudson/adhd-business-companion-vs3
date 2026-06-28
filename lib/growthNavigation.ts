import type { AppSection } from "./companionUi";
import { workspaceTitle } from "./workspaceMode";

/** Workspace panels that belong to the Growth Center family. */
export const GROWTH_PANEL_SECTIONS: AppSection[] = [
  "growth",
  "the-gallery",
  "wins-this-week",
  "evidence-bank",
  "confidence-vault",
  "my-journey",
];

export function isGrowthPanelSection(
  section: AppSection | null | undefined,
): boolean {
  return section != null && GROWTH_PANEL_SECTIONS.includes(section);
}

export function growthPanelBackLabel(
  fromPanel: AppSection | null,
  activeSection: AppSection,
): string | null {
  if (fromPanel) return workspaceTitle(fromPanel);
  if (activeSection === "home") return "Chat";
  return workspaceTitle(activeSection);
}

export type GrowthSectionId =
  | "growth"
  | "wins-this-week"
  | "evidence-bank"
  | "confidence-vault"
  | "my-journey";

export const GROWTH_SECTION_META: Record<
  GrowthSectionId,
  { title: string; emoji: string; subtitle: string }
> = {
  growth: {
    emoji: "🖼",
    title: "The Gallery",
    subtitle: "A walk through your journey — memories on the walls, quiet steps ahead.",
  },
  "wins-this-week": {
    emoji: "🏆",
    title: "Wins",
    subtitle: "Recent progress and accomplishments.",
  },
  "evidence-bank": {
    emoji: "🛡",
    title: "Evidence Bank",
    subtitle:
      "Proof, wins, testimonials, screenshots, progress moments, and confidence reminders — things you may forget you accomplished.",
  },
  "confidence-vault": {
    emoji: "✨",
    title: "Highlights",
    subtitle:
      "Milestones, celebrations, firsts, breakthroughs, and meaningful moments worth remembering.",
  },
  "my-journey": {
    emoji: "🌿",
    title: "My Journey",
    subtitle: "Life experiences, lessons, wisdom, milestones, and personal growth.",
  },
};

export const GROWTH_CROSS_LINKS: {
  id: GrowthSectionId;
  label: string;
}[] = [
  { id: "wins-this-week", label: "Open Wins" },
  { id: "evidence-bank", label: "Open Evidence" },
  { id: "confidence-vault", label: "Open Highlights" },
  { id: "my-journey", label: "Open Journey" },
];

export type GrowthPanelNav = {
  current: GrowthSectionId;
  onBack: () => void;
  backLabel?: string | null;
  onOpenSection: (section: GrowthSectionId) => void;
};

/** Visual identity per Growth reflection destination — scan-friendly, not identical. */
export const GROWTH_DESTINATION_STYLES: Record<
  Exclude<GrowthSectionId, "growth">,
  {
    accentBorder: string;
    headerBg: string;
    iconRing: string;
    actionBorder: string;
    actionFg: string;
    actionHover: string;
  }
> = {
  "wins-this-week": {
    accentBorder: "border-t-amber-500",
    headerBg: "bg-gradient-to-br from-amber-50/90 to-white",
    iconRing: "bg-amber-100 text-amber-800",
    actionBorder: "border-amber-300",
    actionFg: "text-amber-900",
    actionHover: "hover:bg-amber-50",
  },
  "evidence-bank": {
    accentBorder: "border-t-sky-500",
    headerBg: "bg-gradient-to-br from-sky-50/90 to-white",
    iconRing: "bg-sky-100 text-sky-800",
    actionBorder: "border-sky-300",
    actionFg: "text-sky-900",
    actionHover: "hover:bg-sky-50",
  },
  "confidence-vault": {
    accentBorder: "border-t-violet-500",
    headerBg: "bg-gradient-to-br from-violet-50/90 to-white",
    iconRing: "bg-violet-100 text-violet-800",
    actionBorder: "border-violet-300",
    actionFg: "text-violet-900",
    actionHover: "hover:bg-violet-50",
  },
  "my-journey": {
    accentBorder: "border-t-emerald-600",
    headerBg: "bg-gradient-to-br from-emerald-50/90 to-white",
    iconRing: "bg-emerald-100 text-emerald-800",
    actionBorder: "border-emerald-300",
    actionFg: "text-emerald-900",
    actionHover: "hover:bg-emerald-50",
  },
};
