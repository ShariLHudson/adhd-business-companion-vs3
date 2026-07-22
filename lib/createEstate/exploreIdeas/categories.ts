/**
 * Spec 133 — Show Me Categories visual cards.
 */

import type { ExploreIdeaCategoryCard } from "./types";

export const EXPLORE_IDEA_CATEGORY_CARDS: readonly ExploreIdeaCategoryCard[] = [
  {
    id: "marketing",
    label: "Marketing",
    hint: "Campaigns, flyers, funnels, and launch ideas",
    catalogCategoryIds: ["marketing", "content"],
    matchTerms: ["marketing", "campaign", "flyer", "funnel", "launch", "social"],
  },
  {
    id: "planning",
    label: "Planning",
    hint: "Plans, calendars, and clear next steps",
    catalogCategoryIds: ["planning"],
    matchTerms: ["plan", "calendar", "roadmap"],
  },
  {
    id: "writing",
    label: "Writing",
    hint: "Emails, posts, scripts, and documents",
    catalogCategoryIds: ["content", "documents"],
    matchTerms: ["email", "blog", "script", "document", "proposal"],
  },
  {
    id: "business",
    label: "Business",
    hint: "Offers, processes, and business building blocks",
    catalogCategoryIds: ["business-assets", "documents"],
    matchTerms: ["business", "offer", "sop", "process", "checklist"],
  },
  {
    id: "events",
    label: "Events",
    hint: "Workshops, retreats, and gatherings",
    catalogCategoryIds: ["content"],
    matchTerms: ["event", "workshop", "retreat", "webinar", "summit"],
  },
  {
    id: "learning",
    label: "Learning",
    hint: "Courses, training, and teaching materials",
    catalogCategoryIds: ["documents", "content"],
    matchTerms: ["course", "training", "workshop", "guide", "outline"],
  },
  {
    id: "relationships",
    label: "Relationships",
    hint: "Check-ins, follow-ups, and client care",
    catalogCategoryIds: ["relationships"],
    matchTerms: ["client", "referral", "testimonial", "follow-up", "check-in"],
  },
] as const;

export function exploreIdeaCategoryById(
  id: string,
): ExploreIdeaCategoryCard | undefined {
  return EXPLORE_IDEA_CATEGORY_CARDS.find((c) => c.id === id);
}
