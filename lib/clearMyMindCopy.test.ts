import { describe, expect, it } from "vitest";
import {
  CLEAR_MY_MIND_ADD_MORE_LABEL,
  CLEAR_MY_MIND_RELEASE_DONE_LABEL,
  CLEAR_MY_MIND_SPLIT_CONFIRM,
  CLEAR_MY_MIND_SPLIT_HEADLINE,
} from "./clearMyMindCopy";
import { MORE_CLUSTER_FALLBACK } from "./brainDumpClusterModel";
import { OVERFLOW_CLUSTER_FALLBACK } from "./clearMyMindCopy";

describe("clearMyMindCopy", () => {
  it("uses relief-first release completion label", () => {
    expect(CLEAR_MY_MIND_RELEASE_DONE_LABEL).toBe("That's everything for now");
  });

  it("offers add-more without restarting session", () => {
    expect(CLEAR_MY_MIND_ADD_MORE_LABEL).toMatch(/add more/i);
  });

  it("uses companion split language", () => {
    expect(CLEAR_MY_MIND_SPLIT_HEADLINE).toContain("separate thoughts");
    expect(CLEAR_MY_MIND_SPLIT_CONFIRM).toMatch(/separately/i);
  });

  it("avoids more in overflow fallback copy", () => {
    expect(OVERFLOW_CLUSTER_FALLBACK).not.toMatch(/\bmore\b/i);
    expect(MORE_CLUSTER_FALLBACK).not.toMatch(/\bmore\b/i);
  });
});
