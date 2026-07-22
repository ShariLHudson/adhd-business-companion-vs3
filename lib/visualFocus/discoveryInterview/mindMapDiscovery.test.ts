import { describe, expect, it } from "vitest";
import {
  buildMindMapDraftFromDiscovery,
  parseIdeaLines,
  MIND_MAP_DISCOVERY_QUESTIONS,
  dedupeIdeas,
} from "./mindMapDiscovery";
import { createVisualFocusMap } from "../templates";
import { CARTOGRAPHERS_FRAMED_MAPS } from "@/lib/cartographersStudio/framedMaps";
import {
  addChildNode,
  reparentNode,
  renameNode,
  setNodeNote,
  disconnectToRoot,
} from "../mindMapEditing";
import {
  createMindMapHistory,
  pushMindMapHistory,
  undoMindMapHistory,
  redoMindMapHistory,
  canUndo,
  canRedo,
} from "../mindMapHistory";

describe("Mind Map Discovery Interview", () => {
  it("asks Mind Map Discovery questions from 242", () => {
    expect(MIND_MAP_DISCOVERY_QUESTIONS.map((q) => q.id)).toEqual([
      "main-topic",
      "everything",
      "desired-outcome",
    ]);
  });

  it("opens with the mind-map-about question (map already selected)", () => {
    expect(MIND_MAP_DISCOVERY_QUESTIONS[0]?.prompt).toBe(
      "What would you like to create a mind map about?",
    );
  });

  it("uses 242 example prompts for ideas and end goal", () => {
    expect(MIND_MAP_DISCOVERY_QUESTIONS[1]?.prompt).toBe(
      "What ideas immediately come to mind?",
    );
    expect(MIND_MAP_DISCOVERY_QUESTIONS[2]?.prompt).toBe("Is there an end goal?");
  });

  it("parses pasted lists into idea lines", () => {
    expect(
      parseIdeaLines("Audience\nPricing\n• Marketing\n- Follow up"),
    ).toEqual(["Audience", "Pricing", "Marketing", "Follow up"]);
  });

  it("dedupes near-duplicate ideas", () => {
    const { unique, duplicates } = dedupeIdeas([
      "Email marketing",
      "email marketing campaign",
      "Pricing",
    ]);
    expect(unique.length).toBe(2);
    expect(duplicates.length).toBeGreaterThanOrEqual(1);
  });

  it("builds a first draft with grouping explanation — never blank", () => {
    const draft = buildMindMapDraftFromDiscovery({
      topic: "Launch Workshop",
      everything:
        "Audience research\nPricing tiers\nMarketing emails\nCourse content\nOpen questions about timing\nemail marketing",
      anythingElse: "Need a follow-up sequence",
    });

    expect(draft.title).toBe("Launch Workshop");
    expect(draft.root.label).toBe("Launch Workshop");
    expect(draft.root.children.length).toBeGreaterThanOrEqual(2);
    expect(draft.explanation).toMatch(/centered the map/i);
    expect(draft.explanation.length).toBeGreaterThan(40);
  });

  it("createVisualFocusMap stores discovery interview, explanation, and draft tree", () => {
    const map = createVisualFocusMap("mind-map", {
      mindMapDiscovery: {
        topic: "Grow revenue",
        everything: "Content, leads, pricing, partnerships",
      },
    });

    expect(map.mode).toBe("mind-map");
    expect(map.title).toBe("Grow revenue");
    expect(map.discoveryInterview?.mapKind).toBe("mind-map");
    expect(map.draftExplanation).toBeTruthy();
    expect(map.root.children.length).toBeGreaterThan(0);
  });
});

describe("Mind Map editing + history", () => {
  it("supports rename, notes, reparent, disconnect, undo/redo", () => {
    const map = createVisualFocusMap("mind-map", {
      mindMapDiscovery: {
        topic: "Center",
        everything: "Alpha\nBeta\nGamma",
      },
    });
    let root = map.root;
    const childId = root.children[0]!.id;
    root = renameNode(root, childId, "Renamed");
    root = setNodeNote(root, childId, "A note");
    root = addChildNode(root, root.id, "Delta");
    const delta = root.children.find((c) => c.label === "Delta")!;
    root = reparentNode(root, delta.id, childId);
    expect(root.children.find((c) => c.id === childId)?.children.some((c) => c.id === delta.id)).toBe(
      true,
    );
    root = disconnectToRoot(root, delta.id);
    expect(root.children.some((c) => c.id === delta.id)).toBe(true);

    let history = createMindMapHistory(map.root);
    history = pushMindMapHistory(history, root);
    expect(canUndo(history)).toBe(true);
    history = undoMindMapHistory(history);
    expect(history.present.label).toBe("Center");
    expect(canRedo(history)).toBe(true);
    history = redoMindMapHistory(history);
    expect(history.present.children.some((c) => c.id === delta.id)).toBe(true);
  });
});

describe("Cartographer framed maps", () => {
  it("exposes ten wall maps, all interactive after guided-builder cartography", () => {
    expect(CARTOGRAPHERS_FRAMED_MAPS).toHaveLength(10);
    const live = CARTOGRAPHERS_FRAMED_MAPS.filter((m) => m.interactive);
    expect(live).toHaveLength(10);
    expect(live.map((m) => m.id)).toContain("mind-map");
    expect(live.map((m) => m.id)).toContain("system-map");
    expect(live.map((m) => m.id)).not.toContain("project-map");
  });
});
