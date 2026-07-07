import { describe, expect, it, beforeEach } from "vitest";
import { resolveEstateNavigationIntent } from "@/lib/estateNavigationIntelligence/resolveEstateNavigationIntent";
import {
  isResolvedAudioExperience,
  resolveAudioExperienceQuery,
} from "@/lib/estateAudioExperienceFoundation/resolveAudioExperienceQuery";
import {
  classifyAudioPlaybackIntent,
  clearActiveEnvironmentalAudioState,
  executeGuardedEnvironmentalAudioPlay,
  getActiveEnvironmentalAudioId,
  resolveGuardedEnvironmentalAudioRequest,
} from "@/lib/estate/audioPlaybackGuard";

describe("Manual sanity checks — conservatory routing + audio guard", () => {
  beforeEach(() => {
    clearActiveEnvironmentalAudioState();
  });

  it("1 — take me to the ocean conservatory → Ocean Conservatory, not Greenhouse", () => {
    const nav = resolveEstateNavigationIntent("take me to the ocean conservatory");
    expect(nav.kind).toBe("navigate_direct");
    expect(nav.locationId).toBe("conservatory");
    expect(nav.locationId).not.toBe("greenhouse");
  });

  it("2 — take me to the conservatory → choices including Ocean Conservatory and Greenhouse", () => {
    const nav = resolveEstateNavigationIntent("take me to the conservatory");
    expect(nav.kind).toBe("offer_choices");
    const ids = nav.choices?.map((c) => c.locationId) ?? [];
    expect(ids).toContain("conservatory");
    expect(ids).toContain("greenhouse");
  });

  it("3 — what other music do you have → browse only, no autoplay", () => {
    const q = "what other music do you have";
    expect(classifyAudioPlaybackIntent(q).intent).toBe("browse");
    const decision = resolveAudioExperienceQuery(q);
    expect(isResolvedAudioExperience(decision)).toBe(true);
    expect(decision.reason).toBe("audio_browse_no_autoplay");
  });

  it("4 — play bird sounds then play coffee chatter → birds stop before coffee", async () => {
    const birds = resolveGuardedEnvironmentalAudioRequest("play bird sounds");
    const coffee = resolveGuardedEnvironmentalAudioRequest("play coffee chatter");
    expect(birds?.trackId).toBe("greenhouse-birds");
    expect(coffee?.trackId).toBe("coffee-shop-chatter");

    await executeGuardedEnvironmentalAudioPlay(birds!, { userInitiated: true });
    expect(getActiveEnvironmentalAudioId()).toBe("greenhouse-birds");

    const coffeeTrace = await executeGuardedEnvironmentalAudioPlay(coffee!, {
      userInitiated: true,
    });
    expect(coffeeTrace.blockedAudio).toBe("greenhouse-birds");
    expect(getActiveEnvironmentalAudioId()).toBe("coffee-shop-chatter");
  });
});
