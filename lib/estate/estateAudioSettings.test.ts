import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getEstateAudioSettings,
  isEstateAmbienceLayerEnabled,
  isWelcomeGreetingAudioEnabled,
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

  it("welcome greeting audio defaults on and can be turned off", () => {
    expect(getEstateAudioSettings().welcomeGreetingAudioEnabled).toBe(true);
    expect(isWelcomeGreetingAudioEnabled()).toBe(true);
    patchEstateAudioSettings({ welcomeGreetingAudioEnabled: false });
    expect(isWelcomeGreetingAudioEnabled()).toBe(false);
  });
});
