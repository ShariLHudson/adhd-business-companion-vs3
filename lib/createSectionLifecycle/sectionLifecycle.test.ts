import { describe, expect, it } from "vitest";
import { EMPTY_CREATE_WORKFLOW } from "@/lib/createWorkflow";
import {
  applySectionLifecycleTransition,
  fromEventSectionDomainStatus,
  labelForCreateSectionLifecycleStatus,
  resolveCreateSectionLifecycleStatus,
  toEventSectionDomainStatus,
} from "./index";

describe("createSectionLifecycle — authoritative section status", () => {
  const base = {
    ...EMPTY_CREATE_WORKFLOW,
    templateSections: [
      { id: "purpose", title: "Purpose", prompt: "" },
      { id: "audience", title: "Audience", prompt: "" },
    ],
    sectionContent: { purpose: "Deepen trust this weekend" },
    activeSectionId: "purpose",
  };

  it("resolves not_started / in_progress", () => {
    expect(
      resolveCreateSectionLifecycleStatus(
        { id: "audience", content: "", skipped: false },
        { ...base, activeSectionId: "purpose" },
      ),
    ).toBe("not_started");
    expect(
      resolveCreateSectionLifecycleStatus(
        { id: "purpose", content: "Deepen trust this weekend", skipped: false },
        base,
      ),
    ).toBe("in_progress");
  });

  it("complete_for_now preserves content and is never a lock", () => {
    const next = applySectionLifecycleTransition(base, "purpose", {
      type: "complete_for_now",
    });
    expect(next.completedSectionIds).toContain("purpose");
    expect(next.sectionContent?.purpose).toBe("Deepen trust this weekend");
    expect(
      resolveCreateSectionLifecycleStatus(
        {
          id: "purpose",
          content: next.sectionContent!.purpose!,
          skipped: false,
        },
        next,
      ),
    ).toBe("complete_for_now");
  });

  it("reopen preserves version history and yields reopened status", () => {
    const completed = applySectionLifecycleTransition(base, "purpose", {
      type: "complete_for_now",
    });
    const reopened = applySectionLifecycleTransition(completed, "purpose", {
      type: "reopen",
    });
    expect(reopened.completedSectionIds).not.toContain("purpose");
    expect(reopened.completedSectionVersions?.purpose?.content).toBe(
      "Deepen trust this weekend",
    );
    expect(
      resolveCreateSectionLifecycleStatus(
        {
          id: "purpose",
          content: reopened.sectionContent!.purpose!,
          skipped: false,
        },
        reopened,
      ),
    ).toBe("reopened");
  });

  it("meaningful edit after complete_for_now reopens", () => {
    const completed = applySectionLifecycleTransition(base, "purpose", {
      type: "complete_for_now",
    });
    const edited = applySectionLifecycleTransition(completed, "purpose", {
      type: "edit",
      content: "Deepen trust and clarity",
    });
    expect(edited.completedSectionIds).not.toContain("purpose");
    expect(
      resolveCreateSectionLifecycleStatus(
        {
          id: "purpose",
          content: edited.sectionContent!.purpose!,
          skipped: false,
        },
        edited,
      ),
    ).toBe("reopened");
  });

  it("skip_for_now preserves content", () => {
    const skipped = applySectionLifecycleTransition(base, "purpose", {
      type: "skip_for_now",
    });
    expect(skipped.skippedSectionIds).toContain("purpose");
    expect(skipped.sectionContent?.purpose).toBe("Deepen trust this weekend");
    expect(
      resolveCreateSectionLifecycleStatus(
        {
          id: "purpose",
          content: skipped.sectionContent!.purpose!,
          skipped: true,
        },
        skipped,
      ),
    ).toBe("skipped_for_now");
  });

  it("Event domain adapter maps both directions", () => {
    expect(toEventSectionDomainStatus("complete_for_now")).toBe("confirmed");
    expect(toEventSectionDomainStatus("skipped_for_now")).toBe("skipped");
    expect(toEventSectionDomainStatus("reopened")).toBe("drafting");
    expect(fromEventSectionDomainStatus("confirmed")).toBe("complete_for_now");
    expect(
      fromEventSectionDomainStatus("drafting", { hasPriorMilestone: true }),
    ).toBe("reopened");
  });

  it("labels are owned here", () => {
    expect(labelForCreateSectionLifecycleStatus("complete_for_now")).toBe(
      "Complete for Now",
    );
    expect(labelForCreateSectionLifecycleStatus("reopened")).toBe("Reopened");
  });
});
