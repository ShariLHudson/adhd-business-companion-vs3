import { describe, expect, it } from "vitest";
import {
  appendExtraDetail,
  enterAddDetailStep,
  validateCreateForBuild,
} from "./createBuild";
import {
  advanceAfterDiscoveryAnswer,
  advanceFromTemplate,
  advanceAfterSubtypePick,
  advanceAfterItemPick,
} from "./createWorkflow";

describe("createBuild", () => {
  it("validates readiness workflow with answers", () => {
    let wf = advanceFromTemplate(
      advanceAfterSubtypePick(advanceAfterItemPick("Training Guide"), "Client Training"),
    );
    const qs = ["audience", "goal", "format"] as const;
    for (let i = 0; i < qs.length; i++) {
      wf = advanceAfterDiscoveryAnswer(wf, "Training Guide", qs[i]!, `answer ${i}`);
    }
    expect(wf.step).toBe("readiness");
    const v = validateCreateForBuild(wf);
    expect(v.ok).toBe(true);
    expect(v.answersCount).toBeGreaterThan(0);
    expect(v.itemType).toBe("Training Guide");
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
