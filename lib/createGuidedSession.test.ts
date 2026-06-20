import { describe, expect, it } from "vitest";
import {
  approvePendingValue,
  canCreateDraft,
  createPendingApproval,
  getCreateProgressText,
  getNextCreateQuestion,
  handleGuidedCreateMessage,
  isApprovalText,
  startGuidedCreateSession,
} from "./createGuidedSession";
import {
  getNextRequiredField,
  getRequiredFields,
  getTemplateProgress,
  guidedRequiredFieldsComplete,
} from "./createTemplateFields";

describe("createGuidedSession", () => {
  it("saves audience to the audience field", () => {
    let session = startGuidedCreateSession("lead-magnet");
    const turn = handleGuidedCreateMessage(session, "ADHD business owners");
    expect(turn.pendingApproval?.fieldId).toBe("audience");
    expect(turn.values.audience).toBeUndefined();

    const approved = handleGuidedCreateMessage(
      { ...session, pendingApproval: turn.pendingApproval },
      "yes",
    );
    expect(approved.values.audience).toBe("ADHD business owners");
    expect(approved.values.promise).toBeUndefined();
    expect(approved.values.problem).toBeUndefined();
  });

  it("never saves approval words as field content", () => {
    const session = startGuidedCreateSession("lead-magnet");
    const offered = handleGuidedCreateMessage(session, "ADHD business owners");
    const withPending = { ...session, pendingApproval: offered.pendingApproval };

    for (const phrase of [
      "yes",
      "use that",
      "sounds good",
      "correct",
      "that's right",
      "approved",
      "ok",
    ]) {
      const turn = handleGuidedCreateMessage(withPending, phrase);
      expect(turn.values.audience).toBe("ADHD business owners");
      expect(Object.values(turn.values)).not.toContain(phrase);
    }
  });

  it("cannot create draft until all required lead magnet fields are complete", () => {
    const session = startGuidedCreateSession("lead-magnet");
    expect(canCreateDraft(session)).toBe(false);

    const required = getRequiredFields("lead-magnet");
    let values: Record<string, string> = {};
    for (let i = 0; i < required.length - 1; i++) {
      values = { ...values, [required[i]!.id]: `answer ${i + 1}` };
      expect(guidedRequiredFieldsComplete("lead-magnet", values)).toBe(false);
      expect(canCreateDraft({ ...session, values })).toBe(false);
    }

    values = { ...values, [required[required.length - 1]!.id]: "final answer" };
    expect(guidedRequiredFieldsComplete("lead-magnet", values)).toBe(true);
    expect(canCreateDraft({ ...session, values })).toBe(true);
  });

  it("updates progress after approval", () => {
    let session = startGuidedCreateSession("lead-magnet");
    const offered = handleGuidedCreateMessage(session, "ADHD business owners");
    session = { ...session, pendingApproval: offered.pendingApproval };

    const approved = handleGuidedCreateMessage(session, "yes");
    const progress = getTemplateProgress("lead-magnet", approved.values);
    expect(progress.completed).toBe(1);
    expect(progress.total).toBe(8);
    expect(getCreateProgressText({ ...session, values: approved.values })).toBe(
      "1 of 8 required sections complete",
    );
  });

  it("asks the next required question after approval", () => {
    let session = startGuidedCreateSession("lead-magnet");
    const offered = handleGuidedCreateMessage(session, "ADHD business owners");
    session = { ...session, pendingApproval: offered.pendingApproval };

    const approved = handleGuidedCreateMessage(session, "yes");
    const nextQuestion = getNextCreateQuestion({
      ...session,
      values: approved.values,
      pendingApproval: null,
    });
    expect(nextQuestion).toBe(
      getNextRequiredField("lead-magnet", approved.values)?.question,
    );
    expect(approved.assistantMessage).toContain(nextQuestion ?? "");
    expect(approved.readyForDraft).toBe(false);
  });

  it("recognizes approval phrases", () => {
    expect(isApprovalText("yes")).toBe(true);
    expect(isApprovalText("use that")).toBe(true);
    expect(isApprovalText("sounds good")).toBe(true);
    expect(isApprovalText("ADHD founders")).toBe(false);
  });

  it("approvePendingValue commits pending without approval text in values", () => {
    const session = startGuidedCreateSession("lead-magnet");
    const field = getRequiredFields("lead-magnet")[0]!;
    const pending = createPendingApproval(field, "Solo founders");
    const approved = approvePendingValue({
      ...session,
      pendingApproval: pending,
    });
    expect(approved.values.audience).toBe("Solo founders");
    expect(approved.pendingApproval).toBeNull();
  });
});
