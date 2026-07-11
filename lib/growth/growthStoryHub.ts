import type { GrowthSectionId } from "@/lib/growthNavigation";

export type GrowthStoryHubPanelId =
  | Exclude<
      GrowthSectionId,
      "growth" | "growth-library" | "growth-reports" | "confidence-vault" | "my-journey"
    >
  | "timeline";

export type GrowthStoryHubPanel = {
  id: GrowthStoryHubPanelId;
  title: string;
  description: string;
};

export const GROWTH_STORY_INTRO_LINES = [
  "The moments you choose to keep become the story you tell yourself tomorrow.",
  "Save what matters.",
  "Celebrate your progress.",
  "Watch your life grow over time.",
] as const;

/** @deprecated Use GROWTH_STORY_INTRO_LINES */
export const GROWTH_STORY_INTRO = GROWTH_STORY_INTRO_LINES[0];

export const GROWTH_STORY_WELCOME = {
  line1: "Take a seat for a moment.",
  line2: "What would you like to remember today?",
} as const;

export const GROWTH_STORY_HUB_PANELS: GrowthStoryHubPanel[] = [
  {
    id: "growth-journal",
    title: "Journal",
    description: "Private reflections.",
  },
  {
    id: "evidence-bank",
    title: "Evidence Vault",
    description: "Proof you've grown.",
  },
  {
    id: "wins-this-week",
    title: "Celebration Garden",
    description: "Moments of progress — peaceful, reflective, not milestones.",
  },
  {
    id: "growth-portfolio",
    title: "Creative Studio",
    description: "Projects, courses, campaigns, and creative work.",
  },
  {
    id: "timeline",
    title: "Wins Timeline",
    description: "See growth over months and years — not isolated events.",
  },
];
