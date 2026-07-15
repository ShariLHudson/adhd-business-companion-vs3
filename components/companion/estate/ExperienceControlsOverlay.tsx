"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  getEstateAudioSettings,
  patchEstateAudioSettings,
  subscribeEstateAudioSettings,
} from "@/lib/estate/estateAudioSettings";
import {
  isEstateBrowserFullscreen,
  toggleEstateBrowserFullscreen,
} from "@/lib/estate/estateBrowserFullscreen";
import {
  applyExperienceControlPresentation,
  getExperienceControlPrefs,
  patchExperienceControlPrefs,
  subscribeExperienceControlPrefs,
  type EstateBackgroundMode,
  type EstateTextSize,
  type ExperienceControlPrefs,
} from "@/lib/estate/experienceControlPrefs";
import {
  isEstateAmbienceEnabled,
  setEstateAmbienceEnabled,
} from "@/lib/estate/estateAmbiencePreference";
import { stopAllEstateEnvironmentalAudio } from "@/lib/estate/estateEnvironmentalAudio";
import {
  activeEstateAmbienceRoomId,
  kickstartEstateRoomAmbience,
} from "@/lib/estate/estateRoomAmbience";
import { resolveEstatePlaceAmbientProfile } from "@/lib/estate/estatePlaceAmbientSound";

export type ExperienceControlsOverlayProps = {
  open: boolean;
  onClose: () => void;
  roomId: string;
  chatVisible: boolean;
  onSetChatVisible: (visible: boolean) => void;
  onOpenNotifications?: () => void;
};

/**
 * Experience Controls — opens over the current place. Never navigates away.
 * Answers: How do I want the platform to look, sound, or behave?
 */
export function ExperienceControlsOverlay({
  open,
  onClose,
  roomId,
  chatVisible,
  onSetChatVisible,
  onOpenNotifications,
}: ExperienceControlsOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const [prefs, setPrefs] = useState<ExperienceControlPrefs>(() =>
    getExperienceControlPrefs(),
  );
  const [fullscreen, setFullscreen] = useState(false);
  const [estateSoundsOn, setEstateSoundsOn] = useState(true);
  const [musicOn, setMusicOn] = useState(false);
  const [volume, setVolume] = useState(0.85);

  useEffect(() => setMounted(true), []);

  const syncPrefs = useCallback(() => {
    const next = getExperienceControlPrefs();
    setPrefs(next);
    applyExperienceControlPresentation(next);
  }, []);

  const syncAudio = useCallback(() => {
    const audio = getEstateAudioSettings();
    setMusicOn(audio.soundscapeOverlayEnabled && !audio.silenced);
    setVolume(audio.masterVolume);
    const ambiencePref = getExperienceControlPrefs().estateSoundsEnabled;
    if (roomId === "welcome-home") {
      setEstateSoundsOn(
        ambiencePref &&
          isEstateAmbienceEnabled() &&
          activeEstateAmbienceRoomId() === "welcome-home",
      );
    } else {
      setEstateSoundsOn(ambiencePref && isEstateAmbienceEnabled() && !audio.silenced);
    }
  }, [roomId]);

  useEffect(() => {
    if (!open) return;
    syncPrefs();
    syncAudio();
    setFullscreen(isEstateBrowserFullscreen());
    const unsubPrefs = subscribeExperienceControlPrefs(syncPrefs);
    const unsubAudio = subscribeEstateAudioSettings(syncAudio);
    const onFs = () => setFullscreen(isEstateBrowserFullscreen());
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      unsubPrefs();
      unsubAudio();
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, [open, syncPrefs, syncAudio]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    applyExperienceControlPresentation(getExperienceControlPrefs());
  }, []);

  if (!mounted || !open) return null;

  const setConversationVisible = (visible: boolean) => {
    patchExperienceControlPrefs({
      conversationVisibility: visible ? "showing" : "hidden",
    });
    onSetChatVisible(visible);
  };

  const setEstateSounds = (enabled: boolean) => {
    patchExperienceControlPrefs({ estateSoundsEnabled: enabled });
    if (!enabled) {
      setEstateAmbienceEnabled(false);
      void stopAllEstateEnvironmentalAudio();
      setEstateSoundsOn(false);
      return;
    }
    const profile = resolveEstatePlaceAmbientProfile(roomId);
    setEstateAmbienceEnabled(true);
    if (profile) {
      kickstartEstateRoomAmbience(roomId, profile);
    }
    setEstateSoundsOn(true);
  };

  const setMusic = (enabled: boolean) => {
    patchExperienceControlPrefs({ musicEnabled: enabled });
    patchEstateAudioSettings({ soundscapeOverlayEnabled: enabled });
    setMusicOn(enabled);
  };

  const setShariVoice = (enabled: boolean) => {
    patchExperienceControlPrefs({ shariVoiceEnabled: enabled });
  };

  const setMasterVolume = (next: number) => {
    const clamped = Math.min(1, Math.max(0, next));
    patchExperienceControlPrefs({ volume: clamped });
    patchEstateAudioSettings({ masterVolume: clamped });
    setVolume(clamped);
  };

  const setBackgroundMode = (mode: EstateBackgroundMode) => {
    patchExperienceControlPrefs({ backgroundMode: mode });
  };

  const setTextSize = (size: EstateTextSize) => {
    patchExperienceControlPrefs({ textSize: size });
  };

  const setReduceMotion = (enabled: boolean) => {
    patchExperienceControlPrefs({ reduceMotion: enabled });
  };

  const toggleFullscreen = async () => {
    await toggleEstateBrowserFullscreen();
    setFullscreen(isEstateBrowserFullscreen());
  };

  return createPortal(
    <div
      className="experience-controls-overlay"
      data-testid="experience-controls-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Experience Controls"
    >
      <button
        type="button"
        className="experience-controls-overlay__backdrop"
        aria-label="Close Experience Controls"
        data-testid="experience-controls-backdrop"
        onClick={onClose}
      />
      <aside className="experience-controls-overlay__panel">
        <header className="experience-controls-overlay__header">
          <h2 className="experience-controls-overlay__title">Experience Controls</h2>
          <button
            type="button"
            className="experience-controls-overlay__close"
            data-testid="experience-controls-close"
            aria-label="Close Experience Controls"
            onClick={onClose}
          >
            Close
          </button>
        </header>

        <div className="experience-controls-overlay__scroll">
          <section className="experience-controls-overlay__section" aria-label="Conversation">
            <h3 className="experience-controls-overlay__section-title">Conversation</h3>
            <p className="experience-controls-overlay__status">
              Conversation: {chatVisible ? "Showing" : "Hidden"}
            </p>
            <div className="experience-controls-overlay__row">
              <button
                type="button"
                className={
                  chatVisible
                    ? "experience-controls-overlay__choice experience-controls-overlay__choice--active"
                    : "experience-controls-overlay__choice"
                }
                data-testid="experience-controls-show-conversation"
                aria-pressed={chatVisible}
                onClick={() => setConversationVisible(true)}
              >
                Show Conversation
              </button>
              <button
                type="button"
                className={
                  !chatVisible
                    ? "experience-controls-overlay__choice experience-controls-overlay__choice--active"
                    : "experience-controls-overlay__choice"
                }
                data-testid="experience-controls-hide-conversation"
                aria-pressed={!chatVisible}
                onClick={() => setConversationVisible(false)}
              >
                Hide Conversation
              </button>
            </div>
          </section>

          <section className="experience-controls-overlay__section" aria-label="Sound">
            <h3 className="experience-controls-overlay__section-title">Sound</h3>
            <label className="experience-controls-overlay__toggle">
              <span>Estate Sounds</span>
              <input
                type="checkbox"
                checked={estateSoundsOn}
                data-testid="experience-controls-estate-sounds"
                onChange={(event) => setEstateSounds(event.target.checked)}
              />
            </label>
            <label className="experience-controls-overlay__toggle">
              <span>Music</span>
              <input
                type="checkbox"
                checked={musicOn}
                data-testid="experience-controls-music"
                onChange={(event) => setMusic(event.target.checked)}
              />
            </label>
            <label className="experience-controls-overlay__toggle">
              <span>Shari Voice</span>
              <input
                type="checkbox"
                checked={prefs.shariVoiceEnabled}
                data-testid="experience-controls-shari-voice"
                onChange={(event) => setShariVoice(event.target.checked)}
              />
            </label>
            <label className="experience-controls-overlay__volume">
              <span>Volume</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(volume * 100)}
                data-testid="experience-controls-volume"
                aria-label="Volume"
                onChange={(event) =>
                  setMasterVolume(Number(event.target.value) / 100)
                }
              />
            </label>
          </section>

          <section
            className="experience-controls-overlay__section"
            aria-label="Estate Background"
          >
            <h3 className="experience-controls-overlay__section-title">
              Estate Background
            </h3>
            {(
              [
                ["show", "Show Background"],
                ["soften", "Soften Background"],
                ["focus", "Focus Background"],
              ] as const
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                className={
                  prefs.backgroundMode === mode
                    ? "experience-controls-overlay__choice experience-controls-overlay__choice--active"
                    : "experience-controls-overlay__choice"
                }
                data-testid={`experience-controls-background-${mode}`}
                aria-pressed={prefs.backgroundMode === mode}
                onClick={() => setBackgroundMode(mode)}
              >
                {label}
              </button>
            ))}
          </section>

          <section className="experience-controls-overlay__section" aria-label="Display">
            <h3 className="experience-controls-overlay__section-title">Display</h3>
            <button
              type="button"
              className="experience-controls-overlay__choice"
              data-testid="experience-controls-fullscreen"
              aria-pressed={fullscreen}
              onClick={() => {
                void toggleFullscreen();
              }}
            >
              {fullscreen ? "Exit Full Screen" : "Enter Full Screen"}
            </button>
            <p className="experience-controls-overlay__subsection">Text Size</p>
            {(
              [
                ["standard", "Standard"],
                ["large", "Large"],
                ["extra-large", "Extra Large"],
              ] as const
            ).map(([size, label]) => (
              <button
                key={size}
                type="button"
                className={
                  prefs.textSize === size
                    ? "experience-controls-overlay__choice experience-controls-overlay__choice--active"
                    : "experience-controls-overlay__choice"
                }
                data-testid={`experience-controls-text-${size}`}
                aria-pressed={prefs.textSize === size}
                onClick={() => setTextSize(size)}
              >
                {label}
              </button>
            ))}
            <label className="experience-controls-overlay__toggle">
              <span>Reduce Motion</span>
              <input
                type="checkbox"
                checked={prefs.reduceMotion}
                data-testid="experience-controls-reduce-motion"
                onChange={(event) => setReduceMotion(event.target.checked)}
              />
            </label>
          </section>

          {onOpenNotifications ? (
            <section
              className="experience-controls-overlay__section"
              aria-label="Notifications"
            >
              <button
                type="button"
                className="experience-controls-overlay__choice"
                data-testid="experience-controls-notifications"
                onClick={onOpenNotifications}
              >
                Notifications
              </button>
            </section>
          ) : null}
        </div>
      </aside>
    </div>,
    document.body,
  );
}
