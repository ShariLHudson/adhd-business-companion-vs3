/**
 * ADR-012 Phase 4 — end-to-end tests for Shari delivery-setting prompt
 * assembly, now that the SERVER is the sole owner of it.
 *
 * These tests exercise the REAL production path: a request shaped exactly
 * like a real client surface sends it → the real `POST` handler in
 * `app/api/companion-chat/route.ts` → the real `buildCompanionSystemPrompt`
 * → `resolveCompanionDeliveryPreferences` → the real
 * `buildMemberTonePreferenceBlocks` / `buildSupportStylePromptBlock` → the
 * exact system-prompt string that would be sent to the model (captured by
 * mocking `fetch` to the OpenAI endpoint, never actually calling it).
 *
 * Phase 3 wrote this file as a characterization harness: four assertions were
 * labeled "[KNOWN BUG]" and locked in the wrong behavior on purpose so that
 * Phase 4 would have an executable before/after contract. Phase 4 has landed,
 * and each of those four is now flipped to assert the corrected behavior:
 *
 *   1. `useMostOfTheTime: false` — the sentence is no longer asserted anyway.
 *   2. step-by-step / give-me-choices / custom — no longer collapse to
 *      "Adapt to the Situation" on Hospitality and Spark Alpha.
 *   3. The Support Style block ships ONCE, not twice.
 *   4. A temporary override no longer produces two contradictory
 *      "Active Support Style" lines inside one prompt.
 *
 * Every assertion in this file now describes intended behavior. Any failure
 * here is a regression.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  catalogEntryForStyle,
  legacySupportStyleFromId,
  type SupportStyleId,
} from "@/lib/supportStyle";

let capturedOpenAiBody: { messages?: Array<{ role: string; content: string }> } | null =
  null;

vi.stubGlobal(
  "fetch",
  vi.fn(async (_url: string, init: { body?: string }) => {
    capturedOpenAiBody = init?.body ? JSON.parse(init.body) : null;
    return new Response(
      JSON.stringify({
        choices: [{ message: { content: "(mock reply)" }, finish_reason: "stop" }],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }),
);

// Long enough for OPENAI_API_KEY (format-checked, ≥ 20 chars — see
// lib/openai/resolveOpenAiApiKey.ts) but never a real key; fetch is mocked
// above, so no real network call is ever made.
process.env.OPENAI_API_KEY = "sk-test-characterization-0000000000";

/**
 * Sends `body` through the real `/api/companion-chat` POST handler and
 * returns the exact system-prompt string the route built — i.e. the final
 * assembled prompt a model would actually receive.
 */
async function sendCompanionChat(
  body: Record<string, unknown>,
): Promise<{ status: number; systemPrompt: string }> {
  const { POST } = await import("./route");
  const { NextRequest } = await import("next/server");
  const req = new NextRequest("http://localhost/api/companion-chat", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const res = await POST(req);
  const systemPrompt = capturedOpenAiBody?.messages?.[0]?.content ?? "";
  return { status: res.status, systemPrompt };
}

function occurrencesOf(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

beforeEach(() => {
  capturedOpenAiBody = null;
});

describe("ADR-012 Phase 4 — round trip: client request → /api/companion-chat → final assembled prompt", () => {
  it("assembles guardrail + Conversation Style + Help Mode + Support Style for a main-chat-shaped request", async () => {
    const { status, systemPrompt } = await sendCompanionChat({
      messages: [{ role: "user", content: "hello" }],
      aiTone: "direct",
      helpMode: "concise",
      // Phase 4 wire: canonical id in its own field, legacy mirror alongside.
      supportStyleId: "gentle-first",
      supportStyle: "understand",
      useMostOfTheTime: true,
    });
    expect(status).toBe(200);
    expect(systemPrompt).toContain("THE IMMUTABLE FRIEND (constitutional");
    expect(systemPrompt).toContain("TONE — DIRECT");
    expect(systemPrompt).toContain("HELP MODE — CONCISE");
    expect(systemPrompt).toContain(
      "SUPPORT STYLE (separate from Conversation Style",
    );
    expect(systemPrompt).toContain("SUPPORT STYLE — GENTLE FIRST");
  }, 20000);

  it("keeps the identity guardrail earlier in the prompt than the Support Style block — ordering is load-bearing (companionTonePreferences.test.ts:53-54 asserts the same order at the unit level)", async () => {
    const { systemPrompt } = await sendCompanionChat({
      messages: [{ role: "user", content: "hello" }],
      aiTone: "balanced",
      helpMode: "ask-first",
      supportStyleId: "adaptive",
    });
    const guardrailIdx = systemPrompt.indexOf("THE IMMUTABLE FRIEND (constitutional");
    const supportIdx = systemPrompt.indexOf(
      "SUPPORT STYLE (separate from Conversation Style",
    );
    expect(guardrailIdx).toBeGreaterThan(-1);
    expect(supportIdx).toBeGreaterThan(-1);
    expect(guardrailIdx).toBeLessThan(supportIdx);
  }, 20000);

  it("still honors a legacy-only request (no supportStyleId) — older clients keep working", async () => {
    const { systemPrompt } = await sendCompanionChat({
      messages: [{ role: "user", content: "hello" }],
      aiTone: "balanced",
      helpMode: "ask-first",
      supportStyle: "solutions",
    });
    expect(systemPrompt).toContain("SUPPORT STYLE — PRACTICAL FIRST");
    expect(systemPrompt).toContain("Active Support Style: Practical First.");
  }, 20000);

  it("keeps delivery guidance and routing guidance as separate blocks, guardrail first", async () => {
    const { systemPrompt } = await sendCompanionChat({
      messages: [{ role: "user", content: "hello" }],
      aiTone: "gentle", // → routing guidance applies
      helpMode: "direct",
      supportStyleId: "practical-first",
    });
    const guardrailIdx = systemPrompt.indexOf("THE IMMUTABLE FRIEND (constitutional");
    const deliveryIdx = systemPrompt.indexOf(
      "SUPPORT STYLE (separate from Conversation Style",
    );
    const routingIdx = systemPrompt.indexOf(
      "ROUTING GUIDANCE (separate from the delivery guidance above):",
    );
    expect(routingIdx).toBeGreaterThan(-1);
    expect(systemPrompt).toContain(
      "Member tone preference in Settings overrides conflicting action-first routing hints this turn.",
    );
    // Identity → delivery → routing, and the routing sentence appears once.
    expect(guardrailIdx).toBeLessThan(deliveryIdx);
    expect(deliveryIdx).toBeLessThan(routingIdx);
    expect(
      occurrencesOf(
        systemPrompt,
        "Member tone preference in Settings overrides conflicting action-first routing hints this turn.",
      ),
    ).toBe(1);
  }, 20000);

  it("omits the routing guidance block when no delivery preference outranks routing", async () => {
    const { systemPrompt } = await sendCompanionChat({
      messages: [{ role: "user", content: "hello" }],
      aiTone: "direct",
      helpMode: "direct",
      supportStyleId: "practical-first",
    });
    expect(systemPrompt).not.toContain("ROUTING GUIDANCE (separate from");
  }, 20000);
});

describe("ADR-012 Phase 4 — the server reads the latest user message for a temporary override", () => {
  it("detects the override server-side, with no client-assembled block, and emits it exactly once", async () => {
    const { systemPrompt } = await sendCompanionChat({
      messages: [
        { role: "user", content: "I have a lot going on" },
        { role: "assistant", content: "Tell me what is loudest." },
        { role: "user", content: "Just tell me what to do" },
      ],
      aiTone: "balanced",
      helpMode: "ask-first",
      supportStyleId: "gentle-first",
      // No intentHint: the client no longer builds Support Style prompt text.
    });

    expect(occurrencesOf(systemPrompt, "TEMPORARY OVERRIDE THIS TURN")).toBe(1);
    expect(systemPrompt).toContain("Effective style: practical-first");
    expect(systemPrompt).toContain("Saved preference remains gentle-first");
    // The override wins the "Active Support Style" line, and nothing contradicts it.
    expect(systemPrompt).toContain("Active Support Style: Practical First.");
    expect(systemPrompt).not.toContain("Active Support Style: Gentle First.");
  }, 20000);

  it("reads the LATEST user message only — an earlier trigger does not leak into this turn", async () => {
    const { systemPrompt } = await sendCompanionChat({
      messages: [
        { role: "user", content: "Just tell me what to do" },
        { role: "assistant", content: "Here is the next step." },
        { role: "user", content: "Thanks — how are you?" },
      ],
      aiTone: "balanced",
      helpMode: "ask-first",
      supportStyleId: "gentle-first",
    });
    expect(systemPrompt).not.toContain("TEMPORARY OVERRIDE THIS TURN");
    expect(systemPrompt).toContain("Active Support Style: Gentle First.");
  }, 20000);
});

describe("ADR-012 Phase 4 — useMostOfTheTime is the member's real value", () => {
  it("omits the sentence from the final prompt when the member unchecked it (was [KNOWN BUG] in Phase 3 — server hardcoded true)", async () => {
    const { systemPrompt } = await sendCompanionChat({
      messages: [{ role: "user", content: "hi" }],
      aiTone: "balanced",
      helpMode: "ask-first",
      supportStyleId: "practical-first",
      useMostOfTheTime: false,
    });
    expect(systemPrompt).not.toContain("Use this Support Style most of the time");
  }, 20000);

  it("includes the sentence exactly once when the member kept it checked", async () => {
    const { systemPrompt } = await sendCompanionChat({
      messages: [{ role: "user", content: "hi" }],
      aiTone: "balanced",
      helpMode: "ask-first",
      supportStyleId: "practical-first",
      useMostOfTheTime: true,
    });
    expect(
      occurrencesOf(systemPrompt, "Use this Support Style most of the time"),
    ).toBe(1);
  }, 20000);

  it("defaults to true when the surface omits the field", async () => {
    const { systemPrompt } = await sendCompanionChat({
      messages: [{ role: "user", content: "hi" }],
      aiTone: "balanced",
      helpMode: "ask-first",
      supportStyleId: "practical-first",
    });
    expect(systemPrompt).toContain("Use this Support Style most of the time");
  }, 20000);
});

describe("ADR-012 Phase 4 — customSettings reach the model", () => {
  it("renders the member's custom Support Style details (Phase 3 dropped them entirely)", async () => {
    const { systemPrompt } = await sendCompanionChat({
      messages: [{ role: "user", content: "hi" }],
      aiTone: "balanced",
      helpMode: "ask-first",
      supportStyleId: "custom",
      customSettings: {
        overwhelmedStart: "one-next-step",
        choiceCount: "two",
        encouragementLevel: "minimal",
      },
    });
    expect(systemPrompt).toContain("SUPPORT STYLE — CUSTOM (member-built)");
    expect(systemPrompt).toContain("Custom Support Style details:");
    expect(systemPrompt).toContain("When overwhelmed, start with: one-next-step");
    expect(systemPrompt).toContain("Choice count preference: two");
    expect(systemPrompt).toContain("Encouragement: minimal");
  }, 20000);
});

describe("ADR-012 Phase 4 — every Support Style survives Hospitality and Spark Alpha", () => {
  // useHospitalityRoomChat.ts and SparkAlphaPage.tsx now send the canonical id
  // (plus the legacy mirror for older readers). In Phase 3 they sent the legacy
  // mirror alone, and step-by-step / give-me-choices / custom silently
  // collapsed to "Adapt to the Situation".
  const ALL_STYLES: SupportStyleId[] = [
    "gentle-first",
    "practical-first",
    "talk-it-through",
    "step-by-step",
    "give-me-choices",
    "adaptive",
    "custom",
  ];

  it.each(ALL_STYLES)(
    "%s reaches the model intact on the Hospitality / Spark Alpha request shape",
    async (styleId) => {
      const { systemPrompt } = await sendCompanionChat({
        messages: [{ role: "user", content: "hi" }],
        aiTone: "balanced",
        helpMode: "ask-first",
        supportStyleId: styleId,
        supportStyle: legacySupportStyleFromId(styleId), // legacy mirror still rides along
      });
      const expectedLabel = catalogEntryForStyle(styleId).label;
      expect(systemPrompt).toContain(`Active Support Style: ${expectedLabel}.`);
    },
    20000,
  );

  it.each(["step-by-step", "give-me-choices", "custom"] as SupportStyleId[])(
    "%s no longer collapses to Adapt to the Situation (was [KNOWN BUG] in Phase 3)",
    async (styleId) => {
      const { systemPrompt } = await sendCompanionChat({
        messages: [{ role: "user", content: "hi" }],
        aiTone: "balanced",
        helpMode: "ask-first",
        supportStyleId: styleId,
        supportStyle: legacySupportStyleFromId(styleId), // "balanced" for all three
      });
      expect(systemPrompt).not.toContain(
        "Active Support Style: Adapt to the Situation.",
      );
      expect(systemPrompt).toContain(
        `Active Support Style: ${catalogEntryForStyle(styleId).label}.`,
      );
    },
    20000,
  );
});

describe("ADR-012 Phase 4 — one owner, one copy, no contradictions", () => {
  it("ships the Support Style block exactly once (was twice, verbatim — ADR-012 finding #3)", async () => {
    const { systemPrompt } = await sendCompanionChat({
      messages: [{ role: "user", content: "hi" }],
      aiTone: "balanced",
      helpMode: "ask-first",
      supportStyleId: "talk-it-through",
      supportStyle: "listen",
    });
    expect(occurrencesOf(systemPrompt, "Active Support Style: Talk It Through.")).toBe(
      1,
    );
    expect(
      occurrencesOf(systemPrompt, "SUPPORT STYLE (separate from Conversation Style"),
    ).toBe(1);
  }, 20000);

  it("never states two different Active Support Styles in one prompt (was [KNOWN BUG] in Phase 3)", async () => {
    const { systemPrompt } = await sendCompanionChat({
      messages: [{ role: "user", content: "Just tell me what to do" }],
      aiTone: "balanced",
      helpMode: "ask-first",
      supportStyleId: "gentle-first",
      supportStyle: "understand",
    });
    const activeLines = systemPrompt
      .split("\n")
      .filter((line) => line.startsWith("Active Support Style:"));
    expect(activeLines).toHaveLength(1);
    expect(activeLines[0]).toBe("Active Support Style: Practical First.");
  }, 20000);

  it("does not impose the legacy listen-only no-advice constraint on a canonical Talk It Through member", async () => {
    const { systemPrompt } = await sendCompanionChat({
      messages: [{ role: "user", content: "hi" }],
      aiTone: "gentle",
      helpMode: "ask-first",
      supportStyleId: "talk-it-through",
      supportStyle: "listen", // lossy mirror — canonical id is the truth
    });
    expect(systemPrompt).toContain("SUPPORT STYLE — TALK IT THROUGH");
    expect(systemPrompt).not.toContain("SUPPORT — LISTEN ONLY");
  }, 20000);

  it("still honors listen-only for a legacy-only request — the mirror is the only carrier of that intent", async () => {
    const { systemPrompt } = await sendCompanionChat({
      messages: [{ role: "user", content: "hi" }],
      aiTone: "gentle",
      helpMode: "ask-first",
      supportStyle: "listen", // no canonical id: an older client / saved pref
    });
    expect(systemPrompt).toContain("SUPPORT — LISTEN ONLY");
  }, 20000);
});
