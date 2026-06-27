import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import type { CompanionNeedId, RestorationOutcome } from "./types";

export type CompanionNeedDefinition = {
  id: CompanionNeedId;
  name: string;
  tagline: string;
  likelyPlaceIds: readonly CompanionPlaceId[];
  restorationPromise: string;
  restorationOutcome: RestorationOutcome;
  preparationMoves: readonly string[];
  rewardFraming: string;
};

/** Companion Needs Library — v1 primary needs and their Restoration Promise. */
export const COMPANION_NEEDS_CATALOG: Record<
  CompanionNeedId,
  CompanionNeedDefinition
> = {
  relief: {
    id: "relief",
    name: "Relief",
    tagline: "Overwhelmed — needs to unload, permission, and breathing room",
    likelyPlaceIds: ["window-seat"],
    restorationPromise: "Something heavy can rest here for a moment.",
    restorationOutcome: "lighter",
    preparationMoves: [
      "A blanket within reach",
      "Rain-soft light at the window",
      "No fixing — only room to breathe",
    ],
    rewardFraming:
      "Arriving here is permission — not another task on the list.",
  },
  clarity: {
    id: "clarity",
    name: "Clarity",
    tagline: "Too many thoughts — needs one honest next step",
    likelyPlaceIds: ["planning-table"],
    restorationPromise: "Today becomes one manageable piece at a time.",
    restorationOutcome: "clearer",
    preparationMoves: [
      "Planner open to a blank page — not a full schedule",
      "One pen, one cup, uncluttered surface",
      "Gentle structure without pressure",
    ],
    rewardFraming:
      "The table is already cleared — you do not have to organize the whole day first.",
  },
  focus: {
    id: "focus",
    name: "Focus",
    tagline: "Knows what to do — needs protected attention and body doubling",
    likelyPlaceIds: ["focus-studio"],
    restorationPromise: "Your attention is protected long enough to begin.",
    restorationOutcome: "more-focused",
    preparationMoves: [
      "Timer ready — not ticking yet",
      "Distractions stepped back",
      "Shari nearby, not interrupting",
    ],
    rewardFraming:
      "Someone prepared a quiet corner so you do not have to fight for focus alone.",
  },
  creativity: {
    id: "creativity",
    name: "Creativity",
    tagline: "Ideas, writing, content, marketing, playful problem solving",
    likelyPlaceIds: ["creative-studio"],
    restorationPromise: "Your ideas have room to breathe and play.",
    restorationOutcome: "more-confident",
    preparationMoves: [
      "Sketchbook open — imperfect is welcome",
      "Golden-hour warmth, not a blank stare",
      "Permission to explore before judging",
    ],
    rewardFraming:
      "The studio is lit and waiting — creativity is treated as worth showing up for.",
  },
  strategy: {
    id: "strategy",
    name: "Strategy",
    tagline: "Business thinking — revenue, offers, clients, honest planning",
    likelyPlaceIds: ["business-office"],
    restorationPromise: "The next honest business step is visible.",
    restorationOutcome: "more-organized",
    preparationMoves: [
      "Vision board within sight — not a wall of metrics",
      "Afternoon clarity, not urgency",
      "One decision surface, not twelve tabs",
    ],
    rewardFraming:
      "The office is prepared for thinking — not for proving you are enough.",
  },
  reflection: {
    id: "reflection",
    name: "Reflection",
    tagline: "Perspective, gratitude, evidence, wins",
    likelyPlaceIds: ["back-deck", "reading-nook"],
    restorationPromise: "What is true and good has a place to be seen.",
    restorationOutcome: "more-hopeful",
    preparationMoves: [
      "Rocking chair or reading lamp already on",
      "Evidence of wins within gentle reach",
      "Evening pace — no rush to fix",
    ],
    rewardFraming:
      "Someone saved a quiet corner so your wins are not lost in the noise.",
  },
  learning: {
    id: "learning",
    name: "Learning",
    tagline: "Information, research, how-to, reference",
    likelyPlaceIds: ["library"],
    restorationPromise: "What you need to know is findable without hunting.",
    restorationOutcome: "more-understood",
    preparationMoves: [
      "Featured book or reference already pulled",
      "Library hush — not an empty search box",
      "Saved work within arm's reach",
    ],
    rewardFraming:
      "The shelf is prepared — you are not starting from zero.",
  },
  restoration: {
    id: "restoration",
    name: "Restoration",
    tagline: "Low energy, discouraged, recovery — needs hope and kindness",
    likelyPlaceIds: ["garden", "window-seat"],
    restorationPromise: "Hope can return slowly — that is allowed.",
    restorationOutcome: "more-hopeful",
    preparationMoves: [
      "Garden path or window light — no demands",
      "Warm drink if it fits the guest",
      "Beauty without performance",
    ],
    rewardFraming:
      "This room asks nothing of you — it only offers quiet company.",
  },
};

export function needDefinition(id: CompanionNeedId): CompanionNeedDefinition {
  return COMPANION_NEEDS_CATALOG[id];
}

export function primaryPlaceForNeed(id: CompanionNeedId): CompanionPlaceId {
  return COMPANION_NEEDS_CATALOG[id].likelyPlaceIds[0]!;
}
