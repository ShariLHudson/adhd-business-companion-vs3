import { describe, expect, it } from "vitest";
import {
  consumeCompanionChatStream,
  isCompanionChatStreamResponse,
} from "./companionChatStream";

describe("companionChatStream", () => {
  it("detects NDJSON stream responses", () => {
    const res = new Response(null, {
      headers: { "content-type": "application/x-ndjson" },
    });
    expect(isCompanionChatStreamResponse(res)).toBe(true);
    expect(
      isCompanionChatStreamResponse(
        new Response(null, { headers: { "content-type": "application/json" } }),
      ),
    ).toBe(false);
  });

  it("accumulates delta chunks and final message", async () => {
    const body = [
      JSON.stringify({ delta: "Hi" }),
      JSON.stringify({ delta: " there" }),
      JSON.stringify({
        done: true,
        relationshipResponseId: "rel-1",
        message: "Hi there",
      }),
    ].join("\n");

    const chunks: string[] = [];
    const result = await consumeCompanionChatStream(
      new Response(body, {
        headers: { "content-type": "application/x-ndjson" },
      }),
      (text) => chunks.push(text),
    );

    expect(chunks).toEqual(["Hi", "Hi there"]);
    expect(result.fullText).toBe("Hi there");
    expect(result.relationshipResponseId).toBe("rel-1");
  });
});
