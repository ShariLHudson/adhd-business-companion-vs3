import type { SoundscapeMoodId } from "@/lib/soundscapes/types";

export type EstateSignId = SoundscapeMoodId | "my-places";

export type EstateHangingSign = {
  id: EstateSignId;
  label: string;
};

/** Left lamppost — Slow Down and Focus (pathway photograph). */
export const ESTATE_LEFT_SIGNS: readonly EstateHangingSign[] = [
  { id: "calming", label: "Slow Down" },
  { id: "focus", label: "Focus" },
] as const;

/** Right lamppost — Recharge, Unwind, and My Places (pathway photograph). */
export const ESTATE_RIGHT_SIGNS: readonly EstateHangingSign[] = [
  { id: "energize", label: "Recharge" },
  { id: "unwind", label: "Unwind" },
  { id: "my-places", label: "My Places" },
] as const;

/** Per-flag perspective anchors — see peaceful-places-refined.css */
export const GARDEN_FLAG_CLASS: Record<EstateSignId, string> = {
  focus: "flag--focus",
  calming: "flag--slow-down",
  energize: "flag--recharge",
  unwind: "flag--unwind",
  "my-places": "flag--my-places",
} as const;

export type PathwayGardenStake = EstateHangingSign & {
  side: "left" | "right";
  flagClass: string;
};

/** Stakes along the path curb in depth order — positions defined in CSS per flag class. */
export const PATHWAY_GARDEN_STAKES: readonly PathwayGardenStake[] = [
  { id: "focus", label: "Focus", side: "left", flagClass: GARDEN_FLAG_CLASS.focus },
  { id: "calming", label: "Slow Down", side: "left", flagClass: GARDEN_FLAG_CLASS.calming },
  { id: "energize", label: "Recharge", side: "right", flagClass: GARDEN_FLAG_CLASS.energize },
  { id: "unwind", label: "Unwind", side: "right", flagClass: GARDEN_FLAG_CLASS.unwind },
  {
    id: "my-places",
    label: "My Places",
    side: "right",
    flagClass: GARDEN_FLAG_CLASS["my-places"],
  },
] as const;
