import { describe, expect, it } from "vitest";
import {
  WELCOME_ROOM_GREETING_SPEECH,
  WELCOME_ROOM_LETTER,
  welcomeRoomWelcomeBodySpeechText,
} from "./content";
import {
  welcomeRoomArrivalPhase,
  welcomeRoomCinematicDollyProgress,
  welcomeRoomDollyFrame,
  welcomeRoomDollyProgress,
  welcomeRoomShowReadOffer,
  WELCOME_ROOM_CHAIR_VIEW,
  WELCOME_ROOM_DARK_MS,
  WELCOME_ROOM_INTRO_DOLLY_MS,
  WELCOME_ROOM_ENTRANCE_VIEW,
  WELCOME_ROOM_PLAY_MUSIC_START_MS,
  WELCOME_ROOM_PLAY_VOICE_START_MS,
  WELCOME_ROOM_INVITE_DELAY_MS,
  WELCOME_ROOM_REVEAL_MS,
} from "./arrival";
import { CHAT_NAVIGATION_INTENT } from "../navigation/chatDestination";

describe("Welcome Room experience", () => {
  it("starts music on Play and voice ~2.5s later", () => {
    expect(WELCOME_ROOM_GREETING_SPEECH).toMatch(/really glad you're here/i);
    expect(WELCOME_ROOM_PLAY_MUSIC_START_MS).toBe(0);
    expect(WELCOME_ROOM_PLAY_VOICE_START_MS).toBe(2500);
  });

  it("is one continuous letter — no sections or FAQs", () => {
    expect(WELCOME_ROOM_LETTER.paragraphs.length).toBeGreaterThanOrEqual(6);
    const joined = WELCOME_ROOM_LETTER.paragraphs.join(" ");
    expect(joined).toMatch(/walking beside me/i);
  });

  it("walks forward in ~6s — doorway to chair, not a long zoom", () => {
    expect(WELCOME_ROOM_INTRO_DOLLY_MS).toBeGreaterThanOrEqual(4500);
    expect(WELCOME_ROOM_INTRO_DOLLY_MS).toBeLessThanOrEqual(8000);
    expect(WELCOME_ROOM_ENTRANCE_VIEW.translateZ).toBeLessThanOrEqual(-300);
    expect(WELCOME_ROOM_ENTRANCE_VIEW.translateZ).toBeGreaterThanOrEqual(-450);
    expect(WELCOME_ROOM_ENTRANCE_VIEW.objectYPercent).toBeLessThan(
      WELCOME_ROOM_CHAIR_VIEW.objectYPercent,
    );
    expect(
      welcomeRoomCinematicDollyProgress(WELCOME_ROOM_INTRO_DOLLY_MS / 2),
    ).toBeCloseTo(0.5, 2);
    expect(
      welcomeRoomArrivalPhase(
        WELCOME_ROOM_DARK_MS + WELCOME_ROOM_REVEAL_MS + 100,
        false,
        WELCOME_ROOM_INTRO_DOLLY_MS,
      ),
    ).toBe("settled");
    expect(
      welcomeRoomArrivalPhase(
        WELCOME_ROOM_DARK_MS + WELCOME_ROOM_REVEAL_MS + 100,
        false,
        WELCOME_ROOM_INTRO_DOLLY_MS / 2,
      ),
    ).toBe("walking");
    const start = welcomeRoomDollyFrame(0);
    const end = welcomeRoomDollyFrame(1);
    expect(start.translateZ).toBe(WELCOME_ROOM_ENTRANCE_VIEW.translateZ);
    expect(end.translateZ).toBe(WELCOME_ROOM_CHAIR_VIEW.translateZ);
    expect(start.photoScale).toBeGreaterThan(end.photoScale);
    expect(welcomeRoomDollyProgress(WELCOME_ROOM_DARK_MS)).toBe(0);
  });

  it("does not repeat the greeting line at the start of the body audio", () => {
    const body = welcomeRoomWelcomeBodySpeechText();
    expect(body).not.toMatch(/^Welcome\./m);
    expect(body).not.toMatch(/^I'm really glad you're here\./m);
    expect(body).toMatch(/^Before we jump into anything/m);
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
