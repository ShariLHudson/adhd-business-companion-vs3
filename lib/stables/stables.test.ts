import { describe, expect, it } from "vitest";
import { ESTATE_ROOM_BG } from "@/lib/estate/estateRoomAssets";
import { listStablesExperiences } from "./stablesExperiences";
import { STABLES_INTERACTIVE_OBJECTS } from "./stablesInteractiveObjects";
import {
  shouldRecommendStables,
  scoreStablesRecommendation,
} from "./stablesRecommendations";
import { stablesRoomHintForChat } from "./stablesVoice";
import { isStablesSection, STABLES_ROOM_BG } from "./stablesRoomRegistry";

describe("The Stables™", () => {
  it("registers eight placeholder experiences", () => {
    expect(listStablesExperiences()).toHaveLength(8);
    expect(listStablesExperiences().every((e) => e.status === "placeholder")).toBe(
      true,
    );
  });

  it("defines six interactive object hooks (architecture only)", () => {
    expect(STABLES_INTERACTIVE_OBJECTS).toHaveLength(6);
    expect(
      STABLES_INTERACTIVE_OBJECTS.every((o) => o.status === "architecture-only"),
    ).toBe(true);
  });

  it("uses the existing stables background plate", () => {
    expect(STABLES_ROOM_BG).toBe(
      ESTATE_ROOM_BG.stables,
    );
    expect(isStablesSection("stables")).toBe(true);
  });

  it("recommends Stables for confidence and nervous signals", () => {
    expect(shouldRecommendStables("I'm nervous")).toBe(true);
    expect(scoreStablesRecommendation("I lack confidence")?.reason).toBe(
      "lack of confidence",
    );
    expect(shouldRecommendStables("I'm afraid to raise my prices")).toBe(true);
    expect(shouldRecommendStables("I don't trust myself")).toBe(true);
  });

  it("mandates slower reflective voice in chat hints", () => {
    const hint = stablesRoomHintForChat();
    expect(hint).toContain("Slower pace than Momentum Institute");
    expect(hint).toContain("Trust grows one small step at a time");
    expect(hint).toContain("horse training");
  });
});
