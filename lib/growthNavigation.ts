import type { AppSection } from "./companionUi";
import { NAV_HOME } from "./navigationBack";
import { workspaceTitle } from "./workspaceMode";

/** Workspace panels that belong to the Growth Center family. */
export const GROWTH_PANEL_SECTIONS: AppSection[] = [
  "growth",
  "growth-capture",
  "growth-library",
  "growth-reports",
  "the-gallery",
  "wins-this-week",
  "evidence-bank",
  "confidence-vault",
  "my-journey",
  "growth-journal",
  "growth-portfolio",
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

/** Back label when navigating between standalone Growth rooms. */
export function growthRoomBackLabel(fromSection: AppSection): string | null {
  if (fromSection === "home") return NAV_HOME;
  if (fromSection === "growth") return GROWTH_SECTION_META.growth.title;
  if (fromSection === "growth-library") return GROWTH_SECTION_META["growth-library"].title;
  if (fromSection === "growth-capture") return "Capture a Moment";
  if (fromSection === "growth-reports") return GROWTH_SECTION_META["growth-reports"].title;
  if (fromSection in GROWTH_SECTION_META) {
    return GROWTH_SECTION_META[fromSection as GrowthSectionId].title;
  }
  return null;
}

export type GrowthSectionId =
  | "growth"
  | "growth-library"
  | "growth-reports"
  | "wins-this-week"
  | "evidence-bank"
  | "confidence-vault"
  | "my-journey"
  | "growth-journal"
  | "growth-portfolio";

export const GROWTH_SECTION_META: Record<
  GrowthSectionId,
  { title: string; objectId: string; subtitle: string }
> = {
  growth: {
    objectId: "growth",
    title: "Your Story",
    subtitle:
      "The moments you choose to keep become the story you tell yourself tomorrow.",
  },
  "growth-library": {
    objectId: "growth",
    title: "My Story Library",
    subtitle: "Return to any place your story lives.",
  },
  "growth-reports": {
    objectId: "growth",
    title: "Create Your Storybook",
    subtitle:
      "Choose the chapters of your journey you'd like to include. Spark will craft them into a beautiful keepsake of your story.",
  },
  "wins-this-week": {
    objectId: "wins",
    title: "Celebration Garden",
    subtitle: "Wins, milestones, and moments worth remembering.",
  },
  "evidence-bank": {
    objectId: "evidence-bank",
    title: "Evidence Vault",
    subtitle:
      "Collect proof of your growth. When something goes well, save it here — and when self-doubt appears, we'll remind you how far you've come.",
  },
  "confidence-vault": {
    objectId: "my-highlights",
    title: "Highlights",
    subtitle:
      "Milestones, celebrations, firsts, breakthroughs, and meaningful moments worth remembering.",
  },
  "my-journey": {
    objectId: "growth",
    title: "My Journey",
    subtitle: "Life experiences, lessons, wisdom, milestones, and personal growth.",
  },
  "growth-journal": {
    objectId: "journal",
    title: "Journal",
    subtitle: "Private reflections and thoughts.",
  },
  "growth-portfolio": {
    objectId: "create",
    title: "Creative Studio",
    subtitle: "Projects, courses, campaigns, and creative work.",
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
  { id: "growth-journal", label: "Open Journal" },
  { id: "growth-portfolio", label: "Open Portfolio" },
];

export type GrowthPanelNav = {
  current: GrowthSectionId;
  onBack: () => void;
  backLabel?: string | null;
  onOpenSection: (section: GrowthSectionId) => void;
};

/** Visual identity per Growth reflection destination — scan-friendly, not identical. */
export const GROWTH_DESTINATION_STYLES: Record<
  Exclude<GrowthSectionId, "growth" | "growth-library" | "growth-reports">,
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
  "growth-journal": {
    accentBorder: "border-t-stone-500",
    headerBg: "bg-gradient-to-br from-stone-50/90 to-white",
    iconRing: "bg-stone-100 text-stone-800",
    actionBorder: "border-stone-300",
    actionFg: "text-stone-900",
    actionHover: "hover:bg-stone-50",
  },
  "growth-portfolio": {
    accentBorder: "border-t-orange-500",
    headerBg: "bg-gradient-to-br from-orange-50/90 to-white",
    iconRing: "bg-orange-100 text-orange-800",
    actionBorder: "border-orange-300",
    actionFg: "text-orange-900",
    actionHover: "hover:bg-orange-50",
  },
};
