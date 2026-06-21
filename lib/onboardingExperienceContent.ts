/**
 * 🚀 Getting Started — onboarding experience (Phase 1)
 *
 * Orientation lives in How Do I → 🚀 New? Start Here.
 * A dedicated Getting Started workspace section is planned for interactive
 * tours, checklists, and first-win celebrations.
 */

export const ONBOARDING_EXPERIENCE = {
  id: "getting-started",
  title: "Getting Started",
  emoji: "🚀",
  status: "phase-1" as const,
  summary:
    "Onboarding orientation in How Do I — calm first steps, early wins, and ecosystem map.",
  howDoISectionId: "new-user" as const,
  plannedFeatures: [
    "Interactive guided tour",
    "Getting Started dashboard checklist",
    "First win celebration",
    "First growth entry explanation",
    "Dedicated Getting Started section (separate from How Do I)",
  ],
} as const;

export const ONBOARDING_EXPERIENCE_CONTENT = {
  meta: ONBOARDING_EXPERIENCE,
  checklistItems: [
    "First Conversation",
    "First Win",
    "First Project",
    "First Growth Entry",
    "Open My Work",
    "Explore Create",
  ],
};
