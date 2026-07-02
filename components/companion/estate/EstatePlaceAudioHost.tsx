"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  getEstateAudioSettings,
  isEstateAmbienceLayerEnabled,
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

/**
 * Single owner of Layer 1 place ambience — syncs from placeId only.
 * Layer 2 overlay persists across place moves when enabled.
 */
export function EstatePlaceAudioHost({ placeId }: Props) {
  const lastPlaceRef = useRef<string | null>(null);

  const applyPlace = useCallback((id: string | null) => {
    if (!id || id === lastPlaceRef.current) return;
    lastPlaceRef.current = id;

    const settings = getEstateAudioSettings();
    if (settings.silenced) {
      void stopEstateRoomAmbience();
      void stopEstateSoundscapeOverlay();
      return;
    }

    if (!isEstateAmbienceLayerEnabled()) return;
    void transitionEstatePlaceAmbient(id, { userInitiated: true });
  }, []);

  useEffect(() => {
    applyPlace(placeId);
  }, [placeId, applyPlace]);

  return null;
}
