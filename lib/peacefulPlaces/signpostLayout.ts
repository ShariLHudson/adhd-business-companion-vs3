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
