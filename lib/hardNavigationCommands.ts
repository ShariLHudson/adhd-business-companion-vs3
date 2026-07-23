/**
 * P0.16 Hard Navigation Commands — open workspaces/tools immediately.
 * Runs before chat routing, relationship intelligence, and API calls.
 */

import type { AppSection, SidebarNavId } from "./companionUi";

export type HardNavigationTarget =
  | { kind: "workspace"; section: AppSection; nav?: SidebarNavId }
  | { kind: "decision-compass" }
  | { kind: "focus-audio" }
  | { kind: "adapt-my-day" }
  | { kind: "clear-my-mind" }
  | { kind: "talk-it-out" }
  | { kind: "spark-estate-guide" };

export type HardNavigationCommand = {
  target: HardNavigationTarget;
  localReply: string;
  callsApi: false;
  suppressRelationship: true;
  suppressObservation: true;
};

type RouteDef = {
  test: RegExp;
  target: HardNavigationTarget;
  reply: string;
};

/** Explicit destination verbs — keep aligned with explicitNavigationVerb.ts */
const NAV_VERB = "(?:open|go to|take me to|bring me to|show me|enter)";

/** Exact navigation phrases — anchored to full message (optional trailing punctuation). */
const HARD_NAV_ROUTES: RouteDef[] = [
  {
    test: new RegExp(
      `^(?:(?:${NAV_VERB})\\s+create(?:\\s+mode)?|create\\s+mode|open\\s+create\\s+mode)$`,
      "i",
    ),
    target: { kind: "workspace", section: "create", nav: "create" },
    reply: "Opening Create.",
  },
  {
    test: new RegExp(
      `^${NAV_VERB}\\s+(?:the\\s+)?(?:adhd\\s+)?decision\\s+compass$`,
      "i",
    ),
    target: { kind: "decision-compass" },
    reply: "Opening Decision Compass.",
  },
  {
    test: new RegExp(`^${NAV_VERB}\\s+plan\\s+my\\s+day$`, "i"),
    target: { kind: "workspace", section: "plan-my-day" },
    reply: "Opening Plan My Day.",
  },
  {
    test: new RegExp(`^${NAV_VERB}\\s+adapt\\s+my\\s+day$`, "i"),
    target: { kind: "adapt-my-day" },
    reply: "Opening Today's Reality.",
  },
  {
    test: new RegExp(`^${NAV_VERB}\\s+clear\\s+my\\s+mind$`, "i"),
    target: { kind: "clear-my-mind" },
    reply: "Opening Clear My Mind.",
  },
  {
    test: new RegExp(
      `^${NAV_VERB}\\s+(?:the\\s+)?(?:focus\\s+audio|peaceful\\s+(?:moments|places)|soundscapes?|calm(?:ing)?\\s+audio|music\\s+for\\s+focus)$`,
      "i",
    ),
    target: { kind: "focus-audio" },
    reply: "Opening Peaceful Moments.",
  },
  // Music Room is a canonical Estate place — do not alias to Peaceful Moments.
  // Continuity falls through so the Estate kernel / place router navigates.
  {
    test: new RegExp(`^${NAV_VERB}\\s+(?:the\\s+)?talk\\s+it\\s+out$`, "i"),
    target: { kind: "talk-it-out" },
    reply: "Opening Talk It Out.",
  },
  {
    test: new RegExp(
      `^${NAV_VERB}\\s+(?:the\\s+)?(?:spark\\s+)?estate\\s+guide$`,
      "i",
    ),
    target: { kind: "spark-estate-guide" },
    reply: "Opening the Spark Estate Guide.",
  },
  {
    test: new RegExp(`^${NAV_VERB}\\s+strateg(?:y|ies)$`, "i"),
    target: { kind: "workspace", section: "playbook", nav: "playbook" },
    reply: "Opening Strategies.",
  },
  {
    test: new RegExp(`^${NAV_VERB}\\s+saved(?:\\s+work)?$`, "i"),
    target: { kind: "workspace", section: "saved-work", nav: "saved-work" },
    reply: "Opening Saved.",
  },
];

export function normalizeHardNavigationText(text: string): string {
  return text.trim().replace(/[.!?]+$/, "").trim();
}

export function isHardNavigationCommand(text: string): boolean {
  return resolveHardNavigationCommand(text) !== null;
}

export function resolveHardNavigationCommand(
  text: string,
): HardNavigationCommand | null {
  const normalized = normalizeHardNavigationText(text);
  if (!normalized) return null;

  for (const route of HARD_NAV_ROUTES) {
    if (!route.test.test(normalized)) continue;
    return {
      target: route.target,
      localReply: route.reply,
      callsApi: false,
      suppressRelationship: true,
      suppressObservation: true,
    };
  }
  return null;
}

/** Workspace section after a hard nav command (for tests and verification). */
export function hardNavigationActiveWorkspace(text: string): AppSection | null {
  const cmd = resolveHardNavigationCommand(text);
  if (!cmd) return null;
  switch (cmd.target.kind) {
    case "workspace":
      return cmd.target.section;
    case "decision-compass":
      return "decision-compass";
    case "focus-audio":
      return "focus-audio";
    case "adapt-my-day":
      return "energy";
    case "clear-my-mind":
      return "brain-dump";
    case "talk-it-out":
      return "talk-it-out";
    case "spark-estate-guide":
      return null;
  }
}
