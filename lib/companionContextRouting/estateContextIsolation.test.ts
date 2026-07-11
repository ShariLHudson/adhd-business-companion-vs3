import { describe, expect, it } from "vitest";
import { SHARI_ERROR_RECOVERY_LINE } from "@/lib/conversation/shariCompanionEngine";
import {
  containsEstateSystemLanguage,
  ESTATE_RECOVERY_OPENING,
  sanitizeEstateFacingCopy,
} from "./estateContextIsolation";

describe("Estate Context Isolation Rule", () => {
  it("defines canonical recovery opening", () => {
    expect(ESTATE_RECOVERY_OPENING).toBe(SHARI_ERROR_RECOVERY_LINE);
    expect(ESTATE_RECOVERY_OPENING).toContain("still here");
  });

  it("detects forbidden system language", () => {
    expect(containsEstateSystemLanguage("Failed to fetch")).toBe(true);
    expect(containsEstateSystemLanguage("Network error — try again")).toBe(true);
    expect(containsEstateSystemLanguage("Next.js 14.2.7 stale webpack")).toBe(
      true,
    );
    expect(containsEstateSystemLanguage("run npm run dev")).toBe(true);
    expect(containsEstateSystemLanguage("check your connection")).toBe(true);
  });

  it("allows normal Shari conversation", () => {
    expect(
      containsEstateSystemLanguage(
        "That sounds heavy. What part of the call are you dreading most?",
      ),
    ).toBe(false);
  });

  it("replaces system language with Shari recovery", () => {
    const safe = sanitizeEstateFacingCopy("Failed to fetch");
    expect(safe).toContain("still here");
    expect(safe.toLowerCase()).not.toContain("fetch");
  });

  it("passes through clean estate copy unchanged", () => {
    const line = "Of course.";
    expect(sanitizeEstateFacingCopy(line)).toBe(line);
  });
});
