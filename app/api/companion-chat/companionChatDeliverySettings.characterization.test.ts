/**
 * ADR-012 Phase 3 — end-to-end characterization tests for Shari delivery-
 * setting prompt assembly. No production code is changed by this phase.
 *
 * These tests exercise the REAL production path: a request shaped exactly
 * like a real client surface sends it → the real `POST` handler in
 * `app/api/companion-chat/route.ts` → the real `buildCompanionSystemPrompt`
 * → the real `buildMemberTonePreferenceBlocks` / `buildSupportStylePromptBlock`
 * → the exact system-prompt string that would be sent to the model (captured
 * by mocking `fetch` to the OpenAI endpoint, never actually calling it).
 *
 * Purpose: lock in CURRENT behavior — including the known bugs documented in
 * docs/adr/ADR-012-unify-shari-guidance-settings.md — as an explicit, named
 * contract. Some tests below assert today's buggy behavior on purpose
 * (labeled "[KNOWN BUG]"); they exist so that Phase 4 (single-owner server
 * assembly) has a concrete before/after diff instead of a silent behavior
 * change. Flipping a "[KNOWN BUG]" assertion is expected and correct once
 * Phase 4 lands — flipping any other assertion in this file is a regression.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildSupportStylePromptBlock,
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

beforeEach(() => {
  capturedOpenAiBody = null;
});

describe("ADR-012 Phase 3 — round trip: client request → /api/companion-chat → final assembled prompt", () => {
  it("assembles guardrail + Conversation Style + Help Mode + Support Style for a main-chat-shaped request", async () => {
    const { status, systemPrompt } = await sendCompanionChat({
      messages: [{ role: "user", content: "hello" }],
      aiTone: "direct",
      helpMode: "concise",
      supportStyle: "gentle-first", // canonical id, as getActiveSupportStyleId() sends — CompanionPageClient.tsx:21044
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
      supportStyle: "adaptive",
    });
    const guardrailIdx = systemPrompt.indexOf("THE IMMUTABLE FRIEND (constitutional");
    const supportIdx = systemPrompt.indexOf(
      "SUPPORT STYLE (separate from Conversation Style",
    );
    expect(guardrailIdx).toBeGreaterThan(-1);
    expect(supportIdx).toBeGreaterThan(-1);
    expect(guardrailIdx).toBeLessThan(supportIdx);
  }, 20000);
});

describe("ADR-012 Phase 3 — Support Style temporary override appears exactly once", () => {
  it("a message matching a temporary-override trigger produces exactly one TEMPORARY OVERRIDE line in the final prompt", async () => {
    const userText = "Just tell me what to do";
    // Mirrors what the real client sends: supportStyleHintForChat(trimmed) →
    // buildSupportStylePromptBlock(undefined, trimmed) — CompanionPageClient.tsx:21058.
    // We pass an explicit preference instead of relying on localStorage, since
    // this test runs server-side where getSupportStylePreference() cannot see it.
    const intentHint = buildSupportStylePromptBlock(
      {
        styleId: "gentle-first",
        useMostOfTheTime: true,
        savedAt: new Date(0).toISOString(),
        version: 1,
      },
      userText,
    );
    expect(intentHint).toContain("TEMPORARY OVERRIDE THIS TURN");

    const { systemPrompt } = await sendCompanionChat({
      messages: [{ role: "user", content: userText }],
      aiTone: "balanced",
      helpMode: "ask-first",
      supportStyle: "gentle-first",
      intentHint,
    });

    const occurrences = (
      systemPrompt.match(/TEMPORARY OVERRIDE THIS TURN/g) ?? []
    ).length;
    expect(occurrences).toBe(1);
    expect(systemPrompt).toContain("Effective style: practical-first");
    expect(systemPrompt).toContain("Saved preference remains gentle-first");
  }, 20000);
});

describe("ADR-012 Phase 3 — useMostOfTheTime=false removes its sentence", () => {
  it("buildSupportStylePromptBlock (the shared builder both sides call) correctly omits the sentence when useMostOfTheTime=false", () => {
    const block = buildSupportStylePromptBlock({
      styleId: "practical-first",
      useMostOfTheTime: false,
      savedAt: new Date(0).toISOString(),
      version: 1,
    });
    expect(block).not.toContain("Use this Support Style most of the time");
  });

  it("...and includes it when useMostOfTheTime=true, with no override", () => {
    const block = buildSupportStylePromptBlock({
      styleId: "practical-first",
      useMostOfTheTime: true,
      savedAt: new Date(0).toISOString(),
      version: 1,
    });
    expect(block).toContain("Use this Support Style most of the time");
  });

  it("[KNOWN BUG — ADR-012 audit finding, Phase 4 target] the final prompt still asserts the sentence even when the client's real intentHint correctly omitted it, because lib/companionTonePreferences.ts hardcodes useMostOfTheTime: true in its own server-side rebuild and never sees the client's value", async () => {
    const intentHint = buildSupportStylePromptBlock({
      styleId: "practical-first",
      useMostOfTheTime: false,
      savedAt: new Date(0).toISOString(),
      version: 1,
    });
    // Sanity check: the client's own copy is correct in isolation.
    expect(intentHint).not.toContain("Use this Support Style most of the time");

    const { systemPrompt } = await sendCompanionChat({
      messages: [{ role: "user", content: "hi" }],
      aiTone: "balanced",
      helpMode: "ask-first",
      supportStyle: "practical-first",
      intentHint,
    });

    // Today's reality: the server's independent rebuild ignores the member's
    // opt-out and asserts it anyway. This assertion is EXPECTED TO FLIP to
    // `.not.toContain(...)` once Phase 4 makes the server the single owner
    // and threads useMostOfTheTime through instead of hardcoding it.
    expect(systemPrompt).toContain("Use this Support Style most of the time");
    const occurrences = (
      systemPrompt.match(/Use this Support Style most of the time/g) ?? []
    ).length;
    expect(occurrences).toBe(1); // only the server's copy carries it — not duplicated
  }, 20000);
});

describe("ADR-012 Phase 3 — canonical Support Style survives Hospitality and Spark Alpha request paths", () => {
  // useHospitalityRoomChat.ts:150 and SparkAlphaPage.tsx:353 both send
  // `supportStyle: prefs.supportStyle` — the LEGACY mirror, not the
  // canonical id main chat sends — and neither surface builds an intentHint.
  const SURVIVES: SupportStyleId[] = [
    "gentle-first",
    "practical-first",
    "talk-it-through",
    "adaptive",
  ];
  const LOST_TO_LEGACY_COLLAPSE: SupportStyleId[] = [
    "step-by-step",
    "give-me-choices",
    "custom",
  ];

  it.each(SURVIVES)(
    "%s round-trips cleanly through the legacy mirror onto Hospitality/Spark Alpha's request shape",
    async (styleId) => {
      const legacyValue = legacySupportStyleFromId(styleId);
      const { systemPrompt } = await sendCompanionChat({
        messages: [{ role: "user", content: "hi" }],
        aiTone: "balanced",
        helpMode: "ask-first",
        supportStyle: legacyValue, // exactly what the two surfaces send — no intentHint
      });
      const expectedLabel = catalogEntryForStyle(styleId).label;
      expect(systemPrompt).toContain(`Active Support Style: ${expectedLabel}.`);
    },
    20000,
  );

  it.each(LOST_TO_LEGACY_COLLAPSE)(
    "[KNOWN BUG — ADR-012 audit finding #1, 'fix the wire' target] %s silently collapses to Adapt to the Situation on Hospitality/Spark Alpha's request shape",
    async (styleId) => {
      const legacyValue = legacySupportStyleFromId(styleId);
      const { systemPrompt } = await sendCompanionChat({
        messages: [{ role: "user", content: "hi" }],
        aiTone: "balanced",
        helpMode: "ask-first",
        supportStyle: legacyValue,
      });
      // Documents today's data loss. Expected to flip once the wire is fixed
      // to send the canonical id on every surface (ADR-012's "fix the wire"
      // phase) — at which point this test should assert the member's real
      // choice survives, matching the SURVIVES group above.
      expect(systemPrompt).toContain("Active Support Style: Adapt to the Situation.");
      expect(systemPrompt).not.toContain(
        `Active Support Style: ${catalogEntryForStyle(styleId).label}.`,
      );
    },
    20000,
  );
});

describe("ADR-012 Phase 3 — client and server do not silently disagree", () => {
  it("agree on the base style when there is no override — but the block still ships twice (ADR-012 finding #3: 'reaches the model twice, verbatim')", async () => {
    const intentHint = buildSupportStylePromptBlock({
      styleId: "talk-it-through",
      useMostOfTheTime: true,
      savedAt: new Date(0).toISOString(),
      version: 1,
    });
    const { systemPrompt } = await sendCompanionChat({
      messages: [{ role: "user", content: "hi" }],
      aiTone: "balanced",
      helpMode: "ask-first",
      supportStyle: "talk-it-through",
      intentHint,
    });
    const occurrences = (
      systemPrompt.match(/Active Support Style: Talk It Through\./g) ?? []
    ).length;
    // [KNOWN BUG] Expected to become 1 once Phase 4 makes the server the sole
    // assembler and removes the client's duplicate copy.
    expect(occurrences).toBe(2);
  }, 20000);

  it("disagree on the effective style during a temporary override — client shows the override, server's rebuild does not (see the exactly-once test above for the full override text; this test isolates the styleId mismatch)", async () => {
    const userText = "Just tell me what to do"; // → practical-first override, saved style stays gentle-first
    const intentHint = buildSupportStylePromptBlock(
      {
        styleId: "gentle-first",
        useMostOfTheTime: true,
        savedAt: new Date(0).toISOString(),
        version: 1,
      },
      userText,
    );
    const { systemPrompt } = await sendCompanionChat({
      messages: [{ role: "user", content: userText }],
      aiTone: "balanced",
      helpMode: "ask-first",
      supportStyle: "gentle-first",
      intentHint,
    });
    // Client's copy (carries the override) shows the overridden style.
    expect(systemPrompt).toContain("Active Support Style: Practical First.");
    // [KNOWN BUG] Server's independent rebuild has no override input, so it
    // still shows the saved style — the two copies genuinely disagree on
    // "Active Support Style" within the same prompt. Expected to disappear
    // once Phase 4 threads the override through a single assembler.
    expect(systemPrompt).toContain("Active Support Style: Gentle First.");
  }, 20000);
});
