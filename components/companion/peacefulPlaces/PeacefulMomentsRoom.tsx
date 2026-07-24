"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { PEACEFUL_PLACES_PATHWAY_BG } from "@/lib/peacefulPlaces/pathway";
import { stopGardenCardAmbience } from "@/lib/peacefulPlaces/gardenCardAmbience";
import { stopGardenFlagAmbience } from "@/lib/peacefulPlaces/gardenFlagAmbience";
import {
  activeSoundscapeTrackId,
  isSoundscapePaused,
  isSoundscapePlaying,
  playSoundscapeTrack,
  resumeSoundscapeOverlay,
  subscribeSoundscapePlayback,
} from "@/lib/estate/estateAudioService";
import {
  noteEstateSoundsStarted,
  pauseEstateSounds,
  stopActiveEstateSoundscapeItem,
} from "@/lib/estate/estateSoundsTransport";
import { PLAN_MY_DAY_MORNING_COPY } from "@/lib/planMyDay/morningRoom";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";
import {
  PEACEFUL_PLACES_MUSIC_TRACKS,
  peacefulPlacesMusicTrackById,
  type ExperienceSoundscapeTrack,
} from "@/lib/soundscapes/experienceSoundscapesMenu";
import { useDismissibleWindow } from "@/lib/windowDismiss";

type Props = {
  onDone?: () => void;
  backLabel?: string;
};

type ItemPlaybackState = "stopped" | "playing" | "paused";

const CTRL_PRIMARY =
  "rounded-xl bg-[#1e4f4f] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#163d3d] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f] disabled:cursor-not-allowed disabled:opacity-50";

const CTRL_SECONDARY =
  "rounded-xl border border-[#1e4f4f]/35 bg-white px-3 py-2.5 text-sm font-semibold text-[#1e4f4f] shadow-sm transition-colors hover:bg-[#1e4f4f]/08 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]";

/**
 * Peaceful Moments — songs and guided listening only (not ambient soundscapes).
 *
 * Uses the canonical Estate Sounds transport. Item Stop ends this track;
 * Estate Sounds → Turn Off silences the whole session.
 */
export function PeacefulMomentsRoom({
  onDone,
  backLabel = PLAN_MY_DAY_MORNING_COPY.previousScreen,
}: Props) {
  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selected, setSelected] = useState<ExperienceSoundscapeTrack | null>(
    () => {
      const activeId = activeSoundscapeTrackId();
      return activeId ? peacefulPlacesMusicTrackById(activeId) ?? null : null;
    },
  );
  const [itemState, setItemState] = useState<ItemPlaybackState>(() => {
    const activeId = activeSoundscapeTrackId();
    if (!activeId || !peacefulPlacesMusicTrackById(activeId)) return "stopped";
    if (isSoundscapePlaying()) return "playing";
    if (isSoundscapePaused()) return "paused";
    return "stopped";
  });
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  useEffect(() => {
    preloadRoomBackground(PEACEFUL_PLACES_PATHWAY_BG);
    void stopGardenFlagAmbience();
    void stopGardenCardAmbience();
  }, []);

  /**
   * Reflect the shared engine — music tracks only.
   * Ambient soundscapes never appear as the selected Peaceful Moments song.
   */
  useEffect(() => {
    const sync = () => {
      const activeId = activeSoundscapeTrackId();
      const music = activeId ? peacefulPlacesMusicTrackById(activeId) : null;
      if (music) {
        setSelected(music);
        if (isSoundscapePlaying()) setItemState("playing");
        else if (isSoundscapePaused()) setItemState("paused");
        else setItemState("stopped");
        return;
      }
      // Active ambient soundscape (or nothing) — do not show it as a song.
      setItemState("stopped");
    };
    sync();
    return subscribeSoundscapePlayback(sync);
  }, []);

  const closeDropdown = useCallback(() => setDropdownOpen(false), []);

  useDismissibleWindow({
    open: dropdownOpen,
    onClose: closeDropdown,
    closeOnEscape: true,
  });

  useEffect(() => {
    if (!dropdownOpen) return;
    const onPointer = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (triggerRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [dropdownOpen]);

  const selectTrack = useCallback((track: ExperienceSoundscapeTrack) => {
    setPlaybackError(null);
    setSelected(track);
    setDropdownOpen(false);
    // Selecting a track must not start playback — Play is deliberate.
    const activeId = activeSoundscapeTrackId();
    if (activeId === track.id) {
      if (isSoundscapePlaying()) setItemState("playing");
      else if (isSoundscapePaused()) setItemState("paused");
      else setItemState("stopped");
    } else {
      setItemState("stopped");
    }
  }, []);

  const play = useCallback(async () => {
    if (!selected) return;
    setPlaybackError(null);
    const alreadyLoaded = activeSoundscapeTrackId() === selected.id;
    const result = alreadyLoaded
      ? await resumeSoundscapeOverlay()
      : await playSoundscapeTrack(selected);
    if (!result.ok) {
      setItemState("stopped");
      setPlaybackError(result.message);
      return;
    }
    noteEstateSoundsStarted();
    setItemState("playing");
  }, [selected]);

  const pause = useCallback(async () => {
    setPlaybackError(null);
    await pauseEstateSounds();
    setItemState("paused");
  }, []);

  const stop = useCallback(async () => {
    setPlaybackError(null);
    await stopActiveEstateSoundscapeItem();
    setItemState("stopped");
  }, []);

  /**
   * Previous Screen leaves the room view only — playback continues until
   * the member uses Stop on the track or Estate Sounds → Turn Off.
   */
  const handleLeave = useCallback(() => {
    onDone?.();
  }, [onDone]);

  const statusLabel =
    itemState === "playing"
      ? "Playing"
      : itemState === "paused"
        ? "Paused"
        : "Stopped";

  return (
    <div
      className="peaceful-moments-room relative h-full min-h-0 w-full"
      data-testid="peaceful-moments-room"
      data-peaceful-moments="audio-dropdown"
    >
      <CinematicBackground
        preset="peaceful-places"
        mode="image"
        imageStyle={roomBackgroundImageStyle(PEACEFUL_PLACES_PATHWAY_BG)}
        placement="fixed"
        className="peaceful-moments-room__cinematic"
      />

      <div className="relative z-10 flex h-full min-h-0 flex-col items-center overflow-y-auto px-4 pb-10 pt-6">
        {onDone ? (
          <button
            type="button"
            className="plan-day-morning-note__previous self-start"
            onClick={handleLeave}
            data-testid="app-back-button"
            aria-label="Previous Screen"
          >
            <span aria-hidden="true">←</span>
            <span>{backLabel}</span>
          </button>
        ) : null}

        <div
          className="mt-8 w-full max-w-md rounded-2xl border border-white/40 bg-[#faf7f2]/88 px-5 py-5 shadow-sm backdrop-blur-md"
          data-testid="peaceful-moments-controls"
        >
          <h1
            className="text-center text-2xl font-semibold tracking-tight text-[#2f261f]"
            data-testid="peaceful-moments-title"
          >
            Peaceful Moments
          </h1>
          <p className="mt-2 text-center text-base leading-relaxed text-[#4b463f]">
            Choose a song or guided listening track, then press Play. Ambient
            environment sounds live in Soundscapes.
          </p>
          <p className="mt-1 text-center text-xs text-[#8a8377]">
            It keeps playing while you explore the estate. Use Stop on this
            track, or Turn Off all sounds from Estate Sounds in the header.
          </p>

          <div className="relative mt-5">
            <label
              className="mb-2 block text-sm font-semibold uppercase tracking-wide text-[#6b635a]"
              htmlFor="peaceful-moments-music-trigger"
            >
              Peaceful Moments
            </label>
            <button
              ref={triggerRef}
              id="peaceful-moments-music-trigger"
              type="button"
              className="flex w-full min-h-12 items-center justify-between gap-3 rounded-xl border border-[#c9bfb0] bg-white px-4 py-3 text-left text-lg font-semibold text-[#1f1c19] shadow-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
              aria-haspopup="listbox"
              aria-expanded={dropdownOpen}
              aria-controls={listboxId}
              data-testid="peaceful-moments-music-dropdown"
              onClick={() => setDropdownOpen((open) => !open)}
            >
              <span className="min-w-0 truncate">
                {selected?.title ?? "Choose a song…"}
              </span>
              <span aria-hidden="true" className="shrink-0 text-base text-[#6b635a]">
                {dropdownOpen ? "▴" : "▾"}
              </span>
            </button>

            {dropdownOpen ? (
              <ul
                ref={listRef}
                id={listboxId}
                role="listbox"
                aria-label="Peaceful Moments songs"
                className="absolute left-0 right-0 z-20 mt-2 max-h-64 overflow-y-auto overscroll-contain rounded-xl border border-[#c9bfb0] bg-white py-1 shadow-lg"
                data-testid="peaceful-moments-music-list"
              >
                {PEACEFUL_PLACES_MUSIC_TRACKS.map((track) => {
                  const isSelected = selected?.id === track.id;
                  return (
                    <li key={track.id} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`block w-full px-4 py-3 text-left text-base font-semibold outline-none focus-visible:bg-[#1e4f4f]/12 focus-visible:outline-none ${
                          isSelected
                            ? "bg-[#1e4f4f]/14 text-[#1e4f4f]"
                            : "text-[#1f1c19] hover:bg-[#1e4f4f]/08"
                        }`}
                        data-testid={`peaceful-moments-track-${track.id}`}
                        onClick={() => selectTrack(track)}
                      >
                        {track.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>

          <div className="mt-5" data-testid="peaceful-moments-audio">
            {selected ? (
              <p
                className="text-center text-sm font-semibold text-[#1f1c19]"
                data-testid="peaceful-moments-current-track"
                aria-live="polite"
              >
                {selected.title}
                <span
                  className="ml-2 font-normal text-[#1e4f4f]"
                  data-testid="peaceful-moments-playback-state"
                  data-playback-state={itemState}
                >
                  · {statusLabel}
                </span>
              </p>
            ) : (
              <p className="text-center text-sm text-[#6b635a]">
                Select a song above, then press Play when you are ready.
              </p>
            )}

            <div
              className="mt-3 flex flex-wrap justify-center gap-2"
              data-testid="peaceful-moments-playback-controls"
              role="group"
              aria-label="Peaceful Moments playback"
            >
              {itemState === "stopped" ? (
                <button
                  type="button"
                  className={CTRL_PRIMARY}
                  data-testid="peaceful-moments-play"
                  aria-label={
                    selected
                      ? `Play ${selected.title}`
                      : "Play selected song"
                  }
                  disabled={!selected}
                  onClick={() => void play()}
                >
                  Play
                </button>
              ) : null}
              {itemState === "playing" ? (
                <>
                  <button
                    type="button"
                    className={CTRL_PRIMARY}
                    data-testid="peaceful-moments-pause"
                    aria-label={
                      selected ? `Pause ${selected.title}` : "Pause"
                    }
                    onClick={() => void pause()}
                  >
                    Pause
                  </button>
                  <button
                    type="button"
                    className={CTRL_SECONDARY}
                    data-testid="peaceful-moments-stop"
                    aria-label={
                      selected
                        ? `Stop ${selected.title}`
                        : "Stop this track"
                    }
                    onClick={() => void stop()}
                  >
                    Stop
                  </button>
                </>
              ) : null}
              {itemState === "paused" ? (
                <>
                  <button
                    type="button"
                    className={CTRL_PRIMARY}
                    data-testid="peaceful-moments-resume"
                    aria-label={
                      selected ? `Resume ${selected.title}` : "Resume"
                    }
                    onClick={() => void play()}
                  >
                    Resume
                  </button>
                  <button
                    type="button"
                    className={CTRL_SECONDARY}
                    data-testid="peaceful-moments-stop"
                    aria-label={
                      selected
                        ? `Stop ${selected.title}`
                        : "Stop this track"
                    }
                    onClick={() => void stop()}
                  >
                    Stop
                  </button>
                </>
              ) : null}
            </div>

            {playbackError ? (
              <p
                className="mt-2 text-center text-sm text-[#8a4b3a]"
                data-testid="peaceful-moments-playback-error"
                role="status"
              >
                {playbackError}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
