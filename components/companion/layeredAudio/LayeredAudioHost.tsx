"use client";

import { useEffect } from "react";
import { ensureLayeredAudioStopperRegistered } from "@/lib/layeredAudio/session";
import { registerEstateMediaStopper } from "@/lib/estate/stopAllAudio";

/**
 * Keeps the layered audio engine registered with Stop All Sound.
 * Playback instances live in the module singleton — this host does not
 * create Audio elements and remounts do not duplicate playback.
 */
export function LayeredAudioHost() {
  useEffect(() => {
    return ensureLayeredAudioStopperRegistered(registerEstateMediaStopper);
  }, []);

  return null;
}
