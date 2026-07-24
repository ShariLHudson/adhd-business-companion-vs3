/**
 * Companion / global Shari certification spine regressions.
 * Does not copy Talk It Out reflective banks or Create ownership.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { decideConversationTurnAuthority } from "@/lib/shariAnswerFirst/turnAuthority";
import { decideShariResponse } from "@/lib/shariAnswerFirst/decideShariResponse";
import { classifyTurnRecovery } from "@/lib/shariAnswerFirst/turnRecovery";
import { EXPERIENCE_WIRING } from "@/lib/conversationArchitecture/experienceWiring";
import {
  certifyCompanionDelivery,
  inferCompanionDeliveryKind,
  shouldCertifyCompanionDelivery,
} from "./certifyCompanionDelivery";
import { clearGeneralChatCertifiedRuntime } from "./generalChatCertifiedState";

beforeEach(() => {
  clearGeneralChatCertifiedRuntime();
});

describe("Companion certifyCompanionDelivery", () => {
  it("1. normal Companion reply passes CIE and HCV (processConversationTurn full)", () => {
    const userText = "How do I prioritize my client list this week?";
    const draft =
      "Start with the three clients who most need a decision from you this week, " +
      "then park the rest. Who is waiting on you the soonest?";
    const result = certifyCompanionDelivery({
      conversationId: "general-chat:test-1",
      userText,
      draftText: draft,
      messages: [{ role: "user", content: userText }],
      owner: "chat_api",
    });
    expect(result.certified).toBe(true);
    expect(result.finalResponseOwner).toBe("chat_api");
    expect(result.text.trim().length).toBeGreaterThan(20);
    expect(result.cieState).toBeTruthy();
    expect(result.topicAnchor.primaryTopic).toBeTruthy();
    expect(result.text).not.toMatch(/as an ai/i);
    expect((result.text.match(/\?/g) ?? []).length).toBeLessThanOrEqual(1);
  });

  it("2. eligible local early-return reply passes CIE and HCV", () => {
    const userText = "I'm stuck and not sure where to begin.";
    const draft =
      "We can start with one small next step — what feels most in the way right now?";
    const result = certifyCompanionDelivery({
      conversationId: "general-chat:test-2",
      userText,
      draftText: draft,
      messages: [{ role: "user", content: userText }],
      owner: "companion_chat",
    });
    expect(result.certified).toBe(true);
    expect(result.finalResponseOwner).toBe("companion_chat");
    expect(result.cieState.conversationId).toContain("general-chat");
    expect(result.text.trim().length).toBeGreaterThan(10);
  });

  it("3. explicit creation request remains owned by Create — not certified as Companion steal", () => {
    const userText =
      "I'm overwhelmed — can you just write the email for me.";
    const decision = decideShariResponse(userText);
    const auth = decideConversationTurnAuthority({
      userText,
      decision,
      isFollowUp: false,
      thread: null,
      primaryRole: "teacher",
      pendingCreateConsent: false,
      hasCurrentFounderAction: false,
      activeCreateSession: false,
    });
    expect(auth.owner).toBe("create_execution");
    expect(auth.allowEmotionalDestinationOffer).toBe(false);
    expect(
      shouldCertifyCompanionDelivery({
        owner: "frictionless:universal_creation",
        deliveryKind: "create_owned",
      }),
    ).toBe(false);
    expect(
      inferCompanionDeliveryKind({
        owner: "frictionless:universal_creation",
        createOwned: true,
      }),
    ).toBe("create_owned");
  });

  it("4. Evidence Vault suggestion remains advisory (not final owner)", () => {
    const userText = "I feel discouraged about my progress lately.";
    const draft =
      "Would it help to look at a few pieces of evidence that show what you have already done?";
    const result = certifyCompanionDelivery({
      conversationId: "general-chat:test-4",
      userText,
      draftText: draft,
      messages: [{ role: "user", content: userText }],
      owner: "companion_chat",
      advisoryContributions: ["encouragement_vault"],
    });
    expect(result.finalResponseOwner).toBe("companion_chat");
    expect(result.advisoryContributions).toEqual(["encouragement_vault"]);
    expect(result.finalResponseOwner).not.toMatch(/^advisory:/);
  });

  it("5. correction triggers Repair rather than a fresh discovery cycle", () => {
    const userText = "Actually I meant a short email to my team, not a workshop plan.";
    expect(classifyTurnRecovery(userText)).toBe("correction");
    const draft =
      "Got it — a short email to your team. Here's a clear draft you can send today.";
    const result = certifyCompanionDelivery({
      conversationId: "general-chat:test-5",
      userText,
      draftText: draft,
      messages: [
        {
          role: "assistant",
          content: "What kind of workshop are you creating?",
        },
        { role: "user", content: userText },
      ],
      owner: "companion_chat",
      repairActive: true,
    });
    expect(result.text.toLowerCase()).toMatch(/email|team|draft|got it|short/);
    expect(result.text).not.toMatch(/what kind of workshop/i);
  });

  it("6. repeated request does not invent a fresh discovery question over known facts", () => {
    const userText = "write the email to my team again";
    expect(classifyTurnRecovery(userText)).toBe("repetition");
    const draft =
      "Here's the email to your team again — Subject: Need until tomorrow.\n\n" +
      "Hi team — I'm overwhelmed today and need until tomorrow to answer your questions. Thank you.";
    const result = certifyCompanionDelivery({
      conversationId: "general-chat:test-6",
      userText,
      draftText: draft,
      messages: [
        {
          role: "assistant",
          content:
            "Subject: Need until tomorrow\n\nHi team — I need until tomorrow.",
        },
        { role: "user", content: userText },
      ],
      owner: "companion_chat",
      repairActive: true,
    });
    // Spine preserves owner substance; must not replace with empty discovery shell.
    expect(result.text.toLowerCase()).toMatch(/team|email|tomorrow/);
    expect(result.text).not.toMatch(/who is this for\?/i);
    expect(result.text).not.toMatch(/what is the purpose\?/i);
  });

  it("7. navigation response preserves intended action (skip certification)", () => {
    expect(
      shouldCertifyCompanionDelivery({
        owner: "frictionless:estate_concierge",
        deliveryKind: "navigation",
      }),
    ).toBe(false);
    expect(
      inferCompanionDeliveryKind({
        owner: "my_day_opener",
        hasImmediateNavigation: true,
      }),
    ).toBe("navigation");
  });

  it("8. exactly one final owner is logged", () => {
    const userText = "What's a calm way to start my morning?";
    const result = certifyCompanionDelivery({
      conversationId: "general-chat:test-8",
      userText,
      draftText: "Begin with one quiet priority before anything else opens.",
      messages: [{ role: "user", content: userText }],
      owner: "chat_api",
      advisoryContributions: ["confidence_recovery"],
    });
    expect(result.finalResponseOwner).toBe("chat_api");
    expect(result.advisoryContributions).toHaveLength(1);
    expect(typeof result.finalResponseOwner).toBe("string");
    expect(result.finalResponseOwner.includes(",")).toBe(false);
  });

  it("9. exactly one assistant response text is returned", () => {
    const userText = "Help me think through pricing.";
    const result = certifyCompanionDelivery({
      conversationId: "general-chat:test-9",
      userText,
      draftText:
        "Price from the outcome your best-fit client wants, not from every feature. " +
        "What result do they hire you for?",
      messages: [{ role: "user", content: userText }],
      owner: "chat_api",
    });
    expect(typeof result.text).toBe("string");
    expect(result.text.split("---").length).toBe(1);
    expect(result.text.trim().length).toBeGreaterThan(0);
  });

  it("10. Talk It Out wiring remains unchanged (separate entry module)", () => {
    const tio = EXPERIENCE_WIRING.find((e) => e.experienceId === "talk-it-out");
    expect(tio?.status).toBe("wired_cie_hcv");
    expect(tio?.entryModule).toContain("talkItOut/reflectiveEngine");
    expect(tio?.entryModule).not.toContain("certifyCompanionDelivery");
  });

  it("wires general-chat as CIE/HCV certified via companion adapter", () => {
    const shari = EXPERIENCE_WIRING.find((e) => e.experienceId === "general-chat");
    expect(shari?.status).toBe("wired_cie_hcv");
    expect(shari?.entryModule).toContain("certifyCompanionDelivery");
  });
});

describe("C1 integration — ownership + certification boundary", () => {
  it("C1 opening keeps Create ownership; Companion certifier does not claim the turn", () => {
    const C1_OPEN =
      "I'm so overwhelmed, I don't even know what to tell my team — can you just write the email for me.";
    const decision = decideShariResponse(C1_OPEN);
    const auth = decideConversationTurnAuthority({
      userText: C1_OPEN,
      decision,
      isFollowUp: false,
      thread: null,
      primaryRole: "teacher",
      pendingCreateConsent: false,
      hasCurrentFounderAction: false,
      activeCreateSession: false,
    });
    expect(auth.owner).toBe("create_execution");
    expect(auth.allowCreatePresentation).toBe(true);
    expect(auth.allowEmotionalDestinationOffer).toBe(false);
    expect(
      shouldCertifyCompanionDelivery({
        owner: `frictionless:universal_creation`,
        deliveryKind: inferCompanionDeliveryKind({
          owner: "frictionless:universal_creation",
          createOwned: true,
        }),
      }),
    ).toBe(false);
  });
});

describe("shouldCertifyCompanionDelivery gates", () => {
  it("skips system and create-owned owners", () => {
    expect(
      shouldCertifyCompanionDelivery({
        owner: "chat_api",
        bypassVoiceLayer: true,
      }),
    ).toBe(false);
    expect(
      shouldCertifyCompanionDelivery({
        owner: "intent_workflow:strategy",
      }),
    ).toBe(false);
    expect(
      shouldCertifyCompanionDelivery({
        owner: "continuity:universal_creation",
      }),
    ).toBe(false);
  });
});
