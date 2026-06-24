import { describe, expect, it } from "vitest";
import {
  buildRelationshipResponseTraceSummary,
  createRelationshipResponseId,
  firstParagraphForTrace,
} from "./relationshipResponseTrace";
import { enforceRelationshipResponse } from "./relationshipResponseContract";

describe("relationshipResponseTrace", () => {
  it("creates unique response ids", () => {
    const a = createRelationshipResponseId(1);
    const b = createRelationshipResponseId(1);
    expect(a).toMatch(/^rr-1-/);
    expect(a).not.toBe(b);
  });

  it("builds trace summary showing llm vs enforced first paragraph", () => {
    const lead =
      "I've noticed finishing often competes with starting something new.";
    const raw =
      "It sounds like you're reflecting on your tendency.\n\nReflection.\n\nGuidance.";
    const enforced = enforceRelationshipResponse({
      response: raw,
      relationshipLeadParagraph: lead,
      memoryConfidence: "forming",
    });

    const summary = buildRelationshipResponseTraceSummary({
      responseId: "rr-test",
      memoryConfidence: "forming",
      relationshipLeadParagraphLength: lead.length,
      llmRawMessage: raw,
      enforcedMessage: enforced.message,
      enforcementRewritten: enforced.rewritten,
      enforcementRan: enforced.enforcementRan,
      violationReason: enforced.violation?.reason,
    });

    expect(summary.llmRawFirstParagraph).toMatch(/It sounds like/i);
    expect(summary.postEnforcementFirstParagraph).toMatch(/I've noticed finishing/i);
    expect(summary.relationshipResponseRewritten).toBe(true);
    expect(enforced.message).toBe(
      `${lead}\n\nReflection.\n\nGuidance.`,
    );
  });

  it("firstParagraphForTrace extracts opening sentence", () => {
    expect(
      firstParagraphForTrace(
        "It sounds like you're reflecting.\n\nSecond paragraph.",
      ),
    ).toBe("It sounds like you're reflecting.");
  });
});
