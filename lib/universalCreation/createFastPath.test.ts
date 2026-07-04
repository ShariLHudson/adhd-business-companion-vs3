/**
 * CREATE fast path — detection and Universal Creation routing.
 */

import { describe, expect, it } from "vitest";
import { classifyPrimaryConversationTurn } from "@/lib/conversation/primaryTurnClassifier";
import { resolveFrictionlessAction } from "@/lib/frictionlessActionLayer";
import { evaluateSparkDecisionEngine } from "@/lib/sparkCompanion";
import { SHARI_ERROR_RECOVERY_LINE } from "@/lib/conversation/shariCompanionEngine";
import {
  detectUniversalDocumentType,
  shouldEnterUniversalCreation,
  resolveUniversalCreationTurn,
  formatUniversalCreationQuestion,
} from "@/lib/universalCreation";
import {
  isSimpleCreateRequest,
  logCreateFastPath,
} from "@/lib/universalCreation/createFastPath";

const CREATE_PHRASES = [
  "Help me write a workshop",
  "Create a marketing plan",
  "Write an SOP",
  "Create a newsletter",
  "Build a webinar",
  "Create a proposal",
  "Write an email",
  "Create a social media campaign",
  "Help me write a new workshop.",
] as const;

describe("CREATE fast path", () => {
  it.each(CREATE_PHRASES)("%s — detects simple create", (text) => {
    expect(isSimpleCreateRequest(text)).toBe(true);
    expect(detectUniversalDocumentType(text)).toBeTruthy();
    expect(shouldEnterUniversalCreation(text)).toBe(true);
  });

  it.each(CREATE_PHRASES)("%s — classifies CREATE and universal_creation owner", (text) => {
    const primary = classifyPrimaryConversationTurn({ userText: text });
    expect(primary.type).toBe("TASK_REQUEST");
    expect(primary.owner).toBe("frictionless:universal_creation");

    const decision = evaluateSparkDecisionEngine({ userText: text });
    expect(decision.intent).toBe("CREATE");
  });

  it.each(CREATE_PHRASES)("%s — frictionless local reply, no tangled copy", (text) => {
    const primary = classifyPrimaryConversationTurn({ userText: text });
    const frictionless = resolveFrictionlessAction({
      userText: text,
      primaryTurn: primary,
      currentTurn: 1,
    });
    expect(frictionless.category).toBe("universal_creation");
    expect(frictionless.localReply).toBeTruthy();
    expect(frictionless.localReply).not.toContain(SHARI_ERROR_RECOVERY_LINE);
    expect(frictionless.immediateEstatePlaceNavigate).toBeUndefined();
  });

  it("workshop — discovery intro and first question", () => {
    const text = "Help me write a new workshop.";
    const turn = resolveUniversalCreationTurn(text, 1);
    expect(turn?.kind).toBe("question");
    if (turn?.kind !== "question") return;
    expect(turn.intro).toMatch(/love to help/i);
    expect(turn.intro).toMatch(/build it together/i);
    const formatted = formatUniversalCreationQuestion(turn);
    expect(formatted).toMatch(/Who is the workshop for/i);
    expect(formatted).not.toContain(SHARI_ERROR_RECOVERY_LINE);
  });

  it("logCreateFastPath emits CREATE_FAST_PATH tag", () => {
    const logs: unknown[] = [];
    const original = console.info;
    console.info = (...args: unknown[]) => {
      logs.push(...args);
    };
    try {
      logCreateFastPath({
        turn: 1,
        userText: "Create a newsletter",
        documentType: "newsletter",
      });
    } finally {
      console.info = original;
    }
    expect(JSON.stringify(logs)).toContain("CREATE_FAST_PATH");
  });
});
