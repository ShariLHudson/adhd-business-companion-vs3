/**
 * Welcome Home destination switching — close the current experience before
 * opening the requested one. Experiences share `/companion`; pathname alone
 * cannot decide whether navigation is needed.
 */

export type WelcomeHomeDestinationKind =
  | "section"
  | "explore-estate"
  | "overlay"
  | "welcome-home"
  | "breathe";

export type WelcomeHomeDestinationSwitchPlan = {
  destinationId: string;
  kind: WelcomeHomeDestinationKind;
  /** Close Explore Estate full-screen map / room viewer. */
  closeExploreEstate: boolean;
  /** Clear profile / settings overlays. */
  clearOverlays: boolean;
  /** Clear Breathe destination layer. */
  clearBreathe: boolean;
  /** Drop pending "return to Explore Estate" session flag. */
  clearExploreReturnPending: boolean;
  /** Clear guided field-help chat modal. */
  clearGuidedFieldHelpChat: boolean;
};

/**
 * Plan what to tear down before a Welcome Home destination becomes active.
 * Pure — CompanionPageClient applies the plan via React state setters.
 */
export function planWelcomeHomeDestinationSwitch(input: {
  destinationId: string;
  kind: WelcomeHomeDestinationKind;
}): WelcomeHomeDestinationSwitchPlan {
  const { destinationId, kind } = input;
  const openingExplore = kind === "explore-estate";
  const openingOverlay = kind === "overlay";
  const openingBreathe = kind === "breathe";
  const openingWelcomeHome = kind === "welcome-home";

  return {
    destinationId,
    kind,
    closeExploreEstate: !openingExplore,
    clearOverlays: !openingOverlay || openingWelcomeHome,
    clearBreathe: !openingBreathe,
    clearExploreReturnPending: !openingExplore,
    clearGuidedFieldHelpChat: true,
  };
}

/** Destinations used by the navigation matrix tests. */
export const WELCOME_HOME_NAV_MATRIX = [
  { from: "explore-estate", to: "plan-my-day", toKind: "section" as const },
  { from: "explore-estate", to: "project-homes", toKind: "section" as const },
  { from: "explore-estate", to: "settings", toKind: "overlay" as const },
  {
    from: "explore-estate",
    to: "chamber-of-momentum",
    toKind: "section" as const,
  },
  {
    from: "explore-estate",
    to: "welcome-home",
    toKind: "welcome-home" as const,
  },
  { from: "plan-my-day", to: "explore-estate", toKind: "explore-estate" as const },
  { from: "project-homes", to: "plan-my-day", toKind: "section" as const },
  { from: "settings", to: "project-homes", toKind: "section" as const },
  {
    from: "chamber-of-momentum",
    to: "settings",
    toKind: "overlay" as const,
  },
] as const;

export const WELCOME_HOME_NAV_SEQUENCE = [
  { id: "welcome-home", kind: "welcome-home" as const },
  { id: "explore-estate", kind: "explore-estate" as const },
  { id: "plan-my-day", kind: "section" as const },
  { id: "project-homes", kind: "section" as const },
  { id: "settings", kind: "overlay" as const },
  { id: "explore-estate", kind: "explore-estate" as const },
] as const;
