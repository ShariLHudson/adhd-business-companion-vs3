/**
 * Welcome Home menu — global estate navigation only.
 * Answers: Where do I want to go?
 * Experience Controls live under SH, not here.
 *
 * Prompt 146 — finalized intention IA:
 * Today · Work to Create · Guidance · Focus & Reflection · Audio · Chamber · Board · Estate
 *
 * Work to Create = building. Guidance = advice/approaches (Strategies).
 * Audio = Peaceful Moments + Soundscapes only. Cartography lives under Work to Create.
 */

export type WelcomeHomeNavCategoryId =
  | "my-day"
  | "my-work"
  | "take-a-moment"
  | "audio"
  | "get-advice"
  | "chamber"
  | "board"
  | "spark-estate";

export type WelcomeHomeNavDestinationId =
  | "adapt-plan-my-day"
  | "calendar"
  | "reminders-rhythms"
  | "create"
  | "projects"
  | "templates"
  | "destination-gallery"
  | "continue-working"
  | "strategy-library"
  | "spin-the-wheel"
  | "cartographers-studio"
  | "clear-my-mind"
  | "parking-lot"
  | "talk-it-out"
  | "breathe"
  | "peaceful-places"
  | "soundscapes"
  | "nature-sounds"
  | "focus-audio"
  | "guided-audio"
  | "relaxation-audio"
  | "journal"
  | "evidence-vault"
  | "hall-of-accomplishments"
  | "reflect-more"
  | "chamber-of-momentum"
  | "boardroom"
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
  | "journal"
  | "evidence-vault"
  | "hall-of-accomplishments"
  | "peaceful-places"
  | "soundscapes"
  | "nature-sounds"
  | "focus-audio"
  | "guided-audio"
  | "relaxation-audio";

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
   * or open a destination under Browse more / Audio groups.
   */
  dropdownChildren?: readonly WelcomeHomeNavDropdownChild[];
};

export type WelcomeHomeNavCategory = {
  id: WelcomeHomeNavCategoryId;
  label: string;
  /**
   * Short intention subtitle — learning mode / first-time orientation.
   */
  subtitle: string;
  destinations: readonly WelcomeHomeNavDestination[];
};

/**
 * Prompt 146 — finalized intention categories.
 * Category ids stay stable for routing where possible (`my-day`, `my-work`, …).
 */
export const WELCOME_HOME_NAV_CATEGORIES: readonly WelcomeHomeNavCategory[] = [
  {
    id: "my-day",
    label: "Today",
    subtitle: "Your starting place for today.",
    destinations: [
      {
        id: "adapt-plan-my-day",
        label: "Plan My Day / Adapt My Day",
        supportLine: "Turn today’s priorities into a realistic plan.",
        dropdownChildren: [
          { id: "plan-my-day", label: "Plan My Day" },
          { id: "adapt-my-day", label: "Adapt My Day" },
        ],
      },
      {
        id: "calendar",
        label: "Schedule",
        supportLine: "See today’s schedule at a glance.",
      },
      {
        id: "reminders-rhythms",
        label: "Reminders / Rhythms",
        supportLine: "Keep gentle reminders and repeating rhythms nearby.",
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
    subtitle: "Build projects, plans, maps, and new ideas.",
    destinations: [
      {
        id: "create",
        label: "Create",
        supportLine: "Start something new.",
      },
      {
        id: "projects",
        label: "Projects",
        supportLine: "Pick up a project and the next small step.",
      },
      {
        id: "templates",
        label: "Templates",
        supportLine: "Begin from a trusted starting shape.",
      },
      {
        id: "destination-gallery",
        label: "Blueprints",
        supportLine: "Choose a place that fits the work you want to do.",
        selectionExperience: true,
      },
      {
        id: "cartographers-studio",
        label: "Cartography",
        supportLine: "Map ideas so the path forward is easier to see.",
      },
      {
        id: "continue-working",
        label: "Continue Working",
        supportLine: "Return to work already underway.",
      },
      {
        id: "spin-the-wheel",
        label: "Spin the Wheel",
        supportLine: "Optional inspiration when you want a gentle nudge.",
      },
    ],
  },
  {
    id: "get-advice",
    label: "Guidance",
    subtitle: "Approaches and advice that help you think before you build.",
    destinations: [
      {
        id: "strategy-library",
        label: "Strategies",
        supportLine: "Choose a direction with enough calm that the next step feels clear.",
      },
    ],
  },
  {
    id: "take-a-moment",
    label: "Focus & Reflection",
    subtitle: "Clear your mind, think things through, and capture what matters.",
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
        id: "breathe",
        label: "Breathe",
        supportLine: "A short pause to regulate before the next step.",
      },
      {
        id: "journal",
        label: "Journal",
        supportLine: "Write privately; return when you want.",
      },
      {
        id: "evidence-vault",
        label: "Evidence Vault",
        supportLine: "Keep proof of progress where you can find it.",
      },
      {
        id: "hall-of-accomplishments",
        label: "Hall of Accomplishments",
        supportLine: "Remember what you’ve already built.",
      },
    ],
  },
  {
    id: "audio",
    label: "Audio",
    subtitle: "Calming and focus sounds — nothing else.",
    destinations: [
      {
        id: "peaceful-places",
        label: "Peaceful Moments",
        supportLine: "Quiet places to settle and listen.",
        selectionExperience: true,
      },
      {
        id: "soundscapes",
        label: "Soundscapes",
        supportLine: "Background atmospheres while you work or rest.",
        selectionExperience: true,
      },
    ],
  },
  {
    id: "chamber",
    label: "Chamber",
    subtitle: "Specialists when you want a focused point of view.",
    destinations: [
      {
        id: "chamber-of-momentum",
        label: "Chamber of Momentum",
        supportLine: "Think with advisors who know your kind of work.",
      },
    ],
  },
  {
    id: "board",
    label: "Board",
    subtitle: "Calm counsel for important decisions.",
    destinations: [
      {
        id: "boardroom",
        label: "Boardroom",
        supportLine: "Get a clear view when a decision needs more than one mind.",
      },
    ],
  },
  {
    id: "spark-estate",
    label: "Estate",
    subtitle: "Wander the grounds and learn how Spark Estate fits together.",
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

/** Learning / capture destinations under Focus & Reflection. */
export const WELCOME_HOME_MY_STORY_DESTINATION_IDS = [
  "journal",
  "evidence-vault",
  "hall-of-accomplishments",
] as const;

/**
 * Alias destinations that open an existing experience.
 * Kept for deep links / older help copy even when not listed in Audio menu.
 */
export const WELCOME_HOME_DESTINATION_ALIASES: Partial<
  Record<WelcomeHomeNavDestinationId, WelcomeHomeNavDestinationId>
> = {
  "nature-sounds": "peaceful-places",
  "guided-audio": "soundscapes",
  "relaxation-audio": "soundscapes",
  "focus-audio": "peaceful-places",
  /** Legacy explore id */
  "explore-estate": "wander-the-grounds",
  /** Legacy browse-more parent — Journal is direct under Focus & Reflection */
  "reflect-more": "journal",
};

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

/** All expandable Welcome Home dropdown groups. */
export const WELCOME_HOME_NAV_DROPDOWN_IDS = [
  ...WELCOME_HOME_MY_DAY_DROPDOWN_IDS,
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

/** Resolve alias destinations to the canonical open target. */
export function resolveWelcomeHomeDestinationAlias(
  id: WelcomeHomeNavDestinationId,
): WelcomeHomeNavDestinationId {
  return WELCOME_HOME_DESTINATION_ALIASES[id] ?? id;
}

/**
 * Flatten category destinations (Focus & Reflection no longer uses Browse more).
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
        });
      }
      continue;
    }
    out.push(dest);
  }
  return out;
}

/** Today focused submenu — three top-level rows (two are dropdown groups). */
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

/** Category subtitles for learning mode / onboarding orientation. */
export function welcomeHomeCategorySubtitle(
  categoryId: WelcomeHomeNavCategoryId,
): string {
  return (
    WELCOME_HOME_NAV_CATEGORIES.find((c) => c.id === categoryId)?.subtitle ?? ""
  );
}
