import { describe, expect, it } from "vitest";
import { WELCOME_ROOM_GREETING_SPEECH } from "@/lib/welcomeRoom/content";
import { WELCOME_ROOM_AUDIO_PROFILE, WELCOME_HOME_AUDIO_PROFILE } from "./profiles";

describe("welcomeAudio profiles", () => {
  it("registers immersive timeline and cached voice sources", () => {
    expect(WELCOME_ROOM_AUDIO_PROFILE.timeline?.musicStartMs).toBe(2000);
    expect(WELCOME_ROOM_AUDIO_PROFILE.timeline?.voiceStartMs).toBe(4000);
    expect(WELCOME_ROOM_AUDIO_PROFILE.voice?.greetingText).toBe(
      WELCOME_ROOM_GREETING_SPEECH,
    );
    expect(WELCOME_ROOM_AUDIO_PROFILE.ambience?.volume).toBeGreaterThanOrEqual(
      0.15,
    );
    expect(WELCOME_ROOM_AUDIO_PROFILE.voice?.fullWelcomeSrc).toBe(
      "/audio/welcome-room/welcome-letter-full.mp3",
    );
    expect(WELCOME_ROOM_AUDIO_PROFILE.voice?.playbackRate).toBe(0.93);
    expect(WELCOME_ROOM_AUDIO_PROFILE.ambience?.volume).toBeLessThanOrEqual(
      0.2,
    );
  });

  it("registers welcome-home profile with post-login welcome track", () => {
    expect(WELCOME_HOME_AUDIO_PROFILE.id).toBe("welcome-home");
    expect(WELCOME_HOME_AUDIO_PROFILE.voice?.fullWelcomeSrc).toBe(
      "/audio/Welcome%20to%20the%20Spark%20Estates.m4a",
    );
    expect(WELCOME_HOME_AUDIO_PROFILE.voice?.playbackRate).toBe(1);
    expect(WELCOME_HOME_AUDIO_PROFILE.ambience).toBeUndefined();
    expect(WELCOME_HOME_AUDIO_PROFILE.timeline?.voiceStartMs).toBe(0);
  });
});
