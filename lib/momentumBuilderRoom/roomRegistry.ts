/**
 * Momentum Builder — estate room registration (V1 shell).
 * @see docs/MOMENTUM_BUILDER_ROOM_ARCHITECTURE.md
 */

import type { AppSection } from "@/lib/companionUi";
import { STUDY_ROOM_BG } from "@/lib/companionHomestead/homesteadRoomRegistry";

/** Canonical app section for the public Momentum Builder room. */
export const MOMENTUM_BUILDER_SECTION = "momentum-builder" as const satisfies AppSection;

export type MomentumBuilderSection = typeof MOMENTUM_BUILDER_SECTION;

/** Workspace / companion object id for intelligence hooks. */
export const MOMENTUM_BUILDER_OBJECT_ID = "momentum-builder-room" as const;

/** Homestead room id — distinct from game-room (Quick Recharge). */
export const MOMENTUM_BUILDER_HOMESTEAD_ROOM_ID = "momentum-builder" as const;

/**
 * V1 background — placeholder until dedicated estate art ships.
 * Swap without changing section or orchestration contracts.
 */
export const MOMENTUM_BUILDER_ROOM_BG = STUDY_ROOM_BG;

export const MOMENTUM_BUILDER_ROOM_META = {
  section: MOMENTUM_BUILDER_SECTION,
  objectId: MOMENTUM_BUILDER_OBJECT_ID,
  homesteadRoomId: MOMENTUM_BUILDER_HOMESTEAD_ROOM_ID,
  title: "Momentum Builder",
  trademark: "Momentum Builder",
  purpose: "Coaching conversation — help the member move forward today.",
  entryPrompt: "What's making today difficult?",
  successMeasure:
    "The member leaves knowing exactly what to do next.",
  background: MOMENTUM_BUILDER_ROOM_BG,
  status: "live" as const,
} as const;

export function isMomentumBuilderSection(
  section: AppSection | null | undefined,
): section is MomentumBuilderSection {
  return section === MOMENTUM_BUILDER_SECTION;
}
