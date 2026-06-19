import { getDayState } from "./companionStore";
import {
  gamesForNeed,
  type MomentumGameDef,
  type MomentumNeedId,
} from "./momentumGames";

export type MomentumGameRecommendation = {
  game: MomentumGameDef;
  reason: string;
};

function pickFromNeed(need: MomentumNeedId): MomentumGameDef | undefined {
  const pool = gamesForNeed(need).filter((g) => !g.externalTool);
  return pool[0];
}

/** Suggest one game when day-state gives enough signal; otherwise null. */
export function recommendMomentumGame(): MomentumGameRecommendation | null {
  const day = getDayState();
  if (!day) return null;

  const needs = day.needs.map((n) => n.toLowerCase());
  const energy = day.energyLevel ?? "doing-okay";
  const motivation = day.motivationLevel ?? "get-it-done";
  const lowEnergy =
    energy === "running-on-fumes" || energy === "need-recharge";
  const lowMotivation =
    motivation === "need-push" ||
    motivation === "dragging" ||
    motivation === "not-happening";

  if (
    day.overwhelm === "high" ||
    lowMotivation ||
    needs.some((n) => /overwhelm|break|rest|reset/.test(n))
  ) {
    const game = pickFromNeed("mental-vacation");
    if (game) {
      return {
        game,
        reason: "Your brain might need a gentle reset before pushing harder.",
      };
    }
  }

  if (
    motivation === "get-it-done" &&
    lowEnergy
  ) {
    const game = pickFromNeed("focus-attention");
    if (game) {
      return {
        game,
        reason:
          "You seem mentally tired but still want to get something done.",
      };
    }
  }

  if (
    needs.some((n) => /start|stuck|procrastinat|momentum|action/.test(n)) ||
    lowMotivation
  ) {
    const game =
      gamesForNeed("momentum-action").find(
        (g) => g.id === "first-step-finder",
      ) ?? pickFromNeed("momentum-action");
    if (game) {
      return {
        game,
        reason: "A tiny first step can loosen the stuck feeling.",
      };
    }
  }

  if (needs.some((n) => /idea|creative|inspir|brainstorm/.test(n))) {
    const game = pickFromNeed("creative-spark");
    if (game) {
      return {
        game,
        reason: "A quick creative spark might open a fresh angle.",
      };
    }
  }

  if (needs.some((n) => /fun|mood|dopamine|play/.test(n))) {
    const game = pickFromNeed("just-for-fun");
    if (game) {
      return {
        game,
        reason: "Sometimes the best move is a little playful relief.",
      };
    }
  }

  return null;
}
