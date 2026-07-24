import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildFollowUpAdaptedReply,
  buildShariConversationThread,
  clearShariConversationThread,
  extractThreadCorrection,
  isShariConversationFollowUp,
  looksLikeConversationRestart,
  storeShariConversationThread,
} from "./conversationContinuity";
import { decideShariResponse } from "./decideShariResponse";

const memory = new Map<string, string>();

beforeEach(() => {
  memory.clear();
  vi.stubGlobal("window", {
    sessionStorage: {
      getItem: (k: string) => memory.get(k) ?? null,
      setItem: (k: string, v: string) => {
        memory.set(k, v);
      },
      removeItem: (k: string) => {
        memory.delete(k);
      },
    },
  });
  clearShariConversationThread();
});

describe("Shari conversation continuity", () => {
  it("maps teach mode for how-to questions", () => {
    const d = decideShariResponse("How do I make a Loom video?");
    expect(d.conversationMode).toBe("teach");
    expect(d.directAnswerRequired).toBe(true);
  });

  it("adapts booth follow-ups without restarting", () => {
    const d = decideShariResponse(
      "How do I set up a vendor table or booth at an event?",
    );
    const thread = buildShariConversationThread({
      decision: d,
      answer: "Booth setup guidance with display and follow-up.",
      conversationId: "test-conv-booth",
    });
    storeShariConversationThread(thread);

    expect(isShariConversationFollowUp("What should go on the table?")).toBe(
      true,
    );
    const table = buildFollowUpAdaptedReply("What should go on the table?");
    expect(table).toMatch(/table|layers|eye level/i);
    expect(table).not.toMatch(/what are you trying to create/i);

    const withProduct = buildFollowUpAdaptedReply("I sell journals.");
    expect(withProduct).toMatch(/journal/i);
    expect(looksLikeConversationRestart(withProduct!)).toBe(false);
  });

  it("adapts Loom follow-up when member names Spark Estate", () => {
    const d = decideShariResponse("How do I create a Loom video?");
    storeShariConversationThread(
      buildShariConversationThread({
        decision: d,
        answer: "Loom outline with open, show, close.",
        conversationId: "test-conv-loom",
      }),
    );
    const adapted = buildFollowUpAdaptedReply("Mine is for Spark Estate.");
    expect(adapted).toMatch(/Spark Estate|Welcome|glass/i);
    expect(adapted).not.toMatch(/what are you trying to create/i);
  });

  it("does not treat explicit create as a follow-up", () => {
    const d = decideShariResponse("How do I create a strategic plan?");
    storeShariConversationThread(
      buildShariConversationThread({
        decision: d,
        answer: "Strategic plan education.",
        conversationId: "test-conv-strategy",
      }),
    );
    expect(
      isShariConversationFollowUp("Create a strategic plan for my business."),
    ).toBe(false);
  });

  it("extracts thread corrections and ignores ordinary follow-ups", () => {
    expect(extractThreadCorrection("Actually I sell journals")).toMatch(
      /sell journals/i,
    );
    expect(extractThreadCorrection("I meant the craft fair booth")).toMatch(
      /craft fair/i,
    );
    expect(extractThreadCorrection("make that shorter")).toBeNull();
  });
});
