import { describe, expect, it } from "vitest";
import {
  crystalDestinationIdsForArtifact,
  resolveArtifactDestinationCrystalOffers,
} from "./artifactDestinationCrystals";

describe("artifactDestinationCrystals", () => {
  it("shows document crystals without Sheets or Calendar", () => {
    const ids = crystalDestinationIdsForArtifact("Proposal", "Hello");
    expect(ids).toEqual([
      "google-docs",
      "microsoft-word",
      "pdf",
      "print",
      "download",
    ]);
    expect(ids).not.toContain("google-sheets");
    expect(ids).not.toContain("google-calendar");
  });

  it("shows spreadsheet crystals without Docs or Calendar", () => {
    const ids = crystalDestinationIdsForArtifact("Spreadsheet");
    expect(ids).toContain("google-sheets");
    expect(ids).toContain("microsoft-excel");
    expect(ids).toContain("csv");
    expect(ids).toContain("pdf");
    expect(ids).toContain("print");
    expect(ids).not.toContain("google-docs");
    expect(ids).not.toContain("google-calendar");
    expect(ids).not.toContain("download");
  });

  it("shows calendar crystals including Docs when appropriate", () => {
    const ids = crystalDestinationIdsForArtifact("Calendar Event");
    expect(ids).toContain("google-calendar");
    expect(ids).toContain("outlook-calendar");
    expect(ids).toContain("google-docs");
    expect(ids).toContain("pdf");
    expect(ids).toContain("print");
    expect(ids).not.toContain("google-sheets");
  });

  it("marks Google destinations needs_connection when not connected", () => {
    const offers = resolveArtifactDestinationCrystalOffers("Proposal", "Hi", {
      googleConfigured: true,
      googleConnected: false,
      printSupported: true,
    });
    const docs = offers.find((o) => o.destinationId === "google-docs");
    expect(docs?.state).toBe("needs_connection");
    const pdf = offers.find((o) => o.destinationId === "pdf");
    expect(pdf?.state).toBe("connected");
    const print = offers.find((o) => o.destinationId === "print");
    expect(print?.state).toBe("connected");
  });

  it("marks print temporarily_unavailable when unsupported", () => {
    const offers = resolveArtifactDestinationCrystalOffers("Proposal", "Hi", {
      googleConnected: true,
      printSupported: false,
    });
    expect(offers.find((o) => o.destinationId === "print")?.state).toBe(
      "temporarily_unavailable",
    );
  });

  it("assigns distinct pillar slots for document destinations", () => {
    const offers = resolveArtifactDestinationCrystalOffers("Proposal", "Hi", {
      googleConnected: true,
    });
    const slots = offers.map((o) => o.slotId);
    expect(new Set(slots).size).toBe(slots.length);
    expect(offers.find((o) => o.destinationId === "google-docs")?.slotId).toBe(
      "write",
    );
    expect(offers.find((o) => o.destinationId === "print")?.slotId).toBe(
      "print",
    );
  });

  it("never surfaces Sheets just because Google is connected", () => {
    const offers = resolveArtifactDestinationCrystalOffers("Proposal", "Hi", {
      googleConnected: true,
      googleConfigured: true,
    });
    expect(offers.map((o) => o.destinationId)).not.toContain("google-sheets");
  });
});
