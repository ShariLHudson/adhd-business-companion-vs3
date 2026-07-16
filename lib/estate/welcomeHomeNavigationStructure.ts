/**
 * Welcome Home menu — global estate navigation only.
 * Answers: Where do I want to go?
 * Experience Controls live under SH, not here.
 */

export type WelcomeHomeNavCategoryId =
  | "my-day"
  | "my-work"
  | "take-a-moment"
  | "my-story"
  | "get-advice";

export type WelcomeHomeNavDestinationId =
  | "adapt-plan-my-day"
  | "calendar"
  | "reminders-rhythms"
  | "projects"
  | "destination-gallery"
  | "cartographers-studio"
  | "clear-my-mind"
  | "parking-lot"
  | "breathe"
  | "spin-the-wheel"
  | "peaceful-places"
  | "soundscapes"
  | "journal"
  | "evidence-vault"
  | "hall-of-accomplishments"
  | "chamber-of-momentum"
  | "boardroom"
  | "explore-estate"
  | "spark-estate-guide";

export type WelcomeHomeNavDestination = {
  id: WelcomeHomeNavDestinationId;
  label: string;
  /** Gallery / selection experiences may show a trailing affordance. */
  selectionExperience?: boolean;
};

export type WelcomeHomeNavCategory = {
  id: WelcomeHomeNavCategoryId;
  label: string;
  destinations: readonly WelcomeHomeNavDestination[];
};

/** Five intent categories — max depth two (category › destination). */
export const WELCOME_HOME_NAV_CATEGORIES: readonly WelcomeHomeNavCategory[] = [
  {
    id: "my-day",
    label: "My Day",
    destinations: [
      { id: "adapt-plan-my-day", label: "Adapt / Plan My Day" },
      { id: "calendar", label: "Calendar" },
      { id: "reminders-rhythms", label: "Reminders / Rhythms" },
    ],
  },
  {
    id: "my-work",
    label: "My Work",
    destinations: [
      { id: "projects", label: "Projects" },
      {
        id: "destination-gallery",
        label: "Destination Gallery",
        selectionExperience: true,
      },
      { id: "cartographers-studio", label: "Cartographer’s Studio" },
    ],
  },
  {
    id: "take-a-moment",
    label: "Take a Moment",
    destinations: [
      { id: "clear-my-mind", label: "Clear My Mind" },
      { id: "parking-lot", label: "Parking Lot" },
      { id: "breathe", label: "Breathe" },
      { id: "spin-the-wheel", label: "Spin the Wheel" },
      {
        id: "peaceful-places",
        label: "Peaceful Places",
        selectionExperience: true,
      },
      {
        id: "soundscapes",
        label: "Soundscapes",
        selectionExperience: true,
      },
    ],
  },
  {
    id: "my-story",
    label: "My Story",
    destinations: [
      { id: "journal", label: "Journal Gazebo" },
      { id: "evidence-vault", label: "Evidence Vault" },
      { id: "hall-of-accomplishments", label: "Hall of Accomplishments" },
    ],
  },
  {
    id: "get-advice",
    label: "Get Advice",
    destinations: [
      { id: "chamber-of-momentum", label: "Chamber of Momentum" },
      { id: "boardroom", label: "Boardroom" },
    ],
  },
] as const;

/** Wander the Grounds — focused submenu (same replace pattern as categories). */
export const WELCOME_HOME_WANDER_GROUNDS = {
  id: "wander-the-grounds" as const,
  label: "Wander the Grounds",
  destinations: [
    { id: "explore-estate" as const, label: "Explore Estate" },
    { id: "spark-estate-guide" as const, label: "Spark Estate Guide" },
  ],
};

export type WelcomeHomeFocusedPanelId =
  | WelcomeHomeNavCategoryId
  | typeof WELCOME_HOME_WANDER_GROUNDS.id;

/** Experience Controls must never appear in Welcome Home navigation. */
export const WELCOME_HOME_FORBIDDEN_LABELS = [
  "Experience Controls",
  "Chat Off",
  "Chat on",
  "Sound Off",
  "Full screen",
] as const;

export function welcomeHomeNavMaxDepth(): number {
  return 2;
}

export function welcomeHomeHasExperienceControls(
  categoryLabels: readonly string[],
): boolean {
  return categoryLabels.some((label) =>
    /experience controls/i.test(label),
  );
}

/** My Day focused submenu — exactly three combined destinations. */
export function welcomeHomeMyDayDestinationIds(): readonly WelcomeHomeNavDestinationId[] {
  const myDay = WELCOME_HOME_NAV_CATEGORIES.find((c) => c.id === "my-day");
  return myDay?.destinations.map((d) => d.id) ?? [];
}
