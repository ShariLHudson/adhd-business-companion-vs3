import { beforeEach, describe, expect, it, vi } from "vitest";

const audioMocks = vi.hoisted(() => ({
  isEstateSilenced: vi.fn(() => false),
  getEstateMasterVolume: vi.fn(() => 0.85),
}));

vi.mock("@/lib/estate/estateAudioSettings", () => ({
  isEstateSilenced: () => audioMocks.isEstateSilenced(),
  getEstateMasterVolume: () => audioMocks.getEstateMasterVolume(),
}));

describe("evidenceVaultUnlockSound", () => {
  beforeEach(() => {
    audioMocks.isEstateSilenced.mockReturnValue(false);
    audioMocks.getEstateMasterVolume.mockReturnValue(0.85);
    vi.resetModules();
  });

  it("does not play when Estate audio is silenced", async () => {
    audioMocks.isEstateSilenced.mockReturnValue(true);
    const AudioContextSpy = vi.fn();
    vi.stubGlobal("window", {
      AudioContext: AudioContextSpy,
      webkitAudioContext: undefined,
    });
    const { playEvidenceVaultUnlockSound } = await import(
      "./evidenceVaultUnlockSound"
    );
    playEvidenceVaultUnlockSound();
    expect(AudioContextSpy).not.toHaveBeenCalled();
  });

  it("does not play when master volume is effectively zero", async () => {
    audioMocks.getEstateMasterVolume.mockReturnValue(0);
    const AudioContextSpy = vi.fn();
    vi.stubGlobal("window", {
      AudioContext: AudioContextSpy,
      webkitAudioContext: undefined,
    });
    const { playEvidenceVaultUnlockSound } = await import(
      "./evidenceVaultUnlockSound"
    );
    playEvidenceVaultUnlockSound();
    expect(AudioContextSpy).not.toHaveBeenCalled();
  });

  it("attempts Web Audio when sound is enabled", async () => {
    const osc = {
      type: "sine",
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    const gain = {
      gain: {
        value: 1,
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
    const ctx = {
      state: "running",
      currentTime: 0,
      resume: vi.fn(),
      createOscillator: vi.fn(() => osc),
      createGain: vi.fn(() => gain),
      destination: {},
    };
    const AudioContextSpy = vi.fn(function AudioContext() {
      return ctx;
    });
    vi.stubGlobal("window", {
      AudioContext: AudioContextSpy,
      webkitAudioContext: undefined,
    });
    const { playEvidenceVaultUnlockSound } = await import(
      "./evidenceVaultUnlockSound"
    );
    playEvidenceVaultUnlockSound();
    expect(AudioContextSpy).toHaveBeenCalled();
    expect(ctx.createOscillator).toHaveBeenCalled();
    expect(osc.start).toHaveBeenCalled();
  });
});
