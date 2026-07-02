/**
 * Greenhouse™ idea lifecycle — intelligence-ready growth stages.
 *
 * Memorable journey: Seed → Sprout → Growing → Flourishing → Harvested
 * → Portfolio™ or Evidence Vault™
 *
 * @see docs/ESTATE_ROOM_TEMPLATE.md#greenhouse-idea-lifecycle
 */

/** Visual + emotional stage inside the Greenhouse and Seeds Planted™ */
export type IdeaLifecycleStage =
  | "seed"
  | "sprout"
  | "growing"
  | "flourishing"
  | "harvested";

/** Where a harvested idea may live next in the Estate */
export type IdeaHarvestDestination = "portfolio" | "evidence-vault";

export const IDEA_LIFECYCLE_STAGES: readonly {
  id: IdeaLifecycleStage;
  emoji: string;
  label: string;
  memberFacing: string;
}[] = [
  { id: "seed", emoji: "🌱", label: "Seed", memberFacing: "A tiny seed of an idea" },
  { id: "sprout", emoji: "🌿", label: "Sprout", memberFacing: "Starting to take shape" },
  { id: "growing", emoji: "🌼", label: "Growing", memberFacing: "Notes, tags, sketches" },
  {
    id: "flourishing",
    emoji: "🌳",
    label: "Flourishing",
    memberFacing: "Ideas becoming products",
  },
  {
    id: "harvested",
    emoji: "🍎",
    label: "Harvested",
    memberFacing: "Ready to leave the greenhouse",
  },
] as const;

export const IDEA_HARVEST_DESTINATIONS: readonly {
  id: IdeaHarvestDestination;
  emoji: string;
  label: string;
  roomId: string;
}[] = [
  { id: "portfolio", emoji: "📁", label: "Portfolio", roomId: "portfolio" },
  {
    id: "evidence-vault",
    emoji: "🏆",
    label: "Evidence Vault",
    roomId: "evidence-vault",
  },
] as const;

/** Greenhouse visual density over the member journey — V2+ room evolution */
export type GreenhouseJourneyPhase = "new" | "six-months" | "three-years";

export const GREENHOUSE_JOURNEY_PHASES: Record<
  GreenhouseJourneyPhase,
  { label: string; sceneCharacter: string }
> = {
  new: {
    label: "Mostly empty — a few seedlings",
    sceneCharacter: "quiet benches, empty pots, Kinsey asleep, soft light",
  },
  "six-months": {
    label: "Little plants, notes, tags, sketches",
    sceneCharacter: "seedlings on shelves, labels appearing, gentle fullness",
  },
  "three-years": {
    label: "Overflowing — ideas becoming products",
    sceneCharacter: "plants everywhere, harvest baskets, lived-in warmth",
  },
};

export function nextIdeaLifecycleStage(
  current: IdeaLifecycleStage,
): IdeaLifecycleStage | null {
  const order = IDEA_LIFECYCLE_STAGES.map((s) => s.id);
  const idx = order.indexOf(current);
  if (idx < 0 || idx >= order.length - 1) return null;
  return order[idx + 1] ?? null;
}
