import { describe, expect, it } from "vitest";
import {
  createCatalogTypeLabels,
  findCatalogItem,
  matchCatalogFromText,
  sortedCreateCatalog,
} from "./createCatalog";

describe("createCatalog", () => {
  it("includes proposal in catalog labels", () => {
    expect(createCatalogTypeLabels()).toContain("Proposal");
    expect(createCatalogTypeLabels()).toContain("Marketing Plan");
    expect(createCatalogTypeLabels()).toContain("Blog Post");
  });

  it("finds proposal item", () => {
    expect(findCatalogItem("Proposal")?.emoji).toBe("📄");
  });

  it("lists categories alphabetically", () => {
    const labels = sortedCreateCatalog().map((c) => c.label);
    expect(labels).toEqual([
      "Business Assets",
      "Content",
      "Documents",
      "Marketing",
      "Planning",
      "Relationships",
      "Strategies",
    ]);
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

  it("matches blog post phrasing", () => {
    expect(matchCatalogFromText("write a blog post about ADHD")?.type).toBe(
      "Blog Post",
    );
  });
});
