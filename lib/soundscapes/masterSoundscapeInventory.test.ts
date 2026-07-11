import { describe, expect, it } from "vitest";
import {
  MASTER_SOUNDSCAPE_INVENTORY,
  MASTER_SOUNDSCAPE_MENU_GROUPS,
  masterSoundscapeById,
  masterSoundscapesForCategory,
  signatureMasterSoundscapes,
} from "./masterSoundscapeInventory";

describe("masterSoundscapeInventory (#181)", () => {
  it("lists AUD-001 through AUD-017", () => {
    expect(MASTER_SOUNDSCAPE_INVENTORY).toHaveLength(17);
    expect(MASTER_SOUNDSCAPE_INVENTORY[0]?.id).toBe("AUD-001");
    expect(MASTER_SOUNDSCAPE_INVENTORY[16]?.id).toBe("AUD-017");
  });

  it("keeps member display names distinct from filenames", () => {
    const rain = masterSoundscapeById("AUD-002");
    expect(rain?.displayName).toBe("Gentle Rain");
    expect(rain?.originalFilename).toBe("bedroom-window-ambience.mp3");
    expect(rain?.category).toBe("signature-soundscape");
  });

  it("exposes signature sounds as recommendations only", () => {
    const signatures = signatureMasterSoundscapes();
    expect(signatures.length).toBeGreaterThanOrEqual(4);
    expect(signatures.every((a) => a.category === "signature-soundscape")).toBe(
      true,
    );
  });

  it("groups Spark Music for the audio menu", () => {
    const music = masterSoundscapesForCategory("spark-music");
    expect(music.some((a) => a.id === "AUD-013")).toBe(true);
    expect(MASTER_SOUNDSCAPE_MENU_GROUPS.some((g) => g.id === "silence")).toBe(
      true,
    );
  });
});
