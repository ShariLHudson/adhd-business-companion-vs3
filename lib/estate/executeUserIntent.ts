/**
 * executeUserIntentPlan™ — maps resolved intent to a single execution action.
 * No cross-system triggers — one plan per input event.
 */

import { recommendedSoundscapeForLegacyCategory } from "@/lib/soundscapes";
import type { EstateCommandDecision } from "@/lib/estateIntelligence/estateCommandRouter";
import { patchEstateAudioSettings } from "./estateAudioSettings";
import { patchEstateRuntimeState } from "./estateRuntimeState";
import type { ResolvedUserIntent } from "./resolveUserIntent";
import { startEstateSoundscapeOverlay } from "./estateSoundscapeOverlay";

export type UserIntentExecutionPlan =
  | { action: "noop" }
  | { action: "conversation"; userText: string }
  | { action: "soundscape"; categoryId: string; soundscapeId: string | null }
  | { action: "navigate"; userText: string; command: EstateCommandDecision }
  | {
      action: "navigate-offer";
      userText: string;
      line: string;
      placeIds: string[];
    }
  | { action: "navigate-unknown"; userText: string; line: string };

export function planUserIntentExecution(
  intent: ResolvedUserIntent,
): UserIntentExecutionPlan {
  switch (intent.kind) {
    case "input-send":
      return { action: "noop" };
    case "conversation":
      return { action: "conversation", userText: intent.userText };
    case "soundscape": {
      const soundscape = recommendedSoundscapeForLegacyCategory(
        intent.categoryId,
      );
      return {
        action: "soundscape",
        categoryId: intent.categoryId,
        soundscapeId: soundscape?.id ?? null,
      };
    }
    case "navigate": {
      const turn = intent.placeTurn;
      if (turn.type === "navigate") {
        return {
          action: "navigate",
          userText: intent.userText,
          command: turn.command,
        };
      }
      if (turn.type === "offer") {
        return {
          action: "navigate-offer",
          userText: intent.userText,
          line: turn.line,
          placeIds: [...turn.placeIds],
        };
      }
      return {
        action: "navigate-unknown",
        userText: intent.userText,
        line: turn.line,
      };
    }
    default: {
      const _exhaustive: never = intent;
      return _exhaustive;
    }
  }
}

/** Layer 2 overlay only — never changes place or Layer 1 ambient. */
export async function executeSoundscapeIntent(plan: {
  categoryId: string;
  soundscapeId: string | null;
}): Promise<void> {
  patchEstateAudioSettings({ soundscapeOverlayEnabled: true });
  patchEstateRuntimeState({
    activeSoundscape: plan.soundscapeId ?? plan.categoryId,
  });
  if (!plan.soundscapeId) return;
  await startEstateSoundscapeOverlay(plan.soundscapeId);
}
