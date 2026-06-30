import type { AppSection } from "./companionUi";
import { NAV_HOME } from "./navigationBack";

/** Entrepreneurial Grow™ family — capability practice and knowledge. */
export const GROW_PANEL_SECTIONS: AppSection[] = [
  "grow",
  "grow-momentum-builders",
  "grow-spark-cards",
  "grow-guilds",
  "grow-daily-discoveries",
  "grow-business-history",
  "grow-observatory",
];

export function isGrowPanelSection(
  section: AppSection | null | undefined,
): boolean {
  return section != null && GROW_PANEL_SECTIONS.includes(section);
}

export type GrowSectionId =
  | "grow"
  | "grow-momentum-builders"
  | "grow-spark-cards"
  | "grow-guilds"
  | "grow-daily-discoveries"
  | "grow-business-history"
  | "grow-observatory";

export const GROW_SECTION_META: Record<
  GrowSectionId,
  { title: string; objectId: string; lead: string }
> = {
  grow: {
    objectId: "grow",
    title: "Grow",
    lead:
      "Strengthen your thinking, sharpen your skills, and build real entrepreneurial capability through guided experiences designed for your business.",
  },
  "grow-momentum-builders": {
    objectId: "momentum-builders",
    title: "Momentum Builders",
    lead:
      "Practice the thinking, decisions, and skills that help you become a stronger entrepreneur.",
  },
  "grow-spark-cards": {
    objectId: "spark-cards",
    title: "Spark Cards",
    lead:
      "Practical entrepreneurial wisdom personalized to your business, goals, and current work.",
  },
  "grow-guilds": {
    objectId: "guilds",
    title: "Guilds",
    lead:
      "Long-term mastery journeys for the entrepreneurial capabilities you want to strengthen.",
  },
  "grow-daily-discoveries": {
    objectId: "daily-discoveries",
    title: "Daily Discoveries",
    lead:
      "Remarkable business insights, founder stories, and ideas you can apply right away.",
  },
  "grow-business-history": {
    objectId: "business-history",
    title: "Business History Today",
    lead:
      "Explore the decisions, patterns, and turning points that shaped modern business.",
  },
  "grow-observatory": {
    objectId: "observatory",
    title: "Observatory",
    lead:
      "Curated discoveries in AI, business, technology, and innovation to help you stay ahead.",
  },
};

export function growRoomBackLabel(fromSection: AppSection): string | null {
  if (fromSection === "home") return NAV_HOME;
  if (fromSection === "grow") return GROW_SECTION_META.grow.title;
  if (fromSection in GROW_SECTION_META) {
    return GROW_SECTION_META[fromSection as GrowSectionId].title;
  }
  return null;
}
