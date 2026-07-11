/** Approved Profile destinations only — not Welcome Home or Settings. */
export type ProfileDestination = "my-business-estate" | "people-i-help";

export const PROFILE_DESTINATION_DEFAULT: ProfileDestination =
  "my-business-estate";

export type ProfileDestinationCard = {
  destination: ProfileDestination;
  label: string;
  blurb: string;
};

export const PROFILE_DESTINATION_CARDS: readonly ProfileDestinationCard[] = [
  {
    destination: "my-business-estate",
    label: "My Business Estate™",
    blurb:
      "Your business home — who you are, what you build, and where you are headed.",
  },
  {
    destination: "people-i-help",
    label: "People I Help™",
    blurb: "Audiences and client avatars that guide your offers and messaging.",
  },
] as const;

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
