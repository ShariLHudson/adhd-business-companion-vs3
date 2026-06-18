import { describe, expect, it } from "vitest";
import { bootstrapCreateBuilderSession } from "./createBuilderChat";
import { advanceAfterDiscoveryAnswer, advanceAfterItemPick } from "./createWorkflow";
import { buildDiscoveryWorkspaceView } from "./createDiscoveryWorkspace";

describe("createDiscoveryWorkspace", () => {
  it("maps Workshop answers into default template sections", () => {
    let wf = {
      ...advanceAfterItemPick("Workshop"),
      questionMode: "split_screen" as const,
    };
    expect(wf.selectedTemplateId).toBe("workshop-default");

    wf = advanceAfterDiscoveryAnswer(
      wf,
      "Workshop",
      "topic",
      "ADHD productivity for entrepreneurs",
    );
    wf = advanceAfterDiscoveryAnswer(wf, "Workshop", "audience", "Solo founders");

    const view = buildDiscoveryWorkspaceView(wf);
    expect(view).not.toBeNull();
    expect(view!.templateName).toContain("Workshop");
    expect(view!.collectedAnswers).toHaveLength(2);
    expect(view!.templateSections.find((s) => s.id === "overview")?.content).toContain(
      "ADHD productivity",
    );
    expect(view!.templateSections.find((s) => s.id === "overview")?.status).toBe(
      "filled",
    );
    expect(view!.isReady).toBe(false);
    expect(view!.incompleteSectionLabels.length).toBeGreaterThan(0);
    expect(view!.currentQuestion).toContain("outcome");
  });

  it("marks ready only when outline sections are complete", () => {
    const { session } = bootstrapCreateBuilderSession("Newsletter");
    let wf = {
      ...session.workflow,
      discoverySubphase: "sections" as const,
      discoveryAnswers: {
        reader: "ADHD founders",
        theme: "Perfectionism traps",
        goal: "Educate and nurture",
        cta: "Reply with your biggest struggle",
      },
      sectionContent: {
        subject: "Stop waiting for perfect",
        tip: "The 5-minute rule",
        closing: "See you next week",
      },
    };
    wf = { ...wf, step: "readiness" };

    const view = buildDiscoveryWorkspaceView(wf);
    expect(view!.isReady).toBe(true);
    expect(view!.templateSections.find((s) => s.id === "cta")?.content).toContain(
      "Reply",
    );
  });
});
