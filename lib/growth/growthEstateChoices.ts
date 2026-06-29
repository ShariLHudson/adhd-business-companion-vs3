import { JOURNAL_ROOM_BG } from "@/lib/growth/growthRoom";
import { CAPTURE_MOMENT_ROOM_BG } from "@/lib/captureMoment/captureMomentRoom";
import { STORY_LIBRARY_ROOM_BG } from "@/lib/storyLibrary/storyLibraryRoom";

/** Explore card — bright cottage library, distinct from gazebo and pond. */
export const GROWTH_STORY_EXPLORE_BG = STORY_LIBRARY_ROOM_BG;

export type GrowthEstateChoiceId = "reflect" | "capture" | "explore";

export type GrowthEstateChoice = {
  id: GrowthEstateChoiceId;
  label: string;
  headline: string;
  description: string;
  quote: string;
  cta: string;
  image: string;
  testId: string;
};

export const GROWTH_STORY_ENTRANCE_PROMPT =
  "How would you like to spend this moment?" as const;

export const GROWTH_ESTATE_CHOICES: GrowthEstateChoice[] = [
  {
    id: "reflect",
    label: "Reflect",
    headline: "Step into the White Gazebo",
    description:
      "A quiet place for private thoughts, reflections, gratitude, and the story only you can tell.",
    quote: "Some thoughts are meant to be written, not rushed.",
    cta: "Enter the Gazebo →",
    image: JOURNAL_ROOM_BG,
    testId: "growth-choice-journal",
  },
  {
    id: "capture",
    label: "Save",
    headline: "Capture a Moment",
    description:
      "A thought, a photo, a voice recording, a document, or a simple moment from today. Spark will gently organize it in the right place.",
    quote: "You don't have to decide where it belongs—we'll help.",
    cta: "Capture Something →",
    image: CAPTURE_MOMENT_ROOM_BG,
    testId: "growth-choice-capture",
  },
  {
    id: "explore",
    label: "Explore",
    headline: "Walk Through Your Story",
    description:
      "Return to the places where your memories, milestones, projects, and progress live. Visit your Journal, Evidence Vault, Celebration Garden, Creative Studio, and Timeline whenever you're ready.",
    quote: "Every small step becomes part of a larger story.",
    cta: "Open My Story →",
    image: GROWTH_STORY_EXPLORE_BG,
    testId: "growth-choice-explore",
  },
];
