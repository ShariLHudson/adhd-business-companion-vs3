/**
 * Estate Registry™ — knowledge & research registrations.
 *
 * Canon: The Library™ (Living/reading) ≠ Momentum Institute™ (Destination/learning).
 * @see docs/estate/Spark Estate Bible.md — Ch 7, Ch 12
 */

import type { EstateRegistryEntry } from "../types";

/** Reading Nook / Estate Library — stories, volumes, peaceful reading (not the Institute). */
export const LIBRARY_ENTRY: EstateRegistryEntry = {
  id: "library",
  name: "The Library™",
  category: "knowledge",
  purpose:
    "Quiet reading and story — wisdom on the shelves, volumes that protect the member's life.",
  memberDescription:
    "The Library™ is peaceful — stories, how-to at your pace, and room to think beneath the staircase.",
  primarySection: "growth-library",
  sections: ["how-do-i"],
  objectId: "library",
  keywords: [
    "reading nook",
    "read",
    "story",
    "stories",
    "inspiring",
    "growth library",
    "how do i",
    "how to",
    "quiet read",
  ],
  phrases: [
    "take me to the library",
    "want to read",
    "something inspiring to read",
    "reading nook",
  ],
  userNeeds: ["learn", "reflect"],
  intents: ["understand"],
  businessGoals: ["growth", "clarity"],
  problemsSolved: ["want quiet reading", "need inspiration without a course"],
  outcomes: ["peace", "curiosity", "clarity"],
  journeyRole: "reflect",
  relatedEntryIds: ["momentum-institute", "observatory"],
  status: "live",
};

/** Entrepreneur Development Center — drawer wall, Knowledge Cards™, capability growth. */
export const MOMENTUM_INSTITUTE_ENTRY: EstateRegistryEntry = {
  id: "momentum-institute",
  name: "Momentum Institute™",
  category: "knowledge",
  purpose:
    "Entrepreneurial development inside the Estate — drawer by drawer, capability by capability.",
  memberDescription:
    "The Momentum Institute™ is where discoveries live — drawers, Knowledge Cards™, and conversations that build capability.",
  primarySection: "momentum-institute",
  sections: [],
  objectId: "momentum-institute",
  keywords: [
    "momentum institute",
    "the institute",
    "institute",
    "learn",
    "teach me",
    "pricing",
    "marketing",
    "business mastery",
    "entrepreneur",
    "drawer",
    "knowledge card",
    "confidence",
    "imposter",
    "networking",
  ],
  phrases: [
    "learn about pricing",
    "learn marketing",
    "want to learn pricing",
    "how do i price",
    "teach me about",
    "open the institute",
  ],
  userNeeds: ["learn"],
  intents: ["learn", "understand"],
  businessGoals: ["pricing", "marketing", "growth"],
  problemsSolved: ["need to learn a business skill", "how-to questions"],
  outcomes: ["actionable learning", "capability growth"],
  journeyRole: "learn",
  relatedEntryIds: ["business-mastery-minutes", "knowledge-cards", "library"],
  status: "live",
};

export const GROWTH_JOURNAL_ENTRY: EstateRegistryEntry = {
  id: "growth-journal",
  name: "Growth Journal™",
  category: "reflection",
  purpose:
    "Private reflection and growth journaling — capture insights, wins, and lessons without pressure.",
  memberDescription:
    "Your Growth Journal™ is a quiet place to reflect — what you're learning, what mattered, and what's next.",
  primarySection: "growth-journal",
  objectId: "growth-journal",
  keywords: [
    "journal",
    "journaling",
    "reflect",
    "reflection",
    "growth journal",
    "write in my journal",
    "diary",
  ],
  phrases: [
    "open journal",
    "want to reflect",
    "need to reflect",
    "write in my journal",
  ],
  userNeeds: ["reflect", "restore"],
  intents: ["reflect", "restore"],
  businessGoals: ["growth", "clarity"],
  problemsSolved: ["need to process", "want to capture insights"],
  outcomes: ["clarity", "emotional relief", "growth awareness"],
  journeyRole: "reflect",
  status: "live",
};

export const OBSERVATORY_ENTRY: EstateRegistryEntry = {
  id: "observatory",
  name: "Observatory™",
  category: "research",
  purpose:
    "Curated research on AI, business, technology, and innovation — explore before you commit.",
  memberDescription:
    "The Observatory™ is where we explore what's emerging — trends, tools, and ideas worth your attention.",
  primarySection: "grow-observatory",
  objectId: "observatory",
  keywords: [
    "observatory",
    "research",
    "trend",
    "trends",
    "innovation",
    "emerging",
    "ai",
    "artificial intelligence",
    "discover",
    "explore",
    "what's new",
  ],
  phrases: [
    "research ai",
    "research artificial intelligence",
    "want to research",
    "stay ahead",
  ],
  userNeeds: ["research"],
  intents: ["learn", "understand"],
  businessGoals: ["innovation", "technology"],
  problemsSolved: ["need curated research", "overwhelmed by news"],
  outcomes: ["informed perspective", "relevant discoveries"],
  journeyRole: "research",
  status: "live",
};

export const KNOWLEDGE_REGISTRATIONS: readonly EstateRegistryEntry[] = [
  LIBRARY_ENTRY,
  MOMENTUM_INSTITUTE_ENTRY,
  GROWTH_JOURNAL_ENTRY,
  OBSERVATORY_ENTRY,
] as const;
