import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  SUPPORT_EXPERIENCES,
  TAKE_A_QUIET_MOMENT_BG,
  QUICK_RECHARGE_BG,
  PRIORITIZE_MY_OPTIONS_BG,
  BREAK_IT_INTO_SMALLER_PIECES_BG,
  FIRST_STEP_FINDER_BG,
  FOCUS_LIBRARY_BG,
  FIRST_STEP_FINDER_ACTIVITY_ID,
  BREAK_IT_INTO_SMALLER_PIECES_ACTIVITY_ID,
  PRIORITIZE_MY_OPTIONS_ACTIVITY_ID,
  supportExperienceById,
  supportExperienceBackground,
  focusWorkflowBackgroundOverride,
} from "@/lib/supportExperiences/supportExperienceRegistry";
import { MOMENTUM_GAMES_ROOM_BG } from "@/lib/momentumGames/momentumGamesRoom";
import { FOCUS_LIBRARY_ROOM_BG } from "@/lib/focusLibrary/focusLibraryRoom";

function publicPathFromUrl(url: string): string {
  return join(process.cwd(), "public", url.replace(/^\//, ""));
}

describe("supportExperienceRegistry", () => {
  it("keeps exactly the six support experiences — none merged or removed", () => {
    const ids = SUPPORT_EXPERIENCES.map((e) => e.id).sort();
    expect(ids).toEqual(
      [
        "break-it-into-smaller-pieces",
        "first-step-finder",
        "focus-library",
        "prioritize-my-options",
        "quick-recharge",
        "take-a-quiet-moment",
      ].sort(),
    );
    expect(SUPPORT_EXPERIENCES.every((e) => e.isActive)).toBe(true);
  });

  it("assigns the exact background plate specified per experience", () => {
    expect(TAKE_A_QUIET_MOMENT_BG).toBe("/backgrounds/swing-background.png");
    expect(QUICK_RECHARGE_BG).toBe("/backgrounds/game-room-background.png");
    expect(PRIORITIZE_MY_OPTIONS_BG).toBe(
      "/backgrounds/creative-studio-background.png",
    );
    expect(BREAK_IT_INTO_SMALLER_PIECES_BG).toBe(
      "/backgrounds/greenhouse-background.png",
    );
    expect(FIRST_STEP_FINDER_BG).toBe(
      "/backgrounds/horizon-point-background.png",
    );
    expect(FOCUS_LIBRARY_BG).toBe("/backgrounds/tea-room-background.webp");

    for (const experience of SUPPORT_EXPERIENCES) {
      expect(supportExperienceBackground(experience.id)).toBe(
        experience.background,
      );
    }
  });

  it("every experience background plate is a distinct image (no shared/inherited scene)", () => {
    const backgrounds = SUPPORT_EXPERIENCES.map((e) => e.background);
    expect(new Set(backgrounds).size).toBe(backgrounds.length);
  });

  it("ships every background plate under public/backgrounds/", () => {
    for (const experience of SUPPORT_EXPERIENCES) {
      expect(existsSync(publicPathFromUrl(experience.background))).toBe(true);
    }
  });

  it("resolves experiences by id", () => {
    const quietMoment = supportExperienceById("take-a-quiet-moment");
    expect(quietMoment?.name).toBe("Take a Quiet Moment");
    expect(quietMoment?.background).toBe(TAKE_A_QUIET_MOMENT_BG);
    expect(supportExperienceById("focus-library")?.background).toBe(
      FOCUS_LIBRARY_BG,
    );
  });

  it("carries outcome-focused copy from the prompt (not generic filler)", () => {
    const byId = new Map(SUPPORT_EXPERIENCES.map((e) => [e.id, e.description]));
    expect(byId.get("take-a-quiet-moment")).toBe(
      "Pause, reduce stimulation, and give your mind a little space.",
    );
    expect(byId.get("quick-recharge")).toBe(
      "Refresh your attention with a short, energizing reset.",
    );
    expect(byId.get("prioritize-my-options")).toBe(
      "Sort what matters most and choose what deserves attention first.",
    );
    expect(byId.get("break-it-into-smaller-pieces")).toBe(
      "Turn something too big into smaller, doable steps.",
    );
    expect(byId.get("first-step-finder")).toBe(
      "Find the smallest useful place to begin.",
    );
    expect(byId.get("focus-library")).toBe(
      "Choose music, sounds, guided focus, timers, or saved favorites.",
    );
  });

  describe("focusWorkflowBackgroundOverride — distinction from Focus My Brain conservatory", () => {
    it("overrides the background for First Step Finder, Break It Into Smaller Pieces, and Prioritize My Options", () => {
      expect(
        focusWorkflowBackgroundOverride("focus", FIRST_STEP_FINDER_ACTIVITY_ID),
      ).toBe(FIRST_STEP_FINDER_BG);
      expect(
        focusWorkflowBackgroundOverride(
          "focus",
          BREAK_IT_INTO_SMALLER_PIECES_ACTIVITY_ID,
        ),
      ).toBe(BREAK_IT_INTO_SMALLER_PIECES_BG);
      expect(
        focusWorkflowBackgroundOverride(
          "guided-exercises",
          PRIORITIZE_MY_OPTIONS_ACTIVITY_ID,
        ),
      ).toBe(PRIORITIZE_MY_OPTIONS_BG);
    });

    it("overrides to the Take a Quiet Moment scene when guided-exercises has no activity chosen yet", () => {
      expect(focusWorkflowBackgroundOverride("guided-exercises", null)).toBe(
        TAKE_A_QUIET_MOMENT_BG,
      );
      expect(
        focusWorkflowBackgroundOverride("guided-exercises", undefined),
      ).toBe(TAKE_A_QUIET_MOMENT_BG);
    });

    it("returns null for every other Focus My Brain activity — conservatory video keeps its identity elsewhere", () => {
      expect(focusWorkflowBackgroundOverride("focus", "decision-compass")).toBe(
        null,
      );
      expect(focusWorkflowBackgroundOverride("focus", null)).toBe(null);
      expect(focusWorkflowBackgroundOverride("focus", undefined)).toBe(null);
    });
  });

  it("Quick Recharge room background resolves to the registry plate (game room, not Peaceful Places)", () => {
    expect(MOMENTUM_GAMES_ROOM_BG).toBe(QUICK_RECHARGE_BG);
  });

  it("Focus Library room background resolves to the registry plate (tea room, not conservatory)", () => {
    expect(FOCUS_LIBRARY_ROOM_BG).toBe(FOCUS_LIBRARY_BG);
    expect(FOCUS_LIBRARY_ROOM_BG).not.toBe(QUICK_RECHARGE_BG);
    expect(FOCUS_LIBRARY_ROOM_BG).not.toBe(TAKE_A_QUIET_MOMENT_BG);
  });
});
