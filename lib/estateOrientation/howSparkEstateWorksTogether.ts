/**
 * How Spark Estate Works Together — plain-language mental model.
 * Source of truth for onboarding, Help, room orientation, and Estate Tour.
 */

import type {
  EstateOrientationPlace,
  EstateOrientationPlaceId,
  HowSparkEstateWorksTogetherContent,
} from "./types";

export const HOW_SPARK_ESTATE_WORKS_TOGETHER_FEATURE =
  "How Spark Estate Works Together" as const;

export const HOW_EVERYTHING_WORKS_TOGETHER_HELP_LABEL =
  "How Everything Works Together" as const;

export const SHOW_ME_HOW_THIS_FITS_TOGETHER_LABEL =
  "Show me how this fits together" as const;

const PLACES: EstateOrientationPlace[] = [
  {
    id: "create",
    name: "Work to Create",
    summary: "Where ideas become real work.",
    whatIsThis:
      "Work to Create is where ideas become something you can use — drafts, plans, and pieces of your business that feel finished enough to move forward.",
    whyWouldIUseIt:
      "Use it when you are ready to make something real, not just think about it.",
    howItConnects:
      "What you create can settle into Projects when it needs steps, and can quietly inform strategies, evidence, and wins as you keep working.",
  },
  {
    id: "projects",
    name: "Projects",
    summary: "Where work is organized and completed.",
    whatIsThis:
      "Projects is where work is organized and completed — a calm home for the things that take more than one sitting.",
    whyWouldIUseIt:
      "Use it when something matters enough to keep track of, return to, and finish without holding it all in your head.",
    howItConnects:
      "Projects often grow from Create and Clear My Mind. Progress here can show up later as evidence, wins, and a clearer picture of your business.",
  },
  {
    id: "cartography",
    name: "Cartography",
    summary: "Relationships, patterns, and the bigger picture.",
    whatIsThis:
      "Cartography lives under Work to Create — a place to see relationships, patterns, and the bigger picture when your thinking needs space to spread out.",
    whyWouldIUseIt:
      "Use it when ideas feel tangled, or when you want to understand how pieces of your business relate before you decide what to do next.",
    howItConnects:
      "Maps can clarify what belongs in a Project. They do not invent connections — they help you notice the ones already forming in your work.",
  },
  {
    id: "strategies",
    name: "Strategies",
    summary: "Guidance before you build.",
    whatIsThis:
      "Strategies lives under Guidance — approaches that help you think better before you create new work.",
    whyWouldIUseIt:
      "Use it when you want a thoughtful approach, not when you are already ready to draft or build.",
    howItConnects:
      "A good strategy often points toward Create or Projects. It stays useful later when Business Pulse or Evidence helps you see what actually worked.",
  },
  {
    id: "chamber",
    name: "Chamber Members",
    summary: "Specialists for marketing, finance, leadership, content, and more.",
    whatIsThis:
      "Chamber Members are specialists — marketing, finance, leadership, content, and other perspectives you can invite when a conversation needs that lens.",
    whyWouldIUseIt:
      "Use them when you want a focused point of view on something specific, without having to become every kind of expert yourself.",
    howItConnects:
      "The Chamber helps you think and practice. Important decisions may still belong in the Board Room — different rooms, different kinds of help.",
  },
  {
    id: "board",
    name: "Board of Directors",
    summary: "An advisory team for important decisions.",
    whatIsThis:
      "The Board of Directors is your advisory team for important decisions — several thoughtful perspectives around one question that matters.",
    whyWouldIUseIt:
      "Use it when you are stuck on a decision and want calm counsel before you choose.",
    howItConnects:
      "The Board helps you decide. The Chamber can help you carry the work forward afterward. Your choice remains yours.",
  },
  {
    id: "business-pulse",
    name: "Business Pulse",
    summary: "Keeps a gentle eye across the business.",
    whatIsThis:
      "Business Pulse keeps a gentle eye across your business — what moved forward, what connects, and what might help next.",
    whyWouldIUseIt:
      "Use it when you want a quiet sense of progress without digging through every room.",
    howItConnects:
      "Pulse reflects work you have already done in Projects, Create, Wins, and Evidence. It does not invent activity — it notices what is already true.",
  },
  {
    id: "evidence",
    name: "Evidence",
    summary: "Remembers what worked.",
    whatIsThis:
      "Evidence remembers what worked — results, lessons, and proof worth keeping for harder days.",
    whyWouldIUseIt:
      "Use it when something happens that you do not want to forget, especially when confidence needs a real memory later.",
    howItConnects:
      "Evidence often grows from finished work and client moments. It sits beside Wins — wins celebrate; evidence keeps the proof.",
  },
  {
    id: "wins",
    name: "Wins",
    summary: "Celebrates meaningful progress.",
    whatIsThis:
      "Wins celebrates meaningful progress — the small and large moments that show you are moving.",
    whyWouldIUseIt:
      "Use it when something went well and you want that feeling kept, not lost in the rush of the next task.",
    howItConnects:
      "Wins sit near Evidence and the Hall of Accomplishments. Celebration today can become a longer story of growth over time.",
  },
  {
    id: "hall",
    name: "Hall of Accomplishments",
    summary: "The story of your achievements over time.",
    whatIsThis:
      "The Hall of Accomplishments holds the story of your achievements over time — milestones worth returning to with pride.",
    whyWouldIUseIt:
      "Use it when you want to see how far you have come, or when a season of hard work deserves a quiet place to be remembered.",
    howItConnects:
      "The Hall gathers meaningful accomplishments from your journey. Wins and Evidence can feed it as your work unfolds — never as trophies for busywork.",
  },
];

export const HOW_SPARK_ESTATE_WORKS_TOGETHER: HowSparkEstateWorksTogetherContent =
  {
    featureName: HOW_SPARK_ESTATE_WORKS_TOGETHER_FEATURE,
    helpMenuLabel: HOW_EVERYTHING_WORKS_TOGETHER_HELP_LABEL,
    fitsTogetherLinkLabel: SHOW_ME_HOW_THIS_FITS_TOGETHER_LABEL,
    intro: [
      "You don't need to use every part of Spark Estate.",
      "Think of it as a business estate with different rooms. You only need the rooms that are helpful today. The others stay quietly connected for when you need them.",
    ],
    places: PLACES,
    close: [
      "You don't have to connect these yourself. Spark quietly keeps them connected behind the scenes.",
      "Start where you feel comfortable. The rest of the estate grows with you.",
    ],
    tour: {
      title: "A short walk through the estate",
      invitation:
        "Would you like me to walk with you through a few places that show how the estate fits together?",
      walkWithMeLabel: "Walk with me",
      stayLabel: "Stay here",
      notNowLabel: "Not now",
      steps: [
        {
          id: "project-studio",
          placeName: "Project Studio",
          shariLine:
            "This is where you'll spend most of your time doing the work — organizing what matters and finishing it at a human pace.",
          estatePlaceHint: "projects",
        },
        {
          id: "cartographers-studio",
          placeName: "Cartographer's Studio",
          shariLine:
            "When you need the bigger picture, this is where relationships and patterns can breathe — so the next step feels clearer.",
          estatePlaceHint: "cartographers-studio",
        },
        {
          id: "board-room",
          placeName: "Board Room",
          shariLine:
            "When you're stuck on a decision, we can sit with the Board — calm counsel, one important question at a time. You still choose.",
          estatePlaceHint: "boardroom",
        },
        {
          id: "hall-of-accomplishments",
          placeName: "Hall of Accomplishments",
          shariLine:
            "And when progress deserves to be seen, the Hall remembers your meaningful achievements — not as a score, but as your story.",
          estatePlaceHint: "hall-of-accomplishments",
        },
      ],
      closing:
        "That's the heart of it — one business, many helpful perspectives, quietly kept together. We can start wherever feels comfortable.",
    },
  };

export function getEstateOrientationPlace(
  id: EstateOrientationPlaceId,
): EstateOrientationPlace | null {
  return (
    HOW_SPARK_ESTATE_WORKS_TOGETHER.places.find((place) => place.id === id) ??
    null
  );
}

export function listEstateOrientationPlaceIds(): EstateOrientationPlaceId[] {
  return HOW_SPARK_ESTATE_WORKS_TOGETHER.places.map((place) => place.id);
}
