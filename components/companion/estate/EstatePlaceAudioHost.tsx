"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  getEstateAudioSettings,
  isEstateAmbienceLayerEnabled,
  subscribeEstateAudioSettings,
} from "@/lib/estate/estateAudioSettings";
import { stopAllEstateEnvironmentalAudio } from "@/lib/estate/estateEnvironmentalAudio";
import {
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
 * Layer 2 overlay persists across place moves when enabled.
 */
export function EstatePlaceAudioHost({ placeId }: Props) {
  const lastAppliedRef = useRef<AppliedAudioState>({
    placeId: null,
    ambienceEnabled: true,
    silenced: false,
    introBlocked: false,
  });

  const applyPlace = useCallback((id: string | null) => {
    const settings = getEstateAudioSettings();
    const ambienceEnabled = isEstateAmbienceLayerEnabled();
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
