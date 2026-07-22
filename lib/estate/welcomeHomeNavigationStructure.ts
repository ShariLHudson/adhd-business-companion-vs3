/**
 * Welcome Home menu — global estate navigation only.
 * Answers: Where do I want to go?
 * Experience Controls live under SH, not here.
 *
 * Prompt 144 — intention-based IA:
 * Today · Work to Create · Focus & Reflection · Audio · Cartography · Guidance · Estate
 *
 * Today keeps its planning destinations (Plan My Day lives here — daily starting category).
 * Audio is separated from reflection. Cartography is its own visual-thinking hub.
 */

export type WelcomeHomeNavCategoryId =
  | "my-day"
  | "my-work"
  | "take-a-moment"
  | "audio"
  | "cartography"
  | "get-advice"
  | "spark-estate";

export type WelcomeHomeNavDestinationId =
  | "adapt-plan-my-day"
  | "calendar"
  | "reminders-rhythms"
  | "create"
  | "projects"
  | "destination-gallery"
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
   * Short intention subtitle — learning mode / first-time orientation (Prompt 144).
   * Answers the category question without cluttering power use.
   */
  subtitle: string;
  destinations: readonly WelcomeHomeNavDestination[];
};

/**
 * Prompt 144 — intention categories.
 * Category ids stay stable for routing where possible (`my-day`, `my-work`, `take-a-moment`, …).
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
    id: "my-work",
    label: "Work to Create",
    subtitle: "Build projects, plans, and new ideas.",
    destinations: [
      {
        id: "create",
        label: "Create New Work",
        supportLine: "Start something new, or continue work already underway.",
      },
      {
        id: "projects",
        label: "Projects",
        supportLine: "Pick up a project and the next small step.",
      },
      {
        id: "strategy-library",
        label: "Strategies",
        supportLine: "Return to strategies you’ve already trusted.",
      },
      {
        id: "spin-the-wheel",
        label: "Spin the Wheel",
        supportLine: "Optional inspiration when you want a gentle nudge.",
      },
      {
        id: "destination-gallery",
        label: "Destination Gallery",
        supportLine: "Choose a place that fits the work you want to do.",
        selectionExperience: true,
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
        id: "reflect-more",
        label: "Browse more",
        supportLine: "Capture learning and remember progress when you want it.",
        dropdownChildren: [
          { id: "journal", label: "Journal" },
          { id: "evidence-vault", label: "Evidence Vault" },
          { id: "hall-of-accomplishments", label: "Hall of Accomplishments" },
        ],
      },
    ],
  },
  {
    id: "audio",
    label: "Audio",
    subtitle: "Music, soundscapes, and guided audio for focus and calm.",
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
      {
        id: "nature-sounds",
        label: "Nature Sounds",
        supportLine: "Opens Peaceful Moments for natural listening.",
        selectionExperience: true,
      },
      {
        id: "focus-audio",
        label: "Focus Audio",
        supportLine: "Audio that supports concentration.",
      },
      {
        id: "guided-audio",
        label: "Guided Audio",
        supportLine: "Opens Soundscapes for guided listening options.",
        selectionExperience: true,
      },
      {
        id: "relaxation-audio",
        label: "Relaxation Audio",
        supportLine: "Opens Soundscapes for calm listening.",
        selectionExperience: true,
      },
    ],
  },
  {
    id: "cartography",
    label: "Cartography",
    subtitle: "See your ideas, projects, and business from a new perspective.",
    destinations: [
      {
        id: "cartographers-studio",
        label: "Cartographer’s Studio",
        supportLine: "Map ideas so the path forward is easier to see.",
      },
    ],
  },
  {
    id: "get-advice",
    label: "Guidance",
    subtitle: "Expert specialists and trusted advisors when you need them.",
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

/** Learning / capture destinations under Focus & Reflection → Browse more. */
export const WELCOME_HOME_MY_STORY_DESTINATION_IDS = [
  "journal",
  "evidence-vault",
  "hall-of-accomplishments",
] as const;

/** Alias destinations that open an existing experience (Prompt 144 cross-nav). */
export const WELCOME_HOME_DESTINATION_ALIASES: Partial<
  Record<WelcomeHomeNavDestinationId, WelcomeHomeNavDestinationId>
> = {
  "nature-sounds": "peaceful-places",
  "guided-audio": "soundscapes",
  "relaxation-audio": "soundscapes",
  /** Legacy explore id */
  "explore-estate": "wander-the-grounds",
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

/** Resolve alias destinations to the canonical open target. */
export function resolveWelcomeHomeDestinationAlias(
  id: WelcomeHomeNavDestinationId,
): WelcomeHomeNavDestinationId {
  return WELCOME_HOME_DESTINATION_ALIASES[id] ?? id;
}

/**
 * Flatten category destinations, expanding Focus & Reflection “Browse more”
 * so verification exports still see journal / evidence / hall.
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
