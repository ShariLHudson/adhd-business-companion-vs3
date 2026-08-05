import { describe, expect, it } from "vitest";
import {
  advanceAfterSubtypePick,
  advanceFromTemplate,
  advanceAfterItemPick,
} from "./createWorkflow";
import {
  buildFullCreateBrief,
  buildGenerationBrief,
  defaultTemplateFor,
  listPresetTemplates,
  reconcileTemplateForType,
  resolveTemplateName,
} from "./createTemplates";

describe("createTemplates", () => {
  it("lists newsletter templates for a subtype", () => {
    const templates = listPresetTemplates("Newsletter", "Educational");
    expect(templates.some((t) => t.name === "Educational Newsletter")).toBe(true);
    expect(templates.some((t) => t.name === "Default Newsletter Template")).toBe(
      true,
    );
  });

  it("defaults newsletter template from subtype", () => {
    const preset = defaultTemplateFor("Newsletter", "Weekly Tips");
    expect(preset.name).toBe("Weekly Tips Newsletter");
    expect(preset.sections.map((s) => s.label)).toContain("Subject Line");
  });

  it("advances from item pick straight to discovery with internal defaults", () => {
    const wf = advanceAfterItemPick("Newsletter");
    expect(wf.step).toBe("discovery");
    expect(wf.selectedTemplateId).toBeTruthy();
    const fromSubtype = advanceAfterSubtypePick(wf, "Educational");
    expect(fromSubtype.step).toBe("template");
    const ready = advanceFromTemplate(fromSubtype);
    expect(ready.step).toBe("discovery");
  });

  it("appends template scaffold to generation brief", () => {
    const wf = reconcileTemplateForType({
      ...advanceAfterItemPick("Newsletter"),
      selectedSubtype: "Educational",
    });
    const brief = buildFullCreateBrief({
      ...wf,
      discoveryAnswers: {
        theme: "Grow my list",
        audience: "Founders",
        "must-include": "One tip",
      },
    });
    expect(brief).toContain("Grow my list");
    expect(brief).toMatch(/Newsletter/);
    expect(brief).toContain("Subject Line");
  });

  it("supports freeform without template", () => {
    const wf = advanceFromTemplate(
      advanceAfterSubtypePick(advanceAfterItemPick("Social Post"), "Educational"),
    );
    const discovery = "Content type: Social Post\n\nWhat is this for?\nEngage";
    const brief = buildGenerationBrief(
      { ...wf, useTemplate: false, selectedTemplateId: "none" },
      discovery,
    );
    expect(brief).toBe(discovery);
    expect(resolveTemplateName({ ...wf, useTemplate: false, selectedTemplateId: "none" })).toBe(
      "No template (freeform)",
    );
  });

  it("replaces stale email template when item type changes to Workshop", () => {
    const wf = reconcileTemplateForType({
      ...advanceAfterItemPick("Workshop"),
      selectedTemplateId: "email-default",
      selectedTemplateName: "Default Email Template",
      useTemplate: true,
      step: "discovery",
    });
    expect(wf.selectedTemplateId).toBe("workshop-default");
    expect(resolveTemplateName(wf)).toContain("Workshop");
  });

  // 2026-08-05 — ADR-013 routing exposure fix (Checklist/Document templates).
  // Single-artifact Begin requests now default to Create/Current Focus, so
  // these two types started hitting the generic fallback (Introduction /
  // Main Content / Call to Action / Closing) instead of a real structure.
  describe("Checklist and Document dedicated templates", () => {
    it("Checklist resolves to its own template, not the generic fallback", () => {
      const preset = defaultTemplateFor("Checklist");
      expect(preset.id).toBe("checklist-default");
      const labels = preset.sections.map((s) => s.label);
      expect(labels).toContain("Checklist Items");
      expect(labels).toContain("Before You Start");
      expect(labels).not.toContain("Introduction");
      expect(labels).not.toContain("Main Content");
      expect(labels).not.toContain("Call to Action");
    });

    it("Document resolves to its own template, not the generic fallback", () => {
      // "Report" is not a resolvable artifactType anywhere in the app
      // (userFacingSubtypeOptionsForItem is hard-disabled, no free-text /
      // catalog / Browse More path ever produces "Report") — "Document" is
      // the real, reachable catalog item that report-style single
      // documents land on today.
      const preset = defaultTemplateFor("Document");
      expect(preset.id).toBe("document-default");
      const labels = preset.sections.map((s) => s.label);
      expect(labels).toContain("Key Points");
      expect(labels).toContain("Purpose & Overview");
      expect(labels).not.toContain("Introduction");
      expect(labels).not.toContain("Main Content");
      expect(labels).not.toContain("Call to Action");
    });

    it("a type with no dedicated template still falls back to the generic template", () => {
      // Regression guard — confirms the fallback path itself still works
      // for types that genuinely have none, distinguishing "no template
      // exists" from "the lookup is broken."
      const preset = defaultTemplateFor("Some Unmapped Type");
      expect(preset.id).toBe("generic-default");
      expect(preset.sections.map((s) => s.label)).toContain("Introduction");
    });

    it("existing SOP, Proposal, and Training Guide templates are unchanged", () => {
      const sop = defaultTemplateFor("SOP");
      expect(sop.id).toBe("sop-default");
      expect(sop.sections.map((s) => s.label)).toEqual([
        "Purpose",
        "Scope",
        "Steps",
        "Notes & Tips",
      ]);

      const proposal = defaultTemplateFor("Proposal");
      expect(proposal.id).toBe("proposal-default");
      expect(proposal.sections.map((s) => s.label)).toEqual([
        "Executive Summary",
        "Scope of Work",
        "Approach",
        "Timeline",
        "Investment",
      ]);

      const training = defaultTemplateFor("Training Guide");
      expect(training.id).toBe("training-default");
      expect(training.sections.map((s) => s.label)).toEqual([
        "Overview",
        "Learning Objectives",
        "Main Content",
        "Exercise / Practice",
        "Summary",
      ]);
    });
  });
});
