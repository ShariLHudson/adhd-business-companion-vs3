"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addMyAudioLink,
  deleteAudioLink,
  getAudioLinks,
  linksForAudioCategory,
  MASTER_AUDIO_CATEGORIES,
  SAVED_AUDIO_CATEGORIES,
  myAudioLinks,
  playAudioTrack,
  FAVORITES_PLAYLIST_ID,
  MY_AUDIO_PLAYLIST_ID,
  type AudioLink,
} from "@/lib/audioPlaylists";
import { audioBackgroundMood, suggestAudioForEmotion } from "@/lib/audioSuggestions";
import { SceneBackground } from "./SceneBackground";
import type { EmotionalState } from "@/lib/companionEmotions";

// Categories shown in the picker — "My Audio" and "Favorites" live in Saved
// Links instead, so the dropdown stays focused on moods/sound types.
const PICKER_CATEGORIES = MASTER_AUDIO_CATEGORIES.filter(
  (c) => c.id !== MY_AUDIO_PLAYLIST_ID && c.id !== FAVORITES_PLAYLIST_ID,
);

export function FocusAudioPanel({
  onDone,
  emotion = "unclear",
  initialCategory,
}: {
  onDone?: () => void;
  emotion?: EmotionalState;
  initialCategory?: string;
}) {
  const suggestion = useMemo(() => suggestAudioForEmotion(emotion), [emotion]);

  const [category, setCategory] = useState<string>(
    initialCategory ?? suggestion.categoryId,
  );
  const [links, setLinks] = useState<AudioLink[]>([]);
  const [howToOpen, setHowToOpen] = useState(false);

  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
  }, [initialCategory]);

  // Add-your-own form
  const [myName, setMyName] = useState("");
  const [myUrl, setMyUrl] = useState("");
  const [myCategory, setMyCategory] = useState("focus");

  const refresh = useCallback(() => setLinks(getAudioLinks()), []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  const tracks = useMemo(
    () => linksForAudioCategory(category, links),
    [category, links],
  );
  const savedLinks = useMemo(() => myAudioLinks(links), [links]);
  const mood = audioBackgroundMood(category);

  const showingSuggestion = category === suggestion.categoryId;

  function play(track: AudioLink) {
    playAudioTrack(track, "focus-audio", category);
  }

  return (
    <div className="companion-fade-in relative h-full overflow-y-auto px-4 py-8 sm:px-6">
      <SceneBackground page={mood} seed={category} />
      <div className="relative mx-auto w-full max-w-xl">
        {/* All content sits on a readable card over the scene — consistent with
            Home / Focus / Continue, so text never floats on the image. */}
        <div className="rounded-2xl border border-[#1e4f4f]/15 bg-white/90 p-5 shadow-sm backdrop-blur-sm sm:p-6">
        <p className="text-2xl font-semibold text-[#1f1c19]">Focus Audio</p>
        <p className="mt-1 text-lg font-medium text-[#1f1c19]">
          What does your brain need right now?
        </p>
        <p className="mt-1 text-base leading-relaxed text-[#6b635a]">
          Pick a sound below and I&apos;ll cue it up. It opens in a new tab so
          you can keep it playing alongside the Companion.
        </p>

        {/* Category dropdown */}
        <label className="mt-5 block text-sm font-bold uppercase tracking-wide text-[#6b635a]">
          Sound for your brain
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-2 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-3 text-base font-medium text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        >
          {PICKER_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {showingSuggestion && (
          <p className="mt-2 text-sm text-[#1e4f4f]">
            Suggested {suggestion.reason} — {suggestion.categoryName}.
          </p>
        )}

        {/* Tracks for the chosen category */}
        <div className="mt-4 space-y-2">
          {tracks.length === 0 ? (
            <p className="text-base text-[#6b635a]">
              Nothing here yet — add a link under Saved Links below.
            </p>
          ) : (
            tracks.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => play(t)}
                className="flex w-full items-center rounded-lg border border-[#1e4f4f]/25 bg-[#1e4f4f]/5 px-3 py-2.5 text-left text-base font-medium text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
              >
                ▶ {t.name}
              </button>
            ))
          )}
        </div>

        {/* Saved Links — a divider section inside the same card (no card-in-card) */}
        <section className="mt-6 border-t border-[#e7dfd4] pt-5">
          <p className="text-lg font-semibold text-[#1f1c19]">Saved Links</p>
          <p className="mt-1 text-base text-[#6b635a]">
            Your own playlists, recordings, or affirmations — saved here for next
            time.
          </p>

          {/* Grouped by "what does this help you do?" — never a flat list. */}
          {savedLinks.length > 0 ? (
            <div className="mt-3 flex flex-col gap-3">
              {SAVED_AUDIO_CATEGORIES.map((cat) => {
                const inCat = savedLinks.filter(
                  (l) => (l.category ?? "other") === cat.id,
                );
                if (inCat.length === 0) return null;
                return (
                  <div key={cat.id}>
                    <p className="text-sm font-semibold text-[#1f1c19]">
                      {cat.emoji} {cat.name}
                    </p>
                    <div className="mt-1 flex flex-col gap-1.5">
                      {inCat.map((l) => (
                        <div key={l.id} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => play(l)}
                            className="flex-1 rounded-lg border border-[#1e4f4f]/25 bg-[#1e4f4f]/5 px-3 py-2 text-left text-base font-medium text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
                          >
                            ▶ {l.name}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteAudioLink(l.id);
                              refresh();
                            }}
                            title="Remove"
                            aria-label={`Remove ${l.name}`}
                            className="shrink-0 rounded-md px-2 py-2 text-sm text-[#a85c4a] hover:bg-[#a85c4a]/10"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-base text-[#6b635a]">
              No saved links yet — add one below.
            </p>
          )}

          <div className="mt-4 flex flex-col gap-2">
            <input
              value={myName}
              onChange={(e) => setMyName(e.target.value)}
              placeholder="Label — e.g. My focus playlist"
              className="rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base outline-none focus:border-[#1e4f4f]"
            />
            <label className="text-sm font-semibold text-[#6b635a]">
              What does this help you do?
            </label>
            <select
              value={myCategory}
              onChange={(e) => setMyCategory(e.target.value)}
              className="rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            >
              {SAVED_AUDIO_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </select>
            <input
              value={myUrl}
              onChange={(e) => setMyUrl(e.target.value)}
              placeholder="Paste link (YouTube, Spotify, etc.)"
              className="rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base outline-none focus:border-[#1e4f4f]"
            />
            <button
              type="button"
              disabled={!myName.trim() || !myUrl.trim()}
              onClick={() => {
                addMyAudioLink(myName, myUrl, myCategory);
                setMyName("");
                setMyUrl("");
                refresh();
              }}
              className="rounded-lg bg-[#1e4f4f] px-4 py-3 text-base font-semibold text-white enabled:hover:bg-[#163a3a] disabled:opacity-40"
            >
              Save link
            </button>
          </div>
        </section>

        {/* How to add & play */}
        <button
          type="button"
          onClick={() => setHowToOpen((v) => !v)}
          className="mt-5 text-sm font-semibold text-[#1e4f4f]"
        >
          {howToOpen ? "▾" : "▸"} How to add & play your own
        </button>
        {howToOpen && (
          <div className="mt-2 rounded-lg bg-[#faf6f0]/80 p-4 text-base text-[#4b463f]">
            <ol className="list-decimal space-y-1 pl-5">
              <li>
                Open YouTube, Spotify, or wherever you listen, and copy the link
                to a track or playlist.
              </li>
              <li>Paste it under Saved Links with a name, then tap Save link.</li>
              <li>
                Tap any track or ▶ Play to start — it opens in a new tab and
                keeps playing while you work here.
              </li>
            </ol>
            <p className="mt-2 text-sm text-[#6b635a]">
              Tip: any earbuds or headphones work — the sound type matters more
              than the brand.
            </p>
          </div>
        )}
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => onDone?.()}
            className="rounded-xl border-2 border-[#1e4f4f] bg-white px-8 py-3 text-lg font-semibold text-[#1e4f4f]"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
