import { describe, expect, it } from "vitest";
import type { IdealClientAvatar } from "@/lib/companionStore";
import {
  createDefaultAudienceSelection,
  normalizeAudienceSelection,
  outputStrategyApplies,
  parseAudienceSelection,
  resolveSelectedAvatars,
  serializeAudienceSelection,
  updateAudienceSelection,
  type AudienceSelection,
} from "./audienceSelection";

const NOW = "2026-01-01T00:00:00.000Z";
const OLD = "2020-01-01T00:00:00.000Z";
const NEW = "2026-06-01T12:00:00.000Z";

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

// Completed = who + one of painPoints/goals/solution.
const mary = avatar({ id: "a1", name: "Mary", who: "Coaches", painPoints: "burnout" });
const susan = avatar({ id: "a2", name: "Susan", who: "Founders", goals: "grow" });
const draftDan = avatar({ id: "d1", name: "Dan", who: "Someone" }); // no pain/goals/solution
const AVATARS = [mary, susan, draftDan];

function sel(over: Partial<AudienceSelection>): AudienceSelection {
  return { ...createDefaultAudienceSelection(NOW), ...over };
}

describe("resolveSelectedAvatars", () => {
  it("none → no avatars", () => {
    expect(resolveSelectedAvatars(sel({ selectionMode: "none" }), AVATARS)).toEqual([]);
  });

  it("single → exactly one selected avatar", () => {
    const r = resolveSelectedAvatars(
      sel({ selectionMode: "single", selectedAvatarIds: ["a1"] }),
      AVATARS,
    );
    expect(r.map((a) => a.id)).toEqual(["a1"]);
  });

  it("multiple → the selected avatars", () => {
    const r = resolveSelectedAvatars(
      sel({ selectionMode: "multiple", selectedAvatarIds: ["a1", "a2"] }),
      AVATARS,
    );
    expect(r.map((a) => a.id)).toEqual(["a1", "a2"]);
  });

  it("all → all completed avatars (drafts excluded by default)", () => {
    const r = resolveSelectedAvatars(sel({ selectionMode: "all" }), AVATARS);
    expect(r.map((a) => a.id)).toEqual(["a1", "a2"]);
  });

  it("excludes a draft even when explicitly selected, by default", () => {
    const r = resolveSelectedAvatars(
      sel({ selectionMode: "multiple", selectedAvatarIds: ["a1", "d1"] }),
      AVATARS,
    );
    expect(r.map((a) => a.id)).toEqual(["a1"]);
  });

  it("includes drafts when includeDrafts is on", () => {
    const all = resolveSelectedAvatars(
      sel({ selectionMode: "all", includeDrafts: true }),
      AVATARS,
    );
    expect(all.map((a) => a.id)).toEqual(["a1", "a2", "d1"]);
    const one = resolveSelectedAvatars(
      sel({ selectionMode: "single", selectedAvatarIds: ["d1"], includeDrafts: true }),
      AVATARS,
    );
    expect(one.map((a) => a.id)).toEqual(["d1"]);
  });

  it("drops stale / invalid ids", () => {
    const r = resolveSelectedAvatars(
      sel({ selectionMode: "multiple", selectedAvatarIds: ["a1", "ghost"] }),
      AVATARS,
    );
    expect(r.map((a) => a.id)).toEqual(["a1"]);
  });
});

describe("normalizeAudienceSelection", () => {
  it("clamps single to one id and clears ids for none/all", () => {
    expect(
      normalizeAudienceSelection(
        sel({ selectionMode: "single", selectedAvatarIds: ["a1", "a2"] }),
        AVATARS,
        NOW,
      ).selectedAvatarIds,
    ).toEqual(["a1"]);
    expect(
      normalizeAudienceSelection(
        sel({ selectionMode: "all", selectedAvatarIds: ["a1"] }),
        AVATARS,
        NOW,
      ).selectedAvatarIds,
    ).toEqual([]);
  });

  it("de-dupes and drops stale/draft ids in multiple", () => {
    const n = normalizeAudienceSelection(
      sel({ selectionMode: "multiple", selectedAvatarIds: ["a1", "a1", "d1", "ghost"] }),
      AVATARS,
      NOW,
    );
    expect(n.selectedAvatarIds).toEqual(["a1"]);
  });
});

describe("outputStrategyApplies", () => {
  it("is false for none, single, and one resolved avatar", () => {
    expect(outputStrategyApplies(sel({ selectionMode: "none" }), AVATARS)).toBe(false);
    expect(
      outputStrategyApplies(sel({ selectionMode: "single", selectedAvatarIds: ["a1"] }), AVATARS),
    ).toBe(false);
    expect(
      outputStrategyApplies(sel({ selectionMode: "multiple", selectedAvatarIds: ["a1"] }), AVATARS),
    ).toBe(false);
  });

  it("is true when more than one avatar resolves", () => {
    expect(outputStrategyApplies(sel({ selectionMode: "all" }), AVATARS)).toBe(true);
    expect(
      outputStrategyApplies(
        sel({ selectionMode: "multiple", selectedAvatarIds: ["a1", "a2"] }),
        AVATARS,
      ),
    ).toBe(true);
  });
});

describe("persistence round-trip", () => {
  it("parse(serialize(x)) equals the normalized selection", () => {
    const original = sel({
      selectionMode: "multiple",
      selectedAvatarIds: ["a1", "a2"],
      multiAvatarOutputMode: "tailored",
    });
    const round = parseAudienceSelection(
      serializeAudienceSelection(original),
      AVATARS,
      NOW,
    );
    expect(round).toEqual(normalizeAudienceSelection(original, AVATARS, NOW));
  });

  it("parses garbage into a safe default", () => {
    const parsed = parseAudienceSelection("not json {", AVATARS, NOW);
    expect(parsed.selectionMode).toBe("none");
    expect(parsed.selectedAvatarIds).toEqual([]);
    expect(parsed.includeDrafts).toBe(false);
    expect(parsed.multiAvatarOutputMode).toBe("shared");
  });

  it("preserves the timestamp across a serialize/parse round-trip", () => {
    const s = normalizeAudienceSelection(
      sel({ selectionMode: "multiple", selectedAvatarIds: ["a1", "a2"], lastUpdatedAt: OLD }),
      AVATARS,
      OLD,
    );
    const round = parseAudienceSelection(serializeAudienceSelection(s), AVATARS, NEW);
    expect(round.lastUpdatedAt).toBe(OLD);
  });

  it("restores the same selection a workspace could save and reopen", () => {
    const saved = normalizeAudienceSelection(
      sel({ selectionMode: "single", selectedAvatarIds: ["a2"], inheritedFromProject: true }),
      AVATARS,
      NOW,
    );
    const reopened = parseAudienceSelection(serializeAudienceSelection(saved), AVATARS, NOW);
    expect(reopened.selectionMode).toBe("single");
    expect(reopened.selectedAvatarIds).toEqual(["a2"]);
    expect(reopened.inheritedFromProject).toBe(true);
  });
});

describe("lastUpdatedAt semantics", () => {
  it("normalization preserves an existing timestamp", () => {
    const s = sel({ selectionMode: "single", selectedAvatarIds: ["a1"], lastUpdatedAt: OLD });
    expect(normalizeAudienceSelection(s, AVATARS, NEW).lastUpdatedAt).toBe(OLD);
  });

  it("cleaning stale / draft ids does not regenerate the timestamp", () => {
    const s = sel({
      selectionMode: "multiple",
      selectedAvatarIds: ["a1", "ghost", "d1"],
      lastUpdatedAt: OLD,
    });
    const normalized = normalizeAudienceSelection(s, AVATARS, NEW);
    expect(normalized.selectedAvatarIds).toEqual(["a1"]); // cleaned
    expect(normalized.lastUpdatedAt).toBe(OLD); // but not "newly changed"
    // Resolving reads avatars; it never mints a new selection/timestamp.
    expect(resolveSelectedAvatars(s, AVATARS).map((a) => a.id)).toEqual(["a1"]);
    expect(s.lastUpdatedAt).toBe(OLD);
  });

  it("an explicit change stamps a new timestamp through the update helper", () => {
    const s = sel({ selectionMode: "none", lastUpdatedAt: OLD });
    const updated = updateAudienceSelection(
      s,
      { selectionMode: "single", selectedAvatarIds: ["a1"] },
      AVATARS,
      NEW,
    );
    expect(updated.lastUpdatedAt).toBe(NEW);
    expect(updated.selectionMode).toBe("single");
    expect(updated.selectedAvatarIds).toEqual(["a1"]);
    // The original is untouched.
    expect(s.lastUpdatedAt).toBe(OLD);
  });
});
