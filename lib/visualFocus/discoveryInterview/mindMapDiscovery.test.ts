import { describe, expect, it } from "vitest";
import {
  buildMindMapDraftFromDiscovery,
  parseIdeaLines,
  MIND_MAP_DISCOVERY_QUESTIONS,
} from "./mindMapDiscovery";
import { createVisualFocusMap } from "../templates";
import { CARTOGRAPHERS_FRAMED_MAPS } from "@/lib/cartographersStudio/framedMaps";

describe("Mind Map Discovery Interview", () => {
  it("asks the three Mind Map questions from 199", () => {
    expect(MIND_MAP_DISCOVERY_QUESTIONS.map((q) => q.id)).toEqual([
      "main-topic",
      "everything",
      "anything-else",
    ]);
  });

  it("parses pasted lists into idea lines", () => {
    expect(
      parseIdeaLines("Audience\nPricing\n• Marketing\n- Follow up"),
    ).toEqual(["Audience", "Pricing", "Marketing", "Follow up"]);
  });

  it("builds a first draft with grouped branches — never blank", () => {
    const draft = buildMindMapDraftFromDiscovery({
      topic: "Launch Workshop",
      everything:
        "Audience research\nPricing tiers\nMarketing emails\nCourse content\nOpen questions about timing",
      anythingElse: "Need a follow-up sequence",
    });

    expect(draft.title).toBe("Launch Workshop");
    expect(draft.root.label).toBe("Launch Workshop");
    expect(draft.root.children.length).toBeGreaterThanOrEqual(2);
    const labels = draft.root.children.map((c) => c.label);
    expect(labels.some((l) => /Audience|Offer|Marketing|More ideas|Next/i.test(l))).toBe(
      true,
    );
  });

  it("createVisualFocusMap stores discovery interview and draft tree", () => {
    const map = createVisualFocusMap("mind-map", {
      mindMapDiscovery: {
        topic: "Grow revenue",
        everything: "Content, leads, pricing, partnerships",
      },
    });

    expect(map.mode).toBe("mind-map");
    expect(map.title).toBe("Grow revenue");
    expect(map.discoveryInterview?.mapKind).toBe("mind-map");
    expect(map.discoveryInterview?.answers).toHaveLength(3);
    expect(map.root.children.length).toBeGreaterThan(0);
    expect(map.root.label).toBe("Grow revenue");
  });
});

describe("Cartographer framed maps", () => {
  it("exposes ten wall maps with only Mind Map interactive", () => {
    expect(CARTOGRAPHERS_FRAMED_MAPS).toHaveLength(10);
    const live = CARTOGRAPHERS_FRAMED_MAPS.filter((m) => m.interactive);
    expect(live).toHaveLength(1);
    expect(live[0]?.id).toBe("mind-map");
    expect(live[0]?.visualFocusMode).toBe("mind-map");
  });
});
