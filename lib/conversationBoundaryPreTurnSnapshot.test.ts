/**
 * @vitest-environment node
 *
 * S4 Phase 0 — pre-turn snapshot invariant.
 *
 * Proves the Boundary Decision is evaluated from a snapshot captured BEFORE the
 * current turn mutates conversation state. The live app writes the current
 * message into ActiveTopic.unresolvedNeed (processActiveTopicOnUserTurn) before
 * the Boundary runs; that self-contamination previously flipped an obvious
 * interruption ("My dog just threw up on the carpet.") into a false
 * "continue_current_topic", so the errand was swallowed by the active Create.
 *
 * The captured snapshot must make that impossible.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  captureBoundaryPreTurnSnapshot,
  resolveTurnBoundaryDecision,
} from "@/lib/conversationBoundaryInputs";
import {
  saveActiveTopic,
  patchActiveTopic,
  getActiveTopic,
  clearActiveTopic,
} from "@/lib/conversationStabilization/activeTopicStore";
import {
  saveUniversalCreationSession,
  clearUniversalCreationSession,
} from "@/lib/universalCreation";
import type { UniversalCreationSession } from "@/lib/universalCreation/types";
import { resetSuspensionStoreForTests } from "@/lib/conversationStabilization/suspensionStore";

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

const INTERRUPTION = "My dog just threw up on the carpet.";
const PRIOR_UNRESOLVED_NEED = "who the email is going to";
const DISCOVERY_QUESTION = "Who is receiving this email?";

function seedPriorTopic() {
  saveActiveTopic({
    topicId: "t-email-1",
    userGoal: "Help me write an email to my client",
    unresolvedNeed: PRIOR_UNRESOLVED_NEED, // prior-turn value
    selectedKnowledgeSources: [],
    responseOwner: "shari",
    status: "ready_to_answer", // unresolved
    confidence: "medium",
    startedAtTurn: 1,
    updatedAtTurn: 1,
  });
}

function seedActiveEmailDiscovery() {
  saveUniversalCreationSession({
    documentType: "email",
    phase: "discovery",
    confidence: "high",
    answers: {},
    questionIndex: 1,
    originalUserText: "Help me write an email to my client",
    startedAtTurn: 1,
    preparationReady: false,
    pendingEnhancements: [],
    lifecycle: "active",
  } as unknown as UniversalCreationSession);
}

describe("S4 Phase 0 — Boundary uses a captured pre-turn snapshot", () => {
  beforeEach(() => {
    stubStorage();
    clearActiveTopic();
    clearUniversalCreationSession();
    resetSuspensionStoreForTests();
  });
  afterEach(() => vi.unstubAllGlobals());

  it("evaluates the interruption against pre-turn state, not the current-turn mutation", () => {
    // 1. Seed prior ActiveTopic + active Create discovery state.
    seedPriorTopic();
    seedActiveEmailDiscovery();

    // 2. Capture the pre-turn Boundary input snapshot.
    const snapshot = captureBoundaryPreTurnSnapshot();

    // 3. Simulate the current-turn ActiveTopic mutation (the exact contaminated
    //    state observed in the live app: unresolvedNeed := the current message).
    patchActiveTopic({ unresolvedNeed: INTERRUPTION, updatedAtTurn: 2 });

    // 4. Resolve the Boundary using the previously captured snapshot.
    const decision = resolveTurnBoundaryDecision({
      userText: INTERRUPTION,
      turn: 2,
      lastAssistantText: DISCOVERY_QUESTION,
      snapshot,
    });

    // 5a. decision === switch_topic
    expect(decision.decision).toBe("switch_topic");

    // 5b. the Boundary input did NOT contain the current message in unresolvedNeed
    expect(snapshot.activeTopic?.unresolvedNeed).toBe(PRIOR_UNRESOLVED_NEED);
    expect(snapshot.activeTopic?.unresolvedNeed).not.toContain("dog");

    // 5c. reading the now-mutated live store yields contaminated data …
    expect(getActiveTopic()?.unresolvedNeed).toBe(INTERRUPTION);

    // 5d. … and resolving from that contaminated live state produces a DIFFERENT,
    //     wrong decision — proving the captured snapshot is what protects the flow.
    const contaminatedSnapshot = captureBoundaryPreTurnSnapshot();
    const contaminatedDecision = resolveTurnBoundaryDecision({
      userText: INTERRUPTION,
      turn: 2,
      lastAssistantText: DISCOVERY_QUESTION,
      snapshot: contaminatedSnapshot,
    });
    expect(contaminatedDecision.decision).not.toBe("switch_topic");
    expect(contaminatedDecision.decision).toBe("continue_current_topic");
  });
});
