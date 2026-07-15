/**
 * Browse My Business Estate — three collapsed groups.
 */
import type { EstateBrowseGroup } from "./types";

export const BUSINESS_ESTATE_BROWSE_GROUPS: readonly EstateBrowseGroup[] = [
  {
    id: "understand",
    title: "Understand My Business",
    description:
      "Define what your business is, who it serves, and how it communicates.",
    entries: [
      {
        id: "identity",
        kind: "room",
        sectionId: "identity",
        name: "Identity Office",
        purpose:
          "Define what your business is, why it exists, and what it stands for.",
        available: true,
      },
      {
        id: "people-i-help",
        kind: "area",
        name: "People I Help",
        purpose: "Describe who you serve and what they need most.",
        available: true,
      },
      {
        id: "offers",
        kind: "room",
        sectionId: "offers",
        name: "Offer Suite",
        purpose: "Clarify what you offer and the results it creates.",
        available: true,
      },
      {
        id: "brand",
        kind: "room",
        sectionId: "brand",
        name: "Brand Studio",
        purpose: "Shape how your business sounds and shows up.",
        available: true,
      },
    ],
  },
  {
    id: "guide",
    title: "Guide My Business",
    description:
      "Set direction and teach Shari how your business should work.",
    entries: [
      {
        id: "direction",
        kind: "room",
        sectionId: "direction",
        name: "Strategy Desk",
        purpose: "Set direction, priorities, and decision filters.",
        available: true,
      },
      {
        id: "work-style",
        kind: "room",
        sectionId: "work-style",
        name: "Working Style Study",
        purpose: "Teach Shari how you focus, decide, and recover.",
        available: true,
      },
      {
        id: "tools",
        kind: "room",
        sectionId: "tools",
        name: "Systems Desk",
        purpose: "Capture tools, workflows, and what keeps work moving.",
        available: true,
      },
    ],
  },
  {
    id: "keep-moving",
    title: "Keep My Business Moving",
    description:
      "Set goals, return after interruptions, and see your progress.",
    entries: [
      {
        id: "goals-progress",
        kind: "area",
        name: "Goals and Progress",
        purpose: "Choose how you want goals and progress to feel.",
        available: false,
        comingLaterLabel: "Coming Later",
      },
      {
        id: "return-plan",
        kind: "area",
        name: "Return Plan",
        purpose: "Plan how Shari should help you restart after interruptions.",
        available: false,
        comingLaterLabel: "Coming Later",
      },
      {
        id: "spark-impact",
        kind: "area",
        name: "My Spark Impact",
        purpose: "Tell Shari what would make Spark genuinely useful.",
        available: false,
        comingLaterLabel: "Coming Later",
      },
      {
        id: "wins-evidence",
        kind: "area",
        name: "Wins and Evidence",
        purpose: "Gather proof and quiet wins over time.",
        available: false,
        comingLaterLabel: "Coming Later",
      },
      {
        id: "business-check-in",
        kind: "area",
        name: "Business Check-In",
        purpose: "A calm place to notice where things stand.",
        available: false,
        comingLaterLabel: "Coming Later",
      },
    ],
  },
] as const;

export const BUSINESS_ESTATE_OPTIONAL_REASSURANCE =
  "Spark can help you right away. Everything here is optional. Add information whenever it feels useful—the more Shari understands your business and how you work, the more personalized her support can become.";

export const BUSINESS_ESTATE_LEAD =
  "Help Shari learn about your business so her guidance becomes more personal and useful.";
