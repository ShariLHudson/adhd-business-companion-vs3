/**
 * @vitest-environment node
 *
 * Soft-Boundary Conversation Architecture — Stage S1 decision tests.
 *
 * GOAL (this stage is NOT a behavior change): prove that one small,
 * deterministic decision can classify the conversational transition BEFORE any
 * existing machine acts. `resolveConversationBoundary` is pure and unwired —
 * nothing in production imports it.
 *
 * CONTRACT BOUNDARY (client-readiness matrix — full detail in conversationBoundary.ts):
 *   Boundary Decision owns the TRANSITION TYPE; each machine keeps its DOMAIN
 *   EXECUTION + explicit safeguards and becomes a client at wiring time:
 *     Topics(full) Workflow(full) Create(full) | Pending(partial: keeps selection
 *     parse) Offers(partial: keeps explicit accept/decline).
 *
 * Each `it` below is one of the ten required conversational scenarios.
 */
import { describe, expect, it } from "vitest";
import {
  resolveConversationBoundary,
  type BoundaryTurnInput,
} from "./conversationBoundary";

const topic = (
  goal: string,
  extra: Partial<BoundaryTurnInput["activeTopic"]> = {},
): BoundaryTurnInput["activeTopic"] => ({
  topicId: "t1",
  goal,
  resolved: false,
  startedAtTurn: 1,
  updatedAtTurn: 1,
  ...extra,
});

const decide = (input: BoundaryTurnInput) => resolveConversationBoundary(input);

describe("resolveConversationBoundary — ten conversational scenarios", () => {
  it("1. same-topic continuation → continue_current_topic", () => {
    const d = decide({
      userText: "The accountant is the most urgent.",
      turn: 2,
      activeTopic: topic("what should I do first"),
    });
    expect(d.decision).toBe("continue_current_topic");
  });

  it("2. clear subject change → switch_topic", () => {
    const d = decide({
      userText: "My grandson is having trouble with school.",
      turn: 2,
      activeTopic: topic("prepare for the craft show"),
    });
    expect(d.decision).toBe("switch_topic");
  });

  it("3. implicit subject change, no pivot phrase → switch_topic", () => {
    const d = decide({
      userText: "I also need to call the dentist today.",
      turn: 2,
      activeTopic: topic("help me price my workshop"),
    });
    expect(d.decision).toBe("switch_topic");
  });

  it("4a. temporary interruption → interrupt_and_suspend (park, don't destroy)", () => {
    const d = decide({
      userText: "Before we continue, remind me to call Linda.",
      turn: 2,
      activeWork: { kind: "create", id: "c1", artifactType: "proposal", suspendable: true },
    });
    expect(d.decision).toBe("interrupt_and_suspend");
    expect(d.suspend).toBe(true);
  });

  it("4b/10. explicit return → return_to_suspended_topic", () => {
    const d = decide({
      userText: "Okay, back to the proposal.",
      turn: 4,
      suspended: [{ id: "s1", summary: "write this proposal", suspendedAtTurn: 2 }],
    });
    expect(d.decision).toBe("return_to_suspended_topic");
    expect(d.returnTargetId).toBe("s1");
  });

  it("5. related expansion → expand_current_topic", () => {
    const d = decide({
      userText: "I also need a packing checklist.",
      turn: 2,
      activeTopic: topic("help me plan my booth"),
    });
    expect(d.decision).toBe("expand_current_topic");
    expect(d.evidence).toContain("deliverable_addition");
  });

  it("6. mid-create + distress+errand → interrupt_and_suspend (email must not be destroyed)", () => {
    const d = decide({
      userText: "I'm overwhelmed and need to pick up supplies.",
      turn: 5,
      activeWork: { kind: "create", id: "c2", artifactType: "email", suspendable: true },
    });
    expect(d.decision).toBe("interrupt_and_suspend");
    expect(d.suspend).toBe(true);
    expect(d.evidence).toContain("emotional_urgency");
  });

  it("7. awaiting-user + unrelated request → switch_topic (release pending, not swallow)", () => {
    const d = decide({
      userText: "I need to prepare for the craft show.",
      turn: 3,
      pendingQuestion: {
        kind: "menu",
        expects: "selection",
        choices: ["Boardroom", "Round Table"],
      },
    });
    expect(d.decision).toBe("switch_topic");
  });

  it("8a. ambiguous short answer that fits the question → answer_pending_question", () => {
    const d = decide({
      userText: "Tuesday.",
      turn: 3,
      pendingQuestion: { kind: "scheduling", expects: "date_or_day" },
    });
    expect(d.decision).toBe("answer_pending_question");
  });

  it("8b. same short answer that does NOT fit the question → unclear (not swallowed)", () => {
    const d = decide({
      userText: "Tuesday.",
      turn: 3,
      pendingQuestion: {
        kind: "menu",
        expects: "selection",
        choices: ["Boardroom", "Round Table"],
      },
    });
    expect(d.decision).toBe("unclear");
  });

  it("9. emotional interruption of a workflow → interrupt_and_suspend", () => {
    const d = decide({
      userText: "I'm really overwhelmed right now.",
      turn: 6,
      activeWork: { kind: "workflow", id: "w1", artifactType: "strategy", suspendable: true },
    });
    expect(d.decision).toBe("interrupt_and_suspend");
  });

  it("10. return to earlier topic after interruption → return_to_suspended_topic", () => {
    const d = decide({
      userText: "Anyway, back to the craft show.",
      turn: 7,
      suspended: [{ id: "s2", summary: "the craft show booth", suspendedAtTurn: 3 }],
    });
    expect(d.decision).toBe("return_to_suspended_topic");
    expect(d.returnTargetId).toBe("s2");
  });
});

describe("resolveConversationBoundary — precedence + safety", () => {
  it("emotional urgency outranks a pending answer (never swallowed under distress)", () => {
    const d = decide({
      userText: "I'm overwhelmed right now.",
      turn: 2,
      pendingQuestion: { kind: "scheduling", expects: "date_or_day" },
      activeWork: { kind: "create", id: "c", artifactType: "email", suspendable: true },
    });
    expect(d.decision).toBe("interrupt_and_suspend");
  });

  it("explicit cancel is a deliberate destroy, distinct from a soft switch", () => {
    const d = decide({
      userText: "Actually never mind, forget the proposal.",
      turn: 2,
      activeWork: { kind: "create", id: "c", artifactType: "proposal", suspendable: true },
    });
    expect(d.decision).toBe("cancel_current_workflow");
  });

  it("a bare short unknown reply with no pending question stays unclear (no false switch)", () => {
    const d = decide({ userText: "Tuesday.", turn: 2 });
    expect(d.decision).toBe("unclear");
  });

  it("empty message is unclear", () => {
    expect(decide({ userText: "   ", turn: 1 }).decision).toBe("unclear");
  });
});
