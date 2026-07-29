/**
 * Repair 5 — eligible Create requests for a currently-blocked artifact type all
 * resolve to one truthful outcome: blocked_unavailable → a single placeholder.
 * No model fall-through, no generic ack, no Business Profile gate, no silent turn.
 * Exploratory creation stays conversational; a genuinely-available artifact opens.
 */
import { describe, expect, it } from "vitest";

import { resolveCreationTurnEnvelope } from "./creationTurnEnvelope";
import {
  CREATE_ROOM_PREPARED_STATE_MESSAGE,
  resolveLegacyCreateWorkspaceGuard,
} from "@/lib/createExperience/blockLegacyCreateWorkspaceRouting";

type Outcome =
  | "workspace_opened"
  | "blocked_unavailable"
  | "exploratory_conversation"
  | "conversation";

/**
 * Models the handleSend blocked-eligible-Create normalization branch: envelope →
 * execution guard → single outcome + user-visible messages.
 */
function createTurnOutcome(
  userText: string,
  opts: { alreadyOpen?: boolean; ucSessionActive?: boolean } = {},
): { outcome: Outcome; messages: string[] } {
  const e = resolveCreationTurnEnvelope(userText, "t");
  if (e.exploratoryCreation) {
    return { outcome: "exploratory_conversation", messages: [] };
  }
  if (e.createEligible) {
    const guard = resolveLegacyCreateWorkspaceGuard({
      section: "content-generator",
      userText,
      itemType: e.intendedArtifact,
      alreadyOpen: opts.alreadyOpen,
    });
    if (guard.kind === "prepared_state" && !opts.ucSessionActive) {
      return {
        outcome: "blocked_unavailable",
        messages: [CREATE_ROOM_PREPARED_STATE_MESSAGE],
      };
    }
    return { outcome: "workspace_opened", messages: ["<workspace opened>"] };
  }
  return { outcome: "conversation", messages: [] };
}

const BLOCKED_ELIGIBLE = [
  "create a marketing plan",
  "i want to create a marketing plan",
  "go to create i want to create a marketing plan",
  "i want to create a social media post",
];

describe("blocked eligible-Create turns normalize to one placeholder", () => {
  it.each(BLOCKED_ELIGIBLE)("%s → blocked_unavailable + one placeholder", (p) => {
    const r = createTurnOutcome(p);
    expect(r.outcome).toBe("blocked_unavailable");
    expect(r.messages).toEqual([CREATE_ROOM_PREPARED_STATE_MESSAGE]);
  });

  it("3. the two 'marketing plan' wordings produce the SAME outcome", () => {
    expect(createTurnOutcome("create a marketing plan").outcome).toBe(
      createTurnOutcome("i want to create a marketing plan").outcome,
    );
  });

  it("5-6. social-media-post cannot end silently — it renders one placeholder", () => {
    const r = createTurnOutcome("i want to create a social media post");
    expect(r.messages).toHaveLength(1);
    expect(r.messages[0]).toBe(CREATE_ROOM_PREPARED_STATE_MESSAGE);
  });

  it("7-9. blocked turns are not conversation, not a generic ack, and produce one message", () => {
    for (const p of BLOCKED_ELIGIBLE) {
      const r = createTurnOutcome(p);
      expect(r.outcome).not.toBe("conversation");
      expect(r.messages.join(" ")).not.toMatch(/I can help you build that in Create/i);
      expect(r.messages).toHaveLength(1);
    }
  });

  it("11. intended artifact is preserved on the envelope for the marketing-plan turn", () => {
    expect(resolveCreationTurnEnvelope("create a marketing plan", "t").intendedArtifact).toBe(
      "Marketing Plan",
    );
  });

  it("12. exploratory 'what kind of things can i create' stays conversational — no placeholder", () => {
    const r = createTurnOutcome("what kind of things can i create");
    expect(r.outcome).toBe("exploratory_conversation");
    expect(r.messages).toEqual([]);
  });

  it("13. a genuinely-available artifact (guard allow) opens — no placeholder", () => {
    // content-generator already open → guard "allow" → workspace_opened.
    const r = createTurnOutcome("create a marketing plan", { alreadyOpen: true });
    expect(r.outcome).toBe("workspace_opened");
    expect(r.messages).not.toContain(CREATE_ROOM_PREPARED_STATE_MESSAGE);
  });

  it("an in-progress guided creation session is not interrupted", () => {
    const r = createTurnOutcome("create a marketing plan", { ucSessionActive: true });
    expect(r.outcome).not.toBe("blocked_unavailable");
  });
});
