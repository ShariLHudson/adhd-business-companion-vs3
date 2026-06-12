import { describe, expect, it } from "vitest";
import {
  createCatalogTypeLabels,
  findCatalogItem,
  matchCatalogFromText,
} from "./createCatalog";

describe("createCatalog", () => {
  it("includes proposal in catalog labels", () => {
    expect(createCatalogTypeLabels()).toContain("Proposal");
    expect(createCatalogTypeLabels()).toContain("Marketing Plan");
  });

  it("finds proposal item", () => {
    expect(findCatalogItem("Proposal")?.emoji).toBe("📄");
  });

  it("matches natural language to proposal", () => {
    expect(matchCatalogFromText("I need a proposal")?.type).toBe("Proposal");
  });

  it("matches client avatar to route", () => {
    expect(matchCatalogFromText("build a client avatar")?.route).toBe(
      "client-avatars",
    );
  });

  it("matches marketing plan distinctly from generic plan", () => {
    expect(matchCatalogFromText("I need a marketing plan")?.type).toBe(
      "Marketing Plan",
    );
  });
});
