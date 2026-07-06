import { describe, expect, it } from "vitest";

import { FounderFlameService, getFlameMentorOverview } from "./flame/services";
import { pickFlamePanels } from "./flame/sample/mentorData";

describe("FLAME Executive Mentor", () => {
  it("FounderFlameService returns mentor voice sample data", () => {
    expect(FounderFlameService.getMorningMessage().text.length).toBeGreaterThan(20);
    expect(FounderFlameService.getExecutiveObservation().category).toBeTruthy();
    expect(FounderFlameService.getEncouragement().text.length).toBeGreaterThan(10);
    expect(FounderFlameService.getChallenge().text.length).toBeGreaterThan(10);
    expect(FounderFlameService.getSuggestedQuestion().question.endsWith("?")).toBe(true);
    expect(FounderFlameService.getWeeklyReflection().wins.length).toBeGreaterThan(0);
  });

  it("getFlameMentorOverview assembles panels and morning message", () => {
    const overview = getFlameMentorOverview();
    expect(overview.panels.length).toBe(4);
    expect(overview.panels.map((p) => p.kind).sort().join(",")).toBe(
      "encouragement,long-term,perspective,question",
    );
    expect(overview.morningMessage.text).not.toMatch(/great job|you got this/i);
  });

  it("pickFlamePanels rotates through sample mentor panels", () => {
    const panels = pickFlamePanels(new Date("2026-07-06"));
    expect(panels).toHaveLength(4);
    const again = pickFlamePanels(new Date("2026-07-06"));
    expect(again[0]?.id).toBe(panels[0]?.id);
  });
});
