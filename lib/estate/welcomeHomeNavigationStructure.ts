/**
 * Welcome Home menu — global estate navigation only.
 * Answers: Where do I want to go?
 * Experience Controls live under SH, not here.
 *
 * My Day restores two nested dropdown groups (098):
 * - Plan My Day / Adapt My Day → Plan My Day · Adapt My Day
 * - Reminders / Rhythms → Reminders · Rhythms
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
  | "strategy-library"
  | "explore-estate"
  | "spark-estate-guide";

/** Independently routable children inside My Day dropdown groups. */
export type WelcomeHomeNavDropdownChildId =
  | "plan-my-day"
  | "adapt-my-day"
  | "reminders"
  | "rhythms";

export type WelcomeHomeNavDropdownChild = {
  id: WelcomeHomeNavDropdownChildId;
  label: string;
};

export type WelcomeHomeNavDestination = {
  id: WelcomeHomeNavDestinationId;
  label: string;
  /** Gallery / selection experiences may show a trailing affordance. */
  selectionExperience?: boolean;
  /**
   * Nested dropdown children — independently clickable destinations.
   * Parent row toggles the dropdown; it does not open a combined chooser.
   */
  dropdownChildren?: readonly WelcomeHomeNavDropdownChild[];
};

export type WelcomeHomeNavCategory = {
  id: WelcomeHomeNavCategoryId;
  label: string;
  destinations: readonly WelcomeHomeNavDestination[];
};

/** Five intent categories — depth two, or three when a My Day dropdown expands. */
export const WELCOME_HOME_NAV_CATEGORIES: readonly WelcomeHomeNavCategory[] = [
  {
    id: "my-day",
    label: "My Day",
    destinations: [
      {
        id: "adapt-plan-my-day",
        label: "Plan My Day / Adapt My Day",
        dropdownChildren: [
          { id: "plan-my-day", label: "Plan My Day" },
          { id: "adapt-my-day", label: "Adapt My Day" },
        ],
      },
      { id: "calendar", label: "Calendar" },
      {
        id: "reminders-rhythms",
        label: "Reminders / Rhythms",
        dropdownChildren: [
          { id: "reminders", label: "Reminders" },
          { id: "rhythms", label: "Rhythms" },
        ],
      },
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
      { id: "strategy-library", label: "Strategy Library" },
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

/** My Day dropdown group ids that expand in the submenu. */
export const WELCOME_HOME_MY_DAY_DROPDOWN_IDS = [
  "adapt-plan-my-day",
  "reminders-rhythms",
] as const;

export type WelcomeHomeMyDayDropdownId =
  (typeof WELCOME_HOME_MY_DAY_DROPDOWN_IDS)[number];

export function welcomeHomeNavMaxDepth(): number {
  // Category › dropdown group › child destination (My Day only).
  return 3;
}

export function welcomeHomeHasExperienceControls(
  categoryLabels: readonly string[],
): boolean {
  return categoryLabels.some((label) =>
    /experience controls/i.test(label),
  );
}

/** My Day focused submenu — three top-level rows (two are dropdown groups). */
export function welcomeHomeMyDayDestinationIds(): readonly WelcomeHomeNavDestinationId[] {
  const myDay = WELCOME_HOME_NAV_CATEGORIES.find((c) => c.id === "my-day");
  return myDay?.destinations.map((d) => d.id) ?? [];
}

export function welcomeHomeMyDayDropdown(
  id: WelcomeHomeMyDayDropdownId,
): WelcomeHomeNavDestination | undefined {
  const myDay = WELCOME_HOME_NAV_CATEGORIES.find((c) => c.id === "my-day");
  return myDay?.destinations.find((d) => d.id === id);
}

export function isWelcomeHomeMyDayDropdownId(
  id: string,
): id is WelcomeHomeMyDayDropdownId {
  return (WELCOME_HOME_MY_DAY_DROPDOWN_IDS as readonly string[]).includes(id);
}
