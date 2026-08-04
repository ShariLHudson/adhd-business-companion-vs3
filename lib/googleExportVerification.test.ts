import { describe, expect, it } from "vitest";
import { rowsToCsv } from "./googleSheetContent";
import {
  GOOGLE_EXPORT_MESSAGES,
  isLikelyCsv,
  parseCsvRows,
  validateDocumentExportContent,
  validateSpreadsheetCsv,
} from "./googleExportVerification";
import { contentToSheetCsv } from "./googleSheetContent";
import { buildSheetCsv, buildGoogleSheetPendingPayload } from "./googleSheetsIntelligence";

describe("googleExportVerification (P0.44)", () => {
  it("rejects empty documents before export", () => {
    const result = validateDocumentExportContent("   \n  ");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe(GOOGLE_EXPORT_MESSAGES.emptyDocument);
    }
  });

  it("accepts documents with real content", () => {
    const result = validateDocumentExportContent("Marketing Plan\n\nOffer: Course");
    expect(result.ok).toBe(true);
  });

  it("requires spreadsheet columns and starter rows", () => {
    expect(validateSpreadsheetCsv("").ok).toBe(false);
    expect(validateSpreadsheetCsv("OnlyOneColumn").ok).toBe(false);
    expect(
      validateSpreadsheetCsv("Date,Platform\n2026-06-01,Instagram").ok,
    ).toBe(true);
  });

  it("detects likely CSV and preserves structure on re-export", () => {
    const csv = rowsToCsv([
      ["Name", "Email", "Status"],
      ["", "", ""],
      ["", "", ""],
    ]);
    expect(isLikelyCsv(csv)).toBe(true);
    expect(contentToSheetCsv(csv)).toBe(csv);
    const parsed = parseCsvRows(csv);
    expect(parsed[0]).toEqual(["Name", "Email", "Status"]);
    expect(parsed.length).toBeGreaterThan(2);
  });

  it("sheet intake payloads include columns and starter rows", () => {
    const payload = buildGoogleSheetPendingPayload({
      sheetType: "lead_follow_up",
      phase: "offered",
      answers: { offer: "Coaching" },
      questionIndex: 1,
      originalPrompt: "lead tracker",
    });
    const check = validateSpreadsheetCsv(payload.csv);
    expect(check.ok).toBe(true);
    if (check.ok) {
      expect(check.columnCount).toBeGreaterThan(3);
      expect(check.dataRowCount).toBeGreaterThan(0);
    }
    expect(buildSheetCsv({
      sheetType: "content_calendar",
      phase: "offered",
      answers: { platforms: "Instagram", postCount: "5" },
      questionIndex: 2,
      originalPrompt: "content calendar",
    })).toContain("Platform");
  });
});
