import { describe, expect, it } from "vitest";
import {
  SHARI_ANSWER_FIRST_EVAL_CASES,
  appendRestrainedCapabilityOffer,
  buildAnswerFirstFailSafeReply,
  buildShariConversationHandoff,
  countPrimaryCapabilityOffersInText,
  decideShariResponse,
  isExplicitCreationCommand,
  isExplicitNavigationCommand,
  isQuestionAboutCreation,
  shouldBlockImmediateExperienceOpen,
  shouldSuppressRouteBeforeAnswer,
  shariAnswerFirstHintForChat,
  validateShariAnswerSubstance,
} from "./index";
import { isSimpleCreateRequest } from "@/lib/universalCreation/createFastPath";
import {
  buildFailSafeChatReply,
  isInformationalChatTurn,
} from "@/lib/chatFastPath/chatTurnGuarantee";
import { topicPreservingFallbackLine } from "@/lib/conversationStabilization/activeTopicGate";

describe("Shari answer-first general help", () => {
  it("1–3: ordinary and how-to questions require direct answers; how-do-I does not route", () => {
    const booth = decideShariResponse(
      "How do I set up a vendor table or booth at an event?",
    );
    expect(booth.directAnswerRequired).toBe(true);
    expect(booth.routingAllowed).toBe(false);
    expect(booth.primaryHelpMode).toBe("how_to_guidance");
    expect(shouldSuppressRouteBeforeAnswer(booth)).toBe(true);
    expect(shouldBlockImmediateExperienceOpen(booth)).toBe(true);

    const groups = decideShariResponse(
      "How do I find Facebook groups where I can market my business?",
    );
    expect(groups.directAnswerRequired).toBe(true);
    expect(groups.currentResearchRequired).toBe(false);
  });

  it("4–8: question vs action for Create, Projects, Strategy", () => {
    expect(isQuestionAboutCreation("How do I create a strategic plan?")).toBe(
      true,
    );
    expect(isExplicitCreationCommand("How do I create a strategic plan?")).toBe(
      false,
    );
    const educate = decideShariResponse("How do I create a strategic plan?");
    expect(educate.directAnswerRequired).toBe(true);
    expect(educate.routingAllowed).toBe(false);

    const create = decideShariResponse(
      "Create a strategic plan for my business.",
    );
    expect(create.explicitCreationRequested).toBe(true);
    expect(create.directAnswerRequired).toBe(false);
    expect(create.routingAllowed).toBe(true);

    const helpMeDraftEmail =
      "Please help me draft a customer email announcing a price change for my coaching packages.";
    expect(isExplicitCreationCommand(helpMeDraftEmail)).toBe(true);
    expect(isSimpleCreateRequest(helpMeDraftEmail)).toBe(true);
    const emailCreate = decideShariResponse(helpMeDraftEmail);
    expect(emailCreate.explicitCreationRequested).toBe(true);

    const formQ = decideShariResponse(
      "What should a client intake form include?",
    );
    expect(formQ.directAnswerRequired).toBe(true);
    expect(isSimpleCreateRequest("What should a client intake form include?")).toBe(
      false,
    );

    const formC = decideShariResponse(
      "Create a client intake form for my coaching business.",
    );
    expect(formC.explicitCreationRequested).toBe(true);

    const projectQ = decideShariResponse(
      "What should go into a podcast launch project?",
    );
    expect(projectQ.directAnswerRequired).toBe(true);
    const projectC = decideShariResponse(
      "Turn this into a podcast launch project.",
    );
    expect(projectC.explicitProjectRequested).toBe(true);
    expect(projectC.routingAllowed).toBe(true);
  });

  it("9–11: methodology vs current research", () => {
    const method = decideShariResponse(
      "How do I find Facebook groups where I can market my business?",
    );
    expect(method.currentResearchRequired).toBe(false);
    expect(method.directAnswerRequired).toBe(true);

    const current = decideShariResponse(
      "Find active Facebook groups for ADHD entrepreneurs that allow promotion.",
    );
    expect(current.currentResearchRequired).toBe(true);
    expect(current.directAnswerRequired).toBe(true);
  });

  it("12–13: capability offers restrained; hint asks for answer first", () => {
    const d = decideShariResponse(
      "How do I set up a vendor table or booth at an event?",
    );
    const hint = shariAnswerFirstHintForChat(d);
    expect(hint).toMatch(/SHARI CORE CONVERSATION|ANSWER-FIRST/);
    expect(hint).toMatch(/Do NOT open Create/);
    const withOffer = appendRestrainedCapabilityOffer(
      "Here is a full booth setup guide with steps and follow-up.",
      d,
    );
    expect(countPrimaryCapabilityOffersInText(withOffer)).toBeLessThanOrEqual(1);
  });

  it("14–15: follow-up context handoff preserves answer substance", () => {
    const d = decideShariResponse("How do I set up a vendor booth?");
    const handoff = buildShariConversationHandoff({
      decision: d,
      answerContent:
        "Choose the event, plan the display, signage, payment, lead capture, and follow-up.",
      destination: "create",
      userFollowUpContext: ["I sell journals.", "What should go on the table?"],
    });
    expect(handoff.answerContent).toMatch(/display/);
    expect(handoff.userFollowUpContext).toContain("I sell journals.");
    expect(handoff.originalRequest).toMatch(/vendor booth/i);
  });

  it("16–19: substance validation rejects menus, warnings, echoes, thin how-tos", () => {
    const d = decideShariResponse("How do I set up a vendor booth?");
    expect(
      validateShariAnswerSubstance({
        decision: d,
        answer: "Would you like to open Create, Projects, or Research Library?",
      }).destinationMenuOnlyDetected,
    ).toBe(true);
    expect(
      validateShariAnswerSubstance({
        decision: d,
        answer: "I'll open Create for you so we can build this.",
      }).routeBeforeAnswerDetected,
    ).toBe(true);
    expect(
      validateShariAnswerSubstance({
        decision: d,
        answer: "Research is unavailable. Please use the library.",
      }).warningOnlyDetected,
    ).toBe(true);
    expect(
      validateShariAnswerSubstance({
        decision: d,
        answer: "How do I set up a vendor booth?",
      }).requestEchoDetected,
    ).toBe(true);
    const good = validateShariAnswerSubstance({
      decision: d,
      answer: [
        "Start by choosing the right event and confirming booth size and rules.",
        "Decide your booth goal — leads, sales, or awareness.",
        "Plan visual hierarchy: signage, table covering, product height, and a clear next step.",
        "Bring payment options, an emergency kit, and a simple lead capture method.",
        "After the event, follow up within 48 hours and note what was worth repeating.",
      ].join(" "),
    });
    expect(good.valid).toBe(true);
  });

  it("20–22: advice, brainstorming, and essential-info posture", () => {
    const advice = decideShariResponse(
      "Do you think it is worth paying for a vendor booth at this event?",
    );
    expect(advice.primaryHelpMode).toBe("advice");
    expect(advice.directAnswerRequired).toBe(true);

    const ideas = decideShariResponse("Give me ideas for promoting my webinar.");
    expect(ideas.primaryHelpMode).toBe("brainstorming");
    expect(ideas.directAnswerRequired).toBe(true);

    const reflective = decideShariResponse(
      "I keep putting off contacting people about my platform.",
    );
    expect(reflective.primaryHelpMode).toBe("reflective_thinking");
    expect(reflective.followUpApproach).toBe("one_question");
  });

  it("23–24: explicit navigation still allowed; troubleshooting stays in chat", () => {
    expect(isExplicitNavigationCommand("Take me to the Research Library.")).toBe(
      true,
    );
    const nav = decideShariResponse("Take me to the Research Library.");
    expect(nav.routingAllowed).toBe(true);
    expect(nav.directAnswerRequired).toBe(false);

    const qr = decideShariResponse(
      "My QR code will not scan from my computer screen.",
    );
    expect(qr.primaryHelpMode).toBe("troubleshooting");
    expect(qr.directAnswerRequired).toBe(true);
  });

  it("25: informational chat turn + create fast path respect answer-first", () => {
    expect(
      isInformationalChatTurn(
        "How do I set up a vendor table or booth at an event?",
      ),
    ).toBe(true);
    expect(
      isSimpleCreateRequest("How do I create a strategic plan?"),
    ).toBe(false);
  });

  it("fail-safe and topic fallback give substantive how-to, not clarify-only", () => {
    const booth = "How do I set up a vendor table or booth at an event?";
    const local = buildAnswerFirstFailSafeReply(booth);
    expect(local).toMatch(/booth|display|signage|follow up/i);
    expect(local).not.toMatch(/hardest part/i);
    expect(buildFailSafeChatReply(booth)).toMatch(/booth|display|signage/i);
    expect(topicPreservingFallbackLine(undefined, booth)).toMatch(
      /booth|display|signage/i,
    );
  });

  it("parked-Create side questions suppress howto failsafe lesson", () => {
    const side =
      "Quick side question — do I need a business license to sell digital products in Texas?";
    const suppressed = buildAnswerFirstFailSafeReply(side, {
      suppressHowToLesson: true,
    });
    expect(suppressed).toBeNull();
    expect(
      buildFailSafeChatReply(side, undefined, undefined, {
        suppressHowToLesson: true,
      }),
    ).not.toMatch(/practical way to approach/i);
  });

  it("substance validation rejects profiling-before-answer replies", () => {
    const d = decideShariResponse(
      "How do I set up a vendor table or booth at an event?",
    );
    const v = validateShariAnswerSubstance({
      decision: d,
      answer:
        "Did I hear that right? To help you better, can you tell me a bit about your business? What do you do and who do you help?",
    });
    expect(v.valid).toBe(false);
    expect(v.failures).toContain("profiling_before_answer");
  });

  it("evaluation set: answer-first expectations hold across categories", () => {
    const failures: string[] = [];
    for (const c of SHARI_ANSWER_FIRST_EVAL_CASES) {
      const d = decideShariResponse(c.text);
      if (d.directAnswerRequired !== c.expectDirectAnswer) {
        failures.push(
          `${c.id} directAnswerRequired expected ${c.expectDirectAnswer} got ${d.directAnswerRequired} (${d.primaryHelpMode})`,
        );
      }
      if (d.routingAllowed !== c.expectRoutingAllowed) {
        failures.push(
          `${c.id} routingAllowed expected ${c.expectRoutingAllowed} got ${d.routingAllowed}`,
        );
      }
      if (
        c.expectCurrentResearch !== undefined &&
        d.currentResearchRequired !== c.expectCurrentResearch
      ) {
        failures.push(
          `${c.id} currentResearch expected ${c.expectCurrentResearch} got ${d.currentResearchRequired}`,
        );
      }
      if (
        c.expectModeIncludes &&
        !d.primaryHelpMode.includes(c.expectModeIncludes.replace("brainstorm", "brainstorming").replace("troubleshoot", "troubleshooting").replace("reflective", "reflective_thinking").replace("how_to", "how_to_guidance").replace("advice", "advice").replace("comparison", "comparison").replace("formal_creation", "formal_creation").replace("explicit_navigation", "explicit_navigation"))
      ) {
        // loose contains check
        const needle = c.expectModeIncludes;
        if (!`${d.primaryHelpMode}`.includes(needle) && !(needle === "brainstorm" && d.primaryHelpMode === "brainstorming") && !(needle === "troubleshoot" && d.primaryHelpMode === "troubleshooting") && !(needle === "reflective" && d.primaryHelpMode === "reflective_thinking") && !(needle === "how_to" && d.primaryHelpMode === "how_to_guidance")) {
          failures.push(`${c.id} mode ${d.primaryHelpMode} missing ${needle}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });
});
