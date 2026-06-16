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

  it("advances through template step before discovery", () => {
    let wf = advanceAfterItemPick("Newsletter");
    wf = advanceAfterSubtypePick(wf, "Educational");
    expect(wf.step).toBe("template");
    wf = advanceFromTemplate(wf);
    expect(wf.step).toBe("discovery");
    expect(wf.selectedTemplateId).toBeTruthy();
  });

  it("appends template scaffold to generation brief", () => {
    const wf = advanceFromTemplate(
      advanceAfterSubtypePick(advanceAfterItemPick("Newsletter"), "Educational"),
    );
    const brief = buildFullCreateBrief({
      ...wf,
      discoveryAnswers: {
        theme: "Grow my list",
        audience: "Founders",
        "must-include": "One tip",
      },
    });
    expect(brief).toContain("Grow my list");
    expect(brief).toContain("Educational Newsletter");
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
});
