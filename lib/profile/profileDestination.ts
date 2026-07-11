/** Approved Profile destinations only — not Welcome Home or Settings. */
export type ProfileDestination = "my-business-estate" | "people-i-help";

export const PROFILE_DESTINATION_DEFAULT: ProfileDestination =
  "my-business-estate";

export const PROFILE_MENU_LABELS = {
  myBusinessEstate: "My Business Estate",
  peopleIHelp: "People I Help",
} as const;

/** Default Profile landing — never Growth Profile. */
export function resolveProfileDestination(
  destination?: ProfileDestination | null,
): ProfileDestination {
  return destination ?? PROFILE_DESTINATION_DEFAULT;
}

export type ProfileDestinationNavigation =
  | { kind: "profile-overlay" }
  | { kind: "people-i-help-overlay" };

export function resolveProfileDestinationNavigation(
  destination?: ProfileDestination | null,
): ProfileDestinationNavigation {
  const resolved = resolveProfileDestination(destination);
  if (resolved === "people-i-help") {
    return { kind: "people-i-help-overlay" };
  }
  return { kind: "profile-overlay" };
}
