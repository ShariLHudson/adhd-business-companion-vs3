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
const pauseRoomAmbience = vi.fn(async () => {
  roomAmbiencePlaying = false;
});
const resumeRoomAmbience = vi.fn(async () => {
  roomAmbiencePlaying = roomAmbienceSelected;
});

let soundscapePlaying = false;
let layeredPlaying = false;
let layeredSelected = false;
let roomAmbiencePlaying = false;
let roomAmbienceSelected = false;

vi.mock("@/lib/estate/estateAudioService", () => ({
  activeSoundscapeLabel: () => (soundscapePlaying ? "Soft Piano" : null),
  isSoundscapePlaying: () => soundscapePlaying,
  pauseSoundscapeOverlay: () => pauseSoundscape(),
  resumeSoundscapeOverlay: () => resumeSoundscape(),
  stopSoundscapeOverlay: () => stopSoundscape(),
  subscribeSoundscapePlayback: () => () => {},
}));

vi.mock("@/lib/estate/estateRoomAmbience", () => ({
  isEstateRoomAmbiencePlaying: () => roomAmbiencePlaying,
  isEstateRoomAmbienceSelected: () => roomAmbienceSelected,
  pauseEstateRoomAmbience: () => pauseRoomAmbience(),
  resumeEstateRoomAmbience: () => resumeRoomAmbience(),
  subscribeEstateRoomAmbience: () => () => {},
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
  roomAmbiencePlaying = false;
  roomAmbienceSelected = false;
  pauseSoundscape.mockClear();
  resumeSoundscape.mockClear();
  stopSoundscape.mockClear();
  stopAll.mockClear();
  pauseAllLayers.mockClear();
  resumeAllLayers.mockClear();
  pauseRoomAmbience.mockClear();
  resumeRoomAmbience.mockClear();
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

  describe("Layer 1 room ambience honesty (Settings Fix 3)", () => {
    it("reports On when only room ambience is playing — no false Sounds Off", () => {
      roomAmbienceSelected = true;
      roomAmbiencePlaying = true;
      expect(getEstateSoundsPlaybackState()).toBe("on");
      expect(getEstateSoundsTransportSnapshot().closedLabel).toBe(
        "Sounds On",
      );
    });

    it("reports Paused when room ambience is selected but not audible", () => {
      roomAmbienceSelected = true;
      roomAmbiencePlaying = false;
      expect(getEstateSoundsPlaybackState()).toBe("paused");
      expect(getEstateSoundsTransportSnapshot().closedLabel).toBe(
        "Sounds Paused",
      );
    });

    it("reports Off when nothing — including room ambience — is active", () => {
      roomAmbienceSelected = false;
      roomAmbiencePlaying = false;
      expect(getEstateSoundsPlaybackState()).toBe("off");
      expect(getEstateSoundsTransportSnapshot().closedLabel).toBe(
        "Sounds Off",
      );
    });

    it("Pause reaches room ambience alongside soundscape and layered mixes", async () => {
      roomAmbienceSelected = true;
      roomAmbiencePlaying = true;
      await pauseEstateSounds();
      expect(pauseRoomAmbience).toHaveBeenCalled();
      expect(getEstateSoundsPlaybackState()).toBe("paused");
    });

    it("Resume restores room ambience after Pause", async () => {
      roomAmbienceSelected = true;
      roomAmbiencePlaying = true;
      await pauseEstateSounds();
      expect(getEstateSoundsPlaybackState()).toBe("paused");
      await resumeEstateSounds();
      expect(resumeRoomAmbience).toHaveBeenCalled();
      expect(getEstateSoundsPlaybackState()).toBe("on");
    });

    it("Turn Off silences a room-ambience-only Estate", async () => {
      roomAmbienceSelected = true;
      roomAmbiencePlaying = true;
      await turnOffEstateSounds();
      expect(stopAll).toHaveBeenCalledWith({ silenceEstate: true });
      roomAmbienceSelected = false;
      roomAmbiencePlaying = false;
      expect(getEstateSoundsPlaybackState()).toBe("off");
    });

    it("Turn On works after Off when room ambience remains selected", async () => {
      roomAmbienceSelected = true;
      roomAmbiencePlaying = true;
      await turnOffEstateSounds();
      roomAmbiencePlaying = false;
      expect(getEstateSoundsPlaybackState()).toBe("off");
      // Real stopEstateRoomAmbience() clears selection on Off; a room that
      // re-selects ambience (e.g. the member is still in that room) should
      // resume cleanly through Turn On.
      roomAmbienceSelected = true;
      await turnOnEstateSounds();
      expect(getEstateSoundsPlaybackState()).toBe("on");
    });

    it("does not report On from room ambience alone once Estate is silenced", async () => {
      roomAmbienceSelected = true;
      roomAmbiencePlaying = true;
      // Off latch takes priority even if the ambience fade-out has not
      // finished yet (roomAmbiencePlaying still true mid-fade).
      await turnOffEstateSounds();
      expect(getEstateSoundsPlaybackState()).toBe("off");
    });
  });
});
