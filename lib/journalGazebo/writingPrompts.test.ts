import { describe, expect, it } from "vitest";
import { pickJournalPageTip, pickJournalWritingPrompt } from "./writingPrompts";

describe("writingPrompts by intention", () => {
  const day = new Date(2026, 6, 14);

  it("returns journey prompts by default", () => {
    const tip = pickJournalPageTip(8, day);
    expect(tip.length).toBeGreaterThan(8);
    expect(tip).not.toMatch(/prayer|God|Scripture/i);
  });

  it("returns prayer-shaped questions for prayer journals", () => {
    const tip = pickJournalPageTip(0, day, "prayer");
    expect(tip).toMatch(/prayer|peace|heart|God|faith|mercy|Scripture|listening|forgiveness|hope|courage|intercession|surrender|thankful/i);
  });

  it("returns gratitude-shaped questions for gratitude journals", () => {
    const tip = pickJournalPageTip(2, day, "gratitude");
    expect(tip).toMatch(/grateful|smile|gift|kind|glad|beauty|thank|heart|comfort|abundance|pleasure|lighter/i);
  });

  it("day prompt respects intention", () => {
    const prayer = pickJournalWritingPrompt(day, "prayer");
    const health = pickJournalWritingPrompt(day, "health");
    expect(prayer).not.toBe(health);
  });
});
