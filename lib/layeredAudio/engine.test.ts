import { beforeEach, describe, expect, it } from "vitest";
import { LayeredAudioEngine } from "./engine";
import { createMockPlaybackPort } from "./playbackPort";
import { LAYERED_TRACK_IDS } from "./catalog";
import { LAYERED_AUDIO_COPY, MAX_ENVIRONMENT_TRACKS } from "./constants";
import { VOICE_DUCK_ENVIRONMENT } from "./constants";

describe("LayeredAudioEngine multi-environment mix", () => {
  let port: ReturnType<typeof createMockPlaybackPort>;
  let engine: LayeredAudioEngine;

  beforeEach(() => {
    port = createMockPlaybackPort();
    engine = new LayeredAudioEngine(port);
  });

  it("plays one environment soundscape", async () => {
    const result = await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.gentleRain);
    expect(result.ok).toBe(true);
    const snap = engine.getSnapshot();
    expect(snap.environmentTracks).toHaveLength(1);
    expect(snap.environmentTracks[0]?.trackId).toBe(LAYERED_TRACK_IDS.gentleRain);
    expect(snap.environmentTracks[0]?.playing).toBe(true);
    expect(port.playing.has(`env:${LAYERED_TRACK_IDS.gentleRain}`)).toBe(true);
  });

  it("plays two environment soundscapes simultaneously", async () => {
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.gentleRain);
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.morningBirds);
    expect(engine.getSnapshot().environmentTracks).toHaveLength(2);
    expect(port.playing.size).toBe(2);
  });

  it("plays three environment soundscapes simultaneously", async () => {
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.gentleRain);
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.morningBirds);
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.fireplace);
    expect(engine.getSnapshot().environmentTracks).toHaveLength(3);
    expect(port.playing.size).toBe(3);
  });

  it("rejects duplicate soundscapes", async () => {
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.gentleRain);
    const dup = await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.gentleRain);
    expect(dup.ok).toBe(false);
    if (!dup.ok) expect(dup.reason).toBe("duplicate");
    expect(engine.getSnapshot().environmentTracks).toHaveLength(1);
  });

  it("blocks a fourth soundscape with a clear message and does not replace", async () => {
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.gentleRain);
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.morningBirds);
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.fireplace);
    const fourth = await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.stream);
    expect(fourth.ok).toBe(false);
    if (!fourth.ok) {
      expect(fourth.reason).toBe("limit");
      expect(fourth.message).toBe(LAYERED_AUDIO_COPY.environmentLimit);
    }
    const ids = engine.getSnapshot().environmentTracks.map((t) => t.trackId);
    expect(ids).toEqual([
      LAYERED_TRACK_IDS.gentleRain,
      LAYERED_TRACK_IDS.morningBirds,
      LAYERED_TRACK_IDS.fireplace,
    ]);
    expect(engine.getSnapshot().environmentLimitMessage).toBe(
      LAYERED_AUDIO_COPY.environmentLimit,
    );
  });

  it("allows adding after removing one", async () => {
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.gentleRain);
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.morningBirds);
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.fireplace);
    engine.removeEnvironmentTrack(LAYERED_TRACK_IDS.morningBirds);
    expect(port.releasedIds).toContain(`env:${LAYERED_TRACK_IDS.morningBirds}`);
    const added = await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.stream);
    expect(added.ok).toBe(true);
    expect(engine.getSnapshot().environmentTracks).toHaveLength(
      MAX_ENVIRONMENT_TRACKS,
    );
  });

  it("keeps independent environment volumes", async () => {
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.gentleRain);
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.morningBirds);
    engine.setEnvironmentTrackVolume(LAYERED_TRACK_IDS.gentleRain, 0.6);
    engine.setEnvironmentTrackVolume(LAYERED_TRACK_IDS.morningBirds, 0.25);
    const snap = engine.getSnapshot();
    expect(
      snap.environmentTracks.find((t) => t.trackId === LAYERED_TRACK_IDS.gentleRain)
        ?.selectedVolume,
    ).toBeCloseTo(0.6);
    expect(
      snap.environmentTracks.find(
        (t) => t.trackId === LAYERED_TRACK_IDS.morningBirds,
      )?.selectedVolume,
    ).toBeCloseTo(0.25);
  });

  it("scales all tracks with Environment Master without overwriting preferences", async () => {
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.gentleRain);
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.morningBirds);
    engine.setEnvironmentTrackVolume(LAYERED_TRACK_IDS.gentleRain, 0.6);
    engine.setEnvironmentTrackVolume(LAYERED_TRACK_IDS.morningBirds, 0.25);
    engine.setEnvironmentMasterVolume(0.5);
    const snap = engine.getSnapshot();
    const rain = snap.environmentTracks.find(
      (t) => t.trackId === LAYERED_TRACK_IDS.gentleRain,
    )!;
    const birds = snap.environmentTracks.find(
      (t) => t.trackId === LAYERED_TRACK_IDS.morningBirds,
    )!;
    expect(rain.selectedVolume).toBeCloseTo(0.6);
    expect(birds.selectedVolume).toBeCloseTo(0.25);
    expect(rain.effectiveVolume).toBeCloseTo(0.3);
    expect(birds.effectiveVolume).toBeCloseTo(0.125);
  });

  it("ducks all active soundscapes proportionally when Voice plays", async () => {
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.gentleRain);
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.morningBirds);
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.fireplace);
    engine.setEnvironmentTrackVolume(LAYERED_TRACK_IDS.gentleRain, 0.6);
    engine.setEnvironmentTrackVolume(LAYERED_TRACK_IDS.morningBirds, 0.25);
    engine.setEnvironmentTrackVolume(LAYERED_TRACK_IDS.fireplace, 0.35);
    await engine.setMusic(LAYERED_TRACK_IDS.softPiano);
    await engine.setVoice(LAYERED_TRACK_IDS.morningReflection);

    const snap = engine.getSnapshot();
    expect(snap.environmentDuckingMultiplier).toBe(VOICE_DUCK_ENVIRONMENT);
    const rain = snap.environmentTracks.find(
      (t) => t.trackId === LAYERED_TRACK_IDS.gentleRain,
    )!;
    const birds = snap.environmentTracks.find(
      (t) => t.trackId === LAYERED_TRACK_IDS.morningBirds,
    )!;
    expect(rain.effectiveVolume / birds.effectiveVolume).toBeCloseTo(0.6 / 0.25);
    expect(rain.selectedVolume).toBeCloseTo(0.6);
  });

  it("restores environment volumes after Voice ends", async () => {
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.gentleRain);
    engine.setEnvironmentTrackVolume(LAYERED_TRACK_IDS.gentleRain, 0.6);
    await engine.setVoice(LAYERED_TRACK_IDS.morningReflection);
    const ducked = engine.getSnapshot().environmentTracks[0]!.effectiveVolume;
    await engine.pauseVoice();
    const restored = engine.getSnapshot().environmentTracks[0]!;
    expect(restored.effectiveVolume).toBeCloseTo(0.6);
    expect(restored.effectiveVolume).toBeGreaterThan(ducked);
    expect(restored.playing).toBe(true);
  });

  it("replacing Voice does not affect Environment tracks", async () => {
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.gentleRain);
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.fireplace);
    await engine.setVoice(LAYERED_TRACK_IDS.morningReflection);
    await engine.setVoice(LAYERED_TRACK_IDS.breathingGuidance);
    expect(engine.getSnapshot().environmentTracks).toHaveLength(2);
    expect(engine.getSnapshot().voice?.trackId).toBe(
      LAYERED_TRACK_IDS.breathingGuidance,
    );
  });

  it("replacing Music does not affect Environment tracks", async () => {
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.gentleRain);
    await engine.setMusic(LAYERED_TRACK_IDS.softPiano);
    await engine.setMusic(LAYERED_TRACK_IDS.quietPiano);
    expect(engine.getSnapshot().environmentTracks).toHaveLength(1);
    expect(engine.getSnapshot().music?.trackId).toBe(LAYERED_TRACK_IDS.quietPiano);
  });

  it("changing Environment does not stop Voice or Music", async () => {
    await engine.setMusic(LAYERED_TRACK_IDS.softPiano);
    await engine.setVoice(LAYERED_TRACK_IDS.morningReflection);
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.gentleRain);
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.fireplace);
    engine.removeEnvironmentTrack(LAYERED_TRACK_IDS.gentleRain);
    const snap = engine.getSnapshot();
    expect(snap.music?.playing).toBe(true);
    expect(snap.voice?.playing).toBe(true);
    expect(snap.environmentTracks).toHaveLength(1);
  });

  it("Pause Environment pauses all environmental tracks only", async () => {
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.gentleRain);
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.fireplace);
    await engine.setMusic(LAYERED_TRACK_IDS.softPiano);
    await engine.pauseAllEnvironment();
    const snap = engine.getSnapshot();
    expect(snap.environmentTracks.every((t) => !t.playing)).toBe(true);
    expect(snap.music?.playing).toBe(true);
  });

  it("individual soundscape pause affects only that sound", async () => {
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.gentleRain);
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.fireplace);
    await engine.pauseEnvironmentTrack(LAYERED_TRACK_IDS.gentleRain);
    const snap = engine.getSnapshot();
    expect(
      snap.environmentTracks.find((t) => t.trackId === LAYERED_TRACK_IDS.gentleRain)
        ?.playing,
    ).toBe(false);
    expect(
      snap.environmentTracks.find((t) => t.trackId === LAYERED_TRACK_IDS.fireplace)
        ?.playing,
    ).toBe(true);
  });

  it("Stop All stops every layer and releases handles", async () => {
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.gentleRain);
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.fireplace);
    await engine.setMusic(LAYERED_TRACK_IDS.softPiano);
    await engine.setVoice(LAYERED_TRACK_IDS.morningReflection);
    engine.stopAll();
    const snap = engine.getSnapshot();
    expect(snap.environmentTracks).toHaveLength(0);
    expect(snap.music).toBeNull();
    expect(snap.voice).toBeNull();
    expect(engine.activeHandleCount()).toBe(0);
    expect(port.releasedIds.length).toBeGreaterThanOrEqual(4);
  });

  it("presets can contain up to three soundscapes", async () => {
    const result = await engine.applyPreset("morning-garden");
    expect(result.appliedEnvironmentIds.length).toBeLessThanOrEqual(3);
    expect(engine.getSnapshot().environmentTracks.length).toBeLessThanOrEqual(3);
    expect(engine.getSnapshot().activePresetId).toBe("morning-garden");
  });

  it("unavailable preset soundscapes degrade safely", async () => {
    const result = await engine.applyPreset("woodland-reset");
    // Environment tracks exist; voice file may fail in browser but mock plays.
    expect(result.appliedEnvironmentIds.length).toBeGreaterThan(0);
    expect(engine.getSnapshot().environmentTracks.length).toBeGreaterThan(0);
  });

  it("marks Customized when Environment changes after a preset", async () => {
    await engine.applyPreset("rainy-fireside");
    await engine.addEnvironmentTrack(LAYERED_TRACK_IDS.morningBirds);
    expect(engine.getSnapshot().customized).toBe(true);
    expect(engine.getSnapshot().activePresetId).toBeNull();
    expect(engine.getSnapshot().music?.trackId).toBe(LAYERED_TRACK_IDS.softPiano);
  });

  it("does not invent dollar pricing in copy constants", () => {
    const blob = JSON.stringify(LAYERED_AUDIO_COPY);
    expect(blob).not.toMatch(/\$\d/);
    expect(blob).not.toMatch(/\/mo/i);
  });
});
