/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import { openGuidedFieldHelpChat } from "@/lib/profile/openGuidedFieldHelpChat";
import type { GuidedFieldHelpRequest } from "@/lib/profile/guidedFieldTypes";
import { businessEstateFieldSupportsResearch } from "@/lib/profile/businessEstateSectionResearchSupport";

function sampleRequest(
  mode: GuidedFieldHelpRequest["helpMode"],
): GuidedFieldHelpRequest {
  return {
    sectionId: "offers",
    fieldKey: "problemsSolved",
    fieldPath: "offers.problemsSolved",
    helpMode: mode,
    currentValue: "Scattered follow-up",
    approvedBusinessContext: {},
    relatedFieldValues: {},
    question: "Problems and Outcomes — What problems do you solve?",
  };
}

describe("openGuidedFieldHelpChat", () => {
  it("opens exactly one chat and sends help opener with context framing", () => {
    const openChat = vi.fn();
    const appendAssistantWelcome = vi.fn();
    const sendMemberOpener = vi.fn();
    const ensureEstateChatVisible = vi.fn();
    const focusInput = vi.fn();

    const beginFreshHelpSession = vi.fn();

    const ok = openGuidedFieldHelpChat(sampleRequest("help_me_develop"), {
      beginFreshHelpSession,
      openChat,
      appendAssistantWelcome,
      sendMemberOpener,
      ensureEstateChatVisible,
      focusInput,
    });

    expect(ok).toBe(true);
    expect(beginFreshHelpSession).toHaveBeenCalledTimes(1);
    expect(beginFreshHelpSession.mock.invocationCallOrder[0]).toBeLessThan(
      openChat.mock.invocationCallOrder[0]!,
    );
    expect(openChat).toHaveBeenCalledTimes(1);
    expect(ensureEstateChatVisible).toHaveBeenCalledTimes(1);
    expect(appendAssistantWelcome).toHaveBeenCalledTimes(1);
    expect(appendAssistantWelcome.mock.calls[0]![0]).toMatch(
      /Problems and Outcomes/,
    );
    expect(sendMemberOpener).toHaveBeenCalledTimes(1);
    expect(sendMemberOpener.mock.calls[0]![0]).toMatch(
      /Help me answer this question based on what you already know/i,
    );
    expect(focusInput).toHaveBeenCalledTimes(1);
  });

  it("opens research-framed opener for Research This", () => {
    const sendMemberOpener = vi.fn();
    const appendAssistantWelcome = vi.fn();
    openGuidedFieldHelpChat(sampleRequest("research_with_shari"), {
      beginFreshHelpSession: vi.fn(),
      openChat: vi.fn(),
      appendAssistantWelcome,
      sendMemberOpener,
    });
    expect(sendMemberOpener.mock.calls[0]![0]).toMatch(/Research this for me/i);
    expect(appendAssistantWelcome.mock.calls[0]![0]).toMatch(/research/i);
  });

  it("does not open chat for incomplete requests", () => {
    const openChat = vi.fn();
    expect(
      openGuidedFieldHelpChat(null, {
        beginFreshHelpSession: vi.fn(),
        openChat,
        appendAssistantWelcome: vi.fn(),
        sendMemberOpener: vi.fn(),
      }),
    ).toBe(false);
    expect(openChat).not.toHaveBeenCalled();
  });

  it("does not save or mutate currentValue", () => {
    const req = sampleRequest("help_me_develop");
    const before = req.currentValue;
    openGuidedFieldHelpChat(req, {
      beginFreshHelpSession: vi.fn(),
      openChat: vi.fn(),
      appendAssistantWelcome: vi.fn(),
      sendMemberOpener: vi.fn(),
    });
    expect(req.currentValue).toBe(before);
  });
});

describe("businessEstateFieldSupportsResearch", () => {
  it("hides Research This for personal reflection", () => {
    expect(businessEstateFieldSupportsResearch("identity.coreValues")).toBe(
      false,
    );
    expect(businessEstateFieldSupportsResearch("identity.mission")).toBe(false);
    expect(
      businessEstateFieldSupportsResearch("work-style.decisionStyle"),
    ).toBe(false);
  });

  it("shows Research This for market and offer questions", () => {
    expect(
      businessEstateFieldSupportsResearch("offers.problemsSolved"),
    ).toBe(true);
    expect(
      businessEstateFieldSupportsResearch("offers.outcomesCreated"),
    ).toBe(true);
    expect(businessEstateFieldSupportsResearch("offers.mainOffer")).toBe(true);
  });
});
