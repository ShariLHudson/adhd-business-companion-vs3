"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  getEstateAudioSettings,
  isEstateAmbienceLayerEnabled,
  subscribeEstateAudioSettings,
} from "@/lib/estate/estateAudioSettings";
import {
  transitionEstatePlaceAmbient,
  stopEstateRoomAmbience,
} from "@/lib/estate/estateRoomAmbience";
import {
  stopEstateSoundscapeOverlay,
} from "@/lib/estate/estateSoundscapeOverlay";

type Props = {
  /** Current canonical place id — from direct visit or estate presence. */
  placeId: string | null;
};

type AppliedAudioState = {
  placeId: string | null;
  ambienceEnabled: boolean;
  silenced: boolean;
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
  });

  const applyPlace = useCallback((id: string | null) => {
    const settings = getEstateAudioSettings();
    const ambienceEnabled = isEstateAmbienceLayerEnabled();
    const last = lastAppliedRef.current;

    const unchanged =
      id === last.placeId &&
      ambienceEnabled === last.ambienceEnabled &&
      settings.silenced === last.silenced;
    if (unchanged) return;

    lastAppliedRef.current = {
      placeId: id,
      ambienceEnabled,
      silenced: settings.silenced,
    };

    if (!ambienceEnabled || settings.silenced || !id) {
      void stopEstateRoomAmbience();
      if (settings.silenced) void stopEstateSoundscapeOverlay();
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

  return null;
}
