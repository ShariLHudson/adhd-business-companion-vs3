/**
 * Momentum Builder — Estate journey connection points.
 *
 * @see docs/MOMENTUM_BUILDER_V1_ORCHESTRATION.md
 * @see docs/ESTATE_ROOMS_FRAMEWORK.md
 */

import type { AppSection } from "@/lib/companionUi";
import { MOMENTUM_BUILDER_SECTION, MOMENTUM_BUILDER_ROOM_META } from "./roomRegistry";

/** Canonical estate journey position — execution after thinking. */
export const MOMENTUM_BUILDER_ESTATE_JOURNEY = [
  "home",
  "grow-observatory",
  "growth-library",
  "conservatory",
  MOMENTUM_BUILDER_SECTION,
  "content-generator",
  "coffee-house",
] as const satisfies readonly (AppSection | string)[];

export type EstateJourneyRoomId = (typeof MOMENTUM_BUILDER_ESTATE_JOURNEY)[number];

export const MOMENTUM_BUILDER_ESTATE_ROLE = {
  roomId: MOMENTUM_BUILDER_ROOM_META.homesteadRoomId,
  section: MOMENTUM_BUILDER_SECTION,
  /** Owns forward motion — decide and begin. */
  role: "execution" as const,
  emotionalArrival: "I can do this.",
  emotionalDeparture: "I know exactly what to do next.",
  precedes: ["conservatory", "growth-library", "grow-observatory"] as const,
  follows: ["content-generator", "creative-studio"] as const,
} as const;

/** Rooms that may hand off into Momentum Builder with context (V2). */
export type MomentumBuilderHandoffSource =
  | "observatory"
  | "library"
  | "conservatory"
  | "welcome-home";

export type MomentumBuilderHandoff = {
  source: MomentumBuilderHandoffSource;
  /** Never shown to member — orchestration context only. */
  opportunitySummary?: string;
  suggestedFocus?: string;
};

/** Quiet celebration signals — room motion hooks (V2 CSS). */
export type MomentumBuilderCelebrationKind =
  | "first_step_named"
  | "easy_win_complete"
  | "focus_session_complete"
  | "path_ready";

export function celebrationMotionClass(
  kind: MomentumBuilderCelebrationKind,
): string {
  switch (kind) {
    case "first_step_named":
      return "momentum-builder-room--notebook-close";
    case "easy_win_complete":
      return "momentum-builder-room--board-update";
    case "focus_session_complete":
      return "momentum-builder-room--sunlight-warm";
    case "path_ready":
      return "momentum-builder-room--path-reveal";
    default:
      return "";
  }
}
