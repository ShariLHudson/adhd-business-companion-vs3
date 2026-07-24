"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  getEstateSoundsTransportSnapshot,
  pauseEstateSounds,
  resumeEstateSounds,
  subscribeEstateSoundsTransport,
  turnOffEstateSounds,
  turnOnEstateSounds,
  type EstateSoundsPlaybackState,
  type EstateSoundsTransportSnapshot,
} from "@/lib/estate/estateSoundsTransport";
import { useDismissibleWindow } from "@/lib/windowDismiss";

type Props = {
  /** @deprecated Hint unused — transport is the source of truth. */
  soundPlayingHint?: boolean;
  /** Opens Change Sounds (layered mixer + catalog). */
  onOpenLayeredAudioMixer?: () => void;
  /** Opens Peaceful Moments (songs / guided listening). */
  onOpenPeacefulMoments?: () => void;
  /** Opens Soundscapes (ambient environment sounds). */
  onOpenSoundscapes?: () => void;
  /** @deprecated Prefer Change Sounds; ignored on the main surface. */
  onOpenAudioSettings?: () => void;
};

/**
 * Canonical Estate Sounds control — one On / Paused / Off home.
 * Does not create a second audio engine.
 */
export function GlobalSoundControl({
  onOpenLayeredAudioMixer,
  onOpenPeacefulMoments,
  onOpenSoundscapes,
}: Props) {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [snap, setSnap] = useState<EstateSoundsTransportSnapshot>(() =>
    getEstateSoundsTransportSnapshot(),
  );

  useEffect(() => {
    const sync = () => setSnap(getEstateSoundsTransportSnapshot());
    sync();
    return subscribeEstateSoundsTransport(sync);
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

  const state = snap.playbackState;
  const statusAnnouncement =
    state === "on"
      ? "Sounds are on"
      : state === "paused"
        ? "Sounds are paused"
        : "Sounds are off";

  function openSection(openFn?: () => void) {
    setOpen(false);
    openFn?.();
  }

  return (
    <div
      ref={rootRef}
      className="global-sound-control"
      data-testid="global-sound-control"
      data-sound-state={state}
      data-canonical-audio-controller="true"
    >
      <div className="global-sound-control__cluster">
        <button
          type="button"
          className={[
            "global-sound-control__trigger",
            state === "on" ? "global-sound-control__trigger--playing" : "",
            state === "off" ? "global-sound-control__trigger--off" : "",
            state === "paused" ? "global-sound-control__trigger--paused" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label={`${snap.closedLabel}. Open Estate Sounds`}
          aria-expanded={open}
          aria-controls={panelId}
          title={snap.closedLabel}
          data-testid="global-sound-control-trigger"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="global-sound-control__label">{snap.closedLabel}</span>
        </button>
      </div>

      {open ? (
        <div
          id={panelId}
          className="global-sound-control__panel"
          role="dialog"
          aria-label="Estate Sounds"
          data-testid="global-sound-control-panel"
        >
          <p className="global-sound-control__heading">Estate Sounds</p>
          <p
            className="global-sound-control__status"
            data-testid="global-sound-control-status"
            aria-live="polite"
          >
            {statusAnnouncement}
          </p>

          {snap.mixTitle || snap.mixSummary ? (
            <div
              className="global-sound-control__now-playing"
              data-testid="global-sound-now-playing"
            >
              {snap.mixTitle ? (
                <p
                  className="global-sound-control__mix-title"
                  data-testid="global-sound-mix-title"
                >
                  {snap.mixTitle}
                </p>
              ) : null}
              {snap.mixSummary ? (
                <p
                  className="global-sound-control__now-playing-label"
                  data-testid="global-sound-mix-summary"
                >
                  {snap.mixSummary}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="global-sound-control__empty-mix">
              No sounds selected yet.
            </p>
          )}

          <div
            className="global-sound-control__catalog"
            data-testid="global-sound-catalog"
          >
            <p className="global-sound-control__catalog-label">Browse</p>
            {onOpenPeacefulMoments ? (
              <button
                type="button"
                className="global-sound-control__action"
                data-testid="global-sound-peaceful-moments"
                onClick={() => openSection(onOpenPeacefulMoments)}
              >
                Peaceful Moments
              </button>
            ) : null}
            {onOpenSoundscapes ? (
              <button
                type="button"
                className="global-sound-control__action"
                data-testid="global-sound-soundscapes"
                onClick={() => openSection(onOpenSoundscapes)}
              >
                Soundscapes
              </button>
            ) : null}
            {onOpenLayeredAudioMixer ? (
              <button
                type="button"
                className="global-sound-control__action"
                data-testid="global-sound-change-sounds"
                onClick={() => openSection(onOpenLayeredAudioMixer)}
              >
                Current Mix
              </button>
            ) : null}
          </div>

          <div className="global-sound-control__actions">
            {state === "on" ? (
              <button
                type="button"
                className="global-sound-control__action global-sound-control__action--primary"
                data-testid="global-sound-pause"
                onClick={() => void pauseEstateSounds()}
              >
                Pause
              </button>
            ) : null}
            {state === "paused" ? (
              <button
                type="button"
                className="global-sound-control__action global-sound-control__action--primary"
                data-testid="global-sound-resume"
                onClick={() => void resumeEstateSounds()}
              >
                Resume
              </button>
            ) : null}
            {state === "off" ? (
              <button
                type="button"
                className="global-sound-control__action global-sound-control__action--primary"
                data-testid="global-sound-on"
                onClick={() => void turnOnEstateSounds()}
              >
                Turn On
              </button>
            ) : null}
            {state !== "off" ? (
              <button
                type="button"
                className="global-sound-control__action"
                data-testid="global-sound-off"
                onClick={() => void turnOffEstateSounds()}
              >
                Turn Off
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export type { EstateSoundsPlaybackState };
