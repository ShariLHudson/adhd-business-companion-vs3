import { describe, expect, it, beforeEach, vi } from "vitest";

import { processCreateBuilderTurn } from "./createBuilderChat";
import {
  applyAnswerToRecord,
  builderSessionFromRecord,
  buildBriefFromRecord,
  mergeRecordFromWorkflow,
  processCreateBuilderTurnWithRecord,
  questionAlreadyAnswered,
  recordDiscoveryComplete,
  skipQuestionOnRecord,
  startNewWorkflowRecord,
  workflowStateFromRecord,
} from "./createWorkflowRecord";
import {
  advanceAfterDiscoveryAnswer,
  discoveryQuestionsForState,
  requiredFieldsComplete,
  skipDiscoveryQuestion,
} from "./createWorkflow";
import {
  clearSavedWorkflowRecord,
  loadSavedWorkflowRecord,
  loadWorkflowRecord,
  saveWorkflowRecord,
  saveWorkflowRecordForLater,
} from "./createWorkflowRecordStore";

function answerChatWithApproval(
  record: ReturnType<typeof startNewWorkflowRecord>,
  answer: string,
) {
  let turn = processCreateBuilderTurnWithRecord(record, answer);
  let next = turn.record;
  if (turn.session.workflow.pendingFieldApproval) {
    turn = processCreateBuilderTurnWithRecord(next, "yes");
    next = turn.record;
  }
  return next;
}

describe("createWorkflowRecord shared state", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", globalThis);
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => {
        mem.set(k, v);
      },
      removeItem: (k: string) => {
        mem.delete(k);
      },
    });
    clearSavedWorkflowRecord();
  });

  it("answering all questions in chat updates shared record", () => {
    let record = startNewWorkflowRecord("Email", "chat");
    const answers = [
      "Sarah at Acme",
      "Schedule a call",
      "We met at the conference last week",
    ];
    for (const a of answers) {
      record = answerChatWithApproval(record, a);
      saveWorkflowRecord(record);
    }
    expect(
      requiredFieldsComplete(
        "Email",
        record.collectedAnswers,
        record.skippedQuestions,
      ),
    ).toBe(true);
    expect(record.collectedAnswers.recipient).toBe("Sarah at Acme");
    const loaded = loadWorkflowRecord();
    expect(loaded?.collectedAnswers.recipient).toBe("Sarah at Acme");
    expect(buildBriefFromRecord(record)).toContain("Sarah at Acme");
  });

  it("answering all questions in panel updates shared record", () => {
    let record = startNewWorkflowRecord("Email", "panel");
    const type = "Email";
    let wf = workflowStateFromRecord(record);
    const questions = ["recipient", "goal", "context"];
    const values = ["Bob", "Follow up", "Sent proposal Tuesday"];
    questions.forEach((id, i) => {
      wf = advanceAfterDiscoveryAnswer(wf, type, id, values[i]!);
      record = mergeRecordFromWorkflow(record, wf, "panel");
      saveWorkflowRecord(record);
    });
    expect(
      requiredFieldsComplete(
        "Email",
        record.collectedAnswers,
        record.skippedQuestions,
      ),
    ).toBe(true);
    const session = builderSessionFromRecord(loadWorkflowRecord()!);
    expect(session.workflow.discoveryAnswers.goal).toBe("Follow up");
  });

  it("mixing chat + panel answers shares one record", () => {
    let record = startNewWorkflowRecord("Email", "chat");
    record = answerChatWithApproval(record, "Sarah");
    let wf = workflowStateFromRecord(record);
    wf = advanceAfterDiscoveryAnswer(wf, "Email", "goal", "Book a demo");
    record = mergeRecordFromWorkflow(record, wf, "panel");
    record = answerChatWithApproval(record, "Met at webinar");
    expect(record.collectedAnswers.recipient).toBe("Sarah");
    expect(record.collectedAnswers.goal).toBe("Book a demo");
    expect(record.collectedAnswers.context).toBe("Met at webinar");
    expect(
      requiredFieldsComplete(
        "Email",
        record.collectedAnswers,
        record.skippedQuestions,
      ),
    ).toBe(true);
  });

  it("closing and reopening Create restores workflow record", () => {
    let record = startNewWorkflowRecord("Email", "chat");
    record = applyAnswerToRecord(record, "Alex", "chat");
    saveWorkflowRecord(record);
    const reopened = loadWorkflowRecord();
    expect(reopened?.workflowId).toBe(record.workflowId);
    expect(reopened?.collectedAnswers.recipient).toBe("Alex");
    expect(reopened?.itemType).toBe("Email");
  });

  it("switching workspace and returning keeps draft answers", () => {
    let record = startNewWorkflowRecord("Proposal", "panel");
    let wf = workflowStateFromRecord(record);
    wf = advanceAfterDiscoveryAnswer(wf, "Proposal", "client", "Acme Corp");
    record = mergeRecordFromWorkflow(record, wf, "panel");
    saveWorkflowRecord(record);
    // simulate leaving Create — record stays in storage
    const afterSwitch = loadWorkflowRecord();
    expect(afterSwitch?.collectedAnswers.client).toBe("Acme Corp");
    expect(afterSwitch?.activeWorkspace).toBe("content-generator");
  });

  it("build draft uses collectedAnswers from shared record", () => {
    let record = startNewWorkflowRecord("Email", "chat");
    const ids = ["recipient", "goal", "context"];
    const vals = ["Sam", "Reply to quote", "Sent quote Monday"];
    let wf = workflowStateFromRecord(record);
    for (let i = 0; i < ids.length; i++) {
      wf = advanceAfterDiscoveryAnswer(wf, "Email", ids[i]!, vals[i]!);
      record = mergeRecordFromWorkflow(record, wf, "chat");
    }
    const brief = buildBriefFromRecord(record);
    expect(brief).toContain("Sam");
    expect(brief).toContain("Reply to quote");
    expect(
      requiredFieldsComplete(
        "Email",
        record.collectedAnswers,
        record.skippedQuestions,
      ),
    ).toBe(true);
  });

  it("skipping a question does not repeat it", () => {
    let record = startNewWorkflowRecord("Email", "panel");
    const firstQ = discoveryQuestionsForState(
      "Email",
      workflowStateFromRecord(record),
    )!;
    record = skipQuestionOnRecord(record, firstQ.id, "panel");
    expect(questionAlreadyAnswered(record, firstQ.id)).toBe(true);
    const next = discoveryQuestionsForState(
      "Email",
      workflowStateFromRecord(record),
    );
    expect(next?.id).not.toBe(firstQ.id);
  });

  it("starting over creates a new workflow id", () => {
    const first = startNewWorkflowRecord("Email", "chat");
    saveWorkflowRecord(first);
    clearSavedWorkflowRecord();
    const second = startNewWorkflowRecord("Email", "panel");
    expect(second.workflowId).not.toBe(first.workflowId);
    expect(loadWorkflowRecord()).toBeNull();
  });

  it("save for later bookmarks without active auto-restore record", () => {
    let record = startNewWorkflowRecord("Email", "chat");
    record = applyAnswerToRecord(record, "Pat", "chat");
    saveWorkflowRecordForLater(record);
    expect(loadWorkflowRecord()).toBeNull();
    expect(loadSavedWorkflowRecord()?.collectedAnswers.recipient).toBe("Pat");
  });

  it("does not repeat questions already answered in chat", () => {
    let record = startNewWorkflowRecord("Email", "chat");
    record = answerChatWithApproval(record, "Jordan");
    const q2 = discoveryQuestionsForState(
      "Email",
      workflowStateFromRecord(record),
    );
    expect(q2?.id).not.toBe("recipient");
    const turn = processCreateBuilderTurnWithRecord(record, "Schedule a call");
    expect(turn.reply).not.toMatch(/\*\*Who is receiving/i);
  });
});

describe("panel skip syncs to record", () => {
  it("skipDiscoveryQuestion flows through mergeRecordFromWorkflow", () => {
    let record = startNewWorkflowRecord("Email", "panel");
    let wf = workflowStateFromRecord(record);
    const q = discoveryQuestionsForState("Email", wf)!;
    wf = skipDiscoveryQuestion(wf, "Email", q.id);
    record = mergeRecordFromWorkflow(record, wf, "panel");
    expect(record.skippedQuestions).toContain(q.id);
  });
});
