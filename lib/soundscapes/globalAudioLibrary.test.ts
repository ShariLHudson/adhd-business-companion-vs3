import { describe, expect, it } from "vitest";
import {
  globalAudioLibraryById,
  globalAudioLibraryEntries,
} from "./globalAudioLibrary";
import { MASTER_SOUNDSCAPE_INVENTORY } from "./masterSoundscapeInventory";

describe("globalAudioLibrary (#181)", () => {
  it("exposes all AUD inventory plates", () => {
    const entries = globalAudioLibraryEntries();
    expect(entries).toHaveLength(MASTER_SOUNDSCAPE_INVENTORY.length);
    expect(entries[0]?.id).toBe("AUD-001");
    expect(globalAudioLibraryById("AUD-002")?.title).toMatch(/Gentle Rain/i);
  });

  it("uses owned playback URLs not YouTube", () => {
    for (const entry of globalAudioLibraryEntries()) {
      expect(entry.playbackUrl).not.toMatch(/youtube\.com/i);
      expect(entry.playbackUrl.length).toBeGreaterThan(0);
    }
  });
});
