/**
 * SOP Build Journey Phase 2 — Working Memory derivation.
 * Pure function tests. See lib/createEstate/sopBuildJourneyPhase2.test.ts
 * for record-level and durable-persistence integration.
 */

import { describe, expect, it } from "vitest";
import {
  deriveWorkingMemoryFields,
  isWorkingMemoryEmpty,
  WORKING_MEMORY_FIELD_KEYS,
} from "./workingMemory";

describe("deriveWorkingMemoryFields", () => {
  it("derives desiredResult from the purpose section", () => {
    const result = deriveWorkingMemoryFields({
      sectionContent: { purpose: "Izna can share a Loom without asking me." },
    });
    expect(result.desiredResult).toBe(
      "Izna can share a Loom without asking me.",
    );
  });

  it("derives primaryUser from the intended-user section", () => {
    const result = deriveWorkingMemoryFields({
      sectionContent: { "intended-user": "Izna, my assistant" },
    });
    expect(result.primaryUser).toBe("Izna, my assistant");
  });

  it("is Build-Type-agnostic — works for any section content, not just SOP ids", () => {
    const result = deriveWorkingMemoryFields({
      sectionContent: { purpose: "Announce the fall sale." },
    });
    expect(result.desiredResult).toBe("Announce the fall sale.");
    expect(result.primaryUser).toBeNull();
  });

  it("derives nextHelpfulStep from the next section label", () => {
    const result = deriveWorkingMemoryFields({
      sectionContent: {},
      nextSectionLabel: "Intended User",
    });
    expect(result.nextHelpfulStep).toBe("Continue with Intended User");
  });

  it("returns null fields when nothing is answered and nothing existing", () => {
    const result = deriveWorkingMemoryFields({ sectionContent: {} });
    expect(result.desiredResult).toBeNull();
    expect(result.primaryUser).toBeNull();
    expect(result.nextHelpfulStep).toBeNull();
  });

  it("progressively accumulates — answering one section does not erase another", () => {
    const afterPurpose = deriveWorkingMemoryFields({
      sectionContent: { purpose: "Izna can onboard a client alone." },
      nextSectionLabel: "Intended User",
    });
    const afterIntendedUser = deriveWorkingMemoryFields({
      sectionContent: {
        purpose: "Izna can onboard a client alone.",
        "intended-user": "Izna",
      },
      nextSectionLabel: "Before You Begin",
      existing: afterPurpose,
    });
    expect(afterIntendedUser.desiredResult).toBe(
      "Izna can onboard a client alone.",
    );
    expect(afterIntendedUser.primaryUser).toBe("Izna");
    expect(afterIntendedUser.nextHelpfulStep).toBe(
      "Continue with Before You Begin",
    );
  });

  it("does not clobber an existing value when the source section is blank", () => {
    const result = deriveWorkingMemoryFields({
      sectionContent: { purpose: "" },
      existing: { desiredResult: "Already captured this." },
    });
    expect(result.desiredResult).toBe("Already captured this.");
  });

  it("preserves fields it does not derive (existingAssetsFound etc.) unchanged", () => {
    const result = deriveWorkingMemoryFields({
      sectionContent: { purpose: "New purpose." },
      existing: {
        existingAssetsFound: ["welcome email", "intake form"],
        openQuestions: ["where does the checklist fit?"],
      },
    });
    expect(result.existingAssetsFound).toEqual([
      "welcome email",
      "intake form",
    ]);
    expect(result.openQuestions).toEqual(["where does the checklist fit?"]);
  });

  it("nextHelpfulStep clears to null once there is no next section (no stale note)", () => {
    const result = deriveWorkingMemoryFields({
      sectionContent: {},
      nextSectionLabel: null,
      existing: { nextHelpfulStep: "Continue with Purpose" },
    });
    expect(result.nextHelpfulStep).toBe("Continue with Purpose");
    // nextSectionLabel: null with no override intentionally keeps the last
    // known step rather than discarding it — verified explicitly here so a
    // future change to this behavior is a deliberate decision, not a slip.
  });
});

describe("isWorkingMemoryEmpty", () => {
  it("is true for null, undefined, and an all-empty object", () => {
    expect(isWorkingMemoryEmpty(null)).toBe(true);
    expect(isWorkingMemoryEmpty(undefined)).toBe(true);
    expect(isWorkingMemoryEmpty({})).toBe(true);
    expect(
      isWorkingMemoryEmpty({ desiredResult: null, openQuestions: [] }),
    ).toBe(true);
  });

  it("is false once any field has real content", () => {
    expect(isWorkingMemoryEmpty({ desiredResult: "Something real." })).toBe(
      false,
    );
    expect(isWorkingMemoryEmpty({ openQuestions: ["one"] })).toBe(false);
  });
});

describe("WORKING_MEMORY_FIELD_KEYS", () => {
  it("lists the approved 10 fields plus the 2 added for SOP discovery (Phase 2)", () => {
    expect(WORKING_MEMORY_FIELD_KEYS).toHaveLength(12);
    expect([...WORKING_MEMORY_FIELD_KEYS].sort()).toEqual(
      [
        "connectedAssets",
        "decisions",
        "dependencies",
        "desiredResult",
        "existingAssetsFound",
        "intendedAudience",
        "nextHelpfulStep",
        "openQuestions",
        "ownershipContext",
        "primaryUser",
        "waitingItems",
        "whyItMatters",
      ].sort(),
    );
  });
});
