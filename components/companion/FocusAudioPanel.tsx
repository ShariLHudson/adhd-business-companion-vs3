"use client";

import type { EmotionalState } from "@/lib/companionEmotions";
import type { AppSection } from "@/lib/companionUi";
import { PeacefulMomentsRoom } from "@/components/companion/peacefulPlaces/PeacefulMomentsRoom";

/**
 * Welcome Home → Take a Moment → Peaceful Moments (section: focus-audio).
 * Simple woodland + music dropdown experience — not garden destination cards.
 */
export function FocusAudioPanel({
  onDone,
  backLabel = "Previous Screen",
}: {
  onDone?: () => void;
  backLabel?: string;
  emotion?: EmotionalState;
  initialCategory?: string;
  arrivalActive?: boolean;
  onArrivalComplete?: () => void;
  onLaunchActivity?: (activityId: string) => void;
  onLaunchSection?: (section: AppSection) => void;
}) {
  return <PeacefulMomentsRoom onDone={onDone} backLabel={backLabel} />;
}
