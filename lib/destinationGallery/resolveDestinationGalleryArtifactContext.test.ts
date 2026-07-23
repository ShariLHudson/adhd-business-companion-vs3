import { describe, expect, it } from "vitest";
import {
  buildDownloadArtifact,
  destinationCapabilitiesForArtifact,
} from "@/lib/artifactDestinations";
import {
  crystalDestinationIdsForArtifact,
  resolveArtifactDestinationCrystalOffers,
} from "./artifactDestinationCrystals";
import {
  isReadableExportText,
  resolveDestinationGalleryArtifactContext,
} from "./resolveDestinationGalleryArtifactContext";

describe("resolveDestinationGalleryArtifactContext", () => {
  it("prefers draftContent over artifact, record, and assistant fallback", () => {
    const ctx = resolveDestinationGalleryArtifactContext({
      draftContent: "Readable proposal body for the client.",
      artifactContent: "Older artifact body",
      creationRecordContent: "Creation record body",
      itemType: "Proposal",
      fallbackAssistantText: "Stale assistant reply that should not win.",
    });
    expect(ctx.exportText).toBe("Readable proposal body for the client.");
    expect(ctx.artifactType.toLowerCase()).toContain("proposal");
    expect(ctx.family).toBe("document");
  });

  it("uses artifact content then creation record before assistant fallback", () => {
    const fromArtifact = resolveDestinationGalleryArtifactContext({
      draftContent: "  ",
      artifactContent: "Canonical artifact body",
      creationRecordContent: "Record body",
      itemType: "Business Plan",
      fallbackAssistantText: "Assistant",
    });
    expect(fromArtifact.exportText).toBe("Canonical artifact body");
    expect(fromArtifact.family).toBe("document");

    const fromRecord = resolveDestinationGalleryArtifactContext({
      draftContent: null,
      artifactContent: "[object Object]",
      creationRecordContent: "Brief stored on the creation record.",
      itemType: "Marketing Plan",
      fallbackAssistantText: "Assistant",
    });
    expect(fromRecord.exportText).toBe("Brief stored on the creation record.");
    expect(isReadableExportText("[object Object]")).toBe(false);
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
      draftContent: "Proposal section one.",
      itemType: "Proposal",
    });
    const ids = crystalDestinationIdsForArtifact(
      ctx.artifactType,
      ctx.exportText,
    );
    expect(ids).toContain("google-docs");
    expect(ids).toContain("pdf");
    expect(ids).toContain("print");
    expect(ids).toContain("download");
    expect(ids).not.toContain("google-sheets");
    expect(ids).not.toContain("google-calendar");
  });

  it("Event Plan is document-style with intentional Calendar crystals", () => {
    const ctx = resolveDestinationGalleryArtifactContext({
      draftContent: "Event date: July 1\nAgenda and logistics.",
      itemType: "Event Plan",
    });
    expect(ctx.family).toBe("document");
    const ids = crystalDestinationIdsForArtifact(
      ctx.artifactType,
      ctx.exportText,
    );
    expect(ids).toContain("google-docs");
    expect(ids).toContain("print");
    expect(ids).toContain("google-calendar");
    expect(ids).not.toContain("google-sheets");
  });

  it("allows Calendar crystals for true calendar-event artifacts", () => {
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
    expect(ids).toContain("print");
    expect(ids).not.toContain("google-docs");
    expect(ids).not.toContain("google-calendar");
  });

  it("keeps Print visible for compatible document artifacts", () => {
    const ids = destinationCapabilitiesForArtifact(
      "Proposal",
      "Hello",
    ).destinations.map((d) => d.id);
    expect(ids).toContain("print");
    const print = resolveArtifactDestinationCrystalOffers("Proposal", "Hello", {
      printSupported: true,
    }).find((o) => o.destinationId === "print");
    expect(print?.state).toBe("connected");
  });

  it("exported plain text uses UTF-8 BOM and .txt extension", async () => {
    const ctx = resolveDestinationGalleryArtifactContext({
      draftContent: "Plain readable draft — apostrophe's fine.",
      itemType: "Document",
      title: "My Draft",
    });
    const artifact = await buildDownloadArtifact({
      title: ctx.exportTitle,
      body: ctx.exportText,
      format: "txt",
    });
    expect(artifact.filename).toMatch(/\.txt$/);
    expect(artifact.mimeType).toBe("text/plain;charset=utf-8");
    expect(artifact.text?.startsWith("\uFEFF")).toBe(true);
    expect(artifact.text).toContain(ctx.exportText);
    expect(artifact.text).not.toContain("[object Object]");
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
