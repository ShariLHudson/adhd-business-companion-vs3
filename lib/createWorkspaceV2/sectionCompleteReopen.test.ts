import { describe, expect, it } from "vitest";
import { EMPTY_CREATE_WORKFLOW } from "@/lib/createWorkflow";
import { resolveFacilitatedSectionStatus } from "@/lib/facilitatedCreation";
import {
  markSectionCompleteForNow,
  reopenSectionForEditing,
  toggleWorkspaceV2SectionSkipped,
  updateWorkspaceV2SectionContent,
} from "@/lib/createWorkspaceV2";

describe("077_006 Complete for Now / Reopen", () => {
  const base = {
    ...EMPTY_CREATE_WORKFLOW,
    templateSections: [
      { id: "purpose", title: "Purpose", prompt: "" },
      { id: "audience", title: "Audience", prompt: "" },
    ],
    sectionContent: { purpose: "Deepen trust this weekend" },
    activeSectionId: "purpose",
  };

  it("marks Complete for Now without clearing content or locking", () => {
    const next = markSectionCompleteForNow(base, "purpose");
    expect(next.completedSectionIds).toContain("purpose");
    expect(next.sectionContent?.purpose).toBe("Deepen trust this weekend");
    expect(next.completedSectionVersions?.purpose?.content).toBe(
      "Deepen trust this weekend",
    );
    expect(
      resolveFacilitatedSectionStatus(
        {
          id: "purpose",
          content: next.sectionContent!.purpose!,
          skipped: false,
        },
        next,
      ),
    ).toBe("complete_for_now");
  });

  it("reopens while preserving content and prior version", () => {
    const completed = markSectionCompleteForNow(base, "purpose");
    const reopened = reopenSectionForEditing(completed, "purpose");
    expect(reopened.completedSectionIds).not.toContain("purpose");
    expect(reopened.sectionContent?.purpose).toBe("Deepen trust this weekend");
    expect(reopened.completedSectionVersions?.purpose?.content).toBe(
      "Deepen trust this weekend",
    );
    expect(reopened.activeSectionId).toBe("purpose");
  });

  it("meaningful edit after Complete for Now reopens status", () => {
    const completed = markSectionCompleteForNow(base, "purpose");
    const edited = updateWorkspaceV2SectionContent(
      completed,
      "purpose",
      "Deepen trust and clarity",
    );
    expect(edited.completedSectionIds).not.toContain("purpose");
    expect(edited.sectionContent?.purpose).toBe("Deepen trust and clarity");
  });

  it("Skip for Now preserves content and stays openable", () => {
    const skipped = toggleWorkspaceV2SectionSkipped(base, "purpose");
    expect(skipped.skippedSectionIds).toContain("purpose");
    expect(skipped.sectionContent?.purpose).toBe("Deepen trust this weekend");
    expect(
      resolveFacilitatedSectionStatus(
        {
          id: "purpose",
          content: skipped.sectionContent!.purpose!,
          skipped: true,
        },
        skipped,
      ),
    ).toBe("skipped_for_now");
  });
});
