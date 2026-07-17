"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getEstateAudioSettings,
  patchEstateAudioSettings,
  type EstateAudioSettings,
} from "@/lib/estate/estateAudioSettings";
import { executeSoundscapeIntent } from "@/lib/estate/executeUserIntent";
import {
  refreshEstateSoundscapeOverlayVolume,
  stopEstateSoundscapeOverlay,
} from "@/lib/estate/estateSoundscapeOverlay";
import { patchEstateRuntimeState } from "@/lib/estate/estateRuntimeState";
import { recommendedSoundscapeForLegacyCategory } from "@/lib/soundscapes";
import {
  stopEstateRoomAmbience,
  transitionEstatePlaceAmbient,
} from "@/lib/estate/estateRoomAmbience";
import { stopAllAudio } from "@/lib/estate/stopAllAudio";

type Props = {
  placeId?: string | null;
  className?: string;
};

const DEFAULT_CALM_CATEGORY = "calming";

/**
 * Estate Audio Settings — ambience, soundscape overlay, master volume, silence.
 * Soundscape toggles affect Layer 2 only — never change place.
 */
export function EstateAudioSettings({ placeId, className }: Props) {
  const [settings, setSettings] = useState<EstateAudioSettings>(() =>
    getEstateAudioSettings(),
  );

  useEffect(() => {
    setSettings(getEstateAudioSettings());
  }, []);

  const apply = useCallback(
    (patch: Partial<EstateAudioSettings>) => {
      const next = patchEstateAudioSettings(patch);
      setSettings(next);

      if (next.silenced) {
        void stopAllAudio();
        patchEstateRuntimeState({ activeSoundscape: null });
        return;
      }

      if (!next.ambienceEnabled) {
        void stopEstateRoomAmbience();
      } else if (placeId) {
        void transitionEstatePlaceAmbient(placeId, { userInitiated: true });
      }

      if (!next.soundscapeOverlayEnabled) {
        void stopEstateSoundscapeOverlay();
        patchEstateRuntimeState({ activeSoundscape: null });
      } else {
        void refreshEstateSoundscapeOverlayVolume();
      }
    },
    [placeId],
  );

  const enableCalmSoundscape = useCallback(() => {
    const rec = recommendedSoundscapeForLegacyCategory(DEFAULT_CALM_CATEGORY);
    void executeSoundscapeIntent({
      categoryId: DEFAULT_CALM_CATEGORY,
      soundscapeId: rec?.id ?? null,
    });
  }, []);

  return (
    <div
      className={["estate-audio-settings", className].filter(Boolean).join(" ")}
      aria-label="Estate audio"
    >
      <p className="estate-audio-settings__intro">
        Sound is opt-in. Nothing starts until you choose Play or turn a layer
        on. Adjust it here anytime.
      </p>

      <label className="estate-audio-settings__row">
        <input
          type="checkbox"
          checked={settings.welcomeGreetingAudioEnabled && !settings.silenced}
          disabled={settings.silenced}
          onChange={(e) =>
            apply({ welcomeGreetingAudioEnabled: e.target.checked })
          }
          data-testid="estate-audio-welcome-greeting"
        />
        <span>Welcome greeting audio</span>
        <span className="estate-audio-settings__hint">
          Optional spoken welcome on a brand-new member&apos;s first login —
          never autoplays unless you enable it
        </span>
      </label>

      <label className="estate-audio-settings__row">
        <input
          type="checkbox"
          checked={settings.ambienceEnabled && !settings.silenced}
          disabled={settings.silenced}
          onChange={(e) => apply({ ambienceEnabled: e.target.checked })}
        />
        <span>Estate Ambience</span>
        <span className="estate-audio-settings__hint">
          The natural sound of each place
        </span>
      </label>

      <label className="estate-audio-settings__row">
        <input
          type="checkbox"
          checked={settings.soundscapeOverlayEnabled && !settings.silenced}
          disabled={settings.silenced}
          onChange={(e) => {
            const enabled = e.target.checked;
            apply({ soundscapeOverlayEnabled: enabled });
            if (enabled) {
              enableCalmSoundscape();
            }
          }}
        />
        <span>Estate Soundscapes</span>
        <span className="estate-audio-settings__hint">
          An optional atmosphere layered on top
        </span>
      </label>

      <label className="estate-audio-settings__row estate-audio-settings__row--volume">
        <span>Volume</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(settings.masterVolume * 100)}
          disabled={settings.silenced}
          onChange={(e) =>
            apply({ masterVolume: Number(e.target.value) / 100 })
          }
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(settings.masterVolume * 100)}
        />
      </label>

      <button
        type="button"
        className="estate-audio-settings__silence"
        data-testid="estate-audio-stop-all-sound"
        onClick={() => {
          void stopAllAudio();
          apply({
            silenced: true,
            ambienceEnabled: false,
            soundscapeOverlayEnabled: false,
            autoplayAllowed: false,
          });
        }}
      >
        Stop All Sound
      </button>

      <button
        type="button"
        className="estate-audio-settings__silence"
        onClick={() =>
          apply({
            silenced: !settings.silenced,
          })
        }
      >
        {settings.silenced ? "Restore Estate sound" : "Silence Estate"}
      </button>
    </div>
  );
}
