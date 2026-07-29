/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";

import { finalizeBoardFacingText } from "./finalizeBoardFacingText";

const BOARD_MARKDOWN = [
  "## Recommendation",
  "",
  "We **recommend** approving the $5,000 spend, with conditions.",
  "",
  "---",
  "",
  "- Risk: cash flow tightens by March 15",
  "- Watch for scope creep before you commit",
  "",
  "`next step`: revisit in 30 days.",
].join("\n");

const DIRECTOR_A =
  "Speaking as the Financial Stewardship director, I would not approve this until we see the payback: the $5,000 must return within two quarters, or it drains runway.";
const DIRECTOR_B =
  "As the Growth & Opportunity director, I see the upside: this spend could open a new market segment worth pursuing even if the payback is slower.";

describe("finalizeBoardFacingText — normalizes formatting, preserves substance", () => {
  it("removes markdown / mechanical formatting", () => {
    const out = finalizeBoardFacingText(BOARD_MARKDOWN);
    expect(out).not.toMatch(/#{1,6}\s/); // no heading markers
    expect(out).not.toContain("**"); // no bold asterisks
    expect(out).not.toMatch(/^\s*---\s*$/m); // no horizontal rules
    expect(out).not.toContain("`"); // no backticks
  });

  it("preserves concrete details (amounts, dates, risks, recommendation)", () => {
    const out = finalizeBoardFacingText(BOARD_MARKDOWN).toLowerCase();
    expect(out).toContain("$5,000");
    expect(out).toContain("march 15");
    expect(out).toContain("cash flow");
    expect(out).toContain("scope creep");
    // The recommendation content survives (the canonical voice layer may trim the
    // "We recommend" opener the same way it does on the general/Chamber path).
    expect(out).toContain("approving");
    expect(out).toContain("conditions");
  });

  it("does not collapse a substantive response into a short generic line", () => {
    const out = finalizeBoardFacingText(BOARD_MARKDOWN);
    expect(out.trim().length).toBeGreaterThan(120);
    const lower = out.toLowerCase();
    // All three substance points survive — not reduced to encouragement.
    const points = ["$5,000", "march 15", "scope creep"].filter((p) =>
      lower.includes(p),
    );
    expect(points.length).toBe(3);
  });

  it("keeps multiple director perspectives distinguishable", () => {
    const a = finalizeBoardFacingText(DIRECTOR_A);
    const b = finalizeBoardFacingText(DIRECTOR_B);
    expect(a.toLowerCase()).toContain("payback");
    expect(a.toLowerCase()).toContain("runway");
    expect(b.toLowerCase()).toContain("upside");
    expect(b.toLowerCase()).toContain("market segment");
    expect(a).not.toBe(b);
  });

  it("leaves empty / whitespace / null untouched for the existing safe fallback", () => {
    expect(finalizeBoardFacingText("")).toBe("");
    expect(finalizeBoardFacingText("   ")).toBe("   ");
    expect(finalizeBoardFacingText(null)).toBe("");
    expect(finalizeBoardFacingText(undefined)).toBe("");
  });

  it("is deterministic (no model call, same input → same output)", () => {
    expect(finalizeBoardFacingText(DIRECTOR_A)).toBe(
      finalizeBoardFacingText(DIRECTOR_A),
    );
  });
});
