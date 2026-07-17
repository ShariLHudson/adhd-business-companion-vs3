"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  getEstateAudioSettings,
  isEstateAmbienceLayerEnabled,
  isEstateAutoplayAllowed,
  subscribeEstateAudioSettings,
} from "@/lib/estate/estateAudioSettings";
import { stopAllEstateEnvironmentalAudio } from "@/lib/estate/estateEnvironmentalAudio";
import {
  activeEstateAmbienceRoomId,
  transitionEstatePlaceAmbient,
} from "@/lib/estate/estateRoomAmbience";
import {
  isWelcomeHomeIntroAudioBlocked,
  subscribeWelcomeHomeIntroAudioBlocked,
} from "@/lib/welcomeHome/introAudioGuard";

type Props = {
  /** Current canonical place id — from direct visit or estate presence. */
  placeId: string | null;
};

type AppliedAudioState = {
  placeId: string | null;
  ambienceEnabled: boolean;
  silenced: boolean;
  introBlocked: boolean;
};

/**
 * Single owner of Layer 1 place ambience — syncs from placeId only.
 * 133–135: navigation never autoplays. Sound on / kickstart is required.
 * Layer 2 overlay persists across place moves when the member enabled it.
 */
export function EstatePlaceAudioHost({ placeId }: Props) {
  const lastAppliedRef = useRef<AppliedAudioState>({
    placeId: null,
    ambienceEnabled: false,
    silenced: false,
    introBlocked: false,
  });

  const applyPlace = useCallback((id: string | null) => {
    const settings = getEstateAudioSettings();
    const ambienceEnabled = isEstateAmbienceLayerEnabled();
    const autoplayAllowed = isEstateAutoplayAllowed();
    const introBlocked =
      id === "welcome-home" && isWelcomeHomeIntroAudioBlocked();
    const last = lastAppliedRef.current;

    const unchanged =
      id === last.placeId &&
      ambienceEnabled === last.ambienceEnabled &&
      settings.silenced === last.silenced &&
      introBlocked === last.introBlocked;
    if (unchanged) return;

    lastAppliedRef.current = {
      placeId: id,
      ambienceEnabled,
      silenced: settings.silenced,
      introBlocked,
    };

    if (!ambienceEnabled || settings.silenced || !id || introBlocked) {
      void stopAllEstateEnvironmentalAudio();
      return;
    }

    /**
     * Opt-in by default (autoplayAllowed false): never start on navigate.
     * Keep playing only if this place is already the active ambience room
     * (member previously chose Sound on / kickstart).
     */
    if (!autoplayAllowed) {
      if (activeEstateAmbienceRoomId() !== id) {
        void stopAllEstateEnvironmentalAudio();
      }
      return;
    }

    void transitionEstatePlaceAmbient(id);
  }, []);

  useEffect(() => {
    applyPlace(placeId);
  }, [placeId, applyPlace]);

  useEffect(() => {
    return subscribeEstateAudioSettings(() => applyPlace(placeId));
  }, [placeId, applyPlace]);

  useEffect(() => {
    return subscribeWelcomeHomeIntroAudioBlocked(() => applyPlace(placeId));
  }, [placeId, applyPlace]);

  return null;
}
