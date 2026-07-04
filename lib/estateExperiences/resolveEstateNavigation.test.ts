import { describe, expect, it } from "vitest";
import {
  formatEstateNavigationChoiceMenu,
  resolveEstateNavigationDisambiguation,
  resolveEstateNavigationDiscovery,
  parseEstateNavigationChoiceReply,
} from "./resolveEstateNavigation";

describe("resolveEstateNavigation", () => {
  it("offers three experiences for vague business intent", () => {
    const d = resolveEstateNavigationDisambiguation(
      "I need to work on my business",
    );
    expect(d?.confidence).toBe("medium");
    expect(d?.choices.map((c) => c.experienceId)).toEqual([
      "momentum",
      "create",
      "business",
    ]);
    const menu = formatEstateNavigationChoiceMenu(d!);
    expect(menu).toMatch(/Which feels right today/i);
    expect(menu).toMatch(/Momentum/);
    expect(menu).toMatch(/Create/);
    expect(menu).toMatch(/Boardroom/);
  });

  it("discovers collaboratively when member is lost", () => {
    const d = resolveEstateNavigationDiscovery("I don't know where to start");
    expect(d?.confidence).toBe("low");
    expect(d?.intro).toMatch(/figure it out together/i);
    expect(d?.question).toMatch(/making something new/i);
  });

  it("parses numbered and named replies to medium menus", () => {
    const d = resolveEstateNavigationDisambiguation("work on my business")!;
    expect(parseEstateNavigationChoiceReply("2", d.choices)?.experienceId).toBe(
      "create",
    );
    expect(
      parseEstateNavigationChoiceReply("momentum", d.choices)?.experienceId,
    ).toBe("momentum");
  });
});
