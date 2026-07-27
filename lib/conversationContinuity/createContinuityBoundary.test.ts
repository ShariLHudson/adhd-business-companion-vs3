/**
 * @vitest-environment node
 *
 * S3 — Create continuity wiring. Verifies the continuity gate, given an active
 * Create session and a threaded Conversation Boundary Decision, PARKS the Create
 * (recoverable) on an ambiguous turn instead of destroying it — and destroys
 * only on explicit exit/cancel.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveContinuityTurnGate } from "./resolveContinuityGate";
import { clearConversationOwner } from "./ownerStore";
import {
  loadUniversalCreationSession,
  saveUniversalCreationSession,
  clearUniversalCreationSession,
} from "@/lib/universalCreation";
import type { UniversalCreationSession } from "@/lib/universalCreation/types";
import {
  loadSuspensionState,
  resetSuspensionStoreForTests,
} from "@/lib/conversationStabilization/suspensionStore";
import type { ConversationBoundaryDecision } from "@/lib/conversationBoundary";

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

function startActiveEmailCreate(): void {
  const session = {
    documentType: "email",
    phase: "discovery",
    confidence: "high",
    answers: {},
    questionIndex: 1,
    originalUserText: "draft an email to the accountant about the invoice",
    startedAtTurn: 3,
    preparationReady: false,
    pendingEnhancements: [],
    lifecycle: "active",
  } as unknown as UniversalCreationSession;
  saveUniversalCreationSession(session);
}

const dec = (decision: ConversationBoundaryDecision["decision"]): ConversationBoundaryDecision => ({
  decision,
  confidence: "high",
  evidence: [],
});

function runGate(userText: string, decision?: ConversationBoundaryDecision) {
  return resolveContinuityTurnGate({
    userText,
    turn: 5,
    boundaryDecision: decision,
    activeSection: null,
  });
}

describe("S3 — Create parks (not destroys) on ambiguous turns", () => {
  beforeEach(() => {
    stubStorage();
    clearUniversalCreationSession();
    clearConversationOwner();
    resetSuspensionStoreForTests();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("1+6. distress+errand during Create → parked, not destroyed; SuspendedContext recorded", () => {
    startActiveEmailCreate();
    runGate("I'm overwhelmed and need to pick up supplies.", dec("interrupt_and_suspend"));
    const session = loadUniversalCreationSession();
    expect(session).not.toBeNull(); // NOT destroyed
    expect(session?.lifecycle).toBe("parked");
    const suspended = loadSuspensionState().stack;
    expect(suspended.length).toBe(1);
    expect(suspended[0]!.kind).toBe("create");
    expect(suspended[0]!.sourceRef).toBe("email");
    expect(suspended[0]!.summary).toContain("accountant");
    expect(suspended[0]!.resumeHint).toBe("the email you were working on");
    expect(suspended[0]!.suspendedAtTurn).toBe(5);
  });

  it("2. temporary detour during Create → parked, not destroyed", () => {
    startActiveEmailCreate();
    runGate("Before we continue, remind me to call Linda.", dec("interrupt_and_suspend"));
    expect(loadUniversalCreationSession()?.lifecycle).toBe("parked");
  });

  it("7. ordinary unrelated task classified as switch_topic → parked", () => {
    startActiveEmailCreate();
    runGate("I need to prepare for the craft show.", dec("switch_topic"));
    expect(loadUniversalCreationSession()?.lifecycle).toBe("parked");
    expect(loadSuspensionState().stack.length).toBe(1);
  });

  it("3. explicit cancel/exit → Create destroyed", () => {
    startActiveEmailCreate();
    runGate("Never mind, forget this.", dec("cancel_current_workflow"));
    expect(loadUniversalCreationSession()).toBeNull(); // destroyed
    expect(loadSuspensionState().stack.length).toBe(0);
  });

  it("6b. unclear input during Create → neither parked nor destroyed", () => {
    startActiveEmailCreate();
    runGate("Hmm okay.", dec("unclear"));
    const session = loadUniversalCreationSession();
    expect(session).not.toBeNull();
    expect(session?.lifecycle).toBe("active"); // untouched
    expect(loadSuspensionState().stack.length).toBe(0);
  });

  it("behavior-neutral: NO boundary decision threaded → legacy destroy", () => {
    startActiveEmailCreate();
    runGate("I need to prepare for the craft show."); // no decision
    // Legacy conversation-exit destroys, exactly as before S3.
    expect(loadUniversalCreationSession()).toBeNull();
  });

  it("END-TO-END: parked Create survives the downstream classifyCreateTurnRelationship handler", async () => {
    // handleSend continues past the gate to classifyCreateTurnRelationship, which
    // runs on the now-parked session. That handler must NOT exit/destroy a parked
    // session for an unrelated distress turn — otherwise the S3 park is undone.
    const { classifyCreateTurnRelationship } = await import(
      "@/lib/universalCreation/createTurnRelationship"
    );
    startActiveEmailCreate();
    runGate("I'm overwhelmed and need to pick up supplies.", dec("interrupt_and_suspend"));
    const parked = loadUniversalCreationSession();
    expect(parked?.lifecycle).toBe("parked");
    const rel = classifyCreateTurnRelationship({
      userText: "I'm overwhelmed and need to pick up supplies.",
      session: parked,
      lastAssistantText: null,
    });
    expect(rel.shouldExit).toBe(false); // park must survive the downstream handler
  });
});
