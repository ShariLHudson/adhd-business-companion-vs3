/**
 * @vitest-environment node
 *
 * S4 Phase 1 — Boundary Decision is the single authority for Create ownership.
 *
 * Two layers are proven here:
 *  1. The Boundary correctly classifies the three canonical turns (unrelated
 *     errand → switch_topic; related answer → answer_pending_question; bare
 *     pivot → unclear), plus a short recipient answer.
 *  2. classifyCreateTurnRelationship consumes a discovery answer ONLY when the
 *     Boundary grants ownership — the legacy lastAssistantText position heuristic
 *     no longer claims the turn on its own.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  resolveConversationBoundary,
  type BoundaryActiveTopic,
  type BoundaryActiveWork,
  type BoundaryPendingQuestion,
  type ConversationBoundaryDecision,
} from "@/lib/conversationBoundary";
import {
  classifyCreateTurnRelationship,
  createHandlerEligible,
} from "@/lib/universalCreation/createTurnRelationship";
import type { UniversalCreationSession } from "@/lib/universalCreation/types";

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
  vi.stubGlobal("window", {
    sessionStorage: storage,
    localStorage: storage,
    dispatchEvent: vi.fn(),
  });
}

const GOAL = "Help me write an email to my client";
const DISCOVERY_QUESTION = "Who is receiving this email?";

const work: BoundaryActiveWork = {
  kind: "create",
  id: "uc:email:t1",
  artifactType: "email",
  goal: `${GOAL} email`,
  awaitingAnswer: true,
  suspendable: true,
};
const priorTopic: BoundaryActiveTopic = {
  topicId: "t-email-1",
  goal: GOAL,
  unresolvedNeed: "who is receiving", // prior-turn value (clean)
  resolved: false,
  startedAtTurn: 1,
  updatedAtTurn: 1,
};
// S4.1 — email recipient pending, remaining slots outstanding (a member may
// answer purpose while "who" is pending). Carries the workflow's own affordances.
const pendingQuestion: BoundaryPendingQuestion = {
  kind: "open",
  expects: "free",
  role: "recipient",
  outstandingRoles: ["recipient", "goal", "subject", "outcome"],
  affordances: [
    /\b(?:follow up|update|ask|request|deliver|introduce|remind|thank)\b/i,
  ],
};

function boundaryFor(userText: string): ConversationBoundaryDecision {
  return resolveConversationBoundary({
    userText,
    turn: 2,
    activeTopic: priorTopic,
    activeWork: work,
    pendingQuestion,
    suspended: [],
    lastAssistantText: DISCOVERY_QUESTION,
  });
}

describe("S4 Phase 1 — Boundary classification of the three scenarios", () => {
  it("A — unrelated substantive errand during discovery → switch_topic", () => {
    expect(boundaryFor("My dog just threw up on the carpet.").decision).toBe(
      "switch_topic",
    );
  });

  it("B — related substantive answer → answer_pending_question", () => {
    expect(
      boundaryFor("To update the client on the project timeline.").decision,
    ).toBe("answer_pending_question");
  });

  it("C — bare pivot 'Actually…' → unclear (never an answer, never a switch)", () => {
    const d = boundaryFor("Actually...");
    expect(d.decision).not.toBe("answer_pending_question");
    expect(d.decision).toBe("unclear");
  });

  it("short recipient answer 'My accountant' → answer_pending_question", () => {
    expect(boundaryFor("My accountant").decision).toBe("answer_pending_question");
  });
});

function activeEmailDiscovery(): UniversalCreationSession {
  return {
    documentType: "email",
    phase: "discovery",
    confidence: "high",
    answers: {},
    questionIndex: 1,
    originalUserText: GOAL,
    startedAtTurn: 1,
    preparationReady: false,
    pendingEnhancements: [],
    lifecycle: "active",
  } as unknown as UniversalCreationSession;
}

const dec = (
  decision: ConversationBoundaryDecision["decision"],
): ConversationBoundaryDecision => ({ decision, confidence: "medium", evidence: [] });

describe("S4 Phase 1 — createTurnRelationship is Boundary-gated", () => {
  beforeEach(() => stubStorage());
  afterEach(() => vi.unstubAllGlobals());

  it("consumes the errand ONLY if Boundary granted it — switch_topic does NOT", () => {
    const rel = classifyCreateTurnRelationship({
      userText: "My dog just threw up on the carpet.",
      session: activeEmailDiscovery(),
      lastAssistantText: DISCOVERY_QUESTION,
      boundaryDecision: dec("switch_topic"),
    });
    expect(rel.relationship).not.toBe("answer-create-question");
    expect(createHandlerEligible(rel)).toBe(false);
  });

  it("consumes a related answer when Boundary grants answer_pending_question", () => {
    const rel = classifyCreateTurnRelationship({
      userText: "To update the client on the project timeline.",
      session: activeEmailDiscovery(),
      lastAssistantText: DISCOVERY_QUESTION,
      boundaryDecision: dec("answer_pending_question"),
    });
    expect(rel.relationship).toBe("answer-create-question");
    expect(createHandlerEligible(rel)).toBe(true);
  });

  it("position heuristic removed — no Boundary grant means no capture, even with create-context last message", () => {
    const rel = classifyCreateTurnRelationship({
      userText: "My dog just threw up on the carpet.",
      session: activeEmailDiscovery(),
      lastAssistantText: DISCOVERY_QUESTION,
      // no boundaryDecision — the legacy lastAssistantText heuristic must NOT claim it
    });
    expect(rel.relationship).not.toBe("answer-create-question");
    expect(createHandlerEligible(rel)).toBe(false);
  });
});
