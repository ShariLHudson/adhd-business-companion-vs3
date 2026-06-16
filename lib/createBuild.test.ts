import { describe, expect, it } from "vitest";
import {
  appendExtraDetail,
  enterAddDetailStep,
  validateCreateForBuild,
  resolveCreateWorkspacePhase,
} from "./createBuild";
import {
  advanceAfterDiscoveryAnswer,
  advanceFromTemplate,
  advanceAfterSubtypePick,
  advanceAfterItemPick,
  requiredFieldsComplete,
  getDiscoveryQuestions,
} from "./createWorkflow";

describe("createBuild", () => {
  it("validates readiness workflow with all required answers", () => {
    let wf = advanceFromTemplate(
      advanceAfterSubtypePick(advanceAfterItemPick("Training Guide"), "Client Training"),
    );
    const qs = getDiscoveryQuestions("Training Guide");
    for (const q of qs) {
      wf = advanceAfterDiscoveryAnswer(wf, "Training Guide", q.id, `answer-${q.id}`);
    }
    expect(wf.step).toBe("readiness");
    expect(requiredFieldsComplete("Training Guide", wf.discoveryAnswers)).toBe(true);
    const v = validateCreateForBuild(wf);
    expect(v.ok).toBe(true);
    expect(v.itemType).toBe("Training Guide");
  });

  it("resolves workspace phases", () => {
    expect(
      resolveCreateWorkspacePhase({
        draft: "",
        draftStatus: "building",
        buildApproved: false,
        step: "readiness",
        builderPhase: "generating",
      }),
    ).toBe("generating");
    expect(
      resolveCreateWorkspacePhase({
        draft: "Hello",
        draftStatus: "ready",
        buildApproved: true,
        step: "improve",
      }),
    ).toBe("draft-ready");
  });

  it("appends extra detail and returns to readiness", () => {
    const wf = enterAddDetailStep({
      ...advanceAfterItemPick("Email"),
      step: "readiness",
      discoveryAnswers: { recipient: "Sam", goal: "Follow up" },
    });
    expect(wf.step).toBe("add-detail");
    const next = appendExtraDetail(wf, "Mention the April workshop");
    expect(next.step).toBe("readiness");
    expect(next.discoveryAnswers["extra-detail"]).toContain("April workshop");
    expect(next.discoveryAnswers.recipient).toBe("Sam");
  });
});
