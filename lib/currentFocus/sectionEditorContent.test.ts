/**
 * Per-section editor binding — no shared draft buffer.
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import {
  resolveSectionEditorSeed,
  sectionEditorContentKey,
} from "./sectionEditorContent";
import type { CanonicalCurrentFocus } from "./types";
import { initializeWorkspaceV2Workflow } from "@/lib/createWorkspaceV2";
import { updateWorkspaceV2SectionContent } from "@/lib/createWorkspaceV2";
import { openWorkshopMapSection } from "@/lib/workTypeSchema/openWorkshopMapSection";
import { resolveFocusForCreationDestination } from "./resolveCanonicalFocus";

function focus(
  partial: Partial<CanonicalCurrentFocus> &
    Pick<CanonicalCurrentFocus, "focusId" | "creationId" | "title">,
): CanonicalCurrentFocus {
  return {
    purpose: "test",
    prompt: "test",
    responseType: "multiline",
    knownContext: [],
    availableGuidance: [],
    completionCriteria: "ok",
    nextTransition: null,
    contextVersion: 1,
    sectionId: partial.sectionId ?? null,
    assetTypeId: null,
    introductoryGuidance: null,
    savedContent: partial.savedContent,
    ...partial,
  };
}

describe("section editor content binding", () => {
  it("keys content by workId + sectionId", () => {
    expect(
      sectionEditorContentKey({
        creationId: "work-abc",
        sectionId: "main",
        focusId: "section:main",
      }),
    ).toBe("work-abc::main");
  });

  it("seeds from savedContent for that section, or empty — never another section", () => {
    const intro = focus({
      focusId: "section:intro",
      creationId: "work-1",
      title: "Introduction",
      sectionId: "intro",
      savedContent: "Intro only",
    });
    const main = focus({
      focusId: "section:main",
      creationId: "work-1",
      title: "Main Content",
      sectionId: "main",
      savedContent: "",
    });
    expect(resolveSectionEditorSeed(intro, { readRecovery: false })).toBe(
      "Intro only",
    );
    expect(resolveSectionEditorSeed(main, { readRecovery: false })).toBe("");
    expect(resolveSectionEditorSeed(main, { readRecovery: false })).not.toBe(
      "Intro only",
    );
  });

  it("map switch loads each section's independent sectionContent record", () => {
    let wf = {
      ...initializeWorkspaceV2Workflow("Marketing Campaign"),
      sessionId: "work-section-bind-1",
    };
    wf = updateWorkspaceV2SectionContent(wf, "intro", "Intro words");
    wf = updateWorkspaceV2SectionContent(wf, "main", "Main words");

    wf = openWorkshopMapSection(wf, "intro");
    const introFocus = resolveFocusForCreationDestination(wf)!;
    expect(introFocus.sectionId).toBe("intro");
    expect(introFocus.savedContent).toBe("Intro words");
    expect(
      resolveSectionEditorSeed(introFocus, { readRecovery: false }),
    ).toBe("Intro words");

    wf = openWorkshopMapSection(wf, "cta");
    const ctaFocus = resolveFocusForCreationDestination(wf)!;
    expect(ctaFocus.sectionId).toBe("cta");
    expect(ctaFocus.savedContent ?? "").toBe("");
    expect(resolveSectionEditorSeed(ctaFocus, { readRecovery: false })).toBe(
      "",
    );
    expect(resolveSectionEditorSeed(ctaFocus, { readRecovery: false })).not.toBe(
      "Intro words",
    );
    expect(resolveSectionEditorSeed(ctaFocus, { readRecovery: false })).not.toBe(
      "Main words",
    );

    wf = openWorkshopMapSection(wf, "main");
    const mainFocus = resolveFocusForCreationDestination(wf)!;
    expect(mainFocus.savedContent).toBe("Main words");
    expect(
      sectionEditorContentKey(mainFocus),
    ).not.toBe(sectionEditorContentKey(introFocus));
  });
});
