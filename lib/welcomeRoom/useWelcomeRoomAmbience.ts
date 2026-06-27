"use client";

import { useWelcomeAudioExperience } from "@/lib/welcomeAudio";

type Options = {
  /** Room is visible on screen. */
  active: boolean;
  /** Invite or welcome UI is visible — ambience may start when enabled. */
  ambienceAllowed: boolean;
};

/**
 * @deprecated Prefer `useWelcomeAudioExperience` — thin Welcome Room wrapper.
 */
export function useWelcomeRoomAmbience({ active, ambienceAllowed }: Options) {
  const experience = useWelcomeAudioExperience({
    profileId: "welcome-room",
    active,
    immersive: ambienceAllowed,
    paused: !ambienceAllowed,
  });

  return {
    enabled: !experience.musicMuted,
    available: experience.ambienceAvailable,
    toggle: experience.toggleMusic,
  };
}
