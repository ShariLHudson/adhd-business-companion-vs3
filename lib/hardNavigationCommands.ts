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
  | { kind: "clear-my-mind" };

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

/** Exact navigation phrases — anchored to full message (optional trailing punctuation). */
const HARD_NAV_ROUTES: RouteDef[] = [
  {
    test:
      /^(?:(?:open|go to|take me to)\s+create(?:\s+mode)?|create\s+mode|open\s+create\s+mode)$/i,
    target: { kind: "workspace", section: "content-generator", nav: "other" },
    reply: "Opening Create.",
  },
  {
    test:
      /^(?:open|go to|take me to)\s+(?:the\s+)?(?:adhd\s+)?decision\s+compass$/i,
    target: { kind: "decision-compass" },
    reply: "Opening Decision Compass.",
  },
  {
    test: /^(?:open|go to|take me to)\s+plan\s+my\s+day$/i,
    target: { kind: "workspace", section: "plan-my-day" },
    reply: "Opening Plan My Day.",
  },
  {
    test: /^(?:open|go to|take me to)\s+adapt\s+my\s+day$/i,
    target: { kind: "adapt-my-day" },
    reply: "Opening Today's Reality.",
  },
  {
    test: /^(?:open|go to|take me to)\s+clear\s+my\s+mind$/i,
    target: { kind: "clear-my-mind" },
    reply: "Opening Clear My Mind.",
  },
  {
    test: /^(?:open|go to|take me to)\s+focus\s+audio$/i,
    target: { kind: "focus-audio" },
    reply: "Opening Focus Audio.",
  },
  {
    test: /^(?:open|go to|take me to)\s+strateg(?:y|ies)$/i,
    target: { kind: "workspace", section: "playbook", nav: "playbook" },
    reply: "Opening Strategies.",
  },
  {
    test: /^(?:open|go to|take me to)\s+saved(?:\s+work)?$/i,
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
  }
}
