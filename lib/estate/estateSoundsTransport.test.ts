import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetEstateSoundsTransportForTests,
  getEstateSoundsPlaybackState,
  getEstateSoundsTransportSnapshot,
  noteEstateSoundsStarted,
  pauseEstateSounds,
  resumeEstateSounds,
  stopActiveEstateSoundscapeItem,
  turnOffEstateSounds,
  turnOnEstateSounds,
} from "@/lib/estate/estateSoundsTransport";
import { setEstateSilenced } from "@/lib/estate/estateAudioSettings";

const pauseSoundscape = vi.fn(async () => {});
const resumeSoundscape = vi.fn(async () => ({ ok: true as const, trackId: "t1" }));
const stopSoundscape = vi.fn(async () => {});
const stopAll = vi.fn(async () => {});
const pauseAllLayers = vi.fn(async () => {});
const resumeAllLayers = vi.fn(async () => {
  layeredPlaying = layeredSelected;
});

let soundscapePlaying = false;
let layeredPlaying = false;
let layeredSelected = false;

vi.mock("@/lib/estate/estateAudioService", () => ({
  activeSoundscapeLabel: () => (soundscapePlaying ? "Soft Piano" : null),
  isSoundscapePlaying: () => soundscapePlaying,
  pauseSoundscapeOverlay: () => pauseSoundscape(),
  resumeSoundscapeOverlay: () => resumeSoundscape(),
  stopSoundscapeOverlay: () => stopSoundscape(),
  subscribeSoundscapePlayback: () => () => {},
}));

vi.mock("@/lib/estate/stopAllAudio", () => ({
  stopAllAudio: (opts?: { silenceEstate?: boolean }) => stopAll(opts),
}));

vi.mock("@/lib/layeredAudio/session", () => ({
  getLayeredAudioEngine: () => ({
    pauseAllLayers,
    resumeAllLayers,
    hasPlayingLayers: () => layeredPlaying,
    hasSelectedMix: () => layeredSelected,
  }),
  getLayeredAudioSnapshot: () => ({
    voice: null,
    music: layeredSelected
      ? {
          trackId: "soft-piano",
          title: "Soft Piano",
          source: "/audio/x.mp3",
          selectedVolume: 1,
          effectiveVolume: 1,
          playing: layeredPlaying,
          loop: true,
          loadState: "ready" as const,
        }
      : null,
    environmentTracks: layeredSelected
      ? [
          {
            trackId: "gentle-rain",
            title: "Gentle Rain",
            source: "/audio/r.mp3",
            selectedVolume: 1,
            effectiveVolume: 1,
            playing: layeredPlaying,
            loop: true,
            loadState: "ready" as const,
          },
        ]
      : [],
    environmentMasterVolume: 1,
    environmentDuckingMultiplier: 1,
    musicDuckingMultiplier: 1,
    customized: false,
    activePresetId: layeredSelected ? "rainy-fireside" : null,
    environmentLimitMessage: null,
    higherPrioritySpeechActive: false,
  }),
  subscribeLayeredAudio: () => () => {},
}));

beforeEach(() => {
  __resetEstateSoundsTransportForTests();
  setEstateSilenced(false);
  soundscapePlaying = false;
  layeredPlaying = false;
  layeredSelected = false;
  pauseSoundscape.mockClear();
  resumeSoundscape.mockClear();
  stopSoundscape.mockClear();
  stopAll.mockClear();
  pauseAllLayers.mockClear();
  resumeAllLayers.mockClear();
});

afterEach(() => {
  __resetEstateSoundsTransportForTests();
  setEstateSilenced(false);
});

describe("estateSoundsTransport", () => {
  it("reports On when layered audio is playing", () => {
    layeredSelected = true;
    layeredPlaying = true;
    expect(getEstateSoundsPlaybackState()).toBe("on");
    expect(getEstateSoundsTransportSnapshot().closedLabel).toBe("Sounds On");
    expect(getEstateSoundsTransportSnapshot().mixSummary).toContain("Rain");
  });

  it("Pause pauses soundscape and layered mixes", async () => {
    layeredSelected = true;
    layeredPlaying = true;
    soundscapePlaying = true;
    await pauseEstateSounds();
    expect(pauseSoundscape).toHaveBeenCalled();
    expect(pauseAllLayers).toHaveBeenCalled();
    expect(getEstateSoundsPlaybackState()).toBe("paused");
    expect(getEstateSoundsTransportSnapshot().closedLabel).toBe(
      "Sounds Paused",
    );
  });

  it("Resume restores the same mix without creating a new engine", async () => {
    layeredSelected = true;
    await pauseEstateSounds();
    await resumeEstateSounds();
    expect(resumeSoundscape).toHaveBeenCalled();
    expect(resumeAllLayers).toHaveBeenCalled();
    expect(getEstateSoundsPlaybackState()).not.toBe("paused");
  });

  it("Off stops audio and silences Estate", async () => {
    layeredSelected = true;
    layeredPlaying = true;
    await turnOffEstateSounds();
    expect(stopSoundscape).toHaveBeenCalled();
    expect(stopAll).toHaveBeenCalledWith({ silenceEstate: true });
    layeredPlaying = false;
    expect(getEstateSoundsPlaybackState()).toBe("off");
    expect(getEstateSoundsTransportSnapshot().closedLabel).toBe("Sounds Off");
  });

  it("Turn On clears silence after Off", async () => {
    layeredSelected = true;
    layeredPlaying = true;
    await turnOffEstateSounds();
    layeredPlaying = false;
    expect(getEstateSoundsPlaybackState()).toBe("off");
    await turnOnEstateSounds();
    expect(getEstateSoundsPlaybackState()).toBe("on");
  });

  it("noteEstateSoundsStarted clears paused/off for contextual Play", () => {
    setEstateSilenced(true);
    noteEstateSoundsStarted();
    soundscapePlaying = true;
    expect(getEstateSoundsPlaybackState()).toBe("on");
  });

  it("does not autoplay on initial load", () => {
    expect(getEstateSoundsPlaybackState()).toBe("off");
    expect(resumeAllLayers).not.toHaveBeenCalled();
    expect(resumeSoundscape).not.toHaveBeenCalled();
  });

  it("item-level Stop stops the soundscape without silencing Estate", async () => {
    soundscapePlaying = true;
    layeredSelected = true;
    layeredPlaying = true;
    await stopActiveEstateSoundscapeItem();
    expect(stopSoundscape).toHaveBeenCalled();
    expect(stopAll).not.toHaveBeenCalled();
    soundscapePlaying = false;
    expect(getEstateSoundsPlaybackState()).toBe("on");
  });

  it("reports Paused when a mix is selected but not audible", () => {
    layeredSelected = true;
    layeredPlaying = false;
    expect(getEstateSoundsPlaybackState()).toBe("paused");
    expect(getEstateSoundsTransportSnapshot().closedLabel).toBe(
      "Sounds Paused",
    );
  });
});
