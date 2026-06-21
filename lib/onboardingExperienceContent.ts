/**
 * 🚀 Onboarding Experience — FUTURE FEATURE (not visible in How Do I)
 *
 * Reserved for interactive onboarding: guided tours, beginner roadmaps,
 * ecosystem walkthroughs, and new-user checklists.
 *
 * Educational help articles (First 5 Minutes, overwhelm, chat vs workspace, etc.)
 * live in How Do I → Additional Help Topics — not here.
 */

export const ONBOARDING_EXPERIENCE = {
  id: "onboarding-experience",
  title: "Onboarding Experience",
  emoji: "🚀",
  status: "planned" as const,
  summary:
    "Future interactive onboarding — guided tours and checklists, separate from the Help Center.",
  plannedFeatures: [
    "Beginner Roadmaps",
    "Guided Tours",
    "Ecosystem Walkthroughs",
    "New User Checklists",
    "First-session prompts",
    "Progressive feature unlock hints",
  ],
} as const;

/** Placeholder for future onboarding UI — do not render in How Do I. */
export const ONBOARDING_EXPERIENCE_CONTENT = {
  meta: ONBOARDING_EXPERIENCE,
  articleCount: 0,
};
