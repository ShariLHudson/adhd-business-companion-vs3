import type { MomentumNeedId } from "../momentumGames";

/** Cinematic category card art — Game Room invitations. */
export const MOMENTUM_CATEGORY_ART: Record<MomentumNeedId, string> = {
  "focus-attention": "/backgrounds/momentum-games/momentum-focus-attention.png",
  "momentum-action": "/backgrounds/momentum-games/momentum-action.png",
  "creative-spark": "/backgrounds/momentum-games/momentum-creative-spark.png",
  "mental-vacation": "/backgrounds/momentum-games/momentum-mental-vacation.png",
  "just-for-fun": "/backgrounds/momentum-games/momentum-just-for-fun.png",
};

export function categoryArtForNeed(need: MomentumNeedId): string {
  return MOMENTUM_CATEGORY_ART[need];
}
