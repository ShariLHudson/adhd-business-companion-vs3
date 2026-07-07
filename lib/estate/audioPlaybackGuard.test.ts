import { describe, expect, it } from "vitest";
import { classifyAudioIntent } from "@/lib/estateAudioExperienceFoundation/classifyAudioIntent";
import {
  classifyAudioPlaybackIntent,
  getAudioPlaybackTrace,
  resolveGuardedEnvironmentalAudioRequest,
  shouldBlockAutoPlayForAudioQuery,
} from "@/lib/estate/audioPlaybackGuard";
import {
  isResolvedAudioExperience,
  resolveAudioExperienceQuery,
} from "@/lib/estateAudioExperienceFoundation/resolveAudioExperienceQuery";

describe("Audio Playback Guard™", () => {
  it("A — browse music requests do not auto-play", () => {
    const q = "what other music do you have";
    expect(classifyAudioPlaybackIntent(q).intent).toBe("browse");
    expect(classifyAudioIntent(q)?.kind).toBe("browse_audio");
    expect(shouldBlockAutoPlayForAudioQuery(q)).toBe(true);

    const decision = resolveAudioExperienceQuery(q);
    expect(isResolvedAudioExperience(decision)).toBe(true);
    expect(decision.offerNavigation).toBe(false);
    expect(decision.reason).toBe("audio_browse_no_autoplay");
  });

  it("B — calming nature sounds recommends without navigation or autoplay", () => {
    const q = "calming nature sounds";
    expect(classifyAudioPlaybackIntent(q).intent).toBe("recommend");
    expect(shouldBlockAutoPlayForAudioQuery(q)).toBe(true);

    const decision = resolveAudioExperienceQuery(q);
    expect(isResolvedAudioExperience(decision)).toBe(true);
    expect(decision.offerNavigation).toBe(false);
    expect(decision.reason).toBe("audio_recommend_no_autoplay");
  });

  it("C — play bird sounds resolves to greenhouse birds", () => {
    const q = "play bird sounds";
    expect(classifyAudioPlaybackIntent(q).intent).toBe("play");
    const request = resolveGuardedEnvironmentalAudioRequest(q);
    expect(request?.trackId).toBe("greenhouse-birds");
    expect(request?.layer).toBe("room");
    expect(request?.placeId).toBe("greenhouse");
  });

  it("D — start coffee chatter resolves to coffee-shop overlay", () => {
    const q = "start coffee chatter";
    expect(classifyAudioPlaybackIntent(q).intent).toBe("play");
    const request = resolveGuardedEnvironmentalAudioRequest(q);
    expect(request?.trackId).toBe("coffee-shop-chatter");
    expect(request?.layer).toBe("overlay");
    expect(request?.soundscapeId).toBe("coffee-shop");
  });

  it("E — sequential play requests target different tracks", () => {
    const birds = resolveGuardedEnvironmentalAudioRequest("play bird sounds");
    const coffee = resolveGuardedEnvironmentalAudioRequest("play coffee chatter");
    expect(birds?.trackId).not.toBe(coffee?.trackId);
  });

  it("records debug trace fields", () => {
    expect(getAudioPlaybackTrace()).toBeNull();
    expect(classifyAudioPlaybackIntent("what audio do you have").intent).toBe(
      "browse",
    );
  });
});
