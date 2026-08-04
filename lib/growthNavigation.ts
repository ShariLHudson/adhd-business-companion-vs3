import type { AppSection } from "./companionUi";

import { workspaceTitle } from "./workspaceMode";



/** Workspace panels that belong to the Growth Center family. */

export const GROWTH_PANEL_SECTIONS: AppSection[] = [
  "growth",
  "growth-vault",
  "outcome-goals",
  "wins-this-week",
  "evidence-bank",
  "portfolio",
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
  if (fromPanel === "growth-vault") return "Growth Vault";
  if (fromPanel === "outcome-goals") return "Outcome Goals";
  if (fromPanel) return workspaceTitle(fromPanel);
  if (
    activeSection === "wins-this-week" ||
    activeSection === "evidence-bank" ||
    activeSection === "portfolio" ||
    activeSection === "my-journey"
  ) {
    return "Growth Vault";
  }
  if (activeSection === "home") return "Chat";
  return workspaceTitle(activeSection);
}



export type GrowthSectionId =
  | "growth"
  | "growth-vault"
  | "outcome-goals"
  | "wins-this-week"
  | "evidence-bank"
  | "portfolio"
  | "confidence-vault"
  | "my-journey";



export const GROWTH_SECTION_META: Record<

  GrowthSectionId,

  { title: string; emoji: string; subtitle: string }

> = {

  growth: {
    emoji: "📈",
    title: "Growth Center™",
    subtitle: "Growth Vault™ and Outcome Goals™ — two destinations, no nested menus.",
  },
  "growth-vault": {
    emoji: "🏛",
    title: "Growth Vault™",
    subtitle: "Wins, proof, portfolio, and journey.",
  },
  "outcome-goals": {
    emoji: "🎯",
    title: "Outcome Goals™",
    subtitle: "Goals, progress, and reports.",
  },
  "wins-this-week": {

    emoji: "🏆",

    title: "My Wins™",

    subtitle: "Recent progress and accomplishments.",

  },

  "evidence-bank": {

    emoji: "📈",

    title: "Evidence Bank™",

    subtitle: "Proof of impact, improvements, progress, and problems solved.",

  },

  portfolio: {

    emoji: "📦",

    title: "Portfolio™",

    subtitle:

      "Completed assets and creations — courses, books, products, funnels, templates, and more.",

  },

  "confidence-vault": {

    emoji: "✨",

    title: "My Highlights",

    subtitle:

      "Save accomplishments, recognition, praise, expertise, credentials, and meaningful moments you want to remember.",

  },

  "my-journey": {

    emoji: "🌿",

    title: "My Journey™",

    subtitle: "Decisions, lessons, milestones, wisdom, and personal growth.",

  },

};



export const GROWTH_CROSS_LINKS: {

  id: GrowthSectionId;

  label: string;

}[] = [

  { id: "wins-this-week", label: "Open My Wins™" },

  { id: "evidence-bank", label: "Open Evidence Bank™" },

  { id: "portfolio", label: "Open Portfolio™" },

  { id: "my-journey", label: "Open My Journey™" },

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
  "growth-vault": {
    accentBorder: "border-t-amber-600",
    headerBg: "bg-gradient-to-br from-amber-50/90 to-white",
    iconRing: "bg-amber-100 text-amber-900",
    actionBorder: "border-amber-300",
    actionFg: "text-amber-950",
    actionHover: "hover:bg-amber-50",
  },
  "outcome-goals": {
    accentBorder: "border-t-teal-700",
    headerBg: "bg-gradient-to-br from-teal-50/90 to-white",
    iconRing: "bg-teal-100 text-teal-900",
    actionBorder: "border-teal-300",
    actionFg: "text-teal-950",
    actionHover: "hover:bg-teal-50",
  },
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

  portfolio: {

    accentBorder: "border-t-indigo-500",

    headerBg: "bg-gradient-to-br from-indigo-50/90 to-white",

    iconRing: "bg-indigo-100 text-indigo-800",

    actionBorder: "border-indigo-300",

    actionFg: "text-indigo-900",

    actionHover: "hover:bg-indigo-50",

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


