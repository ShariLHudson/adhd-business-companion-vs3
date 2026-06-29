"use client";

import { useEffect, useMemo, useState } from "react";
import { openAudioLink } from "@/lib/audioPlaylists";
import { resolveInAppAudioPlayback } from "@/lib/focusAudio/inAppAudioPlayback";
import type { SoundscapePlayback } from "@/lib/soundscapes/types";

type Props = {
  playback: SoundscapePlayback | null;
  onClose: () => void;
};

export function FocusAudioPlayerModal({ playback, onClose }: Props) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const inApp = useMemo(() => {
    if (!playback) return null;
    return resolveInAppAudioPlayback({
      id: playback.id,
      name: playback.label,
      url: playback.playbackUrl,
      playlistId: "soundscape",
    });
  }, [playback]);

  useEffect(() => {
    if (!playback) {
      setAdvancedOpen(false);
      return;
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [playback, onClose]);

  if (!playback || !inApp) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close soundscape"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={playback.label}
        className="relative z-10 w-full max-w-2xl rounded-2xl border border-[#d4cdc3] bg-[#faf7f2] p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 pr-2">
            <p className="text-lg font-semibold text-[#1f1c19]">
              {playback.label}
            </p>
            <p className="mt-0.5 text-sm text-[#6b635a]">
              {playback.environment}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setAdvancedOpen((v) => !v)}
              aria-expanded={advancedOpen}
              aria-label="More options"
              className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-[#6b635a] hover:bg-[#1e4f4f]/10"
            >
              ⋮
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#6b635a] hover:bg-[#1e4f4f]/10"
            >
              ✕
            </button>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-[#4b463f]">
          {playback.description}
        </p>

        <div className="mt-4">
          {inApp.kind === "youtube" ? (
            <iframe
              src={inApp.embedUrl}
              title={playback.label}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="aspect-video w-full rounded-xl border border-[#e7dfd4] bg-black"
            />
          ) : null}

          {inApp.kind === "direct" ? (
            <audio controls autoPlay src={inApp.src} className="w-full">
              Your browser does not support inline audio playback.
            </audio>
          ) : null}

          {inApp.kind === "unsupported" ? (
            <div className="rounded-xl border border-[#e7dfd4] bg-white/80 px-4 py-4 text-base leading-relaxed text-[#4b463f]">
              {inApp.message}
            </div>
          ) : null}
        </div>

        {advancedOpen ? (
          <div className="mt-3 rounded-xl border border-[#e7dfd4] bg-white/80 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6b635a]">
              Advanced
            </p>
            <button
              type="button"
              onClick={() => openAudioLink(playback.playbackUrl)}
              className="mt-2 text-sm font-medium text-[#1e4f4f] underline-offset-2 hover:underline"
            >
              Open source in browser
            </button>
            <p className="mt-1 text-xs text-[#6b635a]">
              For troubleshooting only — you usually do not need to leave the
              estate.
            </p>
          </div>
        ) : null}

        <div className="mt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
