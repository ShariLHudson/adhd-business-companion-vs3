import { describe, expect, it } from "vitest";
import {
  CLEAR_MY_MIND_ADD_MORE_LABEL,
  CLEAR_MY_MIND_SEE_HELD_LABEL,
  CLEAR_MY_MIND_SPLIT_CONFIRM,
  CLEAR_MY_MIND_SPLIT_HEADLINE,
  OVERFLOW_CLUSTER_FALLBACK,
} from "./clearMyMindCopy";
import { MORE_CLUSTER_FALLBACK } from "./brainDumpClusterModel";

describe("clearMyMindCopy", () => {
  it("uses relief-first landscape transition label", () => {
    expect(CLEAR_MY_MIND_SEE_HELD_LABEL).toBe("See what's held");
  });

  it("offers add-more without restarting session", () => {
    expect(CLEAR_MY_MIND_ADD_MORE_LABEL).toBe("Add More Thoughts");
  });

  it("uses companion split language", () => {
    expect(CLEAR_MY_MIND_SPLIT_HEADLINE).toContain("separate thoughts");
    expect(CLEAR_MY_MIND_SPLIT_CONFIRM).toBe("Separate Them");
  });

  it("avoids more in overflow fallback copy", () => {
    expect(OVERFLOW_CLUSTER_FALLBACK).not.toMatch(/\bmore\b/i);
    expect(MORE_CLUSTER_FALLBACK).not.toMatch(/\bmore\b/i);
  });
});
