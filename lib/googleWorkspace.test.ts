import { describe, expect, it } from "vitest";
import {
  buildGoogleWorkspaceSession,
  googleEmbedUrl,
  recommendGoogleExport,
} from "./googleWorkspace";

describe("googleWorkspace", () => {
  it("recommends docs for content calendars, forms for questionnaires, sheets only for true spreadsheets", () => {
    expect(recommendGoogleExport("Content Calendar", "Week 1 | Post")).toBe(
      "doc",
    );
    expect(recommendGoogleExport("Client Intake Form", "Question 1")).toBe(
      "form",
    );
    expect(recommendGoogleExport("SOP", "Step 1")).toBe("doc");
    expect(recommendGoogleExport("Spreadsheet", "a,b,c")).toBe("sheet");
  });

  it("builds embed session from create-doc url", () => {
    const session = buildGoogleWorkspaceSession({
      kind: "doc",
      url: "https://docs.google.com/document/d/abc123/edit",
      title: "ElevenLabs SOP",
      artifactType: "SOP",
      content: "Steps here",
    });
    expect(session?.fileId).toBe("abc123");
    expect(session?.embedUrl).toBe(googleEmbedUrl("doc", "abc123"));
  });
});
