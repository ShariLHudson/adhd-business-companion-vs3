import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  registerEstateMediaStopper,
  stopAllAudio,
} from "./stopAllAudio";
import { getEstateAudioSettings } from "./estateAudioSettings";

describe("stopAllAudio (133)", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      store: {} as Record<string, string>,
      getItem(key: string) {
        return this.store[key] ?? null;
      },
      setItem(key: string, value: string) {
        this.store[key] = value;
      },
      removeItem(key: string) {
        delete this.store[key];
      },
    });
    vi.stubGlobal("document", {
      querySelectorAll: () => [],
    });
  });

  it("runs registered media stoppers", async () => {
    const stop = vi.fn();
    const unregister = registerEstateMediaStopper(stop);
    await stopAllAudio();
    expect(stop).toHaveBeenCalled();
    unregister();
  });

  it("can silence estate preference", async () => {
    await stopAllAudio({ silenceEstate: true });
    const s = getEstateAudioSettings();
    expect(s.silenced).toBe(true);
    expect(s.autoplayAllowed).toBe(false);
  });
});
