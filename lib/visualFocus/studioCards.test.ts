import { describe, expect, it } from "vitest";
import type { VisualFocusMode } from "./types";
import {
  VISUAL_FOCUS_STUDIO_CARDS,
  VISUAL_FOCUS_STUDIO_HERO,
  VISUAL_FOCUS_WORK_WITH_SHARI,
  getStudioCardByMode,
  visualThinkingToolHelpTips,
} from "./studioCards";

const MODES: VisualFocusMode[] = [
  "mind-map",
  "decision-tree",
  "strategy-map",
  "relationship-map",
  "project-map",
  "visual-kanban",
  "business-canvas",
];

describe("visualFocus studioCards", () => {
  it("defines complete teaching copy for every mode", () => {
    expect(VISUAL_FOCUS_STUDIO_CARDS).toHaveLength(MODES.length);
    for (const mode of MODES) {
      const card = getStudioCardByMode(mode);
      expect(card).toBeDefined();
      expect(card!.title.length).toBeGreaterThan(0);
      expect(card!.whatItIs.length).toBeGreaterThan(10);
      expect(card!.whenToUse.length).toBeGreaterThan(10);
      expect(card!.youWillReceive.length).toBeGreaterThan(3);
      expect(card!.bestFor.length).toBeGreaterThan(0);
      expect(card!.useWhen.length).toBeGreaterThan(2);
      expect(card!.whyItHelps.length).toBeGreaterThan(10);
      expect(card!.exampleLines.length).toBeGreaterThan(2);
      expect(card!.actionLabel.length).toBeGreaterThan(0);
      expect(card!.keywords.length).toBeGreaterThan(0);
      expect(card!.accent.borderTop).toMatch(/border-t-/);
    }
  });

  it("decision tree card distinguishes from Decision Compass", () => {
    const card = getStudioCardByMode("decision-tree");
    expect(card?.subtitle).toMatch(/what happens/i);
    expect(card?.boundaryNote).toMatch(/Decision Compass/i);
    expect(card?.actionLabel).toMatch(/path map/i);
  });

  it("visual kanban avoids Done column in example", () => {
    const card = getStudioCardByMode("visual-kanban");
    const joined = card!.exampleLines.join(" ").toLowerCase();
    expect(joined).not.toContain("done");
    expect(joined).toContain("ready to act");
  });

  it("hero shows always-visible micro-copy without accordion", () => {
    expect(VISUAL_FOCUS_STUDIO_HERO.tagline).toBe("Think visually, not linearly.");
    expect(VISUAL_FOCUS_STUDIO_HERO.microCopy).toMatch(/insights, recommendations, and next steps/i);
  });

  it("work with shari copy reduces decision fatigue", () => {
    expect(VISUAL_FOCUS_WORK_WITH_SHARI.headline).toMatch(/Not sure which one/i);
    expect(VISUAL_FOCUS_WORK_WITH_SHARI.body).toMatch(/recommend the best visual thinking approach/i);
  });

  it("help tips cover every studio tool plus Decision Compass distinction", () => {
    const tips = visualThinkingToolHelpTips();
    expect(tips.length).toBeGreaterThanOrEqual(VISUAL_FOCUS_STUDIO_CARDS.length + 1);
    for (const card of VISUAL_FOCUS_STUDIO_CARDS) {
      expect(tips.some((t) => t.startsWith(card.title))).toBe(true);
    }
    expect(tips.some((t) => /Decision Compass/i.test(t))).toBe(true);
    expect(tips.some((t) => /Continue Thinking/i.test(t))).toBe(true);
  });

  it("relationship map card matches outcome teaching pattern", () => {
    const card = getStudioCardByMode("relationship-map");
    expect(card?.whatItIs).toMatch(/influence one another/i);
    expect(card?.youWillReceive).toContain("Key connections");
    expect(card?.youWillReceive).toContain("Suggested next steps");
  });
});
