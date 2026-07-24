/**
 * @vitest-environment jsdom
 *
 * Conversation isolation — New Chat / New Day / hard reset must not
 * carry active help-thread topic state into a new conversationId.
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetShariThreadIsolationTimestampsForTests,
  buildShariConversationThread,
  clearShariConversationThread,
  inspectShariThreadIsolation,
  isShariConversationFollowUp,
  peekShariConversationThread,
  resolveShariConversationThread,
  resetShariConversationThreadForNewConversation,
  storeShariConversationThread,
  SHARI_CONVERSATION_THREAD_KEY,
} from "./conversationContinuity";
import { decideShariResponse } from "./decideShariResponse";
import { runShariCognitivePipeline } from "./cognitivePipeline";
import { resetActiveConversation } from "@/lib/conversationReset/resetActiveConversation";
import {
  clearConversationSession,
  getOrCreateConversationSession,
  resetConversationSessionMemoryForTests,
} from "@/lib/conversationSession";
import { clearActiveTopic, saveActiveTopic } from "@/lib/conversationStabilization/activeTopicStore";
import { storeShariConversationHandoff, clearShariConversationHandoff, peekShariConversationHandoff } from "./conversationHandoff";
import { collectApprovedBusinessEstateContext } from "@/lib/profile/guidedFieldHelp";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  resetConversationSessionMemoryForTests();
  clearConversationSession();
  clearShariConversationThread();
  clearShariConversationHandoff();
  clearActiveTopic();
  __resetShariThreadIsolationTimestampsForTests();
});

function seedLoomThread(conversationId: string) {
  const decision = decideShariResponse("How do I create a Loom video?");
  const thread = buildShariConversationThread({
    decision,
    answer: "Loom steps: open, record, share.",
    conversationId,
    assumptions: ["Assuming desktop Loom"],
    relevantContextKeys: ["legacy.sells"],
  });
  storeShariConversationThread(thread);
  return thread;
}

describe("Shari conversation isolation", () => {
  it("A–D: New Chat drops Loom thread before craft booth", () => {
    const session = getOrCreateConversationSession();
    seedLoomThread(session.conversationId);

    expect(
      resolveShariConversationThread(session.conversationId).thread
        ?.originalRequest,
    ).toMatch(/Loom/i);

    const reset = resetActiveConversation({ mode: "new-chat" });
    expect(reset.conversationId).not.toBe(session.conversationId);
    expect(peekShariConversationThread()).toBeNull();

    const resolved = resolveShariConversationThread(reset.conversationId);
    expect(resolved.thread).toBeNull();
    expect(resolved.staleRejected).toBe(false);

    const booth = runShariCognitivePipeline(
      "How do I best set up my vendor booth for a craft fair?",
      { conversationId: reset.conversationId },
    );
    expect(booth.isFollowUp).toBe(false);
    expect(booth.promptHints).not.toMatch(/Loom/i);
    expect(booth.thread).toBeNull();
  });

  it("E–H: Hard reset (new-chat isolation) drops vendor booth thread", () => {
    const session = getOrCreateConversationSession();
    const decision = decideShariResponse(
      "How do I best set up my vendor booth for a craft fair?",
    );
    storeShariConversationThread(
      buildShariConversationThread({
        decision,
        answer: "Booth layout with hero zone.",
        conversationId: session.conversationId,
        assumptions: ["Assuming 10x10 booth"],
        correction: "I sell journals",
      }),
    );
    saveActiveTopic({
      topicId: "topic-booth",
      userGoal: "set up vendor booth",
      selectedKnowledgeSources: [],
      status: "identified",
      confidence: "high",
      responseOwner: "shari",
      startedAtTurn: 1,
      updatedAtTurn: 1,
      unresolvedNeed: "booth size?",
    });

    const reset = resetActiveConversation({ mode: "new-chat" });
    expect(peekShariConversationThread()).toBeNull();
    expect(resolveShariConversationThread(reset.conversationId).thread).toBeNull();

    const followWouldHaveBound = isShariConversationFollowUp(
      "What should I work on today?",
      peekShariConversationThread(),
    );
    expect(followWouldHaveBound).toBe(false);

    const turn = runShariCognitivePipeline("What should I work on today?", {
      conversationId: reset.conversationId,
    });
    expect(turn.isFollowUp).toBe(false);
    expect(turn.promptHints).not.toMatch(/booth|vendor|journal/i);
  });

  it("I–K: New Day does not resume Day 1 topic", () => {
    const day1 = getOrCreateConversationSession();
    seedLoomThread(day1.conversationId);

    const reset = resetActiveConversation({ mode: "new-day" });
    expect(reset.conversationId).not.toBe(day1.conversationId);
    expect(peekShariConversationThread()).toBeNull();

    const turn = runShariCognitivePipeline("Good morning — what's next?", {
      conversationId: reset.conversationId,
    });
    expect(turn.isFollowUp).toBe(false);
    expect(JSON.stringify(turn.wisdom)).not.toMatch(/Loom/i);
  });

  it("L–M: approved Estate context remains; active conversation facts do not", () => {
    // Profile/Estate collectors stay available (we only assert API still callable
    // and active thread facts are gone — no wipe of approved fields).
    const session = getOrCreateConversationSession();
    seedLoomThread(session.conversationId);
    resetActiveConversation({ mode: "new-chat" });

    expect(peekShariConversationThread()).toBeNull();
    // Collector must still run without throwing (approved fields untouched by reset).
    expect(() => collectApprovedBusinessEstateContext()).not.toThrow();
  });

  it("rejects stale thread when conversationId mismatches", () => {
    seedLoomThread("conv-old");
    const resolved = resolveShariConversationThread("conv-new");
    expect(resolved.staleRejected).toBe(true);
    expect(resolved.thread).toBeNull();
    expect(peekShariConversationThread()).toBeNull();
    expect(sessionStorage.getItem(SHARI_CONVERSATION_THREAD_KEY)).toBeNull();

    const inspect = inspectShariThreadIsolation("conv-new");
    expect(inspect.resetTimestamp || resolved.hydrationSource).toBeTruthy();
  });

  it("does not copy prior assumptions across conversationIds in builder", () => {
    const prior = seedLoomThread("conv-a");
    const decision = decideShariResponse("How do I find Facebook groups?");
    const next = buildShariConversationThread({
      decision,
      answer: "Search method…",
      conversationId: "conv-b",
      prior,
      assumptions: ["should not inherit loom"],
    });
    expect(next.conversationId).toBe("conv-b");
    expect(next.originalRequest).toMatch(/Facebook/i);
    expect(next.originalRequest).not.toMatch(/Loom/i);
    expect(next.assumptions).not.toContain("Assuming desktop Loom");
  });

  it("reset clears Shari handoff stash", () => {
    storeShariConversationHandoff({
      id: "h1",
      sourceConversationId: "c1",
      sourceMessageIds: [],
      originalRequest: "Loom",
      currentGoal: "Loom",
      answerContent: "steps",
      selectedContent: null,
      userFollowUpContext: [],
      researchStatus: "not_needed",
      sourceReferences: [],
      assumptions: [],
      unresolvedQuestions: [],
      destination: "create",
      intendedOutcome: "draft",
      returnContext: null,
      createdAt: new Date().toISOString(),
    });
    expect(peekShariConversationHandoff()).not.toBeNull();
    resetActiveConversation({ mode: "new-chat" });
    expect(peekShariConversationHandoff()).toBeNull();
  });

  it("resetShariConversationThreadForNewConversation records timestamps", () => {
    seedLoomThread("c1");
    resetShariConversationThreadForNewConversation({
      mode: "hard-reset",
      conversationId: "c2",
    });
    const inspect = inspectShariThreadIsolation("c2");
    expect(inspect.thread).toBeNull();
    expect(inspect.resetTimestamp).toBeTruthy();
    expect(inspect.newChatInitializedAt).toBeTruthy();
  });
});
