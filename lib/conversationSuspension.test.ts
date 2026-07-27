/**
 * @vitest-environment node
 *
 * S2 — Suspension Primitive (pure, unwired). Proves the shared SuspendedContext
 * model generalizes the Create parked model and projects cleanly into the S1
 * boundary decision. No production code imports this; no behavior changes.
 */
import { describe, expect, it } from "vitest";
import {
  MAX_SUSPENSION_DEPTH,
  buildResumeHint,
  emptySuspensionState,
  findSuspendedById,
  hasSuspended,
  listSuspended,
  peekMostRecent,
  resume,
  suspend,
  suspendedContextFromParkedCreate,
  toBoundarySuspendedItems,
  type SuspendedContext,
} from "./conversationSuspension";
import { resolveConversationBoundary } from "./conversationBoundary";
import type { UniversalCreationSession } from "./universalCreation/types";

const ctx = (o: Partial<SuspendedContext> & { sourceRef: string; suspendedAtTurn: number }): Omit<
  SuspendedContext,
  "id"
> => ({
  kind: o.kind ?? "topic",
  summary: o.summary ?? `work on ${o.sourceRef}`,
  reason: o.reason ?? "switch_topic",
  ...o,
});

describe("suspension primitive — push / pop / round-trip", () => {
  it("suspends and resumes most-recent (LIFO)", () => {
    let s = emptySuspensionState();
    s = suspend(s, ctx({ sourceRef: "topicA", suspendedAtTurn: 1 }));
    s = suspend(s, ctx({ sourceRef: "topicB", suspendedAtTurn: 2 }));
    expect(hasSuspended(s)).toBe(true);
    expect(peekMostRecent(s)?.sourceRef).toBe("topicB");
    const r = resume(s);
    expect(r.resumed?.sourceRef).toBe("topicB");
    expect(peekMostRecent(r.state)?.sourceRef).toBe("topicA");
  });

  it("resumes a specific id", () => {
    let s = emptySuspensionState();
    s = suspend(s, ctx({ sourceRef: "topicA", suspendedAtTurn: 1 }));
    s = suspend(s, ctx({ sourceRef: "topicB", suspendedAtTurn: 2 }));
    const targetId = listSuspended(s).find((c) => c.sourceRef === "topicA")!.id;
    const r = resume(s, targetId);
    expect(r.resumed?.sourceRef).toBe("topicA");
    expect(findSuspendedById(r.state, targetId)).toBeNull();
    expect(peekMostRecent(r.state)?.sourceRef).toBe("topicB");
  });

  it("resume returns null when nothing matches / empty", () => {
    expect(resume(emptySuspensionState()).resumed).toBeNull();
    const s = suspend(emptySuspensionState(), ctx({ sourceRef: "x", suspendedAtTurn: 1 }));
    expect(resume(s, "no-such-id").resumed).toBeNull();
  });
});

describe("suspension primitive — bounded depth + dedup", () => {
  it("caps at MAX_SUSPENSION_DEPTH, dropping the oldest", () => {
    let s = emptySuspensionState();
    s = suspend(s, ctx({ sourceRef: "A", suspendedAtTurn: 1 }));
    s = suspend(s, ctx({ sourceRef: "B", suspendedAtTurn: 2 }));
    s = suspend(s, ctx({ sourceRef: "C", suspendedAtTurn: 3 }));
    expect(listSuspended(s).length).toBe(MAX_SUSPENSION_DEPTH);
    expect(listSuspended(s).map((c) => c.sourceRef)).toEqual(["B", "C"]); // A dropped
  });

  it("re-suspending the same source replaces (no duplicate)", () => {
    let s = emptySuspensionState();
    s = suspend(s, ctx({ sourceRef: "A", suspendedAtTurn: 1, summary: "first" }));
    s = suspend(s, ctx({ sourceRef: "A", suspendedAtTurn: 5, summary: "second" }));
    expect(listSuspended(s).length).toBe(1);
    expect(peekMostRecent(s)?.summary).toBe("second");
  });
});

describe("Create as the first producer", () => {
  const parkedSession = (
    o: Partial<UniversalCreationSession> = {},
  ): UniversalCreationSession =>
    ({
      documentType: "email",
      phase: "prepare",
      confidence: "high",
      answers: {},
      questionIndex: 0,
      originalUserText: "draft an email to the accountant about the invoice",
      startedAtTurn: 3,
      preparationReady: false,
      pendingEnhancements: [],
      lifecycle: "parked",
      parkedReason: "temporary_detour",
      parkedAtTurn: 4,
      ...o,
    }) as unknown as UniversalCreationSession;

  it("maps a parked Create session into a SuspendedContext with a resume hint", () => {
    const c = suspendedContextFromParkedCreate(parkedSession())!;
    expect(c).not.toBeNull();
    expect(c.kind).toBe("create");
    expect(c.sourceRef).toBe("email");
    expect(c.reason).toBe("temporary_detour");
    expect(c.suspendedAtTurn).toBe(4);
    expect(c.summary).toContain("accountant");
    expect(c.resumeHint).toBe("the email you were working on");
  });

  it("returns null for an absent or non-parked session", () => {
    expect(suspendedContextFromParkedCreate(null)).toBeNull();
    expect(
      suspendedContextFromParkedCreate(parkedSession({ lifecycle: "active" })),
    ).toBeNull();
  });

  it("buildResumeHint stays natural without an artifact label", () => {
    expect(buildResumeHint({ kind: "topic", summary: "planning the booth" })).toContain(
      "planning the booth",
    );
  });
});

describe("S1 ↔ S2 seam — projected stack drives return_to_suspended_topic", () => {
  it("a suspended item is returnable via the boundary decision (unwired)", () => {
    let s = emptySuspensionState();
    s = suspend(
      s,
      ctx({ sourceRef: "topic-craft", suspendedAtTurn: 3, summary: "the craft show booth" }),
    );
    const d = resolveConversationBoundary({
      userText: "Anyway, back to the craft show booth.",
      turn: 7,
      suspended: toBoundarySuspendedItems(s),
    });
    expect(d.decision).toBe("return_to_suspended_topic");
    expect(d.returnTargetId).toBe(peekMostRecent(s)!.id);
  });
});
