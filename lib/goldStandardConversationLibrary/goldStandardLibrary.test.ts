import { describe, expect, it } from "vitest";
import {
  certifyConversation,
  getGoldStandardById,
  listGoldStandardConversations,
  replaceBlockedDraft,
  retrieveGoldStandardGuidance,
  suggestedGroundedQuestion,
  TIO_GSC_BIZ_HIRING_001,
  TIO_GSC_CORRECTION_001,
  TIO_GSC_REPAIR_001,
} from "./index";
import {
  buildTalkItOutTurn,
  createTalkItOutSession,
  resetTalkItOutSessionsForTests,
} from "@/lib/talkItOut";
import { beforeEach } from "vitest";

describe("Package 194 — Gold Standard Conversation Library", () => {
  beforeEach(() => {
    resetTalkItOutSessionsForTests();
  });

  it("registers Batch 1 + Batch 2 coverage plus featured repairs", () => {
    const all = listGoldStandardConversations();
    // 20 batch1 + 10 batch2 + 2 featured extras (repair/correction) = 32
    expect(all.length).toBeGreaterThanOrEqual(32);
    expect(getGoldStandardById("TIO-GSC-BIZ-HIRING-001")).toBeTruthy();
    expect(getGoldStandardById("TIO-GSC-REPAIR-001")).toBeTruthy();
    expect(getGoldStandardById("TIO-GSC-CORRECTION-001")).toBeTruthy();
    expect(getGoldStandardById("TIO-GSC-OVW-001")).toBeTruthy();
    expect(getGoldStandardById("TIO-GSC-SHORT-001")).toBeTruthy();
    const batch1 = all.filter((c) => c.batch === 1);
    expect(batch1.length).toBe(20);
    const batch2 = all.filter((c) => c.batch === 2);
    expect(batch2.length).toBe(10);
  });

  it("certifies featured hiring conversation", () => {
    const cert = certifyConversation(TIO_GSC_BIZ_HIRING_001);
    expect(cert.passed).toBe(true);
    expect(TIO_GSC_BIZ_HIRING_001.topicAnchor).toMatch(/marketing assistant/i);
  });

  it("retrieves hiring examples for marketing assistant topic", () => {
    const result = retrieveGoldStandardGuidance({
      userText: "If I should hire a marketing assistant or not.",
      topicAnchor: "hiring a marketing assistant",
    });
    expect(result.hits.length).toBeGreaterThan(0);
    expect(result.hits[0]!.conversation.id).toMatch(/HIRING|REPAIR|CORRECTION/);
    expect(result.blockedFailurePatterns.some((p) => /take your time/i.test(p))).toBe(
      true,
    );
    expect(result.structureHints).toContain("no_verbatim_copy");
    expect(result.suggestedMove).toBeTruthy();
  });

  it("retrieves repair examples for clarification", () => {
    const result = retrieveGoldStandardGuidance({
      userText: "What does that mean?",
      topicAnchor: "hiring a marketing assistant",
      clarificationOrRepair: true,
      previousAssistantText: "Take your time with that.",
    });
    expect(
      result.hits.some((h) => h.conversation.id === TIO_GSC_REPAIR_001.id),
    ).toBe(true);
  });

  it("retrieves correction examples when interpretations rejected", () => {
    const result = retrieveGoldStandardGuidance({
      userText: "Nothing underneath.",
      topicAnchor: "hiring a marketing assistant",
      clarificationOrRepair: true,
      rejectedInterpretations: ["deeper concern underneath"],
    });
    expect(
      result.hits.some((h) => h.conversation.id === TIO_GSC_CORRECTION_001.id),
    ).toBe(true);
  });

  it("replaces blocked draft without copying a full conversation", () => {
    const { text, replaced, guidance } = replaceBlockedDraft({
      draftText: "Take your time with that.",
      userText: "If I should hire a marketing assistant or not.",
      topicAnchor: "hiring a marketing assistant",
    });
    expect(replaced).toBe(true);
    expect(text.toLowerCase()).not.toContain("take your time");
    expect(text.toLowerCase()).toMatch(/hir|consider/);
    expect(guidance.structureHints).toContain("no_verbatim_copy");
    // Must not dump the entire gold conversation
    expect(text.length).toBeLessThan(400);
  });

  it("suggested grounded question is a single turn, not a script", () => {
    const result = retrieveGoldStandardGuidance({
      userText: "If I should hire a marketing assistant or not.",
      topicAnchor: "hiring a marketing assistant",
    });
    const q = suggestedGroundedQuestion(result);
    expect(q).toBeTruthy();
    expect((q!.match(/\?/g) ?? []).length).toBe(1);
  });

  it("Talk It Out opening stays aligned with hiring gold standard", () => {
    const session = createTalkItOutSession();
    const turn = buildTalkItOutTurn(
      session,
      "If I should hire a marketing assistant or not.",
    );
    expect(turn.assistantText.toLowerCase()).toMatch(/hir|market|assistant|consider/);
    expect(turn.assistantText.toLowerCase()).not.toMatch(
      /take your time|quieter|underneath|around does/,
    );
  });

  it("every library entry passes certification", () => {
    for (const entry of listGoldStandardConversations()) {
      const cert = certifyConversation(entry);
      expect(cert.passed, `${entry.id}: ${cert.failures.join(",")}`).toBe(true);
    }
  });
});
