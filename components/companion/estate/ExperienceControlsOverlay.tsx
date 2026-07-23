"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  getEstateAudioSettings,
  patchEstateAudioSettings,
  subscribeEstateAudioSettings,
} from "@/lib/estate/estateAudioSettings";
import "@/app/companion/experience-controls-overlay.css";
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
  getConversationDisplayPreference,
  resetDestinationCompanionPreferences,
  setCompanionVisibility,
  subscribeConversationDisplayPreference,
  type CompanionVisibility,
} from "@/lib/conversationVisibility";
import {
  isEstateAmbienceEnabled,
  setEstateAmbienceEnabled,
} from "@/lib/estate/estateAmbiencePreference";
import { turnOffEstateSounds } from "@/lib/estate/estateSoundsTransport";
import {
  activeEstateAmbienceRoomId,
  kickstartEstateRoomAmbience,
} from "@/lib/estate/estateRoomAmbience";
import { resolveEstatePlaceAmbientProfile } from "@/lib/estate/estatePlaceAmbientSound";

export type ExperienceControlsOverlayProps = {
  open: boolean;
  onClose: () => void;
  roomId: string;
  onOpenNotifications?: () => void;
  /** Profile return control when opened from My Profile — reusable origin context. */
  profileReturnSlot?: ReactNode;
};

/**
 * Experience Controls — opens over the current place. Never navigates away.
 * Answers: How do I want the platform to look, sound, or behave?
 */
export function ExperienceControlsOverlay({
  open,
  onClose,
  roomId,
  onOpenNotifications,
  profileReturnSlot,
}: ExperienceControlsOverlayProps) {
  const [prefs, setPrefs] = useState<ExperienceControlPrefs>(() =>
    getExperienceControlPrefs(),
  );
  const [companionDefault, setCompanionDefault] = useState<CompanionVisibility>(
    () => getConversationDisplayPreference().globalDefault,
  );
  const [fullscreen, setFullscreen] = useState(false);
  const [estateSoundsOn, setEstateSoundsOn] = useState(true);
  const [volume, setVolume] = useState(0.85);
  const [masterSilenced, setMasterSilenced] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const syncPrefs = useCallback(() => {
    const next = getExperienceControlPrefs();
    setPrefs(next);
    applyExperienceControlPresentation(next);
    setCompanionDefault(getConversationDisplayPreference().globalDefault);
  }, []);

  const syncAudio = useCallback(() => {
    const audio = getEstateAudioSettings();
    setMasterSilenced(audio.silenced);
    setVolume(audio.masterVolume);
    const ambiencePref = getExperienceControlPrefs().estateSoundsEnabled;
    if (roomId === "welcome-home") {
      setEstateSoundsOn(
        ambiencePref &&
          isEstateAmbienceEnabled() &&
          activeEstateAmbienceRoomId() === "welcome-home" &&
          !audio.silenced,
      );
    } else {
      setEstateSoundsOn(
        ambiencePref && isEstateAmbienceEnabled() && !audio.silenced,
      );
    }
  }, [roomId]);

  useEffect(() => {
    if (!open) return;
    syncPrefs();
    syncAudio();
    setFullscreen(isEstateBrowserFullscreen());
    const unsubPrefs = subscribeExperienceControlPrefs(syncPrefs);
    const unsubAudio = subscribeEstateAudioSettings(syncAudio);
    const unsubCompanion = subscribeConversationDisplayPreference(syncPrefs);
    const onFs = () => setFullscreen(isEstateBrowserFullscreen());
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      unsubPrefs();
      unsubAudio();
      unsubCompanion();
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
    if (!open) return;
    // Immediate keyboard entry — Close is the reversible exit (Spec 132).
    closeButtonRef.current?.focus();
  }, [open]);

  useEffect(() => {
    applyExperienceControlPresentation(getExperienceControlPrefs());
  }, []);

  if (!open) return null;

  const setPlaceAmbience = (enabled: boolean) => {
    patchExperienceControlPrefs({ estateSoundsEnabled: enabled });
    if (!enabled) {
      setEstateAmbienceEnabled(false);
      patchEstateAudioSettings({ ambienceEnabled: false });
      setEstateSoundsOn(false);
      return;
    }
    if (getEstateAudioSettings().silenced) {
      // Estate Sounds Off wins — do not start ambience until Turn On.
      setEstateSoundsOn(false);
      return;
    }
    const profile = resolveEstatePlaceAmbientProfile(roomId);
    setEstateAmbienceEnabled(true);
    patchEstateAudioSettings({ ambienceEnabled: true, autoplayAllowed: false });
    if (profile) {
      kickstartEstateRoomAmbience(roomId, profile);
    }
    setEstateSoundsOn(true);
  };

  const stopEverything = () => {
    void turnOffEstateSounds();
    setEstateAmbienceEnabled(false);
    setEstateSoundsOn(false);
    patchExperienceControlPrefs({
      estateSoundsEnabled: false,
      musicEnabled: false,
    });
    patchEstateAudioSettings({
      ambienceEnabled: false,
      soundscapeOverlayEnabled: false,
      autoplayAllowed: false,
      silenced: true,
    });
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

  // Rendered through GlobalOverlayHost (body portal) — never page flow.
  return (
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
            ref={closeButtonRef}
            type="button"
            className="experience-controls-overlay__close"
            data-testid="experience-controls-close"
            aria-label="Close Experience Controls"
            onClick={onClose}
          >
            Close
          </button>
        </header>
        {profileReturnSlot ? (
          <div
            className="experience-controls-overlay__profile-return px-4 pt-2"
            data-testid="experience-controls-profile-return"
          >
            {profileReturnSlot}
          </div>
        ) : null}

        <div className="experience-controls-overlay__scroll">
          <section className="experience-controls-overlay__section" aria-label="Sound">
            <h3 className="experience-controls-overlay__section-title">Sound</h3>
            <p className="experience-controls-overlay__status">
              {masterSilenced
                ? "Sounds are off. Use Estate Sounds in the header to turn them back on."
                : "Day-to-day Pause and Off live in Estate Sounds in the header. This section is for preferences."}
            </p>
            <label className="experience-controls-overlay__toggle">
              <span>Place ambience</span>
              <input
                type="checkbox"
                checked={estateSoundsOn}
                disabled={masterSilenced}
                data-testid="experience-controls-estate-sounds"
                onChange={(event) => setPlaceAmbience(event.target.checked)}
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
                disabled={masterSilenced}
                data-testid="experience-controls-volume"
                aria-label="Volume"
                onChange={(event) =>
                  setMasterVolume(Number(event.target.value) / 100)
                }
              />
            </label>
            <button
              type="button"
              className="experience-controls-overlay__choice"
              data-testid="experience-controls-turn-off-sounds"
              onClick={stopEverything}
            >
              Turn Off Estate Sounds
            </button>
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

          <section
            className="experience-controls-overlay__section"
            aria-label="Companion Conversation"
          >
            <h3 className="experience-controls-overlay__section-title">
              Companion Conversation
            </h3>
            <p className="experience-controls-overlay__subsection">
              Default Companion state
            </p>
            {(
              [
                ["on", "Companion: On"],
                ["off", "Companion: Off"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={
                  companionDefault === value
                    ? "experience-controls-overlay__choice experience-controls-overlay__choice--active"
                    : "experience-controls-overlay__choice"
                }
                data-testid={`experience-controls-companion-default-${value}`}
                aria-pressed={companionDefault === value}
                onClick={() => {
                  setCompanionVisibility({
                    visibility: value,
                    destinationId: null,
                    source: "settings",
                    updateGlobalDefault: true,
                  });
                  setCompanionDefault(value);
                }}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              className="experience-controls-overlay__choice"
              data-testid="experience-controls-companion-reset-destinations"
              onClick={() => {
                resetDestinationCompanionPreferences();
                syncPrefs();
              }}
            >
              Reset destination conversation preferences
            </button>
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
    </div>
  );
}
