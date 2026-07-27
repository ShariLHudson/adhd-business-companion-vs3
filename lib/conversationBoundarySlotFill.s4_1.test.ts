/**
 * @vitest-environment node
 *
 * S4.1 — slot-aware Boundary ownership. During active Create discovery the
 * Boundary decides ownership by whether the reply fills the pending/outstanding
 * discovery slot (authored affordance or general role shape), NOT by goal/content
 * overlap. Fallback order: fill → answer_pending_question; clear switch/interrupt
 * → park/suspend; neither → unclear (Create must not silently reclaim it).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  resolveConversationBoundary,
  type BoundaryActiveTopic,
  type BoundaryActiveWork,
  type BoundaryPendingQuestion,
  type ConversationBoundaryDecision,
} from "@/lib/conversationBoundary";
import { classifyCreateTurnRelationship } from "@/lib/universalCreation/createTurnRelationship";
import type { UniversalCreationSession } from "@/lib/universalCreation/types";

// Email discovery affordances (the workflow's OWN authored signalPatterns).
const EMAIL_AFFORDANCES = [
  /\b(?:client|prospect|team|vendor|partner|existing|new|cold|warm)\b/i,
  /\b(?:follow up|update|ask|request|deliver|introduce|remind|thank|follow through|agreed|boundary)\b/i,
  /\b(?:already|know|background|context|last time|project|agreed)\b/i,
  /\b(?:need them|want them|ask|reply|approve|schedule|click)\b/i,
  /\b(?:reply|yes|book|sign|approve|schedule|outcome)\b/i,
];

const work: BoundaryActiveWork = {
  kind: "create",
  id: "uc:email:t1",
  artifactType: "email",
  goal: "Help me write an email email",
  awaitingAnswer: true,
  suspendable: true,
};
const cleanTopic: BoundaryActiveTopic = {
  topicId: "t1",
  goal: "Help me write an email",
  unresolvedNeed: "who is receiving",
  resolved: false,
  startedAtTurn: 1,
  updatedAtTurn: 1,
};

function boundary(
  userText: string,
  pendingQuestion: BoundaryPendingQuestion,
  activeTopic: BoundaryActiveTopic | null = cleanTopic,
): ConversationBoundaryDecision {
  return resolveConversationBoundary({
    userText,
    turn: 2,
    activeTopic,
    activeWork: work,
    pendingQuestion,
    suspended: [],
    lastAssistantText: "discovery question",
  });
}

const goalPending: BoundaryPendingQuestion = {
  kind: "open",
  expects: "free",
  role: "goal",
  outstandingRoles: ["goal", "subject", "outcome"],
  affordances: EMAIL_AFFORDANCES,
};
const recipientPending: BoundaryPendingQuestion = {
  kind: "open",
  expects: "free",
  role: "recipient",
  outstandingRoles: ["recipient", "goal", "subject", "outcome"],
  affordances: EMAIL_AFFORDANCES,
};
const datePending: BoundaryPendingQuestion = {
  kind: "scheduling",
  expects: "free",
  role: "date",
  outstandingRoles: ["date"],
};

describe("S4.1 — pending goal/purpose slot", () => {
  it("'To update the client on the project timeline.' → answer_pending_question", () => {
    expect(boundary("To update the client on the project timeline.", goalPending).decision).toBe(
      "answer_pending_question",
    );
  });
  it("'To apologize for missing yesterday's meeting.' → answer_pending_question", () => {
    expect(boundary("To apologize for missing yesterday's meeting.", goalPending).decision).toBe(
      "answer_pending_question",
    );
  });
  it("'My dog just threw up on the carpet.' → switch/interrupt (not an answer)", () => {
    const d = boundary("My dog just threw up on the carpet.", goalPending).decision;
    expect(["switch_topic", "interrupt_and_suspend"]).toContain(d);
    expect(d).not.toBe("answer_pending_question");
  });
  it("'Actually...' → unclear", () => {
    expect(boundary("Actually...", goalPending).decision).toBe("unclear");
  });
});

describe("S4.1 — pending recipient/who slot", () => {
  it("'My accountant.' → answer_pending_question", () => {
    expect(boundary("My accountant.", recipientPending).decision).toBe("answer_pending_question");
  });
  it("'Linda at Acme.' → answer_pending_question", () => {
    expect(boundary("Linda at Acme.", recipientPending).decision).toBe("answer_pending_question");
  });
  it("'The carpet is ruined.' → not answer_pending_question", () => {
    expect(boundary("The carpet is ruined.", recipientPending).decision).not.toBe(
      "answer_pending_question",
    );
  });

  it("ambiguity check: 'They need to know.' → valid slot fulfillment OR clarification, never silent switch/capture", () => {
    // Matches the email 'context' question's authored affordance ("know"), so it
    // is valid slot fulfillment of an outstanding slot — never a position capture.
    const d = boundary("They need to know.", recipientPending).decision;
    expect(["answer_pending_question", "unclear"]).toContain(d);
    expect(["switch_topic", "interrupt_and_suspend", "cancel_current_workflow"]).not.toContain(d);
  });

  it("ambiguity check: a fragment with no affordance and <2 content words → unclear (clarify)", () => {
    // No authored affordance, no role shape, only one content word → not a clear
    // switch and not a slot fill → unclear.
    const bareRecipient: BoundaryPendingQuestion = {
      kind: "open",
      expects: "free",
      role: "recipient",
      outstandingRoles: ["recipient"],
      affordances: [],
    };
    expect(boundary("They will handle it.", bareRecipient).decision).toBe("unclear");
  });
});

describe("S4.1 — pending date/time slot", () => {
  it("'Friday afternoon.' → answer_pending_question", () => {
    expect(boundary("Friday afternoon.", datePending).decision).toBe("answer_pending_question");
  });
  it("'I'm overwhelmed.' → emotional interrupt, not slot fulfillment", () => {
    const d = boundary("I'm overwhelmed.", datePending).decision;
    expect(d).toBe("interrupt_and_suspend");
    expect(d).not.toBe("answer_pending_question");
  });
});

describe("S4.1 — general properties", () => {
  it("a legitimate answer with entirely new vocabulary still fills the slot", () => {
    expect(
      boundary("To onboard the Zephyr rollout cohort next sprint.", goalPending).decision,
    ).toBe("answer_pending_question");
  });

  it("authored signalPatterns establish slot fulfillment for a weak role", () => {
    const subjectPending: BoundaryPendingQuestion = {
      kind: "open",
      expects: "free",
      role: "subject", // structurally weak — must rely on affordance
      outstandingRoles: ["subject"],
      affordances: [/\bwidget\b/i],
    };
    expect(boundary("Widget inventory reconciliation details.", subjectPending).decision).toBe(
      "answer_pending_question",
    );
    // …and a reply matching no affordance for the same weak role does NOT fill it.
    expect(
      boundary("My dog just threw up on the carpet.", subjectPending).decision,
    ).not.toBe("answer_pending_question");
  });

  it("slot-fill ignores a current-turn-contaminated ActiveTopic", () => {
    const reply = "To update the client on the project timeline.";
    // Topic contaminated with the current reply, or entirely absent — decision is identical.
    const contaminated: BoundaryActiveTopic = { ...cleanTopic, unresolvedNeed: reply, updatedAtTurn: 2 };
    expect(boundary(reply, goalPending, contaminated).decision).toBe("answer_pending_question");
    expect(boundary(reply, goalPending, null).decision).toBe("answer_pending_question");
    // And an errand is switch/interrupt regardless of a contaminated topic.
    const errand = "My dog just threw up on the carpet.";
    const errandContam: BoundaryActiveTopic = { ...cleanTopic, unresolvedNeed: errand, updatedAtTurn: 2 };
    expect(boundary(errand, goalPending, errandContam).decision).not.toBe("answer_pending_question");
  });
});

function stubStorage() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, v),
    removeItem: (k: string) => void mem.delete(k),
    clear: () => mem.clear(),
  };
  vi.stubGlobal("sessionStorage", storage);
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", { sessionStorage: storage, localStorage: storage, dispatchEvent: vi.fn() });
}

describe("S4.1 — Create does not independently reclaim an unclear turn", () => {
  beforeEach(() => stubStorage());
  afterEach(() => vi.unstubAllGlobals());

  it("boundary unclear → createTurnRelationship does not consume it", () => {
    const session = {
      documentType: "email",
      phase: "discovery",
      confidence: "high",
      answers: {},
      questionIndex: 0,
      originalUserText: "Help me write an email",
      startedAtTurn: 1,
      preparationReady: false,
      pendingEnhancements: [],
      lifecycle: "active",
    } as unknown as UniversalCreationSession;
    const rel = classifyCreateTurnRelationship({
      userText: "Actually...",
      session,
      lastAssistantText: "Who is receiving this email?",
      boundaryDecision: { decision: "unclear", confidence: "low", evidence: [] },
    });
    expect(rel.relationship).not.toBe("answer-create-question");
    expect(rel.createEligible).toBe(false);
  });
});
