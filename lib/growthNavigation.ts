import type { AppSection } from "./companionUi";
import { workspaceTitle } from "./workspaceMode";

/** Workspace panels that belong to the Growth Center family. */
export const GROWTH_PANEL_SECTIONS: AppSection[] = [
  "growth",
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
    emoji: "🌱",
    title: "Growth",
    subtitle: "Track progress, impact, highlights, and your story over time.",
  },
  "wins-this-week": {
    emoji: "🏆",
    title: "My Wins",
    subtitle: "Recent progress and accomplishments.",
  },
  "evidence-bank": {
    emoji: "📈",
    title: "Evidence Bank",
    subtitle: "Proof of impact, improvements, progress, and problems solved.",
  },
  "confidence-vault": {
    emoji: "🌟",
    title: "My Highlights",
    subtitle:
      "Save accomplishments, recognition, praise, expertise, credentials, and meaningful moments you want to remember.",
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
  { id: "confidence-vault", label: "Open My Highlights" },
  { id: "my-journey", label: "Open Journey" },
];

export type GrowthPanelNav = {
  current: GrowthSectionId;
  onBack: () => void;
  backLabel?: string | null;
  onOpenSection: (section: GrowthSectionId) => void;
};
