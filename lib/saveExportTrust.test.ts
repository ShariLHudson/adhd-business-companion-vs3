import { describe, expect, it } from "vitest";
import {
  extractFormQuestions,
  isFormFriendlyContent,
} from "./googleFormContent";
import {
  contentToSheetCsv,
  isTableFriendlyContent,
} from "./googleSheetContent";
import {
  googleFailureReceipt,
  googleReceiptForKind,
  isGoogleCreateSuccess,
  saveReceipt,
  SAVE_LEVEL_COPY,
  shouldShowGoogleExportButtons,
} from "./saveExportTrust";

describe("saveExportTrust", () => {
  it("1. Google Docs success requires file id and url", () => {
    expect(
      isGoogleCreateSuccess(200, {
        url: "https://docs.google.com/document/d/abc/edit",
        id: "abc",
      }),
    ).toBe(true);
    expect(isGoogleCreateSuccess(200, { url: "https://example.com" })).toBe(
      false,
    );
    expect(isGoogleCreateSuccess(502, { url: "x", id: "y" })).toBe(false);
  });

  it("2. Google Sheets creates table-oriented csv", () => {
    const csv = contentToSheetCsv("| Task | Owner |\n| --- | --- |\n| A | Me |");
    expect(csv).toContain("Task");
    expect(csv).toContain("Owner");
    expect(isTableFriendlyContent("| A | B |\n| 1 | 2 |")).toBe(true);
  });

  it("3. Google Forms extracts questions", () => {
    const content =
      "Client intake\n\nWhat is your business name?\nWhat is your biggest challenge?\nHow did you hear about us?";
    expect(isFormFriendlyContent(content)).toBe(true);
    const qs = extractFormQuestions(content);
    expect(qs.length).toBeGreaterThanOrEqual(2);
    expect(qs.some((q) => q.includes("business name"))).toBe(true);
  });

  it("4. Google export failure receipt keeps local copy message", () => {
    expect(googleFailureReceipt("doc")).toMatch(/still saved here/i);
    expect(saveReceipt("google-fail")).toMatch(/still saved here/i);
    expect(saveReceipt("export-fail")).toMatch(/still saved here/i);
  });

  it("5. project receipt includes project name", () => {
    expect(saveReceipt("project", "Launch Plan")).toBe(
      "Added to Launch Plan.",
    );
  });

  it("6. Saved Work receipt is explicit", () => {
    expect(saveReceipt("saved-work")).toBe(
      "Saved to your Saved Work library.",
    );
    expect(SAVE_LEVEL_COPY["saved-work"].description).toMatch(/Saved Work/);
  });

  it("7. resume save is labeled device-local", () => {
    expect(saveReceipt("resume")).toMatch(/come back/i);
    expect(SAVE_LEVEL_COPY.resume.description).toMatch(/this device/i);
  });

  it("8. user never sees Google success unless file was created", () => {
    const fail = isGoogleCreateSuccess(200, {});
    expect(fail).toBe(false);
    const ok = isGoogleCreateSuccess(201, {
      id: "file123",
      url: "https://docs.google.com/document/d/file123/edit",
    });
    expect(ok).toBe(true);
    expect(googleReceiptForKind("doc")).toMatch(/Google Doc/);
    expect(googleReceiptForKind("sheet")).toMatch(/Google Sheet/);
    expect(googleReceiptForKind("form")).toMatch(/Google Form/);
  });

  it("9. Google buttons hidden when integration unavailable", () => {
    expect(shouldShowGoogleExportButtons(false, false)).toBe(false);
    expect(shouldShowGoogleExportButtons(true, false)).toBe(false);
    expect(shouldShowGoogleExportButtons(true, true)).toBe(true);
    expect(shouldShowGoogleExportButtons(null, null)).toBe(false);
  });
});
