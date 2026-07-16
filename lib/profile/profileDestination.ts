/**
 * My Spark Estate destinations — each menu item maps to exactly one overlay.
 * People I Help is nested under My Business Estate in the menu hierarchy,
 * but keeps a dedicated overlay so direct links open it on first click.
 */

export type ProfileDestination =
  | "my-business-estate"
  | "people-i-help"
  | "profile-personal";

export const PROFILE_DESTINATION_DEFAULT: ProfileDestination =
  "my-business-estate";

export const PROFILE_MENU_LABELS = {
  mySparkEstate: "My Spark Estate",
  myBusinessEstate: "My Business Estate",
  peopleIHelp: "People I Help",
  myProfile: "My Profile",
} as const;

/**
 * Overlay ids for ProfileDestinationHost.
 * `profile` remains only as a legacy alias for My Business Estate (URL/history).
 */
export const PROFILE_DESTINATION_OVERLAY_IDS = [
  "my-business-estate",
  "people-i-help",
  "profile-personal",
  "growth-profile",
  /** @deprecated Use my-business-estate — kept for URL restore only */
  "profile",
] as const;

export type ProfileDestinationOverlayId =
  (typeof PROFILE_DESTINATION_OVERLAY_IDS)[number];

export function isProfileDestinationOverlay(
  overlay: string | null | undefined,
): overlay is ProfileDestinationOverlayId {
  return (
    overlay === "my-business-estate" ||
    overlay === "people-i-help" ||
    overlay === "profile-personal" ||
    overlay === "growth-profile" ||
    overlay === "profile"
  );
}

/** Normalize legacy "profile" overlay id to the business-estate destination. */
export function canonicalizeProfileDestinationOverlay(
  overlay: ProfileDestinationOverlayId,
): Exclude<ProfileDestinationOverlayId, "profile"> {
  if (overlay === "profile") return "my-business-estate";
  return overlay;
}

export function resolveProfileDestination(
  destination?: ProfileDestination | null,
): ProfileDestination {
  return destination ?? PROFILE_DESTINATION_DEFAULT;
}

export type ProfileDestinationNavigation =
  | { kind: "my-business-estate-overlay"; destinationId: "my-business-estate" }
  | { kind: "people-i-help-overlay"; destinationId: "people-i-help" }
  | { kind: "profile-personal-overlay"; destinationId: "profile-personal" };

/**
 * Explicit 1:1 mapping — never defaults My Profile to Business Estate.
 */
export function resolveProfileDestinationNavigation(
  destination: ProfileDestination,
): ProfileDestinationNavigation {
  switch (destination) {
    case "people-i-help":
      return {
        kind: "people-i-help-overlay",
        destinationId: "people-i-help",
      };
    case "profile-personal":
      return {
        kind: "profile-personal-overlay",
        destinationId: "profile-personal",
      };
    case "my-business-estate":
      return {
        kind: "my-business-estate-overlay",
        destinationId: "my-business-estate",
      };
    default: {
      const _exhaustive: never = destination;
      return _exhaustive;
    }
  }
}

export function profileDestinationBreadcrumbParent(): string {
  return PROFILE_MENU_LABELS.mySparkEstate;
}

/** Breadcrumb parent for rooms nested inside My Business Estate. */
export function businessEstateBreadcrumbParent(): string {
  return PROFILE_MENU_LABELS.myBusinessEstate;
}

/** e.g. My Business Estate › People I Help */
export function businessEstateAreaBreadcrumb(areaTitle: string): string {
  return `${businessEstateBreadcrumbParent()} › ${areaTitle}`;
}

export function profileDestinationBreadcrumb(
  destination: ProfileDestination | ProfileDestinationOverlayId,
): string {
  if (destination === "people-i-help") {
    return businessEstateAreaBreadcrumb(PROFILE_MENU_LABELS.peopleIHelp);
  }
  return `${profileDestinationBreadcrumbParent()} › ${profileDestinationTitle(destination)}`;
}

export function profileDestinationTitle(
  destination: ProfileDestination | ProfileDestinationOverlayId,
): string {
  switch (destination) {
    case "profile-personal":
      return PROFILE_MENU_LABELS.myProfile;
    case "people-i-help":
      return PROFILE_MENU_LABELS.peopleIHelp;
    case "my-business-estate":
    case "profile":
      return PROFILE_MENU_LABELS.myBusinessEstate;
    case "growth-profile":
      return "Growth Profile";
    default: {
      const _exhaustive: never = destination;
      return _exhaustive;
    }
  }
}

/** Menu action → destination (SH My Spark Estate children). */
export function profileDestinationForMenuAction(
  actionId: string,
): ProfileDestination | null {
  switch (actionId) {
    case "my-business-estate":
      return "my-business-estate";
    case "people-i-help":
      return "people-i-help";
    case "my-profile":
    case "estate-profile":
      return "profile-personal";
    default:
      return null;
  }
}
