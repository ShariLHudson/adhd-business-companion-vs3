"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  getEstateAudioSettings,
  patchEstateAudioSettings,
  setEstateSilenced,
  subscribeEstateAudioSettings,
} from "@/lib/estate/estateAudioSettings";
import {
  activeSoundscapeLabel,
  isSoundscapePlaying,
  stopSoundscapeOverlay,
  subscribeSoundscapePlayback,
} from "@/lib/estate/estateAudioService";
import { stopAllAudio } from "@/lib/estate/stopAllAudio";
import { useDismissibleWindow } from "@/lib/windowDismiss";

export type GlobalSoundUiState = "off" | "on" | "playing";

function resolveSoundUiState(
  silenced: boolean,
  playingHint: boolean,
): GlobalSoundUiState {
  if (silenced) return "off";
  if (playingHint) return "playing";
  return "on";
}

type Props = {
  /** Optional: true when a registered/visible player is known to be active. */
  soundPlayingHint?: boolean;
  onOpenAudioSettings?: () => void;
  /**
   * Open Peaceful Moments (the Music Room) from anywhere in the companion —
   * this is the one entry point that works regardless of the current
   * section or room, satisfying "open from any window".
   */
  onOpenPeacefulMoments?: () => void;
};

/**
 * Persistent global Sound Off control — Estate top-right chrome.
 * One click stops all audio and persists silence. Does not create a second engine.
 *
 * Also self-subscribes to the shared Layer 2 soundscape overlay so it can
 * show "Now Playing" + Stop for Peaceful Moments from any screen without any
 * parent wiring — one truly global Now Playing surface.
 */
export function GlobalSoundControl({
  soundPlayingHint = false,
  onOpenAudioSettings,
  onOpenPeacefulMoments,
}: Props) {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [silenced, setSilenced] = useState(
    () => getEstateAudioSettings().silenced,
  );
  const [volume, setVolume] = useState(
    () => getEstateAudioSettings().masterVolume,
  );
  const [open, setOpen] = useState(false);
  const [nowPlayingLabel, setNowPlayingLabel] = useState<string | null>(
    () => (isSoundscapePlaying() ? activeSoundscapeLabel() : null),
  );

  useEffect(() => {
    return subscribeEstateAudioSettings(() => {
      const s = getEstateAudioSettings();
      setSilenced(s.silenced);
      setVolume(s.masterVolume);
    });
  }, []);

  useEffect(() => {
    const sync = () =>
      setNowPlayingLabel(isSoundscapePlaying() ? activeSoundscapeLabel() : null);
    sync();
    return subscribeSoundscapePlayback(sync);
  }, []);

  useDismissibleWindow({
    open,
    onClose: () => setOpen(false),
    closeOnEscape: true,
  });

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  const uiState = resolveSoundUiState(
    silenced,
    (soundPlayingHint || nowPlayingLabel !== null) && !silenced,
  );
  const label =
    uiState === "off"
      ? "Sound Off"
      : uiState === "playing"
        ? "Sound Playing"
        : "Sound On";

  async function soundOff() {
    await stopAllAudio({ silenceEstate: true });
    setSilenced(true);
  }

  async function soundOn() {
    setEstateSilenced(false);
    setSilenced(false);
  }

  async function stopAll() {
    await stopAllAudio({ silenceEstate: true });
    setSilenced(true);
  }

  return (
    <div
      ref={rootRef}
      className="global-sound-control"
      data-testid="global-sound-control"
      data-sound-state={uiState}
    >
      <div className="global-sound-control__cluster">
        <button
          type="button"
          className={[
            "global-sound-control__trigger",
            uiState === "playing" ? "global-sound-control__trigger--playing" : "",
            uiState === "off" ? "global-sound-control__trigger--off" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label={
            silenced
              ? `${label}. Open sound controls`
              : `${label}. Click to turn Sound Off`
          }
          title={silenced ? label : `${label} — click for Sound Off`}
          data-testid="global-sound-control-trigger"
          onClick={() => {
            if (!silenced) {
              void soundOff();
              return;
            }
            setOpen((v) => !v);
          }}
        >
          <span aria-hidden="true" className="global-sound-control__icon">
            <SpeakerGlyph state={uiState} />
          </span>
          <span className="global-sound-control__label">{label}</span>
        </button>
        <button
          type="button"
          className="global-sound-control__menu"
          aria-label="Open sound menu"
          aria-expanded={open}
          aria-controls={panelId}
          data-testid="global-sound-control-menu"
          onClick={() => setOpen((v) => !v)}
        >
          ▾
        </button>
      </div>

      {open ? (
        <div
          id={panelId}
          className="global-sound-control__panel"
          role="dialog"
          aria-label="Sound controls"
          data-testid="global-sound-control-panel"
        >
          <p
            className="global-sound-control__status"
            data-testid="global-sound-control-status"
          >
            {label}
          </p>
          {nowPlayingLabel ? (
            <div
              className="global-sound-control__now-playing"
              data-testid="global-sound-now-playing"
            >
              <p className="global-sound-control__now-playing-label">
                Now playing: {nowPlayingLabel}
              </p>
              <div className="global-sound-control__now-playing-actions">
                {onOpenPeacefulMoments ? (
                  <button
                    type="button"
                    className="global-sound-control__action"
                    data-testid="global-sound-now-playing-open"
                    onClick={() => {
                      setOpen(false);
                      onOpenPeacefulMoments();
                    }}
                  >
                    Open Peaceful Moments
                  </button>
                ) : null}
                <button
                  type="button"
                  className="global-sound-control__action"
                  data-testid="global-sound-now-playing-stop"
                  onClick={() => void stopSoundscapeOverlay()}
                >
                  Stop
                </button>
              </div>
            </div>
          ) : onOpenPeacefulMoments ? (
            <button
              type="button"
              className="global-sound-control__action"
              data-testid="global-sound-open-peaceful-moments"
              onClick={() => {
                setOpen(false);
                onOpenPeacefulMoments();
              }}
            >
              Peaceful Moments
            </button>
          ) : null}
          <div className="global-sound-control__actions">
            <button
              type="button"
              className="global-sound-control__action global-sound-control__action--primary"
              data-testid="global-sound-off"
              onClick={() => void soundOff()}
            >
              Sound Off
            </button>
            <button
              type="button"
              className="global-sound-control__action"
              data-testid="global-sound-on"
              onClick={() => void soundOn()}
              disabled={!silenced}
            >
              Sound On
            </button>
            <button
              type="button"
              className="global-sound-control__action"
              data-testid="global-stop-all-sound"
              onClick={() => void stopAll()}
            >
              Stop All Sound
            </button>
          </div>
          <label className="global-sound-control__volume">
            <span>Volume</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={silenced ? 0 : volume}
              data-testid="global-sound-volume"
              onChange={(e) => {
                const next = Number(e.target.value);
                setVolume(next);
                patchEstateAudioSettings({
                  masterVolume: next,
                  silenced: next <= 0,
                });
                setSilenced(next <= 0);
              }}
            />
          </label>
          {onOpenAudioSettings ? (
            <button
              type="button"
              className="global-sound-control__settings"
              data-testid="global-sound-open-settings"
              onClick={() => {
                setOpen(false);
                onOpenAudioSettings();
              }}
            >
              Audio Settings
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SpeakerGlyph({ state }: { state: GlobalSoundUiState }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 9.5v5h3.5L12 18.5V5.5L7.5 9.5H4z"
        fill="currentColor"
      />
      {state === "off" ? (
        <path
          d="M15 9l5 5m0-5l-5 5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      ) : (
        <>
          <path
            d="M15.5 9.5a3.5 3.5 0 010 5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {state === "playing" ? (
            <path
              d="M18 7.5a6 6 0 010 9"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          ) : null}
        </>
      )}
    </svg>
  );
}
