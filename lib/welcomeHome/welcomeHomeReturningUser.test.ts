import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { evaluateWelcomeHomeExperience } from "@/lib/sparkExperienceEngine/evaluateWelcomeHomeExperience";
import {
  welcomeRoomDollyFrame,
  welcomeRoomRevealOpacitiesAt,
  WELCOME_ROOM_ENTRANCE_VIEW,
  WELCOME_ROOM_READY_ELAPSED_MS,
} from "@/lib/welcomeRoom/arrival";
import {
  WELCOME_HOME_BACKGROUND,
  WELCOME_ROOM_ASSET,
} from "@/lib/welcomeRoom/types";

/** Mirrors WelcomeHomeFirstLaunch arrival wiring. */
function welcomeHomeWalkPaused(
  firstVisitCinematic: boolean,
  introWalkPaused: boolean,
): boolean {
  return firstVisitCinematic ? introWalkPaused : false;
}

describe("Welcome Home first-visit cinematic — camera dolly", () => {
  it("starts at the widest entrance frame before walk-in", () => {
    const entrance = welcomeRoomDollyFrame(0);
    expect(entrance.imageScale).toBe(WELCOME_ROOM_ENTRANCE_VIEW.imageScale);
    expect(entrance.imageScale).toBe(1);
  });

  it("first-visit intro uses walkPaused (not frozen) to hold wide frame until audio", () => {
    const plan = evaluateWelcomeHomeExperience({ hasSeenWelcomeIntro: false });
    const firstVisitCinematic =
      plan.showIntro &&
      (plan.visitorKind === "first_visit" || plan.visitorKind === "replay");
    expect(firstVisitCinematic).toBe(true);
    expect(welcomeHomeWalkPaused(firstVisitCinematic, true)).toBe(true);
    expect(welcomeHomeWalkPaused(firstVisitCinematic, false)).toBe(false);
  });
});

describe("Welcome Home returning user — arrival visibility", () => {
  it("skipIntro + frozen at t=0 keeps fadeOpacity 1 and darkOpacity 0", () => {
    const { fadeOpacity, darkOpacity } = welcomeRoomRevealOpacitiesAt(0, true);
    expect(fadeOpacity).toBe(1);
    expect(darkOpacity).toBe(0);
  });

  it("skipIntro + frozen at settled elapsed keeps room fully visible", () => {
    const { fadeOpacity, darkOpacity } = welcomeRoomRevealOpacitiesAt(
      WELCOME_ROOM_READY_ELAPSED_MS,
      true,
    );
    expect(fadeOpacity).toBe(1);
    expect(darkOpacity).toBe(0);
  });

  it("without skipIntro at t=0 stays in dark hold (regression guard)", () => {
    const { fadeOpacity, darkOpacity } = welcomeRoomRevealOpacitiesAt(0, false);
    expect(fadeOpacity).toBe(0);
    expect(darkOpacity).toBe(1);
  });
});

describe("Welcome Home returning user — experience integration", () => {
  it("hasSeenWelcomeIntro true yields returning visitor without intro", () => {
    const plan = evaluateWelcomeHomeExperience({ hasSeenWelcomeIntro: true });
    expect(plan.visitorKind).toBe("returning");
    expect(plan.showIntro).toBe(false);
  });

  it("returning user does not pause walk-in (settled background immediately)", () => {
    const plan = evaluateWelcomeHomeExperience({ hasSeenWelcomeIntro: true });
    const firstVisitCinematic =
      plan.showIntro &&
      (plan.visitorKind === "first_visit" || plan.visitorKind === "replay");
    expect(firstVisitCinematic).toBe(false);
    expect(welcomeHomeWalkPaused(firstVisitCinematic, true)).toBe(false);
  });

  it("hero asset points at welcome-home-background", () => {
    expect(WELCOME_ROOM_ASSET).toBe(WELCOME_HOME_BACKGROUND);
    expect(WELCOME_ROOM_ASSET).toMatch(/welcome-home-background\.png/);
  });

  it("welcome-home-background.png exists in public/backgrounds (deploy asset gate)", () => {
    const assetPath = path.join(
      process.cwd(),
      "public",
      "backgrounds",
      "welcome-home-background.png",
    );
    expect(existsSync(assetPath)).toBe(true);
  });
});
