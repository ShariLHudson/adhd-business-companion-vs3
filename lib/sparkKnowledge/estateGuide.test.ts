/**
 * Estate guide — capability / ADHD exploration questions.
 */

import { describe, expect, it } from "vitest";
import { classifyPrimaryConversationTurn } from "@/lib/conversation/primaryTurnClassifier";
import { resolveFrictionlessAction } from "@/lib/frictionlessActionLayer";
import { buildFailSafeChatReply } from "@/lib/chatFastPath/chatTurnGuarantee";
import { SHARI_ERROR_RECOVERY_LINE } from "@/lib/conversation/shariCompanionEngine";
import {
  formatEstateGuideReply,
  isEstateGuideQuestion,
  resolveEstateGuideTurn,
} from "./estateGuide";

const ADHD_CAPABILITY =
  "i have adhd and am wondering what this system can help me do";

describe("estate guide — ADHD capability exploration", () => {
  it("detects the member question", () => {
    expect(isEstateGuideQuestion(ADHD_CAPABILITY)).toBe(true);
  });

  it("classifies as information and returns estate guide locally", () => {
    const primary = classifyPrimaryConversationTurn({ userText: ADHD_CAPABILITY });
    expect(primary.type).toBe("INFORMATION_OR_RESEARCH");

    const frictionless = resolveFrictionlessAction({
      userText: ADHD_CAPABILITY,
      primaryTurn: primary,
      currentTurn: 1,
    });
    expect(frictionless.category).toBe("estate_guide");
    expect(frictionless.localReply).toBeTruthy();
    expect(frictionless.localReply).toMatch(/adhd|brains that work differently/i);
    expect(frictionless.localReply).not.toContain(
      "I'm here — tell me what you need",
    );
  });

  it("fail-safe uses ADHD guide copy, not generic bridge fallback", () => {
    const failSafe = buildFailSafeChatReply(ADHD_CAPABILITY);
    expect(failSafe).toMatch(/adhd|brains that work differently/i);
    expect(failSafe).not.toContain("I'm here — tell me what you need");
    expect(failSafe).not.toContain(SHARI_ERROR_RECOVERY_LINE);
  });

  it("resolveEstateGuideTurn topic is adhd", () => {
    const turn = resolveEstateGuideTurn(ADHD_CAPABILITY);
    expect(turn.topic).toBe("adhd");
    const formatted = formatEstateGuideReply(turn);
    expect(formatted).toMatch(/Clear My Mind|overwhelm/i);
  });
});
