import type { HelpfulLesson } from "./types";

/**
 * Curated one-at-a-time discovery lessons for Welcome → Show Me Something Helpful.
 * Keep explanations short; destinations must be live/navigable when destinationId is set.
 */
export const HELPFUL_LESSON_REGISTRY: readonly HelpfulLesson[] = [
  {
    id: "parking-lot",
    title: "Parking Lot",
    shortExplanation:
      "Save an idea, task, or thought without interrupting what you are already doing. You can return to it later when you are ready.",
    destinationId: "plan-my-day",
    actionLabel: "Show Me",
    eligibility: { tags: ["planning", "capture"] },
  },
  {
    id: "clear-my-mind",
    title: "Clear My Mind",
    shortExplanation:
      "Set everything swirling in your head down in one place so you can breathe and see what actually needs attention.",
    destinationId: "clear-my-mind",
    actionLabel: "Show Me",
    eligibility: { tags: ["overwhelm", "capture"] },
  },
  {
    id: "plan-my-day",
    title: "Plan My Day",
    shortExplanation:
      "Shape today around priorities, time, and energy — without holding the whole day in your working memory.",
    destinationId: "plan-my-day",
    actionLabel: "Show Me",
    eligibility: { tags: ["planning"] },
  },
  {
    id: "adapt-my-day",
    title: "Adapt My Day",
    shortExplanation:
      "When the day shifts, gently reshape an existing plan instead of starting from scratch.",
    destinationId: "plan-my-day",
    actionLabel: "Show Me",
    eligibility: { tags: ["planning"] },
  },
  {
    id: "reminders",
    title: "Reminders",
    shortExplanation:
      "Ask for a timely nudge when something matters — without turning your day into a wall of alerts.",
    destinationId: "reminders",
    actionLabel: "Show Me",
    eligibility: { tags: ["memory"] },
  },
  {
    id: "rhythms",
    title: "Rhythms",
    shortExplanation:
      "Build gentle repeating patterns that support your business and life — more flexible than rigid habits.",
    destinationId: "rhythms",
    actionLabel: "Show Me",
    eligibility: { tags: ["memory", "planning"] },
  },
  {
    id: "work-with-shari",
    title: "Work With Shari",
    shortExplanation:
      "Stay in conversation while you work — like quiet company that helps you begin and keep going.",
    actionLabel: "Show Me",
    eligibility: { tags: ["support"] },
  },
  {
    id: "decision-compass",
    title: "Decision Compass",
    shortExplanation:
      "Walk through a decision with calm structure when options feel tangled.",
    destinationId: "decision-compass",
    actionLabel: "Show Me",
    eligibility: { tags: ["decision"] },
  },
  {
    id: "chamber",
    title: "Chamber of Momentum",
    shortExplanation:
      "Invite specialized perspectives when you want thoughtful counsel without leaving the Estate.",
    destinationId: "chamber",
    actionLabel: "Show Me",
    eligibility: { tags: ["decision", "council"] },
  },
  {
    id: "boardroom",
    title: "Round Table Boardroom",
    shortExplanation:
      "Bring a Board of Directors lens to a business question when you want several angles at once.",
    destinationId: "boardroom",
    actionLabel: "Show Me",
    eligibility: { tags: ["decision", "council"] },
  },
  {
    id: "evidence-vault",
    title: "Evidence Vault",
    shortExplanation:
      "Keep proof of progress and wins so hard days do not erase what you have already done.",
    destinationId: "evidence-vault",
    actionLabel: "Show Me",
    eligibility: { tags: ["memory", "recognition"] },
  },
  {
    id: "journal",
    title: "Journal Gazebo",
    shortExplanation:
      "A quiet place to write what is true for you — without turning it into a productivity task.",
    destinationId: "journal",
    actionLabel: "Show Me",
    eligibility: { tags: ["reflection"] },
  },
  {
    id: "projects",
    title: "Projects",
    shortExplanation:
      "Give important work a home so you can return to it without reconstructing the whole story.",
    destinationId: "projects",
    actionLabel: "Show Me",
    eligibility: { tags: ["work"] },
  },
  {
    id: "people-i-help",
    title: "People I Help",
    shortExplanation:
      "Clarify who you serve so suggestions for offers, content, and messaging stay grounded.",
    destinationId: "people-i-help",
    actionLabel: "Show Me",
    eligibility: { tags: ["business"] },
  },
  {
    id: "business-estate",
    title: "Business Estate",
    shortExplanation:
      "Add details about your business over time so Spark can support you more personally.",
    destinationId: "my-business-estate",
    actionLabel: "Show Me",
    eligibility: { tags: ["business"] },
  },
  {
    id: "conversation-style",
    title: "Conversation Style",
    shortExplanation:
      "Adjust how I speak with you — warmer, more direct, shorter — without changing who I am.",
    destinationId: "settings",
    actionLabel: "Show Me",
    eligibility: { tags: ["preferences"] },
  },
  {
    id: "support-style",
    title: "Support Style",
    shortExplanation:
      "Tell me how you like to be supported when you are stuck, tired, or deciding.",
    destinationId: "settings",
    actionLabel: "Show Me",
    eligibility: { tags: ["preferences"] },
  },
  {
    id: "peaceful-places",
    title: "Peaceful Places",
    shortExplanation:
      "Step into a calmer setting when your nervous system needs rest before the next decision.",
    destinationId: "peaceful-places",
    actionLabel: "Show Me",
    eligibility: { tags: ["restoration"] },
  },
  {
    id: "soundscapes",
    title: "Soundscapes",
    shortExplanation:
      "Gentle ambient sound that can help you settle or focus — always optional.",
    destinationId: "settings",
    actionLabel: "Show Me",
    eligibility: { voiceOnly: true, tags: ["restoration"] },
  },
  {
    id: "estate-guide",
    title: "Spark Estate Guide",
    shortExplanation:
      "A quiet guidebook to the Estate — discovered like a book, not a help-center menu.",
    destinationId: "guidebook",
    actionLabel: "Show Me",
    eligibility: { tags: ["discovery"] },
  },
] as const;

export function getHelpfulLessonById(id: string): HelpfulLesson | null {
  return HELPFUL_LESSON_REGISTRY.find((l) => l.id === id) ?? null;
}
