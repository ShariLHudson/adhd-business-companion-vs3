/**
 * Support Experiences — canonical registry (Spark Estate Support Experience
 * Backgrounds and Distinction Cleanup).
 *
 * Six "help me right now" destinations stay available and distinct:
 * Take a Quiet Moment · Quick Recharge · First Step Finder ·
 * Break It Into Smaller Pieces · Prioritize My Options · Focus Library.
 *
 * This is the single source of truth for their name, purpose, background
 * plate, and the outcome-focused copy shown on cards/menus. Routing here is
 * expressed as the real companion navigation token (AppSection + optional
 * activityId) rather than a Next.js file route — these destinations open as
 * companion sections/activities, not standalone pages.
 *
 * @see docs/navigation/SPARK_ESTATE_SUPPORT_EXPERIENCE_BACKGROUNDS_AND_DISTINCTIONS_REPORT.md
 */

import type { AppSection } from "@/lib/companionUi";

export type SupportExperienceId =
  | "take-a-quiet-moment"
  | "quick-recharge"
  | "prioritize-my-options"
  | "break-it-into-smaller-pieces"
  | "first-step-finder"
  | "focus-library";

/** Companion navigation token — how the member actually arrives here today. */
export type SupportExperienceRoute = {
  section: AppSection;
  /** Set only when this destination is a specific guided activity inside its section. */
  activityId?: string;
};

export type SupportExperienceDefinition = {
  id: SupportExperienceId;
  name: string;
  route: SupportExperienceRoute;
  /** Public background plate — full-bleed, own scene, never conservatory/butterfly-video inheritance. */
  background: string;
  purpose: string;
  description: string;
  isActive: true;
};

/** Take a Quiet Moment — short, contained pause. Not Peaceful Places. Not meditation library. */
export const TAKE_A_QUIET_MOMENT_BG = "/backgrounds/swing-background.png" as const;

/** Quick Recharge — brief energizing reset. Not deep rest, not Peaceful Places. */
export const QUICK_RECHARGE_BG = "/backgrounds/game-room-background.png" as const;

/** Prioritize My Options — compare real options, choose what matters first. */
export const PRIORITIZE_MY_OPTIONS_BG =
  "/backgrounds/creative-studio-background.png" as const;

/** Break It Into Smaller Pieces — turn one big thing into doable steps. */
export const BREAK_IT_INTO_SMALLER_PIECES_BG =
  "/backgrounds/greenhouse-background.png" as const;

/** First Step Finder — find the smallest useful place to begin. */
export const FIRST_STEP_FINDER_BG =
  "/backgrounds/horizon-point-background.png" as const;

/** Focus Library — the focus resource collection. Never Clear My Mind. */
export const FOCUS_LIBRARY_BG = "/backgrounds/tea-room-background.webp" as const;

/** Activity ids used by First Step Finder, Break It Into Smaller Pieces, and Prioritize My Options. */
export const FIRST_STEP_FINDER_ACTIVITY_ID = "first-step-finder" as const;
export const BREAK_IT_INTO_SMALLER_PIECES_ACTIVITY_ID = "break-into-pieces" as const;
export const PRIORITIZE_MY_OPTIONS_ACTIVITY_ID = "priority-sort" as const;

export const SUPPORT_EXPERIENCES: readonly SupportExperienceDefinition[] = [
  {
    id: "take-a-quiet-moment",
    name: "Take a Quiet Moment",
    route: { section: "guided-exercises" },
    background: TAKE_A_QUIET_MOMENT_BG,
    purpose: "calm",
    description: "Pause, reduce stimulation, and give your mind a little space.",
    isActive: true,
  },
  {
    id: "quick-recharge",
    name: "Quick Recharge",
    route: { section: "quick-recharge" },
    background: QUICK_RECHARGE_BG,
    purpose: "energy",
    description: "Refresh your attention with a short, energizing reset.",
    isActive: true,
  },
  {
    id: "prioritize-my-options",
    name: "Prioritize My Options",
    route: { section: "guided-exercises", activityId: PRIORITIZE_MY_OPTIONS_ACTIVITY_ID },
    background: PRIORITIZE_MY_OPTIONS_BG,
    purpose: "prioritization",
    description: "Sort what matters most and choose what deserves attention first.",
    isActive: true,
  },
  {
    id: "break-it-into-smaller-pieces",
    name: "Break It Into Smaller Pieces",
    route: { section: "focus", activityId: BREAK_IT_INTO_SMALLER_PIECES_ACTIVITY_ID },
    background: BREAK_IT_INTO_SMALLER_PIECES_BG,
    purpose: "task-breakdown",
    description: "Turn something too big into smaller, doable steps.",
    isActive: true,
  },
  {
    id: "first-step-finder",
    name: "First Step Finder",
    route: { section: "focus", activityId: FIRST_STEP_FINDER_ACTIVITY_ID },
    background: FIRST_STEP_FINDER_BG,
    purpose: "starting",
    description: "Find the smallest useful place to begin.",
    isActive: true,
  },
  {
    id: "focus-library",
    name: "Focus Library",
    route: { section: "focus" },
    background: FOCUS_LIBRARY_BG,
    purpose: "focus-support",
    description: "Choose music, sounds, guided focus, timers, or saved favorites.",
    isActive: true,
  },
] as const;

const BY_ID = new Map(SUPPORT_EXPERIENCES.map((e) => [e.id, e]));

export function supportExperienceById(
  id: SupportExperienceId,
): SupportExperienceDefinition | undefined {
  return BY_ID.get(id);
}

export function supportExperienceBackground(id: SupportExperienceId): string {
  return supportExperienceById(id)?.background ?? "";
}

/**
 * Resolves the dedicated background for a Focus My Brain guided workflow —
 * replaces the shared butterfly-conservatory video for exactly the three
 * kept "help now" destinations that carry an activityId, and for the
 * Take a Quiet Moment browse landing (guided-exercises with no activity
 * chosen yet). Returns null for every other Focus My Brain activity so the
 * conservatory video keeps its identity everywhere else — narrow, additive.
 */
export function focusWorkflowBackgroundOverride(
  section: AppSection,
  activityId?: string | null,
): string | null {
  if (activityId === FIRST_STEP_FINDER_ACTIVITY_ID) return FIRST_STEP_FINDER_BG;
  if (activityId === BREAK_IT_INTO_SMALLER_PIECES_ACTIVITY_ID) {
    return BREAK_IT_INTO_SMALLER_PIECES_BG;
  }
  if (activityId === PRIORITIZE_MY_OPTIONS_ACTIVITY_ID) return PRIORITIZE_MY_OPTIONS_BG;
  if (section === "guided-exercises" && !activityId) return TAKE_A_QUIET_MOMENT_BG;
  return null;
}
