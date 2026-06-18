import { describe, expect, it } from "vitest";
import {
  advanceAfterDiscoveryAnswer,
  advanceAfterItemPick,
  advanceAfterTypePick,
  advanceToDiscovery,
  applyCreateDiscoveryFromChat,
  buildBriefFromDiscovery,
  discoveryQuestionProgress,
  getDiscoveryQuestions,
  hasEnoughDiscoveryForDraft,
  readinessSummary,
} from "./createWorkflow";

describe("createWorkflow", () => {
  it("uses type-specific discovery questions", () => {
    const qs = getDiscoveryQuestions("Proposal");
    expect(qs[0]?.id).toBe("client");
    expect(getDiscoveryQuestions("Unknown Type")).toHaveLength(3);
  });

  it("builds a brief from discovery answers", () => {
    const brief = buildBriefFromDiscovery("Email", {
      recipient: "Sarah",
      goal: "Book a call",
    });
    expect(brief).toContain("Creating: Email");
    expect(brief).toContain("Sarah");
  });

  it("reports discovery question progress", () => {
    const start = advanceToDiscovery(advanceAfterTypePick("Social Post", "content"));
    const progress = discoveryQuestionProgress("Social Post", start);
    expect(progress).toEqual({ current: 1, total: 3 });
  });

  it("skips subtype and template — item pick lands on discovery", () => {
    const wf = advanceAfterItemPick("Email");
    expect(wf.step).toBe("discovery");
    expect(wf.selectedSubtype).toBeTruthy();
    expect(wf.selectedTemplateId).toBeTruthy();
  });

  it("reaches readiness after one discovery answer (simplified Create)", () => {
    const start = advanceAfterItemPick("Social Post");
    const qs = getDiscoveryQuestions("Social Post");
    const state = advanceAfterDiscoveryAnswer(
      start,
      "Social Post",
      qs[0]!.id,
      "founders on LinkedIn",
    );
    expect(state.step).toBe("readiness");
    expect(hasEnoughDiscoveryForDraft(state.discoveryAnswers)).toBe(true);
  });

  it("still supports full discovery when more answers are given", () => {
    const start = advanceAfterItemPick("Email");
    const qs = getDiscoveryQuestions("Email");
    let state = start;
    for (const q of qs) {
      state = advanceAfterDiscoveryAnswer(state, "Email", q.id, "answer");
    }
    expect(state.step).toBe("readiness");
    expect(readinessSummary("Email", state.discoveryAnswers).length).toBe(
      qs.length,
    );
  });

  it("applies chat text as the current discovery answer", () => {
    const start = advanceAfterItemPick("Proposal");
    const next = applyCreateDiscoveryFromChat(
      start,
      "Acme Corp needs a Q3 retainer scope",
    );
    expect(next?.step).toBe("readiness");
    expect(next?.discoveryAnswers.client).toContain("Acme");
  });

  it("ignores chat fill when not on discovery step", () => {
    const wf = { ...advanceAfterItemPick("Email"), step: "readiness" as const };
    expect(applyCreateDiscoveryFromChat(wf, "Some answer")).toBeNull();
  });
});
