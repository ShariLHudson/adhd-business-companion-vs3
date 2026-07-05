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
  ESTATE_CHROME_IDLE_HINT_FULLSCREEN,
  ESTATE_ROOM_MENU_FULLSCREEN_IDLE_MS,
} from "@/lib/estate/justBeHere";
import { resolveEstatePlaceAmbientProfile } from "@/lib/estate/estatePlaceAmbientSound";
import { kickstartEstateRoomAmbience } from "@/lib/estate/estateRoomAmbience";
import { useIdleChromeReveal } from "@/lib/estate/useIdleChromeReveal";

export type EstateRoomExperienceMenuProps = {
  roomId: string;
  visible?: boolean;
  /** When true, shift left so the estate menu trigger stays at the corner. */
  withEstateMenu?: boolean;
  /** When true, render inline inside EstateTopRightChrome (no separate portal). */
  embedded?: boolean;
  onJustBeHere: () => void;
};

/**
 * One Room button — tap to reveal sound + Just Be Here™ underneath.
 * In browser fullscreen, fades after idle with a gentle return hint.
 */
export function EstateRoomExperienceMenu({
  roomId,
  visible = true,
  withEstateMenu = false,
  embedded = false,
  onJustBeHere,
}: EstateRoomExperienceMenuProps) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const profile = resolveEstatePlaceAmbientProfile(roomId);
  const soundAvailable = Boolean(profile);

  const { fullscreen, faded, bumpVisibility } = useIdleChromeReveal({
    fullscreenIdleMs: ESTATE_ROOM_MENU_FULLSCREEN_IDLE_MS,
    onlyWhenFullscreen: true,
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const sync = () => setSoundEnabled(isEstateAmbienceEnabled());
    sync();
    return subscribeEstateAudioSettings(sync);
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

  const toggleSound = useCallback(() => {
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
  }, [soundEnabled, profile, roomId]);

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
        fullscreen ? "estate-room-experience-menu--fullscreen" : "",
        faded ? "estate-room-experience-menu--faded" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="estate-room-experience-menu"
      onMouseMove={fullscreen ? bumpVisibility : undefined}
      onTouchStart={fullscreen ? bumpVisibility : undefined}
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
            aria-label={
              soundEnabled ? "Room — sound on" : "Room — sound off"
            }
            title="Room"
            onClick={() => {
              bumpVisibility();
              setOpen((value) => !value);
            }}
          >
            <span className="estate-room-experience-menu__trigger-icons" aria-hidden>
              <span>🎵</span>
              <span>🖼</span>
            </span>
            <span className="estate-room-experience-menu__trigger-label">Room</span>
          </button>

          {open ? (
            <div
              className="estate-room-experience-menu__panel"
              role="menu"
              aria-label="Room choices"
              data-testid="estate-room-quick-choices"
            >
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
                  onClick={toggleSound}
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
                className="estate-room-experience-menu__item estate-room-experience-menu__item--presence"
                onClick={() => {
                  setOpen(false);
                  onJustBeHere();
                }}
              >
                <span className="estate-room-experience-menu__item-icon" aria-hidden>
                  🌿
                </span>
                <span className="estate-room-experience-menu__item-label">
                  Enjoy the Estate
                </span>
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );

  if (embedded) return menu;

  return createPortal(menu, document.body);
}
