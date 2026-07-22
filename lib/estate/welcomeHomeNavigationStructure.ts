/**
 * Welcome Home menu — global estate navigation only.
 * Answers: Where do I want to go?
 * Experience Controls live under SH, not here.
 *
 * Spec 129 / 139 / 140 — five intent categories (Today · Work to Create · Reflect · Guidance · Estate).
 * Reflect shows three primary destinations + Browse more (progressive disclosure).
 *
 * My Day restores two nested dropdown groups (098):
 * - Plan My Day / Adapt My Day → Plan My Day · Adapt My Day
 * - Reminders / Rhythms → Reminders · Rhythms
 */

export type WelcomeHomeNavCategoryId =
  | "my-day"
  | "my-work"
  | "take-a-moment"
  | "get-advice"
  | "spark-estate";

export type WelcomeHomeNavDestinationId =
  | "adapt-plan-my-day"
  | "calendar"
  | "reminders-rhythms"
  | "create"
  | "projects"
  | "destination-gallery"
  | "cartographers-studio"
  | "clear-my-mind"
  | "parking-lot"
  | "talk-it-out"
  | "breathe"
  | "spin-the-wheel"
  | "peaceful-places"
  | "soundscapes"
  | "journal"
  | "evidence-vault"
  | "hall-of-accomplishments"
  | "reflect-more"
  | "chamber-of-momentum"
  | "boardroom"
  | "strategy-library"
  /** Opens Explore Estate (estate exploration). */
  | "wander-the-grounds"
  /** @deprecated Prefer wander-the-grounds from Spark Estate submenu. */
  | "explore-estate"
  | "spark-estate-guide";

/** Independently routable children inside dropdown groups. */
export type WelcomeHomeNavDropdownChildId =
  | "plan-my-day"
  | "adapt-my-day"
  | "reminders"
  | "rhythms"
  | "breathe"
  | "spin-the-wheel"
  | "peaceful-places"
  | "soundscapes"
  | "journal"
  | "evidence-vault"
  | "hall-of-accomplishments";

export type WelcomeHomeNavDropdownChild = {
  id: WelcomeHomeNavDropdownChildId;
  label: string;
};

export type WelcomeHomeNavDestination = {
  id: WelcomeHomeNavDestinationId;
  label: string;
  /** Optional one-line support text shown under the label (findability). */
  supportLine?: string;
  /** Gallery / selection experiences may show a trailing affordance. */
  selectionExperience?: boolean;
  /**
   * Nested dropdown children — open the shared parent window with that child selected,
   * or open a destination under Browse more (Reflect).
   */
  dropdownChildren?: readonly WelcomeHomeNavDropdownChild[];
};

export type WelcomeHomeNavCategory = {
  id: WelcomeHomeNavCategoryId;
  label: string;
  destinations: readonly WelcomeHomeNavDestination[];
};

/**
 * Spec 129 / 140 — Today / Work to Create / Reflect / Guidance / Estate.
 * Category ids stay stable for routing; member-facing labels use the simpler names.
 * Spec 139 — My Story destinations live under Reflect → Browse more (one fewer top-level decision).
 */
export const WELCOME_HOME_NAV_CATEGORIES: readonly WelcomeHomeNavCategory[] = [
  {
    id: "my-day",
    label: "Today",
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
    label: "Work to Create",
    destinations: [
      {
        id: "create",
        label: "Create",
        supportLine: "Start something new, or continue work already underway.",
      },
      {
        id: "projects",
        label: "Projects",
        supportLine: "Pick up a project and the next small step.",
      },
      {
        id: "destination-gallery",
        label: "Destination Gallery",
        supportLine: "Choose a place that fits the work you want to do.",
        selectionExperience: true,
      },
      {
        id: "cartographers-studio",
        label: "Cartographer’s Studio",
        supportLine: "Map ideas so the path forward is easier to see.",
      },
    ],
  },
  {
    id: "take-a-moment",
    label: "Reflect",
    destinations: [
      {
        id: "talk-it-out",
        label: "Talk It Out",
        supportLine:
          "Think through one situation with Shari, one thoughtful question at a time.",
      },
      {
        id: "clear-my-mind",
        label: "Clear My Mind",
        supportLine: "Get thoughts out of your head without organizing them yet.",
      },
      {
        id: "parking-lot",
        label: "Parking Lot",
        supportLine: "Hold ideas safely until you’re ready for them.",
      },
      {
        id: "reflect-more",
        label: "Browse more",
        supportLine: "Quieter places and your story, when you want them.",
        dropdownChildren: [
          { id: "breathe", label: "Breathe" },
          { id: "spin-the-wheel", label: "Spin the Wheel" },
          { id: "peaceful-places", label: "Peaceful Moments" },
          { id: "soundscapes", label: "Soundscapes" },
          { id: "journal", label: "Journal Gazebo" },
          { id: "evidence-vault", label: "Evidence Vault" },
          { id: "hall-of-accomplishments", label: "Hall of Accomplishments" },
        ],
      },
    ],
  },
  {
    id: "get-advice",
    label: "Guidance",
    destinations: [
      {
        id: "chamber-of-momentum",
        label: "Chamber of Momentum",
        supportLine: "Think with advisors who know your kind of work.",
      },
      {
        id: "boardroom",
        label: "Boardroom",
        supportLine: "Get a clear view when a decision needs more than one mind.",
      },
      {
        id: "strategy-library",
        label: "Strategy Library",
        supportLine: "Return to strategies you’ve already trusted.",
      },
    ],
  },
  {
    id: "spark-estate",
    label: "Estate",
    destinations: [
      { id: "wander-the-grounds", label: "Wander the Grounds" },
      { id: "spark-estate-guide", label: "Spark Estate Guide" },
    ],
  },
] as const;

/**
 * @deprecated Use Welcome Home → Spark Estate category.
 * Kept as a label/id helper for transitional verification strings.
 */
export const WELCOME_HOME_WANDER_GROUNDS = {
  id: "wander-the-grounds" as const,
  label: "Wander the Grounds",
} as const;

/** Former My Story destinations — now under Reflect → Browse more. */
export const WELCOME_HOME_MY_STORY_DESTINATION_IDS = [
  "journal",
  "evidence-vault",
  "hall-of-accomplishments",
] as const;

export type WelcomeHomeFocusedPanelId = WelcomeHomeNavCategoryId;

/** Experience Controls must never appear in Welcome Home navigation. */
export const WELCOME_HOME_FORBIDDEN_LABELS = [
  "Experience Controls",
  "Chat Off",
  "Chat on",
  "Sound Off",
  "Full screen",
] as const;

/** Today-only dropdown groups (098 — exactly two). */
export const WELCOME_HOME_MY_DAY_DROPDOWN_IDS = [
  "adapt-plan-my-day",
  "reminders-rhythms",
] as const;

/** All expandable Welcome Home dropdown groups (Today + Reflect Browse more). */
export const WELCOME_HOME_NAV_DROPDOWN_IDS = [
  ...WELCOME_HOME_MY_DAY_DROPDOWN_IDS,
  "reflect-more",
] as const;

export type WelcomeHomeMyDayDropdownId =
  (typeof WELCOME_HOME_MY_DAY_DROPDOWN_IDS)[number];

export type WelcomeHomeNavDropdownId =
  (typeof WELCOME_HOME_NAV_DROPDOWN_IDS)[number];

export function welcomeHomeNavMaxDepth(): number {
  // Category › dropdown group › child destination.
  return 3;
}

export function welcomeHomeHasExperienceControls(
  categoryLabels: readonly string[],
): boolean {
  return categoryLabels.some((label) =>
    /experience controls/i.test(label),
  );
}

/**
 * Flatten category destinations, expanding Reflect “Browse more” children
 * so verification exports still see journal / peaceful places / etc.
 */
export function welcomeHomeFlattenCategoryDestinations(
  categoryId: WelcomeHomeNavCategoryId,
): WelcomeHomeNavDestination[] {
  const category = WELCOME_HOME_NAV_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return [];

  const out: WelcomeHomeNavDestination[] = [];
  for (const dest of category.destinations) {
    if (dest.id === "reflect-more" && dest.dropdownChildren?.length) {
      for (const child of dest.dropdownChildren) {
        out.push({
          id: child.id as WelcomeHomeNavDestinationId,
          label: child.label,
          selectionExperience:
            child.id === "peaceful-places" || child.id === "soundscapes"
              ? true
              : undefined,
          supportLine:
            child.id === "journal"
              ? "Write privately; return when you want."
              : child.id === "evidence-vault"
                ? "Keep proof of progress where you can find it."
                : child.id === "hall-of-accomplishments"
                  ? "Remember what you’ve already built."
                  : undefined,
        });
      }
      continue;
    }
    out.push(dest);
  }
  return out;
}

/** My Day focused submenu — three top-level rows (two are dropdown groups). */
export function welcomeHomeMyDayDestinationIds(): readonly WelcomeHomeNavDestinationId[] {
  const myDay = WELCOME_HOME_NAV_CATEGORIES.find((c) => c.id === "my-day");
  return myDay?.destinations.map((d) => d.id) ?? [];
}

export function welcomeHomeNavDropdown(
  id: WelcomeHomeNavDropdownId,
): WelcomeHomeNavDestination | undefined {
  for (const category of WELCOME_HOME_NAV_CATEGORIES) {
    const found = category.destinations.find((d) => d.id === id);
    if (found) return found;
  }
  return undefined;
}

/** @deprecated Prefer welcomeHomeNavDropdown — kept for Today-pair call sites. */
export function welcomeHomeMyDayDropdown(
  id: WelcomeHomeNavDropdownId,
): WelcomeHomeNavDestination | undefined {
  return welcomeHomeNavDropdown(id);
}

export function isWelcomeHomeMyDayDropdownId(
  id: string,
): id is WelcomeHomeMyDayDropdownId {
  return (WELCOME_HOME_MY_DAY_DROPDOWN_IDS as readonly string[]).includes(id);
}

export function isWelcomeHomeNavDropdownId(
  id: string,
): id is WelcomeHomeNavDropdownId {
  return (WELCOME_HOME_NAV_DROPDOWN_IDS as readonly string[]).includes(id);
}
