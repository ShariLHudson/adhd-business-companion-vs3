import { describe, expect, it, beforeEach } from "vitest";

import { upsertRecord } from "./store";
import {
  applyMemoryAging,
  buildMemoryProfile,
  buildRecallDecision,
  clearMemoryStore,
  clearPendingProposals,
  confirmMemoryUpdate,
  deleteMemory,
  editMemory,
  exportMemory,
  proposeMemoryWrite,
  runCoreMemory,
  writeMemoryDirect,
} from "./memoryEngine";

describe("Spark Core Memory & Personalization Engine v1.0", () => {
  const userId = "user-1";

  beforeEach(() => {
    clearMemoryStore();
    clearPendingProposals();
  });

  it("recalls business context to reduce repeated questions", () => {
    writeMemoryDirect({
      userId,
      key: "business_name",
      value: "Bright Path Coaching",
      provenance: "member_confirmed",
    });
    writeMemoryDirect({
      userId,
      key: "industry",
      value: "executive coaching",
      provenance: "member_confirmed",
    });

    const recall = buildRecallDecision(userId, "Help me plan my marketing.");
    expect(recall.recalledFacts.length).toBeGreaterThanOrEqual(2);
    expect(recall.reduceRepetition).toContain("business_name");
    expect(recall.shouldAsk).toBe(false);
  });

  it("blocks speculation and temporary thoughts", () => {
    const proposal = proposeMemoryWrite({
      userId,
      key: "audience",
      proposedValue: "maybe busy founders",
      sourceText: "I guess my audience is maybe busy founders",
    });

    expect(proposal.blocked).toBe(true);
    expect(proposal.blockReason).toBe("speculation");
  });

  it("blocks one-time emotional states as permanent traits", () => {
    const proposal = proposeMemoryWrite({
      userId,
      key: "recurring_challenges",
      proposedValue: "sad today",
      sourceText: "I'm so sad today",
    });

    expect(proposal.blocked).toBe(true);
    expect(proposal.blockReason).toBe("one_time_emotional_state");
  });

  it("prompts remember-this flow for important business facts", () => {
    const result = runCoreMemory({
      turnId: "t1",
      threadId: "thread-1",
      userId,
      memberMessage: "My audience is women entrepreneurs in their 40s.",
    });

    expect(result.ingress.pendingProposals.length).toBeGreaterThan(0);
    expect(result.egress?.rememberPrompt?.promptText).toMatch(/remember/i);
  });

  it("detects conflict when audience changes", () => {
    writeMemoryDirect({
      userId,
      key: "audience",
      value: "corporate executives",
      provenance: "member_confirmed",
    });

    const result = runCoreMemory({
      turnId: "t2",
      threadId: "thread-1",
      userId,
      memberMessage: "My audience is women entrepreneurs in their 40s.",
      rememberConsent: true,
    });

    expect(result.ingress.conflicts.length).toBe(1);
    expect(result.ingress.conflicts[0].promptText).toMatch(/update/i);
  });

  it("confirms and writes memory on member approval", () => {
    const proposal = proposeMemoryWrite({
      userId,
      key: "brand_voice",
      proposedValue: "warm and direct",
      sourceText: "Our brand voice is warm and direct",
      provenance: "member_stated",
    });

    const record = confirmMemoryUpdate(userId, proposal.id);
    expect(record?.confidence).toBe("confirmed");
    expect(record?.value).toBe("warm and direct");
  });

  it("supports edit, delete, and export", () => {
    const record = writeMemoryDirect({
      userId,
      key: "goals",
      value: "launch group program",
      provenance: "member_confirmed",
    })!;

    const edited = editMemory(userId, record.id, "launch VIP day");
    expect(edited?.value).toBe("launch VIP day");
    expect(edited?.confidence).toBe("high_confidence");

    const exported = exportMemory(userId);
    expect(exported.records.some((r) => r.id === record.id)).toBe(true);

    deleteMemory(userId, record.id);
    const profile = buildMemoryProfile(userId);
    expect(profile.totalActive).toBe(0);
  });

  it("ages short-term conversation memory", () => {
    const record = writeMemoryDirect({
      userId,
      key: "recent_context",
      value: "discussed pricing page",
      provenance: "member_stated",
    })!;

    const old = new Date(record.createdAt).getTime() - 2 * 24 * 60 * 60 * 1000;
    record.createdAt = new Date(old).toISOString();
    record.updatedAt = record.createdAt;
    upsertRecord(record);

    const { expired } = applyMemoryAging(userId, Date.now());
    expect(expired).toContain(record.id);
  });

  it("builds user-visible memory profile by category", () => {
    writeMemoryDirect({
      userId,
      key: "business_name",
      value: "Spark Studio",
      provenance: "member_confirmed",
    });
    writeMemoryDirect({
      userId,
      key: "preferred_tone",
      value: "warm",
      provenance: "member_confirmed",
    });

    const profile = buildMemoryProfile(userId);
    expect(profile.sections.length).toBeGreaterThanOrEqual(2);
    expect(profile.totalActive).toBe(2);
  });
});
