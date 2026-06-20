import { describe, expect, it } from "vitest";
import {
  buildSectionEditOpener,
  buildTemplateEditOptions,
} from "./createTemplateEditOptions";
import { getTemplateSectionsForEdit } from "./createTemplateSections";

describe("create template edit options", () => {
  it("builds edit options from template sections", () => {
    const options = buildTemplateEditOptions([
      { id: "audience", label: "Audience" },
      { id: "promise", label: "Promise" },
    ]);
    expect(options.map((option) => option.label)).toEqual([
      "Audience",
      "Promise",
      "Other",
    ]);
  });

  it("creates a section-specific opener", () => {
    expect(buildSectionEditOpener("Promise")).toBe(
      "Let's work on the promise section. What doesn't feel right about it?",
    );
  });

  it("always includes Other", () => {
    const options = buildTemplateEditOptions([]);
    expect(options).toEqual([
      {
        id: "other",
        label: "Other",
        opener: "What would you like to change?",
      },
    ]);
  });

  it("lead magnet sections match the active template", () => {
    const sections = getTemplateSectionsForEdit("lead-magnet");
    const labels = buildTemplateEditOptions(sections).map((o) => o.label);
    expect(labels).toContain("Title");
    expect(labels).toContain("Audience");
    expect(labels).toContain("Call To Action");
    expect(labels[labels.length - 1]).toBe("Other");
  });

  it("workshop sections are distinct from lead magnet", () => {
    const workshop = getTemplateSectionsForEdit("workshop").map((s) => s.label);
    expect(workshop).toContain("Workshop Title");
    expect(workshop).toContain("Teaching Points");
    expect(workshop).not.toContain("Format");
  });

  it("marketing plan sections match the active template", () => {
    const labels = getTemplateSectionsForEdit("marketing-plan").map((s) => s.label);
    expect(labels).toEqual([
      "Audience",
      "Offer",
      "Goals",
      "Messaging",
      "Content Strategy",
      "Lead Generation",
      "Sales Strategy",
      "Timeline",
    ]);
  });
});
