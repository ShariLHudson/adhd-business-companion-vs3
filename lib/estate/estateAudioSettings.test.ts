import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getEstateAudioSettings,
  isEstateAmbienceLayerEnabled,
  patchEstateAudioSettings,
} from "./estateAudioSettings";

describe("estateAudioSettings", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      store: {} as Record<string, string>,
      getItem(key: string) {
        return this.store[key] ?? null;
      },
      setItem(key: string, value: string) {
        this.store[key] = value;
      },
    });
  });

  it("defaults ambience on and soundscape overlay off", () => {
    const s = getEstateAudioSettings();
    expect(s.ambienceEnabled).toBe(true);
    expect(s.soundscapeOverlayEnabled).toBe(false);
    expect(s.silenced).toBe(false);
    expect(isEstateAmbienceLayerEnabled()).toBe(true);
  });

  it("silence disables all layers", () => {
    patchEstateAudioSettings({ silenced: true });
    expect(isEstateAmbienceLayerEnabled()).toBe(false);
  });
});
