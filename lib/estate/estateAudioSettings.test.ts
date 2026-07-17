import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getEstateAudioSettings,
  isEstateAmbienceLayerEnabled,
  isEstateAutoplayAllowed,
  isWelcomeGreetingAudioEnabled,
  patchEstateAudioSettings,
  toAudioPreference,
} from "./estateAudioSettings";

describe("estateAudioSettings (133 opt-in)", () => {
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

  it("defaults autoplay off, ambience off, welcome greeting off", () => {
    const s = getEstateAudioSettings();
    expect(s.autoplayAllowed).toBe(false);
    expect(s.ambienceEnabled).toBe(false);
    expect(s.soundscapeOverlayEnabled).toBe(false);
    expect(s.silenced).toBe(false);
    expect(s.welcomeGreetingAudioEnabled).toBe(false);
    expect(isEstateAmbienceLayerEnabled()).toBe(false);
    expect(isEstateAutoplayAllowed()).toBe(false);
    expect(isWelcomeGreetingAudioEnabled()).toBe(false);
  });

  it("silence disables all layers", () => {
    patchEstateAudioSettings({ ambienceEnabled: true, silenced: true });
    expect(isEstateAmbienceLayerEnabled()).toBe(false);
    expect(isEstateAutoplayAllowed()).toBe(false);
  });

  it("welcome greeting can be enabled explicitly", () => {
    patchEstateAudioSettings({ welcomeGreetingAudioEnabled: true });
    expect(isWelcomeGreetingAudioEnabled()).toBe(true);
  });

  it("exposes AudioPreference view", () => {
    const pref = toAudioPreference();
    expect(pref.autoplayAllowed).toBe(false);
    expect(pref.globalMuted).toBe(false);
    expect(pref.volume).toBeGreaterThan(0);
  });
});
