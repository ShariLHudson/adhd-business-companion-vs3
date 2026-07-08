"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  isEstateAmbienceEnabled,
  setEstateAmbienceEnabled,
} from "@/lib/estate/estateAmbiencePreference";
import { subscribeEstateAudioSettings } from "@/lib/estate/estateAudioSettings";
import { stopAllEstateEnvironmentalAudio } from "@/lib/estate/estateEnvironmentalAudio";
import {
  isEstateBrowserFullscreen,
  toggleEstateBrowserFullscreen,
} from "@/lib/estate/estateBrowserFullscreen";
import {
  ESTATE_CHROME_IDLE_HINT_FULLSCREEN,
  ESTATE_ROOM_MENU_FULLSCREEN_IDLE_MS,
} from "@/lib/estate/justBeHere";
import { resolveEstatePlaceAmbientProfile } from "@/lib/estate/estatePlaceAmbientSound";
import { kickstartEstateRoomAmbience } from "@/lib/estate/estateRoomAmbience";
import { resolveWanderRoomDisplayName } from "@/lib/estate/manifest/estateWanderMode";
import { useIdleChromeReveal } from "@/lib/estate/useIdleChromeReveal";

export type EstateRoomExperienceMenuProps = {
  roomId: string;
  visible?: boolean;
  /** When true, shift left so the estate menu trigger stays at the corner. */
  withEstateMenu?: boolean;
  /** When true, render inline inside EstateTopRightChrome (no separate portal). */
  embedded?: boolean;
  chatVisible: boolean;
  onToggleChat: () => void;
  onToggleSound?: () => void;
  soundEnabled?: boolean;
  onReturnToRoom: () => void;
  onBackToEstate: () => void;
  /** Manifest wander — pick another Live estate place. */
  onWander?: () => void;
};

/**
 * Room button — one doorway for room identity, experience controls, and estate navigation.
 * @see spark-notes-files/ESTATE_ROOM_BUTTON_AND_WANDER_NAVIGATION_SPECIFICATION.md
 */
export function EstateRoomExperienceMenu({
  roomId,
  visible = true,
  withEstateMenu = false,
  embedded = false,
  chatVisible,
  onToggleChat,
  onToggleSound,
  soundEnabled: soundEnabledProp,
  onReturnToRoom,
  onBackToEstate,
  onWander,
}: EstateRoomExperienceMenuProps) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const profile = resolveEstatePlaceAmbientProfile(roomId);
  const soundAvailable = Boolean(profile);
  const placeDisplayName = resolveWanderRoomDisplayName(roomId);

  const { fullscreen: browserFullscreen, faded, bumpVisibility } =
    useIdleChromeReveal({
      fullscreenIdleMs: ESTATE_ROOM_MENU_FULLSCREEN_IDLE_MS,
      onlyWhenFullscreen: true,
    });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const syncSound = () => {
      if (soundEnabledProp !== undefined) {
        setSoundEnabled(soundEnabledProp);
        return;
      }
      setSoundEnabled(isEstateAmbienceEnabled());
    };
    syncSound();
    if (soundEnabledProp !== undefined) return;
    return subscribeEstateAudioSettings(syncSound);
  }, [soundEnabledProp]);

  useEffect(() => {
    const syncFullscreen = () => setFullscreen(isEstateBrowserFullscreen());
    syncFullscreen();
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  useEffect(() => {
    if (faded) setOpen(false);
  }, [faded]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && rootRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const closeAndRun = useCallback((action: () => void) => {
    setOpen(false);
    bumpVisibility();
    action();
  }, [bumpVisibility]);

  const toggleSound = useCallback(() => {
    if (onToggleSound) {
      onToggleSound();
      return;
    }
    if (soundEnabled) {
      setEstateAmbienceEnabled(false);
      setSoundEnabled(false);
      void stopAllEstateEnvironmentalAudio();
      return;
    }
    if (!profile) return;
    setEstateAmbienceEnabled(true);
    setSoundEnabled(true);
    kickstartEstateRoomAmbience(roomId, profile);
  }, [onToggleSound, soundEnabled, profile, roomId]);

  const toggleFullscreen = useCallback(async () => {
    await toggleEstateBrowserFullscreen();
    setFullscreen(isEstateBrowserFullscreen());
  }, []);

  if (!mounted || !visible) return null;

  const menu = (
    <div
      ref={rootRef}
      className={[
        "estate-room-experience-menu",
        !embedded && withEstateMenu
          ? "estate-room-experience-menu--with-estate-menu"
          : "",
        embedded ? "estate-room-experience-menu--embedded" : "",
        soundEnabled ? "estate-room-experience-menu--sound-on" : "",
        open ? "estate-room-experience-menu--open" : "",
        browserFullscreen ? "estate-room-experience-menu--fullscreen" : "",
        faded ? "estate-room-experience-menu--faded" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="estate-room-experience-menu"
      onMouseMove={browserFullscreen ? bumpVisibility : undefined}
      onTouchStart={browserFullscreen ? bumpVisibility : undefined}
    >
      {faded ? (
        <button
          type="button"
          className="estate-room-experience-menu__hint"
          aria-label="Show Room menu — move mouse or tap"
          onClick={() => {
            bumpVisibility();
          }}
        >
          {ESTATE_CHROME_IDLE_HINT_FULLSCREEN}
        </button>
      ) : (
        <>
          <button
            type="button"
            className="estate-room-experience-menu__trigger"
            aria-expanded={open}
            aria-haspopup="menu"
            aria-label={`${placeDisplayName} — room menu`}
            title={placeDisplayName}
            onClick={() => {
              bumpVisibility();
              setOpen((value) => !value);
            }}
          >
            <span className="estate-room-experience-menu__trigger-label">
              {placeDisplayName}
            </span>
            <span className="estate-room-experience-menu__trigger-chevron" aria-hidden>
              ▼
            </span>
          </button>

          {open ? (
            <div
              className="estate-room-experience-menu__panel"
              role="menu"
              aria-label="Room menu"
              data-testid="estate-room-quick-choices"
            >
              <p className="estate-room-experience-menu__section-label">
                Experience controls
              </p>
              <button
                type="button"
                role="menuitem"
                className={[
                  "estate-room-experience-menu__item",
                  chatVisible ? "estate-room-experience-menu__item--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={chatVisible}
                data-testid="estate-room-chat-toggle"
                onClick={() => closeAndRun(onToggleChat)}
              >
                <span className="estate-room-experience-menu__item-icon" aria-hidden>
                  💬
                </span>
                <span className="estate-room-experience-menu__item-label">
                  {chatVisible ? "Chat on" : "Chat off"}
                </span>
              </button>
              {soundAvailable ? (
                <button
                  type="button"
                  role="menuitem"
                  className={[
                    "estate-room-experience-menu__item",
                    soundEnabled ? "estate-room-experience-menu__item--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-pressed={soundEnabled}
                  data-testid="estate-room-sound-toggle"
                  onClick={() => closeAndRun(toggleSound)}
                >
                  <span className="estate-room-experience-menu__item-icon" aria-hidden>
                    🎵
                  </span>
                  <span className="estate-room-experience-menu__item-label">
                    {soundEnabled ? "Sound on" : "Sound off"}
                  </span>
                </button>
              ) : null}
              <button
                type="button"
                role="menuitem"
                className={[
                  "estate-room-experience-menu__item",
                  fullscreen ? "estate-room-experience-menu__item--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={fullscreen}
                data-testid="estate-room-fullscreen-toggle"
                onClick={() => {
                  void closeAndRun(() => {
                    void toggleFullscreen();
                  });
                }}
              >
                <span className="estate-room-experience-menu__item-icon" aria-hidden>
                  {fullscreen ? "⤡" : "⛶"}
                </span>
                <span className="estate-room-experience-menu__item-label">
                  {fullscreen ? "Full screen on" : "Full screen off"}
                </span>
              </button>
              <button
                type="button"
                role="menuitem"
                className="estate-room-experience-menu__item"
                data-testid="estate-room-return-to-room"
                onClick={() => closeAndRun(onReturnToRoom)}
              >
                <span className="estate-room-experience-menu__item-icon" aria-hidden>
                  🖼
                </span>
                <span className="estate-room-experience-menu__item-label">
                  Return to room
                </span>
              </button>

              <p className="estate-room-experience-menu__section-label estate-room-experience-menu__section-label--nav">
                Estate navigation
              </p>
              <button
                type="button"
                role="menuitem"
                className="estate-room-experience-menu__item estate-room-experience-menu__item--nav"
                data-testid="estate-back-to-estate"
                onClick={() => closeAndRun(onBackToEstate)}
              >
                <span className="estate-room-experience-menu__item-icon" aria-hidden>
                  🏠
                </span>
                <span className="estate-room-experience-menu__item-label">
                  Back to Estate
                </span>
              </button>
              {onWander ? (
                <button
                  type="button"
                  role="menuitem"
                  className="estate-room-experience-menu__item estate-room-experience-menu__item--nav"
                  aria-label="Wander to another Estate place"
                  data-testid="estate-wander-button"
                  onClick={() => closeAndRun(onWander)}
                >
                  <span className="estate-room-experience-menu__item-icon" aria-hidden>
                    🌿
                  </span>
                  <span className="estate-room-experience-menu__item-label">
                    Wander
                  </span>
                </button>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </div>
  );

  if (embedded) return menu;

  return createPortal(menu, document.body);
}
