import { describe, expect, it } from "vitest";
import { resolveEstateRoomTemplate } from "./resolveEstateRoomTemplate";

describe("resolveEstateRoomTemplate", () => {
  it("resolves evidence vault welcome and empty state", () => {
    const template = resolveEstateRoomTemplate("evidence-vault");
    expect(template.hero.title).toContain("Evidence Vault");
    expect(template.welcome.shariLine).toMatch(/story of your journey/i);
    expect(template.emptyState.headline).toMatch(/waiting to tell your story/i);
  });

  it("resolves greenhouse welcome, hero, and empty state", () => {
    const template = resolveEstateRoomTemplate("greenhouse");
    expect(template.hero.subtitle).toMatch(/tiny seed of an idea/i);
    expect(template.welcome.shariLine).toBe("Welcome.");
    expect(template.welcome.shariParagraphs?.length).toBeGreaterThanOrEqual(3);
    expect(template.emptyState.headline).toMatch(/waiting to tell your story/i);
  });

  it("falls back to arrival experience greeting for apple orchard", () => {
    const template = resolveEstateRoomTemplate("apple-orchard");
    expect(template.welcome.shariLine).toMatch(/slow down/i);
    expect(template.hero.title).toContain("Apple Orchard");
  });
});
