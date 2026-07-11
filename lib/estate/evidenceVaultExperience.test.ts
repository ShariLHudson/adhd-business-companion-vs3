import { describe, expect, it } from "vitest";
import {
  EVIDENCE_VAULT_DISCOVERY_GUIDE_FIELDS,
  EVIDENCE_VAULT_DISCOVERY_GUIDE_QUESTIONS,
  EVIDENCE_VAULT_POST_SAVE_NAV,
} from "./evidenceVaultExperience";

describe("evidenceVaultExperience", () => {
  it("lists all guided discovery questions for new discoveries", () => {
    expect(EVIDENCE_VAULT_DISCOVERY_GUIDE_QUESTIONS).toEqual([
      "What happened?",
      "What did you learn?",
      "What problem did you solve?",
      "Who did you help?",
      "What did you create?",
      "What evidence shows your growth?",
    ]);
    expect(EVIDENCE_VAULT_DISCOVERY_GUIDE_FIELDS).toHaveLength(6);
    expect(EVIDENCE_VAULT_DISCOVERY_GUIDE_FIELDS.map((field) => field.fieldId)).toEqual([
      "situation",
      "lessonsLearned",
      "problem",
      "whoBenefited",
      "whatIDid",
      "whyItMattered",
    ]);
  });

  it("offers only working post-save actions", () => {
    const labels = EVIDENCE_VAULT_POST_SAVE_NAV.map((action) => action.label);
    expect(labels).toEqual([
      "View Discovery",
      "Add Another Discovery",
      "Return to Estate",
    ]);
    expect(labels).not.toContain("Print");
    expect(labels).not.toContain("Save PDF");
    expect(labels).not.toContain("Browse Archive");
  });
});
