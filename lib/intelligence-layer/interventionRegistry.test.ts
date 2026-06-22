import { describe, expect, it } from "vitest";
import {
  getInterventionRegistry,
  isRegisteredInterventionBucket,
  listInterventionBuckets,
  lookupInterventionEntry,
  resolveOfferBucket,
  type TrustTraitPath,
} from "./interventionRegistry";

const APPROVED_BUCKETS = [
  "breathing",
  "clear_mind",
  "brain_dump",
  "reset",
  "momentum_prompt",
  "workspace_open",
  "create",
  "plan_my_day",
  "future_shari_offer",
  "generic_tip",
] as const;

const ALLOWED_TRUST_PATHS = new Set<TrustTraitPath>([
  "relationship.trust.responds_to_suggestions",
  "relationship.trust.ignores_generic_suggestions",
  "relationship.trust.momentum_from_interventions",
  "relationship.trust.disengages_from_nagging",
]);

describe("interventionRegistry", () => {
  it("defines exactly the approved v1 buckets", () => {
    expect(listInterventionBuckets()).toEqual([...APPROVED_BUCKETS]);
    expect(getInterventionRegistry()).toHaveLength(10);
  });

  it("each entry has bucket, class, legacyAliases, and trustTraitPaths", () => {
    for (const entry of getInterventionRegistry()) {
      expect(entry.bucket).toBeTruthy();
      expect(entry.class).toBeTruthy();
      expect(entry.legacyAliases.length).toBeGreaterThan(0);
      expect(entry.trustTraitPaths.length).toBeGreaterThan(0);
      for (const path of entry.trustTraitPaths) {
        expect(ALLOWED_TRUST_PATHS.has(path)).toBe(true);
      }
    }
  });

  it("resolves canonical bucket names", () => {
    for (const bucket of APPROVED_BUCKETS) {
      expect(resolveOfferBucket(bucket)).toBe(bucket);
      expect(isRegisteredInterventionBucket(bucket)).toBe(true);
      expect(lookupInterventionEntry(bucket)?.bucket).toBe(bucket);
    }
  });

  it("resolves legacy aliases (case and separator tolerant)", () => {
    expect(resolveOfferBucket("clear-mind")).toBe("clear_mind");
    expect(resolveOfferBucket("CLEAR_MIND")).toBe("clear_mind");
    expect(resolveOfferBucket("breathe")).toBe("breathing");
    expect(resolveOfferBucket("breathing")).toBe("breathing");
    expect(resolveOfferBucket("brain-dump")).toBe("brain_dump");
    expect(resolveOfferBucket("get-unstuck")).toBe("momentum_prompt");
    expect(resolveOfferBucket("workspace.offer_accept")).toBe("workspace_open");
    expect(resolveOfferBucket("plan-my-day")).toBe("plan_my_day");
    expect(resolveOfferBucket("day_designer")).toBe("plan_my_day");
    expect(resolveOfferBucket("suggestion:plan-my-day")).toBe("plan_my_day");
    expect(resolveOfferBucket("suggestion:generic-tip")).toBe("generic_tip");
    expect(resolveOfferBucket("future-shari-offer")).toBe("future_shari_offer");
    expect(resolveOfferBucket("focus-session")).toBe("generic_tip");
    expect(resolveOfferBucket("spin-wheel")).toBe("generic_tip");
  });

  it("returns null for unknown input without throwing", () => {
    const unknowns: Array<string | null | undefined> = [
      "",
      "   ",
      "not-a-real-offer",
      "random_slug_xyz",
      null,
      undefined,
    ];
    for (const value of unknowns) {
      expect(resolveOfferBucket(value)).toBeNull();
    }
  });

  it("isRegisteredInterventionBucket is false for unknown strings", () => {
    expect(isRegisteredInterventionBucket("clear-mind")).toBe(false);
    expect(isRegisteredInterventionBucket("unknown_bucket")).toBe(false);
    expect(isRegisteredInterventionBucket("")).toBe(false);
  });

  it("does not throw on malformed input", () => {
    expect(() => resolveOfferBucket("!!!")).not.toThrow();
    expect(() => isRegisteredInterventionBucket("!!!")).not.toThrow();
  });
});
