import { describe, expect, it } from "vitest";
import {
  EXPERIENCE_PRESENCE_MAP,
  evaluateCompanionPresenceEngine,
  experienceForPlace,
  experienceForSection,
  legacyPresenceMatchesEngine,
  PRESENCE_LEVEL_META,
} from "./companionPresenceEngine";

describe("Companion Presence Engine", () => {
  it("defines five presence levels", () => {
    expect(PRESENCE_LEVEL_META[5].name).toBe("Fully Present");
    expect(PRESENCE_LEVEL_META[1].name).toBe("Invisible");
  });

  it("maps Living Room and Main Chat to level 5", () => {
    const living = evaluateCompanionPresenceEngine({ experienceId: "living-room" });
    const chat = evaluateCompanionPresenceEngine({ experienceId: "main-chat" });
    expect(living.level).toBe(5);
    expect(living.showShariImage).toBe(true);
    expect(chat.conversationPrimary).toBe(true);
  });

  it("maps Window Seat to level 2 with evidence, no Shari image", () => {
    const presence = evaluateCompanionPresenceEngine({ experienceId: "window-seat" });
    expect(presence.level).toBe(2);
    expect(presence.showShariImage).toBe(false);
    expect(presence.evidenceObjects).toContain("handwritten note");
    expect(presence.evidenceObjects).toContain("tea");
  });

  it("drops Clear My Mind to level 1 when writing is active", () => {
    const arrival = evaluateCompanionPresenceEngine({ experienceId: "clear-my-mind" });
    const writing = evaluateCompanionPresenceEngine({
      experienceId: "clear-my-mind",
      modifiers: ["writing-active"],
    });
    expect(arrival.level).toBe(2);
    expect(writing.level).toBe(1);
    expect(writing.showShariImage).toBe(false);
  });

  it("maps Focus Audio and Breathing to level 1", () => {
    expect(evaluateCompanionPresenceEngine({ experienceId: "focus-audio" }).level).toBe(
      1,
    );
    expect(evaluateCompanionPresenceEngine({ experienceId: "breathing" }).level).toBe(1);
    expect(evaluateCompanionPresenceEngine({ experienceId: "games" }).level).toBe(1);
  });

  it("maps Plan My Day and Focus Buddy to level 4", () => {
    expect(evaluateCompanionPresenceEngine({ experienceId: "plan-my-day" }).level).toBe(
      4,
    );
    expect(evaluateCompanionPresenceEngine({ experienceId: "focus-buddy" }).level).toBe(
      4,
    );
    expect(
      evaluateCompanionPresenceEngine({ experienceId: "focus-buddy" })
        .allowAmbientPresenceMotion,
    ).toBe(true);
  });

  it("elevates Business Office for strategy discussion", () => {
    const work = evaluateCompanionPresenceEngine({ experienceId: "business-office" });
    const strategy = evaluateCompanionPresenceEngine({
      experienceId: "business-office",
      modifiers: ["strategy-discussion"],
    });
    expect(work.level).toBe(3);
    expect(strategy.level).toBe(4);
  });

  it("resolves from app section", () => {
    expect(experienceForSection("brain-dump")).toBe("clear-my-mind");
    expect(experienceForSection("plan-my-day")).toBe("plan-my-day");
    expect(experienceForPlace("window-seat")).toBe("window-seat");
  });

  it("answers the host question in plain language", () => {
    const garden = evaluateCompanionPresenceEngine({ experienceId: "garden" });
    expect(garden.hostQuestion).toMatch(/naturally stay/i);
    expect(garden.hostDecision).toMatch(/prepared the room/i);
  });

  it("covers every mapped experience in the presence map", () => {
    expect(EXPERIENCE_PRESENCE_MAP.length).toBeGreaterThanOrEqual(20);
    for (const rule of EXPERIENCE_PRESENCE_MAP) {
      const resolved = evaluateCompanionPresenceEngine({ experienceId: rule.id });
      expect(resolved.level).toBe(rule.level);
    }
  });

  it("legacy place presence roughly aligns with engine", () => {
    expect(legacyPresenceMatchesEngine("living-room")).toBe(true);
    expect(legacyPresenceMatchesEngine("focus-studio")).toBe(true);
  });
});
