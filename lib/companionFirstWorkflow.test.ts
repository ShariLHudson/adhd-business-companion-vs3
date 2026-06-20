import { describe, expect, it } from "vitest";

import {
  buildCompanionFirstOfferReply,
  companionFirstWorkflowHintForChat,
  detectCompanionFirstTarget,
  isCompanionFirstQuestion,
  toWorkspaceOffer,
  usesSplitWalkthrough,
} from "./companionFirstWorkflow";

describe("companionFirstWorkflow", () => {
  it("routes snippet how-to to Snippets builder", () => {
    const target = detectCompanionFirstTarget("How do I create a snippet?");
    expect(target?.section).toBe("snippets");
    expect(target?.offerLine).toMatch(/Snippets/i);
    const reply = buildCompanionFirstOfferReply(target!);
    expect(reply).toMatch(/snippet/i);
    expect(reply).toMatch(/open/i);
  });

  it("routes Spin The Wheel how-to to spin-wheel beside chat", () => {
    const target = detectCompanionFirstTarget("How do I use Spin The Wheel?");
    expect(target?.section).toBe("spin-wheel");
    expect(usesSplitWalkthrough(target!)).toBe(true);
  });

  it("routes strategy how-to to Strategies", () => {
    const target = detectCompanionFirstTarget("How do I create a strategy?");
    expect(target?.section).toBe("playbook");
  });

  it("routes client avatar how-to to Client Avatar", () => {
    const target = detectCompanionFirstTarget("How do I build a client avatar?");
    expect(target?.section).toBe("client-avatars");
  });

  it("routes SOP how-to to Create with SOP type", () => {
    const target = detectCompanionFirstTarget("How do I create an SOP?");
    expect(target?.section).toBe("content-generator");
    expect(target?.itemType).toBe("SOP");
  });

  it("routes project how-to to Projects", () => {
    const target = detectCompanionFirstTarget("How do I create a project?");
    expect(target?.section).toBe("projects");
  });

  it("workflow hint forbids documentation-only answers", () => {
    const hint = companionFirstWorkflowHintForChat(
      "How do I create a snippet?",
      null,
    );
    expect(hint).toMatch(/COMPANION FIRST/i);
    expect(hint).toMatch(/conversation-only/i);
    expect(hint).toMatch(/do NOT offer to open it from chat/i);
  });

  it("does not re-offer when workspace already open", () => {
    const hint = companionFirstWorkflowHintForChat(
      "How do I use Strategies?",
      "playbook",
    );
    expect(hint).toMatch(/already open/i);
  });

  it("produces workspace offer for acceptance flow", () => {
    const target = detectCompanionFirstTarget("How do I create a project?")!;
    const offer = toWorkspaceOffer(target);
    expect(offer.section).toBe("projects");
    expect(offer.buttonLabel).toMatch(/Projects/i);
  });

  it("isCompanionFirstQuestion covers explicit create routes", () => {
    expect(isCompanionFirstQuestion("How do I create a snippet?")).toBe(true);
    expect(isCompanionFirstQuestion("I'm feeling overwhelmed")).toBe(false);
  });
});
