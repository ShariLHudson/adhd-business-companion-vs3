"use client";

/**
 * RETIRED — plain-text Welcome Home daily choices are no longer used.
 * Today's Welcome Card (`TodaysWelcomeCard` / `GlobalDailyCompanionOpening`)
 * is the only daily-opening UI on Spark Estate.
 *
 * Kept as a null stub so stale imports fail closed instead of rendering
 * "Help Me Restart / Clear My Mind / Check My Day" as chat text.
 */

type Props = {
  choices?: unknown;
  discoveryInvitation?: unknown;
  onSelect?: (choiceId: string) => void;
  onDiscoveryInvite?: () => void;
};

export function WelcomeHomeDailyChoices(_props: Props) {
  return null;
}
