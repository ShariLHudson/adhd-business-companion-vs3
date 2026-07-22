/**
 * Create Simplification & Category Evaluation — Part 15 audit completeness.
 */

import { describe, expect, it } from "vitest";
import { allCatalogItems } from "@/lib/createCatalog";
import {
  auditForLabel,
  auditedCatalogLabels,
  CREATE_OPTION_AUDIT,
  hiddenAuditRows,
  mergedAuditRows,
  renamedAuditRows,
} from "./createOptionAudit";

describe("Part 15 — Create option audit", () => {
  it("audits every catalog option exactly once", () => {
    const catalogLabels = allCatalogItems().map((i) => i.label);
    const audited = auditedCatalogLabels();
    expect(new Set(audited).size).toBe(audited.length);
    for (const label of catalogLabels) {
      expect(audited).toContain(label);
    }
    // No stale rows for options that no longer exist in the catalog.
    for (const label of audited) {
      expect(catalogLabels).toContain(label);
    }
  });

  it("every row answers keep + reason (Part 5 evaluation)", () => {
    for (const row of CREATE_OPTION_AUDIT) {
      expect(row.reason.trim().length).toBeGreaterThan(10);
      expect(typeof row.keep).toBe("boolean");
    }
  });

  it("hides Client Avatar — routed elsewhere, not a Create output", () => {
    const row = auditForLabel("Client Avatar");
    expect(row?.keep).toBe(false);
  });

  it("merges narrow email variants into the Email parent type", () => {
    const followUp = auditForLabel("Follow-Up Email");
    expect(followUp?.newParentType).toBe("Email");
    expect(followUp?.newSubtype).toBe("Follow-Up");
  });

  it("merges social platform variants into Social Content", () => {
    for (const label of ["Social Post", "Facebook Post", "LinkedIn Post"]) {
      const row = auditForLabel(label);
      expect(row?.newParentType).toBe("Social Content");
    }
  });

  it("merges Client Check-In / Referral / Testimonial into Client Communication", () => {
    for (const label of [
      "Client Check-In",
      "Referral Request",
      "Testimonial Request",
    ]) {
      const row = auditForLabel(label);
      expect(row?.newParentType).toBe("Client Communication");
    }
  });

  it("merges Process / Automation / GHL Workflow into Standard Operating Procedure", () => {
    for (const label of ["SOP", "Process", "Automation", "GHL Workflow"]) {
      const row = auditForLabel(label);
      expect(row?.newParentType).toBe("Standard Operating Procedure");
    }
  });

  it("renames unclear names for immediate understanding", () => {
    const rename = renamedAuditRows().map((r) => r.currentName);
    expect(rename).toContain("Claude Prompt");
    expect(rename).toContain("Document");
    expect(auditForLabel("Claude Prompt")?.renameTo).toBe("AI Prompt");
  });

  it("reports merge and hidden counts consistent with mission (fewer duplicates)", () => {
    expect(mergedAuditRows().length).toBeGreaterThanOrEqual(8);
    expect(hiddenAuditRows().length).toBeGreaterThanOrEqual(1);
  });
});
