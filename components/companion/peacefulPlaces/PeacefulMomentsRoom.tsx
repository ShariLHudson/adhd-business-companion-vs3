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
  registerEstateMediaStopper,
  stopAllAudio,
} from "@/lib/estate/stopAllAudio";
import { PLAN_MY_DAY_MORNING_COPY } from "@/lib/planMyDay/morningRoom";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";
import {
  PEACEFUL_PLACES_MUSIC_TRACKS,
  type ExperienceSoundscapeTrack,
} from "@/lib/soundscapes/experienceSoundscapesMenu";
import { useDismissibleWindow } from "@/lib/windowDismiss";

type Props = {
  onDone?: () => void;
  backLabel?: string;
};

const CTRL =
  "rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-sm font-semibold text-[#1f1c19] shadow-sm transition-colors hover:border-[#1e4f4f] hover:bg-[#f3f7f7] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f] disabled:cursor-not-allowed disabled:opacity-50";
const CTRL_PRIMARY =
  "rounded-xl bg-[#1e4f4f] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#163d3d] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f] disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Peaceful Moments — woodland pathway + one music dropdown + playback controls.
 * Sound is opt-in: select a track, then press Play. No autoplay.
 */
export function PeacefulMomentsRoom({
  onDone,
  backLabel = PLAN_MY_DAY_MORNING_COPY.previousScreen,
}: Props) {
  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selected, setSelected] = useState<ExperienceSoundscapeTrack | null>(
    null,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const stopLocalAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    try {
      audio.currentTime = 0;
    } catch {
      /* ignore */
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    preloadRoomBackground(PEACEFUL_PLACES_PATHWAY_BG);
    void stopGardenFlagAmbience();
    void stopGardenCardAmbience();
  }, []);

  useEffect(() => {
    return registerEstateMediaStopper(() => {
      stopLocalAudio();
    });
  }, [stopLocalAudio]);

  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
    audio.muted = muted;
  }, [volume, muted]);

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
    setIsPlaying(false);
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = track.src;
    audio.load();
    // Selecting a track must not start playback — Play is deliberate.
  }, []);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !selected) return;
    setPlaybackError(null);
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
      setPlaybackError(
        "That piece could not play just now. Try another track, or try again in a moment.",
      );
    }
  }, [selected]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    stopLocalAudio();
  }, [stopLocalAudio]);

  const toggleMute = useCallback(() => {
    setMuted((m) => !m);
  }, []);

  const handleLeave = useCallback(() => {
    stopLocalAudio();
    void stopAllAudio();
    onDone?.();
  }, [onDone, stopLocalAudio]);

  const handleAudioError = useCallback(() => {
    setIsPlaying(false);
    setPlaybackError(
      "That piece could not play just now. Try another track, or try again in a moment.",
    );
  }, []);

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
            Choose a piece of music, then press Play when you are ready.
          </p>

          <div className="relative mt-5">
            <label
              className="mb-2 block text-sm font-semibold uppercase tracking-wide text-[#6b635a]"
              htmlFor="peaceful-moments-music-trigger"
            >
              Choose Music
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
                {selected?.title ?? "Choose music…"}
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
                aria-label="Choose Music"
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

          <div className="mt-5" data-testid="peaceful-moments-player">
            <audio
              ref={audioRef}
              preload="metadata"
              className="sr-only"
              data-testid="peaceful-moments-audio"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              onError={handleAudioError}
            />

            {selected ? (
              <p
                className="text-center text-sm font-semibold text-[#1f1c19]"
                data-testid="peaceful-moments-current-track"
              >
                {selected.title}
              </p>
            ) : (
              <p className="text-center text-sm text-[#6b635a]">
                Select a track above, then press Play when you are ready.
              </p>
            )}

            <div
              className="mt-3 flex flex-wrap justify-center gap-2"
              data-testid="peaceful-moments-playback-controls"
            >
              <button
                type="button"
                className={CTRL_PRIMARY}
                data-testid="peaceful-moments-play"
                disabled={!selected || isPlaying}
                onClick={() => void play()}
              >
                Play
              </button>
              <button
                type="button"
                className={CTRL}
                data-testid="peaceful-moments-pause"
                disabled={!selected || !isPlaying}
                onClick={pause}
              >
                Pause
              </button>
              <button
                type="button"
                className={CTRL}
                data-testid="peaceful-moments-stop"
                disabled={!selected}
                onClick={stop}
              >
                Stop
              </button>
              <button
                type="button"
                className={CTRL}
                data-testid="peaceful-moments-mute"
                aria-pressed={muted}
                onClick={toggleMute}
              >
                {muted ? "Sound On" : "Sound Off"}
              </button>
            </div>

            <label className="mt-4 flex items-center gap-3 text-sm text-[#4b463f]">
              <span className="shrink-0 font-semibold">Volume</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                disabled={!selected}
                data-testid="peaceful-moments-volume"
                className="w-full accent-[#1e4f4f]"
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setVolume(next);
                  if (next > 0 && muted) setMuted(false);
                }}
              />
            </label>

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
