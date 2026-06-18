import { describe, expect, it } from "vitest";
import {
  appendExtraDetail,
  enterAddDetailStep,
  validateCreateForBuild,
  resolveCreateWorkspacePhase,
} from "./createBuild";
import {
  advanceAfterDiscoveryAnswer,
  advanceAfterItemPick,
  getDiscoveryQuestions,
} from "./createWorkflow";

describe("createBuild", () => {
  it("validates readiness workflow with one discovery answer", () => {
    let wf = advanceAfterItemPick("Training Guide");
    const qs = getDiscoveryQuestions("Training Guide");
    wf = advanceAfterDiscoveryAnswer(
      wf,
      "Training Guide",
      qs[0]!.id,
      "answer-first",
    );
    expect(wf.step).toBe("readiness");
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
    expect(
      resolveCreateWorkspacePhase({
        draft: "",
        draftStatus: "error",
        buildApproved: false,
        step: "readiness",
      }),
    ).toBe("error");
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

  it("allows chat-approved build with brief even when fields incomplete", () => {
    const wf = advanceAfterItemPick("Social Post");
    const brief = "Post about ADHD Business Ecosystem launching July 1, 2026.";
    const v = validateCreateForBuild(
      {
        ...wf,
        step: "readiness",
        discoveryAnswers: { topic: brief },
      },
      { fromChatApproval: true, brief },
    );
    expect(v.ok).toBe(true);
    expect(v.readyToBuild).toBe(true);
  });
});
