/**
 * Browse My Business Estate — three collapsed groups.
 * Keep My Business Moving shows one compact Coming Soon teaser (no inactive rows).
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
          "Helps Shari speak accurately about what your business is and stands for.",
        available: true,
      },
      {
        id: "people-i-help",
        kind: "area",
        name: "People I Help",
        purpose:
          "Helps Spark speak to the right people with the right problems and language.",
        available: true,
      },
      {
        id: "offers",
        kind: "room",
        sectionId: "offers",
        name: "Offer Suite",
        purpose:
          "Keeps guidance tied to what you actually offer and the results it creates.",
        available: true,
      },
      {
        id: "brand",
        kind: "room",
        sectionId: "brand",
        name: "Brand Studio",
        purpose: "Shapes how Spark writes and sounds like your business.",
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
        purpose:
          "Gives Shari your current priorities so suggestions stay relevant.",
        available: true,
      },
      {
        id: "work-style",
        kind: "room",
        sectionId: "work-style",
        name: "Working Style Study",
        purpose:
          "Teaches Shari how you focus, decide, and recover — so support fits you.",
        available: true,
      },
      {
        id: "tools",
        kind: "room",
        sectionId: "tools",
        name: "Systems Desk",
        purpose: "Remembers the tools and systems that keep your work moving.",
        available: true,
      },
    ],
  },
  {
    id: "keep-moving",
    title: "Keep My Business Moving",
    description:
      "Goals, return support, and quiet progress tools will live here later.",
    entries: [
      {
        id: "more-support-coming",
        kind: "coming-soon",
        name: "More Support Is Coming",
        purpose:
          "A calm place for goals, return support, and quiet progress — arriving later.",
        available: false,
        comingLaterLabel: "Coming Later",
        comingSoonItems: [
          "Goals and Progress",
          "Return Plan",
          "My Spark Impact",
          "Wins and Evidence",
          "Business Check-In",
        ],
      },
    ],
  },
] as const;

/** Single warm reassurance — do not repeat optional-copy elsewhere on the overview. */
export const BUSINESS_ESTATE_OPTIONAL_REASSURANCE =
  "My Business Estate grows with you over time. Nothing here has to be completed all at once. Every section you complete simply helps Spark understand your business a little better.";

export const BUSINESS_ESTATE_LEAD =
  "This is where Spark learns about your business so Shari, the Chamber, and the Board can give you more useful and personalized support.";
