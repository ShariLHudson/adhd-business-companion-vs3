import { describe, expect, it } from "vitest";

import {
  formatFounderGoogleDocContent,
  formatFounderPdfBody,
  founderExportFilename,
  founderItemHasExportableContent,
} from "./exportContent";
import type { FounderWorkspaceItem } from "./types";

const sample: FounderWorkspaceItem = {
  id: "fw-1",
  kind: "project",
  title: "Launch beta",
  description: "Ship onboarding flow",
  status: "active",
  createdAt: "2026-01-01T12:00:00.000Z",
  updatedAt: "2026-01-02T12:00:00.000Z",
};

describe("founder export content", () => {
  it("detects exportable content", () => {
    expect(founderItemHasExportableContent(sample)).toBe(true);
    expect(
      founderItemHasExportableContent({ ...sample, title: "", description: "" }),
    ).toBe(false);
  });

  it("formats Google Docs content as description only", () => {
    expect(formatFounderGoogleDocContent(sample)).toBe("Ship onboarding flow");
  });

  it("formats PDF body with full metadata", () => {
    const body = formatFounderPdfBody(sample);
    expect(body).toContain("Launch beta");
    expect(body).toContain("Type: Project");
    expect(body).toContain("Status: Active");
    expect(body).toContain("Ship onboarding flow");
  });

  it("builds safe filenames", () => {
    expect(founderExportFilename("My Project!", "pdf")).toBe("My-Project.pdf");
  });
});
