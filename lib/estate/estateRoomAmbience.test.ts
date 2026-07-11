import { beforeEach, describe, expect, it, vi } from "vitest";

describe("estateRoomAmbience", () => {
  const play = vi.fn().mockResolvedValue(undefined);
  const pause = vi.fn();

  async function loadAmbience() {
    return import("./estateRoomAmbience");
  }

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    play.mockResolvedValue(undefined);

    let now = 0;
    vi.stubGlobal("performance", {
      now: () => now,
    });
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      now += 600;
      cb(now);
      return 1;
    });

    class MockAudio {
      loop = false;
      preload = "";
      volume = 1;
      currentTime = 0;
      src = "";
      play = play;
      pause = pause;
    }

    vi.stubGlobal("Audio", MockAudio);
    vi.stubGlobal("window", {
      location: { origin: "http://localhost:3000" },
    });
  });

  it("plays primary src on kickstart from user gesture path", async () => {
    const { kickstartEstateRoomAmbience, activeEstateAmbienceRoomId } =
      await loadAmbience();
    kickstartEstateRoomAmbience("journal", {
      src: "/audio/room-primary.mp3",
      volume: 0.1,
      character: "test",
    });

    expect(play).toHaveBeenCalled();
    await vi.waitFor(() => {
      expect(activeEstateAmbienceRoomId()).toBe("journal");
    });
  });

  it("falls back to estate ambience when primary play fails", async () => {
    const { ESTATE_AMBIENCE_FALLBACK_MP3 } = await import(
      "@/lib/soundscapes/audioAssets"
    );
    const { kickstartEstateRoomAmbience } = await loadAmbience();
    play
      .mockRejectedValueOnce(new Error("not found"))
      .mockResolvedValueOnce(undefined);

    kickstartEstateRoomAmbience("growth-profile", {
      src: "/audio/missing-greenhouse.mp3",
      volume: 0.11,
      character: "test",
    });

    await vi.waitFor(() => {
      expect(play).toHaveBeenCalledTimes(2);
    });
  });

  it("keeps one loop when two places share the same ambience src", async () => {
    const { kickstartEstateRoomAmbience, activeEstateAmbienceRoomId } =
      await loadAmbience();
    const profile = {
      src: "/audio/Soundscapes/greenhouse-birds-ambience.mp3",
      volume: 0.09,
      character: "birds",
    };

    kickstartEstateRoomAmbience("garden-path", profile);
    await vi.waitFor(() => {
      expect(activeEstateAmbienceRoomId()).toBe("garden-path");
    });
    const callsAfterFirst = play.mock.calls.length;

    kickstartEstateRoomAmbience("greenhouse", profile);
    await vi.waitFor(() => {
      expect(activeEstateAmbienceRoomId()).toBe("greenhouse");
    });

    expect(play.mock.calls.length).toBe(callsAfterFirst);
  });

  it("stops active ambience", async () => {
    const { ESTATE_AMBIENCE_FALLBACK_MP3 } = await import(
      "@/lib/soundscapes/audioAssets"
    );
    const {
      kickstartEstateRoomAmbience,
      stopEstateRoomAmbience,
      activeEstateAmbienceRoomId,
    } = await loadAmbience();
    kickstartEstateRoomAmbience("journal", {
      src: ESTATE_AMBIENCE_FALLBACK_MP3,
      volume: 0.1,
      character: "test",
    });

    await stopEstateRoomAmbience();
    expect(activeEstateAmbienceRoomId()).toBeNull();
    expect(pause).toHaveBeenCalled();
  });

  it("stops coffee-house when moving to a place with no Layer 1 profile", async () => {
    const {
      kickstartEstateRoomAmbience,
      transitionEstatePlaceAmbient,
      activeEstateAmbienceRoomId,
    } = await loadAmbience();

    kickstartEstateRoomAmbience("coffee-house", {
      src: "/audio/Soundscapes/java-seranade-coffee-house.mp3",
      volume: 0.13,
      character: "cafe",
    });
    await vi.waitFor(() => {
      expect(activeEstateAmbienceRoomId()).toBe("coffee-house");
    });

    await transitionEstatePlaceAmbient("games");
    expect(activeEstateAmbienceRoomId()).toBeNull();
    expect(pause).toHaveBeenCalled();
  });

  it("crossfades coffee-house into music-room", async () => {
    const {
      kickstartEstateRoomAmbience,
      transitionEstatePlaceAmbient,
      activeEstateAmbienceRoomId,
    } = await loadAmbience();

    kickstartEstateRoomAmbience("coffee-house", {
      src: "/audio/Soundscapes/java-seranade-coffee-house.mp3",
      volume: 0.13,
      character: "cafe",
    });
    await vi.waitFor(() => {
      expect(activeEstateAmbienceRoomId()).toBe("coffee-house");
    });

    await transitionEstatePlaceAmbient("music-room", { userInitiated: true });
    expect(activeEstateAmbienceRoomId()).toBe("music-room");
    expect(play).toHaveBeenCalled();
    const lastPlayCall = play.mock.invocationCallOrder.at(-1);
    expect(lastPlayCall).toBeDefined();
  });
});
