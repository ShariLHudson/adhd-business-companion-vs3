import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildPeacefulPlacesFolderTracks,
  buildPeacefulPlacesGroupedTracks,
  PEACEFUL_PLACES_FOLDER_FILENAMES,
  PEACEFUL_PLACES_GROUP_ORDER,
  peacefulPlacesFolderSrc,
} from "./peacefulPlacesFolderManifest";

const PEACEFUL_PLACES_DIR = resolve(
  process.cwd(),
  "public/audio/peaceful-places",
);

describe("peacefulPlacesFolderManifest", () => {
  it("lists every mp3 in public/audio/peaceful-places", () => {
    const onDisk = readdirSync(PEACEFUL_PLACES_DIR)
      .filter((name) => name.toLowerCase().endsWith(".mp3"))
      .sort();
    expect([...PEACEFUL_PLACES_FOLDER_FILENAMES].sort()).toEqual(onDisk);
  });

  it("builds playback URLs only from the peaceful-places folder", () => {
    for (const track of buildPeacefulPlacesFolderTracks()) {
      expect(track.src).toBe(peacefulPlacesFolderSrc(track.filename));
      expect(track.src.startsWith("/audio/peaceful-places/")).toBe(true);
    }
  });

  // --- 12 original + 5 recovered (2026-07-31, from the v4 clone) ---

  const ORIGINAL_TWELVE = [
    "bright-studio.mp3",
    "evening-hearth.mp3",
    "evening-reflections.mp3",
    "hall-of-reflections.mp3",
    "java-seranade-coffee-house.mp3",
    "lofty-studio.mp3",
    "morning-whisper.mp3",
    "nightime-melody.mp3",
    "pulse-of-momentum-energy-exercise-room.mp3",
    "pulse-of-momentum-energy.mp3",
    "reflections-of-triumph.mp3",
    "reflections-of-victory.mp3",
  ];
  const RECOVERED_FIVE: Record<string, string> = {
    "Catalyst of Joy.mp3": "Catalyst of Joy",
    "Dawn of New Horizons.mp3": "Dawn of New Horizons",
    "Energize the Day.mp3": "Energize the Day",
    "Momentum Unleashed.mp3": "Momentum Unleashed",
    "Radiant Horizons.mp3": "Radiant Horizons",
  };

  it("lists seventeen peaceful moments", () => {
    expect(PEACEFUL_PLACES_FOLDER_FILENAMES).toHaveLength(17);
  });

  it("keeps the original twelve and adds the five recovered", () => {
    for (const f of ORIGINAL_TWELVE) {
      expect(PEACEFUL_PLACES_FOLDER_FILENAMES).toContain(f);
    }
    for (const f of Object.keys(RECOVERED_FIVE)) {
      expect(PEACEFUL_PLACES_FOLDER_FILENAMES).toContain(f);
    }
  });

  it("renders the five recovered titles with exact asset URLs", () => {
    const tracks = buildPeacefulPlacesFolderTracks();
    for (const [filename, title] of Object.entries(RECOVERED_FIVE)) {
      const track = tracks.find((t) => t.title === title);
      expect(track, `missing recovered title: ${title}`).toBeDefined();
      expect(track?.src).toBe(`/audio/peaceful-places/${filename}`);
    }
  });

  it("has no duplicate ids, titles, or asset paths", () => {
    const tracks = buildPeacefulPlacesFolderTracks();
    const ids = tracks.map((t) => t.id);
    const titles = tracks.map((t) => t.title);
    const srcs = tracks.map((t) => t.src);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(srcs).size).toBe(srcs.length);
  });

  // --- Groupings (2026-07-31, confirmed with Shari) ---

  it("assigns every song to one of the six known groups (never Other / undefined)", () => {
    for (const track of buildPeacefulPlacesFolderTracks()) {
      expect(
        track.group,
        `song has no group: ${track.title}`,
      ).toBeDefined();
      expect(PEACEFUL_PLACES_GROUP_ORDER).toContain(track.group);
    }
  });

  it("groups in fixed order, alphabetized within, with no dropped songs", () => {
    const grouped = buildPeacefulPlacesGroupedTracks();

    // Group order is a subsequence of the canonical order.
    const orderIndex = grouped.map((s) =>
      PEACEFUL_PLACES_GROUP_ORDER.indexOf(s.group),
    );
    expect(orderIndex).toEqual([...orderIndex].sort((a, b) => a - b));

    // Alphabetized within each group.
    for (const section of grouped) {
      const titles = section.tracks.map((t) => t.title);
      expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)));
    }

    // Every song appears exactly once across all groups.
    const groupedIds = grouped.flatMap((s) => s.tracks.map((t) => t.id));
    const allIds = buildPeacefulPlacesFolderTracks().map((t) => t.id);
    expect(new Set(groupedIds).size).toBe(allIds.length);
    expect([...groupedIds].sort()).toEqual([...allIds].sort());
  });

  it("places songs in the confirmed groups", () => {
    const byTitle = new Map(
      buildPeacefulPlacesFolderTracks().map((t) => [t.title, t.group]),
    );
    const expected: Record<string, string> = {
      "Morning Whisper": "Calm & Settle",
      "Java Serenade": "Focus & Flow",
      "Bright Studio": "Creative Thinking",
      "Lofty Studio": "Creative Thinking",
      "Dawn of New Horizons": "Gentle Energy",
      "Radiant Horizons": "Gentle Energy",
      "Catalyst of Joy": "Motivation & Momentum",
      "Energize the Day": "Motivation & Momentum",
      "Momentum Unleashed": "Motivation & Momentum",
      "Pulse of Momentum": "Motivation & Momentum",
      "Pulse of Momentum Energy": "Motivation & Momentum",
      "Reflections of Triumph": "Motivation & Momentum",
      "Reflections of Victory": "Motivation & Momentum",
      "Evening Hearth": "Reflection & Rest",
      "Evening Reflections": "Reflection & Rest",
      "Hall of Reflections": "Reflection & Rest",
      "Nighttime Melody": "Reflection & Rest",
    };
    for (const [title, group] of Object.entries(expected)) {
      expect(byTitle.get(title), `wrong group for ${title}`).toBe(group);
    }
  });
});
