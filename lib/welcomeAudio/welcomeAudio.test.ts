import { describe, expect, it } from "vitest";
import { WELCOME_ROOM_GREETING_SPEECH } from "@/lib/welcomeRoom/content";
import { WELCOME_ROOM_AUDIO_PROFILE } from "./profiles";

describe("welcomeAudio profiles", () => {
  it("registers immersive timeline and cached voice sources", () => {
    expect(WELCOME_ROOM_AUDIO_PROFILE.timeline?.musicStartMs).toBe(0);
    expect(WELCOME_ROOM_AUDIO_PROFILE.timeline?.voiceStartMs).toBe(2500);
    expect(WELCOME_ROOM_AUDIO_PROFILE.voice?.greetingText).toBe(
      WELCOME_ROOM_GREETING_SPEECH,
    );
    expect(WELCOME_ROOM_AUDIO_PROFILE.ambience?.volume).toBeGreaterThanOrEqual(
      0.15,
    );
    expect(WELCOME_ROOM_AUDIO_PROFILE.voice?.fullWelcomeSrc).toBe(
      "/audio/welcome-room/welcome-letter-full.mp3",
    );
    expect(WELCOME_ROOM_AUDIO_PROFILE.ambience?.volume).toBeLessThanOrEqual(
      0.2,
    );
  });
});
