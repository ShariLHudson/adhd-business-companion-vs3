/**
 * Member-facing Estate place names — navigation phrase coverage.
 * Each name must resolve via alias registry + canonical registry.
 */

export type MemberEstatePlaceName = {
  /** Name members use in conversation */
  memberName: string;
  /** Canonical place id */
  placeId: string;
};

/** Core member-facing places (expand as Estate grows). */
export const MEMBER_ESTATE_PLACE_NAMES: readonly MemberEstatePlaceName[] = [
  { memberName: "Estate Library", placeId: "library" },
  { memberName: "Personal Library", placeId: "library" },
  { memberName: "Coffee House", placeId: "coffee-house" },
  { memberName: "Kitchen", placeId: "estate-kitchen" },
  { memberName: "Music Room", placeId: "music-room" },
  { memberName: "Greenhouse", placeId: "greenhouse" },
  { memberName: "Journal Gazebo", placeId: "journal" },
  { memberName: "Board Room", placeId: "round-table" },
  { memberName: "Study Hall", placeId: "study-hall" },
  { memberName: "Strategy Studio", placeId: "strategy-studio" },
  { memberName: "Celebration Garden", placeId: "gardens" },
  { memberName: "Celebration Hall", placeId: "celebration-room" },
  { memberName: "Reflection Pond", placeId: "reflection-pond" },
  { memberName: "Lakeside Hammock", placeId: "lakeside-hammock" },
  { memberName: "Pool", placeId: "summer-terrace" },
  { memberName: "Stables", placeId: "stables" },
] as const;
