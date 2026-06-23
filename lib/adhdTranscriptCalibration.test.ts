import { describe, expect, it } from "vitest";
import {
  runTranscriptCalibration,
  TRANSCRIPT_CALIBRATION_CASES,
  evaluateTranscriptCase,
} from "./adhdTranscriptCalibration";

describe("adhdTranscriptCalibration", () => {
  it("runs all calibration transcripts", () => {
    const { passed, failed, results } = runTranscriptCalibration();
    if (failed > 0) {
      const summary = results
        .filter((r) => !r.passed)
        .map((r) => `${r.id}: ${r.failures.join("; ")}`)
        .join("\n");
      expect.fail(`${failed} calibration case(s) failed:\n${summary}`);
    }
    expect(passed).toBe(TRANSCRIPT_CALIBRATION_CASES.length);
  });

  it("planning addiction transcript passes individually", () => {
    const c = TRANSCRIPT_CALIBRATION_CASES.find((t) => t.id === "planning-addiction")!;
    expect(evaluateTranscriptCase(c).passed).toBe(true);
  });

  it("practical request avoids false positive", () => {
    const c = TRANSCRIPT_CALIBRATION_CASES.find((t) => t.id === "practical-request")!;
    const r = evaluateTranscriptCase(c);
    expect(r.detectedPattern).toBeNull();
    expect(r.passed).toBe(true);
  });

  it("momentum transcript protects without pattern", () => {
    const c = TRANSCRIPT_CALIBRATION_CASES.find((t) => t.id === "momentum-state")!;
    const r = evaluateTranscriptCase(c);
    expect(r.detectedPattern).toBeNull();
    expect(r.protectionMode).toBe("momentum");
    expect(r.passed).toBe(true);
  });
});
