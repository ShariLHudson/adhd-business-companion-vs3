import { describe, expect, it } from "vitest";
import {
  RELATIONSHIP_GRAPH_PARTICIPATION,
  countByParticipationStatus,
  listOrphanedOrGapped,
} from "./relationshipGraphParticipation";

describe("relationshipGraphParticipation (141)", () => {
  it("inventories major entities with participation status", () => {
    expect(RELATIONSHIP_GRAPH_PARTICIPATION.length).toBeGreaterThanOrEqual(8);
    const counts = countByParticipationStatus();
    expect(counts.in_graph + counts.partial + counts.orphaned + counts.planned).toBe(
      RELATIONSHIP_GRAPH_PARTICIPATION.length,
    );
  });

  it("exposes gap register for orphaned / planned / gapped entries", () => {
    const gaps = listOrphanedOrGapped();
    expect(gaps.some((g) => g.entity.includes("Strategy"))).toBe(true);
    expect(gaps.some((g) => g.status === "orphaned")).toBe(true);
  });
});
