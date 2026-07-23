/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import {
  artifactSupportsDestination,
  buildDownloadArtifact,
  classifyArtifactFamily,
  destinationCapabilitiesForArtifact,
  detectPrintSupport,
  utf8TextBytes,
  visibleDestinationIds,
} from "./index";

describe("artifactDestinations", () => {
  it("classifies document vs spreadsheet vs calendar vs presentation", () => {
    expect(classifyArtifactFamily("Proposal")).toBe("document");
    expect(classifyArtifactFamily("Workshop Outline")).toBe("document");
    expect(classifyArtifactFamily("Event Plan")).toBe("document");
    expect(classifyArtifactFamily("Marketing Plan")).toBe("document");
    expect(classifyArtifactFamily("Business Plan")).toBe("document");
    expect(classifyArtifactFamily("Facebook Community")).toBe("document");
    expect(classifyArtifactFamily("Content Calendar")).toBe("document");
    expect(classifyArtifactFamily("Spreadsheet")).toBe("spreadsheet");
    expect(classifyArtifactFamily("Budget Table")).toBe("spreadsheet");
    expect(classifyArtifactFamily("Calendar Event")).toBe("calendar");
    expect(classifyArtifactFamily("Pitch Deck")).toBe("presentation");
    expect(classifyArtifactFamily("Intake Form")).toBe("form");
  });

  it("adds calendar destinations to Event Plan / Workshop without Sheets", () => {
    const ids = destinationCapabilitiesForArtifact(
      "Event Plan",
      "Agenda and logistics",
    ).destinations.map((d) => d.id);
    expect(ids).toContain("google-docs");
    expect(ids).toContain("print");
    expect(ids).toContain("download");
    expect(ids).toContain("google-calendar");
    expect(ids).not.toContain("google-sheets");
  });

  it("lists document destinations without Sheets or Calendar", () => {
    const caps = destinationCapabilitiesForArtifact("Proposal", "Hello world");
    const ids = caps.destinations.map((d) => d.id);
    expect(ids).toContain("google-docs");
    expect(ids).toContain("pdf");
    expect(ids).toContain("print");
    expect(ids).toContain("download");
    expect(ids).not.toContain("google-sheets");
    expect(ids).not.toContain("google-calendar");
    expect(artifactSupportsDestination("Proposal", "google-sheets")).toBe(false);
    expect(artifactSupportsDestination("Proposal", "print")).toBe(true);
  });

  it("lists spreadsheet destinations with Sheets/CSV and without Docs calendar", () => {
    const ids = destinationCapabilitiesForArtifact("Spreadsheet").destinations.map(
      (d) => d.id,
    );
    expect(ids).toContain("google-sheets");
    expect(ids).toContain("csv");
    expect(ids).toContain("print");
    expect(ids).not.toContain("google-docs");
    expect(ids).not.toContain("google-calendar");
  });

  it("lists calendar destinations with calendars, Docs when appropriate, without Sheets", () => {
    const ids = destinationCapabilitiesForArtifact("Calendar Event").destinations.map(
      (d) => d.id,
    );
    expect(ids).toContain("google-calendar");
    expect(ids).toContain("outlook-calendar");
    expect(ids).toContain("google-docs");
    expect(ids).toContain("print");
    expect(ids).not.toContain("google-sheets");
  });

  it("keeps Print visible even when print is unsupported", () => {
    const ids = visibleDestinationIds("Proposal", "", {
      printSupported: false,
      googleConnected: true,
    });
    expect(ids).toContain("print");
  });

  it("builds UTF-8 text downloads with BOM, honest MIME, and .txt extension", async () => {
    const artifact = await buildDownloadArtifact({
      title: "My Proposal!",
      body: "Readable draft content",
      format: "txt",
    });
    expect(artifact.filename).toMatch(/\.txt$/);
    expect(artifact.mimeType).toBe("text/plain;charset=utf-8");
    expect(artifact.encoding).toBe("utf-8");
    expect(artifact.text?.startsWith("\uFEFF")).toBe(true);
    expect(artifact.text).toContain("Readable draft content");
    const bytes = utf8TextBytes("Readable draft content");
    // UTF-8 BOM EF BB BF — keeps Windows Notepad from misreading encoding
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    expect(new TextDecoder().decode(bytes)).toContain("Readable draft content");
  });

  it("builds markdown downloads with .md and charset", async () => {
    const artifact = await buildDownloadArtifact({
      title: "Notes",
      body: "Line one",
      format: "md",
    });
    expect(artifact.filename).toMatch(/\.md$/);
    expect(artifact.mimeType).toBe("text/markdown;charset=utf-8");
    expect(artifact.text).toContain("# Notes");
  });

  it("builds docx with binary encoding and correct MIME/extension", async () => {
    const artifact = await buildDownloadArtifact({
      title: "Letter",
      body: "Dear friend",
      format: "docx",
    });
    expect(artifact.filename).toMatch(/\.docx$/);
    expect(artifact.mimeType).toContain("wordprocessingml");
    expect(artifact.encoding).toBe("binary");
    expect(artifact.bytes?.length).toBeGreaterThan(40);
    // ZIP local file header signature
    expect(artifact.bytes![0]).toBe(0x50);
    expect(artifact.bytes![1]).toBe(0x4b);
  });

  it("builds pdf with application/pdf MIME and .pdf extension", async () => {
    const artifact = await buildDownloadArtifact({
      title: "Brief",
      body: "Executive summary",
      format: "pdf",
    });
    expect(artifact.filename).toMatch(/\.pdf$/);
    expect(artifact.mimeType).toBe("application/pdf");
    expect(artifact.encoding).toBe("binary");
    expect(artifact.bytes?.length).toBeGreaterThan(40);
  });

  it("detects print support honestly", () => {
    expect(detectPrintSupport({ print: () => {}, open: () => null }).supported).toBe(
      true,
    );
    expect(detectPrintSupport({} as Window).supported).toBe(false);
  });
});
