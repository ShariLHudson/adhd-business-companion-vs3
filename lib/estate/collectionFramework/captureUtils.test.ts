import { describe, expect, it } from "vitest";
import {
  emptyCaptureValues,
  isCaptureValid,
} from "./captureUtils";

describe("collection capture utils", () => {
  it("validates required fields only", () => {
    const fields = [
      { id: "title", label: "Title", required: true },
      { id: "body", label: "Body", required: true },
      { id: "note", label: "Note" },
    ] as const;
    const values = emptyCaptureValues(fields);
    expect(isCaptureValid(fields, values)).toBe(false);
    expect(
      isCaptureValid(fields, { ...values, title: "Win", body: "Story" }),
    ).toBe(true);
  });
});
