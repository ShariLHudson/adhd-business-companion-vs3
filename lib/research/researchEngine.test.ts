import { describe, expect, it, vi } from "vitest";
import {
  createDefaultChatProvider,
  makeExploreFinding,
  runResearch,
  type LiveRetrievalProvider,
  type ResearchEngineRequest,
  type ResearchProviders,
} from "./researchEngine";
import { findingMayShowCitation, type ResearchSourceCitation } from "./types";

function chatSpy(reply = "Here are a few angles to consider…") {
  return vi.fn(async () => reply);
}

function req(
  partial: Partial<ResearchEngineRequest> & { mode: ResearchEngineRequest["mode"] },
): ResearchEngineRequest {
  return {
    systemPrompt: "You are Shari.",
    messages: [{ role: "user", content: "How do I describe my offer?" }],
    ...partial,
  };
}

const realSource: ResearchSourceCitation = {
  title: "Statista — SMB spend 2026",
  url: "https://example.com/report",
  publisher: "Statista",
  retrievalDate: "2026-07-27T00:00:00.000Z",
};

describe("Explore mode", () => {
  it("returns a conversational reply and never citation findings", async () => {
    const chat = chatSpy();
    const result = await runResearch(req({ mode: "explore" }), { chat });
    expect(chat).toHaveBeenCalledOnce();
    expect(result.mode).toBe("explore");
    expect(result.reply).toContain("angles");
    expect(result.providerUnavailable).toBeUndefined();
    expect(result.findings.every((f) => !findingMayShowCitation(f))).toBe(true);
  });

  it("cannot emit live_source or connected_source findings (throws)", () => {
    for (const basis of ["live_source", "connected_source"] as const) {
      expect(() =>
        makeExploreFinding({
          id: "x",
          title: "t",
          content: "c",
          kind: "fact",
          evidenceBasis: basis,
        }),
      ).toThrow();
    }
  });

  it("labels topic-pack / built-in output as built_in_guidance with no citation metadata", async () => {
    const result = await runResearch(
      req({
        mode: "explore",
        builtInGuidance: [
          { id: "g1", title: "Offer clarity checklist", content: "…" },
          { id: "g2", title: "Common offer pitfalls", content: "…" },
        ],
      }),
      { chat: chatSpy() },
    );
    expect(result.findings).toHaveLength(2);
    expect(result.findings.every((f) => f.evidenceBasis === "built_in_guidance")).toBe(true);
    // Explore findings can never retain citation metadata.
    expect(result.findings.every((f) => f.sources.length === 0)).toBe(true);
    expect(result.findings.every((f) => f.confidence === undefined)).toBe(true);
    expect(result.findings.some(findingMayShowCitation)).toBe(false);
  });
});

describe("Sources mode without a provider (Stage 3A)", () => {
  it("returns providerUnavailable, zero findings, an honest notice, and never calls chat", async () => {
    const chat = chatSpy();
    const result = await runResearch(req({ mode: "sources" }), { chat });
    expect(result.providerUnavailable).toBe(true);
    expect(result.findings).toEqual([]);
    expect(result.notice).toMatch(/won't invent them/i);
    expect(result.reply).toBe("");
    // No silent fallback to the conversational model.
    expect(chat).not.toHaveBeenCalled();
  });
});

describe("Sources mode honesty guarantees", () => {
  it("a retrieval failure never becomes model-generated 'sourced' research", async () => {
    const chat = chatSpy();
    const failing: LiveRetrievalProvider = {
      retrieve: vi.fn(async () => {
        throw new Error("network down");
      }),
    };
    const providers: ResearchProviders = { chat, liveRetrieval: failing };
    const result = await runResearch(req({ mode: "sources" }), providers);
    expect(result.providerUnavailable).toBe(true);
    expect(result.findings).toEqual([]);
    expect(chat).not.toHaveBeenCalled(); // did not launder failure into a chat reply
  });

  it("cannot fabricate citations: a provider returning incomplete sources yields no findings", async () => {
    const junk: LiveRetrievalProvider = {
      retrieve: vi.fn(async () => [
        {
          id: "h1",
          title: "Claim",
          content: "…",
          // Missing a locator → not a real citation.
          sources: [{ title: "Somewhere", retrievalDate: "2026-07-27" }],
        },
      ]),
    };
    const result = await runResearch(req({ mode: "sources" }), {
      chat: chatSpy(),
      liveRetrieval: junk,
    });
    expect(result.providerUnavailable).toBe(true);
    expect(result.findings).toEqual([]);
  });

  it("only genuine, fully-cited retrieval hits survive as live_source findings", async () => {
    const good: LiveRetrievalProvider = {
      retrieve: vi.fn(async () => [
        {
          id: "h1",
          title: "SMB spend is rising",
          content: "…",
          sources: [realSource],
          confidence: "high" as const,
          freshness: "current" as const,
          verificationStatus: "verified" as const,
        },
      ]),
    };
    const result = await runResearch(req({ mode: "sources" }), {
      chat: chatSpy(),
      liveRetrieval: good,
    });
    expect(result.providerUnavailable).toBeUndefined();
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]!.evidenceBasis).toBe("live_source");
    expect(findingMayShowCitation(result.findings[0]!)).toBe(true);
  });
});

describe("default chat provider", () => {
  it("posts to the companion research engine and returns the message", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ message: "reply text" }), { status: 200 }),
      );
    const chat = createDefaultChatProvider();
    const out = await chat({ systemPrompt: "sp", messages: [{ role: "user", content: "q" }] });
    expect(out).toBe("reply text");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/companion-chat",
      expect.objectContaining({ method: "POST" }),
    );
    fetchMock.mockRestore();
  });
});
