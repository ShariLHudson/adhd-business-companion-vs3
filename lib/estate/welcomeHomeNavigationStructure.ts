/**
 * Welcome Home menu — global estate navigation only.
 * Answers: Where do I want to go?
 * Experience Controls live under SH, not here.
 *
 * IA order:
 * Today · Build · Guidance · Focus · Reflection · Audio · Spark Estates
 * (+ Welcome Home return control last in the menu chrome)
 *
 * Build = create / projects / maps / gallery.
 * Guidance = Chamber · Board · Strategy Chamber.
 * Focus = clarity tools + Focus Library (sessions, blocking, body double, timers).
 * Reflection = Journal · Evidence Vault · Hall of Accomplishments.
 * Audio = Peaceful Moments + Soundscapes only.
 */

export type WelcomeHomeNavCategoryId =
  | "my-day"
  | "build"
  | "take-a-moment"
  | "reflection"
  | "audio"
  | "get-advice"
  | "spark-estates"
  /** @deprecated Prefer `build`. */
  | "my-work"
  /** @deprecated Prefer `reflection`. */
  | "reflect"
  /** @deprecated Prefer `spark-estates`. */
  | "spark-estate"
  /** @deprecated Chamber lives under Guidance. */
  | "chamber"
  /** @deprecated Board lives under Guidance. */
  | "board";

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
  | "focus-library"
  | "start-focus-session"
  | "time-blocking"
  | "body-double"
  | "timers"
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
  /** @deprecated Prefer wander-the-grounds from Spark Estates submenu. */
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
  | "relaxation-audio"
  | "start-focus-session"
  | "time-blocking"
  | "body-double"
  | "timers";

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
   * or open a destination under Browse more / Audio / Focus Library groups.
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
 * Finalized intention categories (Build / Guidance / Reflection / Spark Estates).
 * Legacy ids remain in the type union for transitional call sites.
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
        label: "Calendar",
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
    id: "build",
    label: "Build",
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
        id: "cartographers-studio",
        label: "Visual Thinking Studio",
        supportLine:
          "See ideas, research, plans, and information in the clearest way for you.",
      },
    ],
  },
  {
    id: "get-advice",
    label: "Guidance",
    subtitle: "Advisors and approaches that help you think before you build.",
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
        label: "Strategy Chamber",
        supportLine: "Choose a direction with enough calm that the next step feels clear.",
      },
    ],
  },
  {
    id: "take-a-moment",
    label: "Focus",
    subtitle: "Clear your mind and think things through.",
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
        id: "focus-library",
        label: "Focus Library",
        supportLine: "Sessions, blocking, body double, and timers when you need them.",
        dropdownChildren: [
          { id: "start-focus-session", label: "Start focus session" },
          { id: "time-blocking", label: "Time blocking" },
          { id: "body-double", label: "Body double" },
          { id: "timers", label: "Timers" },
        ],
      },
    ],
  },
  {
    id: "reflection",
    label: "Reflection",
    subtitle: "Capture meaning, proof, and what you’ve already built.",
    destinations: [
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
    id: "spark-estates",
    label: "Spark Estates",
    subtitle: "Wander the grounds and learn how Spark Estate fits together.",
    destinations: [
      { id: "wander-the-grounds", label: "Wander the Estate" },
      { id: "spark-estate-guide", label: "Spark Estate Guide" },
    ],
  },
] as const;

/**
 * @deprecated Use Welcome Home → Spark Estates category.
 * Kept as a label/id helper for transitional verification strings.
 */
export const WELCOME_HOME_WANDER_GROUNDS = {
  id: "wander-the-grounds" as const,
  label: "Wander the Estate",
} as const;

/** Learning / capture destinations under Reflection. */
export const WELCOME_HOME_MY_STORY_DESTINATION_IDS = [
  "journal",
  "evidence-vault",
  "hall-of-accomplishments",
] as const;

/**
 * Alias destinations that open an existing experience.
 * Kept for deep links / older help copy even when not listed in the menu.
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
  /** Legacy browse-more parent — Journal is direct under Reflection */
  "reflect-more": "journal",
  /** Timers share the Focus Timer panel with Start focus session. */
  timers: "start-focus-session",
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
  "focus-library",
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
 * Flatten category destinations (Reflection no longer uses Browse more).
 */
export function welcomeHomeFlattenCategoryDestinations(
  categoryId: WelcomeHomeNavCategoryId,
): WelcomeHomeNavDestination[] {
  const resolvedId =
    categoryId === "my-work"
      ? "build"
      : categoryId === "reflect"
        ? "reflection"
        : categoryId === "spark-estate"
          ? "spark-estates"
          : categoryId;
  const category = WELCOME_HOME_NAV_CATEGORIES.find((c) => c.id === resolvedId);
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
  const resolvedId =
    categoryId === "my-work"
      ? "build"
      : categoryId === "reflect"
        ? "reflection"
        : categoryId === "spark-estate"
          ? "spark-estates"
          : categoryId;
  return (
    WELCOME_HOME_NAV_CATEGORIES.find((c) => c.id === resolvedId)?.subtitle ?? ""
  );
}

