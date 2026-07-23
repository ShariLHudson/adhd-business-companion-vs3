import { afterEach, describe, expect, it } from "vitest";
import { LayeredAudioEngine } from "./engine";
import { createMockPlaybackPort } from "./playbackPort";
import { LAYERED_TRACK_IDS } from "./catalog";
import {
  __resetLayeredAudioSessionForTests,
  getLayeredAudioEngine,
  getLayeredAudioSnapshot,
  stopLayeredAudioAll,
} from "./session";

describe("layered audio session", () => {
  afterEach(() => {
    __resetLayeredAudioSessionForTests(null);
  });

  it("reuses one engine across remount-style lookups (no duplicate instances)", async () => {
    const port = createMockPlaybackPort();
    const engine = new LayeredAudioEngine(port);
    __resetLayeredAudioSessionForTests(engine);
    await getLayeredAudioEngine().addEnvironmentTrack(LAYERED_TRACK_IDS.gentleRain);
    expect(getLayeredAudioEngine()).toBe(engine);
    expect(getLayeredAudioSnapshot().environmentTracks).toHaveLength(1);
    expect(engine.activeHandleCount()).toBe(1);
  });

  it("does not autoplay after a fresh session reset (page refresh)", () => {
    __resetLayeredAudioSessionForTests(null);
    const snap = getLayeredAudioSnapshot();
    expect(snap.environmentTracks).toHaveLength(0);
    expect(snap.music).toBeNull();
    expect(snap.voice).toBeNull();
  });

  it("stopLayeredAudioAll clears the shared session", async () => {
    const port = createMockPlaybackPort();
    __resetLayeredAudioSessionForTests(new LayeredAudioEngine(port));
    await getLayeredAudioEngine().addEnvironmentTrack(LAYERED_TRACK_IDS.gentleRain);
    stopLayeredAudioAll();
    expect(getLayeredAudioSnapshot().environmentTracks).toHaveLength(0);
  });
});
