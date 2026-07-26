import { describe, expect, it } from "vitest";
import type { IdealClientAvatar } from "@/lib/companionStore";
import { buildAudienceContext } from "./audienceContext";
import {
  createDefaultAudienceSelection,
  type AudienceSelection,
  type MultiAvatarOutputMode,
} from "./audienceSelection";

const NOW = "2026-01-01T00:00:00.000Z";

function avatar(partial: Partial<IdealClientAvatar> & { id: string }): IdealClientAvatar {
  return {
    name: partial.id,
    tagline: "",
    who: "",
    painPoints: "",
    goals: "",
    currentBehavior: "",
    solution: "",
    createdAt: NOW,
    updatedAt: NOW,
    ...partial,
  };
}

const mary = avatar({ id: "a1", name: "Mary", who: "Coaches", painPoints: "burnout" });
const susan = avatar({ id: "a2", name: "Susan", who: "Founders", goals: "grow" });
const AVATARS = [mary, susan];

function sel(over: Partial<AudienceSelection>): AudienceSelection {
  return { ...createDefaultAudienceSelection(NOW), ...over };
}

describe("buildAudienceContext", () => {
  it("none → general context, no invented audience", () => {
    const ctx = buildAudienceContext(sel({ selectionMode: "none" }), AVATARS);
    expect(ctx.strategy).toBe("none");
    expect(ctx.audienceCount).toBe(0);
    expect(ctx.text).toMatch(/No specific audience/i);
    expect(ctx.text).toMatch(/Do not invent an audience/i);
  });

  it("single → one primary audience block", () => {
    const ctx = buildAudienceContext(
      sel({ selectionMode: "single", selectedAvatarIds: ["a1"] }),
      AVATARS,
    );
    expect(ctx.strategy).toBe("single");
    expect(ctx.audienceCount).toBe(1);
    expect(ctx.text).toMatch(/PRIMARY AUDIENCE/);
    expect(ctx.text).toContain("Mary");
  });

  it("multiple → distinct labeled blocks, never flattened into one person", () => {
    const ctx = buildAudienceContext(
      sel({ selectionMode: "multiple", selectedAvatarIds: ["a1", "a2"] }),
      AVATARS,
    );
    expect(ctx.audienceCount).toBe(2);
    // Two separate labeled blocks, each with its own name.
    expect(ctx.text).toContain("AUDIENCE 1: Mary");
    expect(ctx.text).toContain("AUDIENCE 2: Susan");
    // Explicit no-flatten instruction.
    expect(ctx.text).toMatch(/never blend them into a single imaginary person/i);
  });

  it("states each of the four output strategies distinctly", () => {
    const expectations: Record<MultiAvatarOutputMode, RegExp> = {
      shared: /ONE SHARED VERSION/,
      separate: /SEPARATE VERSIONS/,
      tailored: /SHARED FOUNDATION \+ TAILORED VARIATIONS/,
      compare: /COMPARE FIRST/,
    };
    for (const mode of Object.keys(expectations) as MultiAvatarOutputMode[]) {
      const ctx = buildAudienceContext(
        sel({
          selectionMode: "multiple",
          selectedAvatarIds: ["a1", "a2"],
          multiAvatarOutputMode: mode,
        }),
        AVATARS,
      );
      expect(ctx.strategy).toBe(mode);
      expect(ctx.text).toMatch(expectations[mode]);
      // Blocks stay distinct regardless of strategy.
      expect(ctx.text).toContain("AUDIENCE 1: Mary");
      expect(ctx.text).toContain("AUDIENCE 2: Susan");
    }
  });
});
