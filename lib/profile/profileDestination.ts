/** Approved Profile destinations — My Spark Estate siblings. */
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

/** Overlay ids used for dedicated profile destination host mounts. */
export const PROFILE_DESTINATION_OVERLAY_IDS = [
  "profile",
  "people-i-help",
  "profile-personal",
  "growth-profile",
] as const;

export type ProfileDestinationOverlayId =
  (typeof PROFILE_DESTINATION_OVERLAY_IDS)[number];

export function isProfileDestinationOverlay(
  overlay: string | null | undefined,
): overlay is ProfileDestinationOverlayId {
  return (
    overlay === "profile" ||
    overlay === "people-i-help" ||
    overlay === "profile-personal" ||
    overlay === "growth-profile"
  );
}

/** Default landing when destination omitted — never auto-select My Profile children. */
export function resolveProfileDestination(
  destination?: ProfileDestination | null,
): ProfileDestination {
  return destination ?? PROFILE_DESTINATION_DEFAULT;
}

export type ProfileDestinationNavigation =
  | { kind: "profile-overlay"; destinationId: "my-business-estate" }
  | { kind: "people-i-help-overlay"; destinationId: "people-i-help" }
  | { kind: "profile-personal-overlay"; destinationId: "profile-personal" };

export function resolveProfileDestinationNavigation(
  destination?: ProfileDestination | null,
): ProfileDestinationNavigation {
  const resolved = resolveProfileDestination(destination);
  if (resolved === "people-i-help") {
    return {
      kind: "people-i-help-overlay",
      destinationId: "people-i-help",
    };
  }
  if (resolved === "profile-personal") {
    return {
      kind: "profile-personal-overlay",
      destinationId: "profile-personal",
    };
  }
  return {
    kind: "profile-overlay",
    destinationId: "my-business-estate",
  };
}

/** Breadcrumb parent for My Spark Estate destinations. */
export function profileDestinationBreadcrumbParent(): string {
  return PROFILE_MENU_LABELS.mySparkEstate;
}

export function profileDestinationTitle(
  destination: ProfileDestination | ProfileDestinationOverlayId,
): string {
  switch (destination) {
    case "profile-personal":
      return PROFILE_MENU_LABELS.myProfile;
    case "people-i-help":
      return PROFILE_MENU_LABELS.peopleIHelp;
    case "profile":
    case "my-business-estate":
      return PROFILE_MENU_LABELS.myBusinessEstate;
    case "growth-profile":
      return "Growth Profile";
    default:
      return PROFILE_MENU_LABELS.myBusinessEstate;
  }
}
