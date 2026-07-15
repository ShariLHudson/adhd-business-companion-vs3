import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getExperienceControlPrefs,
  patchExperienceControlPrefs,
} from "./experienceControlPrefs";

const store = new Map<string, string>();

describe("experienceControlPrefs", () => {
  beforeEach(() => {
    store.clear();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => store.clear(),
    });
  });

  it("keeps sound preferences independent", () => {
    patchExperienceControlPrefs({
      estateSoundsEnabled: true,
      musicEnabled: false,
      shariVoiceEnabled: true,
    });
    const prefs = getExperienceControlPrefs();
    expect(prefs.estateSoundsEnabled).toBe(true);
    expect(prefs.musicEnabled).toBe(false);
    expect(prefs.shariVoiceEnabled).toBe(true);

    patchExperienceControlPrefs({ shariVoiceEnabled: false });
    const next = getExperienceControlPrefs();
    expect(next.estateSoundsEnabled).toBe(true);
    expect(next.musicEnabled).toBe(false);
    expect(next.shariVoiceEnabled).toBe(false);
  });

  it("persists conversation visibility without affecting background mode", () => {
    patchExperienceControlPrefs({
      conversationVisibility: "hidden",
      backgroundMode: "soften",
    });
    const prefs = getExperienceControlPrefs();
    expect(prefs.conversationVisibility).toBe("hidden");
    expect(prefs.backgroundMode).toBe("soften");

    patchExperienceControlPrefs({ conversationVisibility: "showing" });
    expect(getExperienceControlPrefs().backgroundMode).toBe("soften");
  });

  it("supports text size and reduce motion choices", () => {
    patchExperienceControlPrefs({
      textSize: "extra-large",
      reduceMotion: true,
    });
    const prefs = getExperienceControlPrefs();
    expect(prefs.textSize).toBe("extra-large");
    expect(prefs.reduceMotion).toBe(true);
  });
});
