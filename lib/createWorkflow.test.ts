import { describe, expect, it } from "vitest";
import {
  advanceAfterDiscoveryAnswer,
  advanceAfterTypePick,
  advanceToDiscovery,
  buildBriefFromDiscovery,
  getDiscoveryQuestions,
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
    expect(brief).toContain("Content type: Email");
    expect(brief).toContain("Sarah");
  });

  it("moves to readiness after last discovery answer", () => {
    const confirm = advanceAfterTypePick("Email", "content");
    expect(confirm.step).toBe("confirm");
    const start = advanceToDiscovery(confirm);
    const qs = getDiscoveryQuestions("Email");
    let state = start;
    for (const q of qs) {
      state = advanceAfterDiscoveryAnswer(state, "Email", q.id, "answer");
    }
    expect(state.step).toBe("readiness");
    expect(readinessSummary("Email", state.discoveryAnswers).length).toBe(qs.length);
  });
});
