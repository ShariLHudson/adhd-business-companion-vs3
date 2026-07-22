import { describe, expect, it, beforeEach } from "vitest";
import {
  linkWorkRelationship,
  resetWorkRelationshipsForTests,
} from "@/lib/universalWorkEngine";
import { summarizeRelatedProjectWork } from "./projectRelatedWork";

describe("summarizeRelatedProjectWork (141)", () => {
  beforeEach(() => {
    resetWorkRelationshipsForTests();
  });

  it("returns empty when no project id", () => {
    const s = summarizeRelatedProjectWork(null);
    expect(s.hasAny).toBe(false);
    expect(s.workTitles).toEqual([]);
  });

  it("surfaces Work and maps from trusted project edges — not invented titles", () => {
    linkWorkRelationship({
      fromWorkId: "work-related-1",
      toRef: { kind: "project", id: "proj-related" },
      relationship: "part_of",
      edgeSource: "creation_flow_lineage",
      note: "Project connection",
    });
    linkWorkRelationship({
      fromWorkId: "work-related-1",
      toRef: { kind: "cartography_node", id: "map-node-1" },
      relationship: "visualizes",
      edgeSource: "creation_flow_lineage",
      note: "Launch map",
    });
    linkWorkRelationship({
      fromWorkId: "work-related-1",
      toRef: { kind: "win", id: "win-1" },
      relationship: "related_to",
      edgeSource: "explicit_user_link",
      note: "First client yes",
    });

    const s = summarizeRelatedProjectWork("proj-related");
    expect(s.workTitles.length).toBeGreaterThan(0);
    expect(s.mapTitles).toContain("Launch map");
    expect(s.winTitles).toContain("First client yes");
    expect(s.hasAny).toBe(true);

    // Unrelated project must not inherit invented edges
    const other = summarizeRelatedProjectWork("proj-other");
    expect(other.workTitles).toEqual([]);
    expect(other.mapTitles).toEqual([]);
  });
});
