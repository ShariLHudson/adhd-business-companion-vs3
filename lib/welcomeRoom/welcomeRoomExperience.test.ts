import { describe, expect, it } from "vitest";
import {
  WELCOME_ROOM_GREETING_SPEECH,
  WELCOME_ROOM_LETTER,
  welcomeRoomLetterSpeechText,
  welcomeRoomWelcomeBodySpeechText,
} from "./content";
import {
  welcomeRoomArrivalPhase,
  welcomeRoomCinematicDollyProgress,
  welcomeRoomDollyFrame,
  welcomeRoomShowReadOffer,
  WELCOME_ROOM_CHAIR_VIEW,
  WELCOME_ROOM_DARK_MS,
  WELCOME_ROOM_ENTRANCE_VIEW,
  WELCOME_ROOM_INTRO_DOLLY_MS,
  WELCOME_ROOM_INVITE_DELAY_MS,
  WELCOME_ROOM_PLAY_MUSIC_START_MS,
  WELCOME_ROOM_PLAY_VOICE_START_MS,
  WELCOME_ROOM_REVEAL_MS,
  WELCOME_ROOM_WALK_TRANSFORM_ORIGIN,
} from "./arrival";
import { CHAT_NAVIGATION_INTENT } from "../navigation/chatDestination";

describe("Welcome Room experience", () => {
  it("starts music at 2s and voice at 4s after Step Inside", () => {
    expect(WELCOME_ROOM_GREETING_SPEECH).toMatch(/really glad you're here/i);
    expect(WELCOME_ROOM_PLAY_MUSIC_START_MS).toBe(2000);
    expect(WELCOME_ROOM_PLAY_VOICE_START_MS).toBe(4000);
  });

  it("is one continuous letter — no sections or FAQs", () => {
    expect(WELCOME_ROOM_LETTER.paragraphs.length).toBeGreaterThanOrEqual(6);
    const joined = welcomeRoomLetterSpeechText();
    expect(joined).toMatch(/trusted companion/i);
    expect(joined).toMatch(/Ecosystem/i);
  });

  it("walks in over ~72s once the room reveals — perimeter crops away", () => {
    expect(WELCOME_ROOM_INTRO_DOLLY_MS).toBeGreaterThanOrEqual(60000);
    expect(WELCOME_ROOM_INTRO_DOLLY_MS).toBeLessThanOrEqual(90000);
    expect(WELCOME_ROOM_ENTRANCE_VIEW.imageScale).toBe(1);
    expect(WELCOME_ROOM_ENTRANCE_VIEW.objectYPercent).toBeLessThanOrEqual(32);
    expect(WELCOME_ROOM_CHAIR_VIEW.imageScale).toBeGreaterThanOrEqual(1.75);
    expect(WELCOME_ROOM_CHAIR_VIEW.imageScale).toBeLessThanOrEqual(1.95);
    expect(
      welcomeRoomCinematicDollyProgress(WELCOME_ROOM_INTRO_DOLLY_MS / 2),
    ).toBeCloseTo(0.5, 2);
    const readyMs = WELCOME_ROOM_DARK_MS + WELCOME_ROOM_REVEAL_MS;
    expect(welcomeRoomArrivalPhase(readyMs, false, 0)).toBe("settled");
    expect(welcomeRoomArrivalPhase(readyMs + 500, false, 500)).toBe("walking");
    expect(
      welcomeRoomArrivalPhase(
        readyMs + WELCOME_ROOM_INTRO_DOLLY_MS,
        false,
        WELCOME_ROOM_INTRO_DOLLY_MS,
      ),
    ).toBe("settled");
    expect(
      welcomeRoomArrivalPhase(
        readyMs + 500,
        false,
        WELCOME_ROOM_INTRO_DOLLY_MS / 2,
      ),
    ).toBe("walking");

    const start = welcomeRoomDollyFrame(0);
    const end = welcomeRoomDollyFrame(1);

    expect(start.objectFit).toBe("cover");
    expect(end.objectFit).toBe("cover");
    expect(start.imageScale).toBe(1);
    expect(end.imageScale).toBe(WELCOME_ROOM_CHAIR_VIEW.imageScale);
    expect(start.imageScale).toBeLessThan(end.imageScale);
    expect(start.translateXPercent).toBe(0);
    expect(end.translateXPercent).toBe(-12);
    expect(start.transformOrigin).toBe(WELCOME_ROOM_WALK_TRANSFORM_ORIGIN);
    expect(start.imageTransform).toContain("scale(1)");
    expect(end.imageTransform).toContain("scale(1.85)");
    expect(end.imageTransform).toContain("translate3d(-12%");
    expect(start.objectPosition).toBe("50% 30%");
    expect(end.objectPosition).toBe("72% 48%");
  });

  it("does not repeat the greeting line at the start of the body audio", () => {
    const body = welcomeRoomWelcomeBodySpeechText();
    expect(body).not.toMatch(/^Welcome\./m);
    expect(body).not.toMatch(/^I'm really glad you're here\./m);
    expect(body).toMatch(/^Before we do anything else/m);
    expect(WELCOME_ROOM_GREETING_SPEECH).toMatch(/really glad you're here/i);
  });

  it("offers reading after the visitor has absorbed the room", () => {
    expect(welcomeRoomShowReadOffer(WELCOME_ROOM_INVITE_DELAY_MS - 1, false)).toBe(
      false,
    );
    expect(welcomeRoomShowReadOffer(WELCOME_ROOM_INVITE_DELAY_MS, false)).toBe(
      true,
    );
  });
});

describe("Chat navigation destination", () => {
  it("declares highest-priority full reset to main conversation", () => {
    expect(CHAT_NAVIGATION_INTENT.activeNav).toBe("chat");
    expect(CHAT_NAVIGATION_INTENT.clearWelcomeRoom).toBe(true);
  });
});
