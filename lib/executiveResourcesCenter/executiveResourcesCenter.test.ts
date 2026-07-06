import { describe, expect, it } from "vitest";

import {
  composeExecutiveResourcesCenterView,
  evaluateExecutiveResourceAdmission,
  EXECUTIVE_RESOURCE_ADMISSION_QUESTIONS,
} from "./index";

describe("Executive Resources Center™", () => {
  it("defines five admission questions", () => {
    expect(EXECUTIVE_RESOURCE_ADMISSION_QUESTIONS).toHaveLength(5);
    expect(EXECUTIVE_RESOURCE_ADMISSION_QUESTIONS[0]!.question).toContain("weekly");
  });

  it("evaluateExecutiveResourceAdmission requires all five yes answers", () => {
    expect(evaluateExecutiveResourceAdmission([true, true, true, true, true])).toBe(true);
    expect(evaluateExecutiveResourceAdmission([true, true, true, true, false])).toBe(false);
    expect(evaluateExecutiveResourceAdmission([true, true, true])).toBe(false);
  });

  it("composeExecutiveResourcesCenterView links integration and vault", () => {
    const view = composeExecutiveResourcesCenterView();
    expect(view.headline).toContain("Executive Resources Center");
    expect(view.integrationCenterHref).toContain("executive-integration-center");
    expect(view.knowledgeVaultHref).toContain("founder-knowledge-vault");
    expect(view.masterLibraryHref).toContain("spark-master-library");
    expect(view.departments.length).toBe(8);
    expect(view.executiveSearch.scopes.length).toBeGreaterThan(10);
  });
});
