/**
 * 101 — Celebration routing with return-to-source navigation.
 */

import type { CelebrationDestination, CelebrationRecord } from "./contracts";
import { recordCelebration } from "./adapters";
import { getRecognitionPreferences } from "./preferences";
export type CelebrationRouteOffer = {
  recognitionType: "win" | "accomplishment";
  recognitionId: string;
  primaryDestination: CelebrationDestination;
  placeId: string | null;
  prompt: string;
  choices: readonly {
    id: string;
    label: string;
    destination: CelebrationDestination | "save_only" | "not_now";
  }[];
  returnPath: CelebrationRecord["returnPath"];
};

export function buildCelebrationRouteOffer(input: {
  recognitionType: "win" | "accomplishment";
  recognitionId: string;
  title: string;
  returnPath?: CelebrationRecord["returnPath"];
}): CelebrationRouteOffer {
  void getRecognitionPreferences();
  if (input.recognitionType === "win") {
    return {
      recognitionType: "win",
      recognitionId: input.recognitionId,
      primaryDestination: "garden",
      placeId: "gardens",
      prompt: `Would you like to visit the Celebration Garden for a quick moment with “${input.title}”?`,
      choices: [
        { id: "go_garden", label: "Go to Celebration Garden", destination: "garden" },
        { id: "here", label: "Celebrate here", destination: "in-place" },
        { id: "save", label: "Save only", destination: "save_only" },
        { id: "not_now", label: "Not now", destination: "not_now" },
      ],
      returnPath: input.returnPath,
    };
  }

  return {
    recognitionType: "accomplishment",
    recognitionId: input.recognitionId,
    primaryDestination: "hall",
    placeId: "portfolio",
    prompt: `“${input.title}” belongs in your Hall of Accomplishments. Would you like to go there now?`,
    choices: [
      { id: "go_hall", label: "Go to Celebration Hall", destination: "hall" },
      { id: "add_stay", label: "Add it and stay here", destination: "save_only" },
      { id: "here", label: "Celebrate here", destination: "in-place" },
      { id: "not_now", label: "Not now", destination: "not_now" },
    ],
    returnPath: input.returnPath,
  };
}

export function resolveCelebrationChoice(input: {
  recognitionType: "win" | "accomplishment";
  recognitionId: string;
  choiceId: string;
  offer: CelebrationRouteOffer;
  soundId?: string | null;
}): {
  celebration: CelebrationRecord | null;
  navigatePlaceId: string | null;
  celebrateInPlace: boolean;
} {
  const choice = input.offer.choices.find((c) => c.id === input.choiceId);
  if (!choice || choice.destination === "not_now") {
    return { celebration: null, navigatePlaceId: null, celebrateInPlace: false };
  }
  if (choice.destination === "save_only") {
    return { celebration: null, navigatePlaceId: null, celebrateInPlace: false };
  }

  const celebration = recordCelebration({
    celebrationId: `cel-${Date.now().toString(36)}`,
    recognitionType: input.recognitionType,
    recognitionId: input.recognitionId,
    destination: choice.destination,
    soundId: input.soundId ?? null,
    celebratedAt: new Date().toISOString(),
    returnPath: input.offer.returnPath,
  });

  const navigatePlaceId =
    choice.destination === "garden"
      ? input.offer.placeId
      : choice.destination === "hall"
        ? input.offer.placeId
        : null;

  return {
    celebration,
    navigatePlaceId,
    celebrateInPlace: choice.destination === "in-place",
  };
}

export function inPlaceCelebrationMessage(title: string): string {
  return `You did it. “${title}” moved your business forward.`;
}
