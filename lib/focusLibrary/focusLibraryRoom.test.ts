import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  FOCUS_LIBRARY_CATEGORIES,
  FOCUS_LIBRARY_ROOM_BG,
} from "@/lib/focusLibrary/focusLibraryRoom";
import { FOCUS_LIBRARY_BG } from "@/lib/supportExperiences/supportExperienceRegistry";
import { CLEAR_MY_MIND_SECTION, isClearMyMindSection } from "@/lib/clearMyMindRouting";

function publicPathFromUrl(url: string): string {
  return join(process.cwd(), "public", url.replace(/^\//, ""));
}

describe("Focus Library — distinct from Clear My Mind", () => {
  it("resolves to its own tea-room background plate", () => {
    expect(FOCUS_LIBRARY_ROOM_BG).toBe(FOCUS_LIBRARY_BG);
    expect(FOCUS_LIBRARY_ROOM_BG).toBe("/backgrounds/tea-room-background.webp");
  });

  it("ships the tea-room background plate in public/", () => {
    expect(existsSync(publicPathFromUrl(FOCUS_LIBRARY_ROOM_BG))).toBe(true);
  });

  it("offers exactly music/sounds, guided focus, timers, and saved favorites", () => {
    const ids = FOCUS_LIBRARY_CATEGORIES.map((c) => c.id);
    expect(ids).toEqual([
      "music-sounds",
      "guided-focus",
      "timers",
      "saved-favorites",
    ]);
  });

  it("never dispatches an action into Clear My Mind (brain-dump)", () => {
    for (const category of FOCUS_LIBRARY_CATEGORIES) {
      if (!category.action) continue;
      if (category.action.kind === "section") {
        expect(isClearMyMindSection(category.action.section)).toBe(false);
        expect(category.action.section).not.toBe(CLEAR_MY_MIND_SECTION);
      }
      if (category.action.kind === "tool") {
        expect(category.action.tool).not.toBe("brain-dump");
      }
    }
  });

  it("Saved Favorites has no fabricated action — honest empty state only", () => {
    const savedFavorites = FOCUS_LIBRARY_CATEGORIES.find(
      (c) => c.id === "saved-favorites",
    );
    expect(savedFavorites?.action).toBeUndefined();
  });
});
