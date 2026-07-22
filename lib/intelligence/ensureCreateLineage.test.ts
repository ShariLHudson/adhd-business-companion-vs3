import { describe, expect, it, beforeEach } from "vitest";
import {
  listWorkRelationshipsForTarget,
  resetWorkRelationshipsForTests,
} from "@/lib/universalWorkEngine";
import {
  ensureCreateLineage,
  lineageRefsFromExplicitContext,
} from "./ensureCreateLineage";

describe("ensureCreateLineage (141)", () => {
  beforeEach(() => {
    resetWorkRelationshipsForTests();
  });

  it("links project + blueprint from explicit context only", () => {
    const refs = lineageRefsFromExplicitContext({
      projectId: "proj-141",
      blueprintId: "bp-workshop",
      cartographyNodeId: "node-a",
    });
    const result = ensureCreateLineage({
      workId: "work-141-a",
      refs,
      edgeSource: "creation_flow_lineage",
    });
    expect(result.linked.length).toBe(3);
    expect(
      listWorkRelationshipsForTarget({ kind: "project", id: "proj-141" })
        .length,
    ).toBe(1);
  });

  it("dedupes identical lineage links", () => {
    const refs = lineageRefsFromExplicitContext({ projectId: "proj-dup" });
    ensureCreateLineage({ workId: "work-dup", refs });
    const second = ensureCreateLineage({ workId: "work-dup", refs });
    expect(second.linked.length).toBe(1);
    expect(
      listWorkRelationshipsForTarget({ kind: "project", id: "proj-dup" })
        .length,
    ).toBe(1);
  });

  it("skips empty and self links", () => {
    const result = ensureCreateLineage({
      workId: "work-self",
      refs: [
        {
          kind: "work",
          id: "work-self",
          relationship: "related_to",
        },
        {
          kind: "project",
          id: "  ",
          relationship: "part_of",
        },
      ],
    });
    expect(result.linked.length).toBe(0);
    expect(result.skipped.length).toBe(2);
  });
});
