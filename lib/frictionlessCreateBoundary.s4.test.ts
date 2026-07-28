/**
 * @vitest-environment node
 *
 * S4 — Boundary propagation across the page→frictionless Create handoff.
 *
 * The page computes turnBoundaryDecision and honors it (createEligible). This
 * verifies the SAME decision now reaches the Create fast-path's internal
 * classifyCreateTurnRelationship (frictionlessActionLayer), so a slot-valid
 * discovery answer is not re-labeled "unrelated-turn" (which previously parked
 * then cleared the session and handed the turn to answer-first).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveCreateFastPathAction } from "@/lib/frictionlessActionLayer";
import { classifyCreateTurnRelationship } from "@/lib/universalCreation/createTurnRelationship";
import {
  saveUniversalCreationSession,
  loadUniversalCreationSession,
  clearUniversalCreationSession,
} from "@/lib/universalCreation";
import { isCreateParked } from "@/lib/universalCreation/createLifecycle";
import type { UniversalCreationSession } from "@/lib/universalCreation/types";
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

const grant = (
  decision: ConversationBoundaryDecision["decision"],
): ConversationBoundaryDecision => ({ decision, confidence: "high", evidence: [] });

const RECIPIENT_Q =
  "Who is receiving this email — one person, a role, or a small group?";
const ANSWER = "To update the client on the project timeline.";
const ROUTING = {} as never; // routing.learnFastPath undefined → guards pass (as existing tests)

function seedEmailDiscovery(): void {
  saveUniversalCreationSession({
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
  } as unknown as UniversalCreationSession);
}

describe("S4 — Boundary propagation into the Create fast-path", () => {
  beforeEach(() => {
    stubStorage();
    clearUniversalCreationSession();
  });
  afterEach(() => vi.unstubAllGlobals());

  it("internal relationship check honors answer_pending_question (eligible, no park)", () => {
    seedEmailDiscovery();
    const rel = classifyCreateTurnRelationship({
      userText: ANSWER,
      session: loadUniversalCreationSession(),
      lastAssistantText: RECIPIENT_Q,
      boundaryDecision: grant("answer_pending_question"),
    });
    expect(rel.relationship).toBe("answer-create-question");
    expect(rel.createEligible).toBe(true);
    expect(rel.shouldPark).toBe(false);
  });

  it("without a Boundary decision the same reply is unrelated + parks (the pre-fix bug)", () => {
    seedEmailDiscovery();
    const rel = classifyCreateTurnRelationship({
      userText: ANSWER,
      session: loadUniversalCreationSession(),
      lastAssistantText: RECIPIENT_Q,
    });
    expect(rel.relationship).toBe("unrelated-turn");
    expect(rel.shouldPark).toBe(true);
  });

  it("fast-path WITH grant advances discovery and does NOT park-or-clear the session", () => {
    seedEmailDiscovery();
    const res = resolveCreateFastPathAction(
      {
        userText: ANSWER,
        currentTurn: 5,
        lastAssistantText: RECIPIENT_Q,
        boundaryDecision: grant("answer_pending_question"),
      },
      ROUTING,
    );
    expect(res).not.toBeNull();
    expect(res?.localReply).toBeTruthy(); // the next Create discovery step
    const session = loadUniversalCreationSession();
    expect(session).not.toBeNull(); // not cleared
    expect(isCreateParked(session)).toBe(false); // not parked
  });

  it("'They need to know.' is handled by Create under a grant (not handed to answer-first)", () => {
    seedEmailDiscovery();
    const res = resolveCreateFastPathAction(
      {
        userText: "They need to know.",
        currentTurn: 5,
        lastAssistantText: RECIPIENT_Q,
        boundaryDecision: grant("answer_pending_question"),
      },
      ROUTING,
    );
    expect(res).not.toBeNull();
    expect(res?.localReply).toBeTruthy();
    expect(loadUniversalCreationSession()).not.toBeNull();
  });

  it("legacy caller WITHOUT a Boundary decision keeps prior behavior (returns null)", () => {
    seedEmailDiscovery();
    const res = resolveCreateFastPathAction(
      {
        userText: ANSWER,
        currentTurn: 5,
        lastAssistantText: RECIPIENT_Q,
      },
      ROUTING,
    );
    expect(res).toBeNull();
  });
});
