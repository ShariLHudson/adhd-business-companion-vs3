import { describe, expect, it } from "vitest";
import {
  crystalDestinationIdsForArtifact,
  resolveArtifactDestinationCrystalOffers,
} from "./artifactDestinationCrystals";
import { resolveDestinationGalleryArtifactContext } from "./resolveDestinationGalleryArtifactContext";

describe("resolveDestinationGalleryArtifactContext", () => {
  it("prefers draftContent over assistant fallback for exportText", () => {
    const ctx = resolveDestinationGalleryArtifactContext({
      draftContent: "Readable proposal body for the client.",
      itemType: "Proposal",
      fallbackAssistantText: "Stale assistant reply that should not win.",
    });
    expect(ctx.exportText).toBe("Readable proposal body for the client.");
    expect(ctx.artifactType.toLowerCase()).toContain("proposal");
    expect(ctx.family).toBe("document");
  });

  it("falls back safely when artifact metadata is unavailable", () => {
    const ctx = resolveDestinationGalleryArtifactContext({
      draftContent: null,
      itemType: null,
      fallbackAssistantText: "Here is a draft we wrote together.",
    });
    expect(ctx.exportText).toBe("Here is a draft we wrote together.");
    expect(ctx.artifactType).toBe("Document");
    expect(ctx.exportTitle).toBe("Spark work");
    expect(ctx.family).toBe("document");
  });

  it("passes live artifactType so document crystals omit Sheets and Calendar", () => {
    const ctx = resolveDestinationGalleryArtifactContext({
      draftContent: "Workshop outline section one.",
      itemType: "Workshop Outline",
    });
    const ids = crystalDestinationIdsForArtifact(
      ctx.artifactType,
      ctx.exportText,
    );
    expect(ids).toContain("google-docs");
    expect(ids).toContain("pdf");
    expect(ids).toContain("print");
    expect(ids).not.toContain("google-sheets");
    expect(ids).not.toContain("google-calendar");
  });

  it("allows Calendar crystals for event artifacts", () => {
    const ctx = resolveDestinationGalleryArtifactContext({
      draftContent: "Event date: July 1\nAgenda and logistics.",
      itemType: "Calendar Event",
    });
    expect(ctx.family).toBe("calendar");
    const offers = resolveArtifactDestinationCrystalOffers(
      ctx.artifactType,
      ctx.exportText,
      { googleConnected: true, outlookConnected: true },
    );
    const ids = offers.map((o) => o.destinationId);
    expect(ids).toContain("google-calendar");
    expect(ids).not.toContain("google-sheets");
  });

  it("allows Sheets crystals for spreadsheet artifacts", () => {
    const ctx = resolveDestinationGalleryArtifactContext({
      draftContent: "col1,col2\n1,2",
      itemType: "Spreadsheet",
    });
    expect(ctx.family).toBe("spreadsheet");
    const ids = crystalDestinationIdsForArtifact(
      ctx.artifactType,
      ctx.exportText,
    );
    expect(ids).toContain("google-sheets");
    expect(ids).not.toContain("google-docs");
    expect(ids).not.toContain("google-calendar");
  });

  it("keeps exportText as readable UTF-8 text (not binary gibberish)", () => {
    const body = "Plain readable draft — apostrophe's fine.";
    const ctx = resolveDestinationGalleryArtifactContext({
      draftContent: body,
      itemType: "Document",
    });
    expect(ctx.exportText).toBe(body);
    expect(ctx.exportText).not.toMatch(/\u0000/);
    expect([...ctx.exportText].every((ch) => ch.charCodeAt(0) >= 9)).toBe(
      true,
    );
  });
});
