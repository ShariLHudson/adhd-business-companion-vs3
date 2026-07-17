import { describe, expect, it } from "vitest";
import { buildCompanionSystemPrompt } from "@/lib/companionPrompt";
import { GLOBAL_CONVERSATION_CONTINUITY_OVERRIDE_BLOCK } from "./globalConversationContinuityOverride";

describe("GLOBAL CONVERSATION CONTINUITY OVERRIDE", () => {
  it("exports the master enforcement instruction", () => {
    expect(GLOBAL_CONVERSATION_CONTINUITY_OVERRIDE_BLOCK).toContain(
      "GLOBAL CONVERSATION CONTINUITY OVERRIDE",
    );
    expect(GLOBAL_CONVERSATION_CONTINUITY_OVERRIDE_BLOCK).toContain(
      "Conversation state outranks keyword routing",
    );
    expect(GLOBAL_CONVERSATION_CONTINUITY_OVERRIDE_BLOCK).toMatch(
      /I already told you/i,
    );
  });

  it("is injected first in the companion system prompt", () => {
    const prompt = buildCompanionSystemPrompt("today", "text");
    const overrideAt = prompt.indexOf("GLOBAL CONVERSATION CONTINUITY OVERRIDE");
    const constitutionAt = prompt.indexOf("CONSTITUTION — CONVERSATION FIRST");
    expect(overrideAt).toBeGreaterThanOrEqual(0);
    expect(constitutionAt).toBeGreaterThan(overrideAt);
    expect(prompt).toContain("Completion-first");
    expect(prompt).toContain("Specific request beats generic language");
  });
});
