import { describe, expect, it } from "vitest";
import {
  COLLECTION_FLOW_DESIGN_RULES,
  COLLECTION_FLOW_QA_CHECKLIST,
  formatCollectionFlowQaReport,
  runCollectionFlowAutomatedChecks,
} from "./collectionFlowQa";

describe("collectionFlowQa", () => {
  it("defines ten checklist steps", () => {
    expect(COLLECTION_FLOW_QA_CHECKLIST).toHaveLength(10);
    expect(COLLECTION_FLOW_QA_CHECKLIST.map((item) => item.step)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
  });

  it("documents four design rules", () => {
    expect(COLLECTION_FLOW_DESIGN_RULES).toHaveLength(4);
    expect(COLLECTION_FLOW_DESIGN_RULES.map((rule) => rule.id)).toEqual([
      "no-auto-save",
      "permission-first",
      "no-interrupt",
      "one-offer",
    ]);
  });

  it("passes automated smoke checks", () => {
    const results = runCollectionFlowAutomatedChecks();
    const failed = results.filter((row) => !row.passed);
    expect(failed, formatCollectionFlowQaReport(results)).toEqual([]);
  });
});
