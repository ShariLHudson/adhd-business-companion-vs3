/**
 * Phase 3.1B — B4: soften the mandatory action-close (F2).
 * Prompt-contract assertions: the assistant may end after fully answering, and
 * no longer must manufacture an action/question/offer to close every turn —
 * while genuinely helpful offers, clarification, empathy, and structured
 * Create/confirmation flows remain intact.
 */

import { describe, expect, it } from "vitest";
import { COMPANION_SYSTEM_PROMPT } from "./companionPrompt";
import { actionBiasHintForChat, analyzeActionBias } from "./companionActionBias";

describe("B4 — no mandatory action-close (F2)", () => {
  it("1/2 — a complete answer may simply end; the old mandatory close is gone", () => {
    // Old mandatory phrasings are removed.
    expect(COMPANION_SYSTEM_PROMPT).not.toContain(
      "End turns with: decision, next step, action, feature transition, or continue plan — NOT more confusion.",
    );
    expect(COMPANION_SYSTEM_PROMPT).not.toContain(
      "Always end with ONE action or a handoff",
    );
    // New wording explicitly permits ending after a full answer.
    expect(COMPANION_SYSTEM_PROMPT.toLowerCase()).toContain("you may simply end");
  });

  it("2 — the RESPONSE RULE no longer requires every response to end with an offer/next step", () => {
    expect(COMPANION_SYSTEM_PROMPT).not.toContain(
      "ask exactly ONE question OR offer ONE action.",
    );
    expect(COMPANION_SYSTEM_PROMPT).toMatch(
      /otherwise simply finish; never manufacture one to fill the slot/i,
    );
  });

  it("3 — a genuinely helpful next step / offer is still allowed", () => {
    expect(COMPANION_SYSTEM_PROMPT).toMatch(
      /when a next step genuinely helps, offer it/i,
    );
    // The strategy-layer offer remains available, now conditional.
    expect(COMPANION_SYSTEM_PROMPT).toContain("Want to start this now?");
  });

  it("4/6 — structured Create / confirmation flow guidance is preserved", () => {
    expect(COMPANION_SYSTEM_PROMPT).toContain("CHAT ROUTES, MAKE EXECUTES");
    expect(COMPANION_SYSTEM_PROMPT).toContain("let them accept the Create offer");
  });

  it("5 — clarification guidance is preserved", () => {
    expect(COMPANION_SYSTEM_PROMPT).toContain("clarification questions typical");
  });

  it("empathy close (INSIGHT layer) is untouched", () => {
    expect(COMPANION_SYSTEM_PROMPT).toContain("Close with ONE gentle question");
  });

  it("duplicate in the injected action-bias hint is softened, not left mandatory", () => {
    const analysis = analyzeActionBias({
      messages: [{ role: "user", content: "What is a sales funnel?" }],
      userText: "What is a sales funnel?",
      emotionalState: "unclear",
    });
    const hint = actionBiasHintForChat(analysis);
    // Old mandatory duplicate of the system-prompt rule is gone.
    expect(hint).not.toContain("Every meaningful turn should end with:");
    // Softened, permissive wording present.
    expect(hint.toLowerCase()).toContain("a complete answer may also simply end");
    // Progress-bias framing still remains (not a blanket ban on offers).
    expect(hint).toContain("OUTCOME OVER INSIGHT");
  });
});
