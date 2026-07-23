/**
 * Certified Conversation Pipeline — shared quality certification before delivery.
 *
 * Flow (Chamber advisory):
 *   Understanding-first gate (hear whole situation → choose help mode)
 *     → Specialist draft (or listen/question rewrite)
 *     → Topic Anchor (TCAI)
 *     → CI / gold / continuity / CQRI
 *     → CIE + HCV
 *     → Coffee-test / advisory policy
 *     → Deliver
 */

import { getPrefs } from "@/lib/companionStore";
import {
  processConversationTurn,
  type ConversationRuntimeState,
} from "@/lib/conversationIntelligenceEngine";
import { deliverConversationalResponse } from "@/lib/conversationalIntelligence";
import { applyGroundedAcknowledgement } from "@/lib/conversationalIntelligence/groundedAcknowledgement";
import { runConversationQualityAndRhythm } from "@/lib/conversationQualityRhythmIntelligence";
import { replaceBlockedDraft } from "@/lib/goldStandardConversationLibrary";
import {
  applyTopicContinuityValidation,
  updateTopicAnchor,
} from "@/lib/topicContinuityAnchorIntelligence";
import { validateTalkItOutQuestion } from "@/lib/talkItOut/questionIntelligence";
import { applyChamberUnderstandingGate } from "@/lib/chamber/chamberUnderstandingGate";
import {
  buildAdvisorySafeFallback,
  evaluateChamberSharedResponsePolicy,
} from "./responsePolicy";
import {
  containsPermanentBanPhrase,
  isReflectiveConversationShell,
  limitToOneQuestion,
  scrubCertifiedAiLanguage,
} from "./scrubAiLanguage";
import type {
  CertifyConversationDeliveryInput,
  CertifyConversationDeliveryResult,
} from "./types";

function countQuestions(text: string): number {
  return (text.match(/\?/g) ?? []).length;
}

function draftLooksLikeAdvisoryAnswer(draft: string): boolean {
  const beforeQ = draft.split("?")[0] ?? draft;
  return (
    beforeQ.trim().split(/\s+/).length >= 18 &&
    /\b(?:recommend|instead|rather|phase|over time|trade-?off|because|risk|consider|all at once|gradually|clarity|audience|launch|feature)\b/i.test(
      beforeQ,
    )
  );
}

function preserveAdvisoryDraft(draft: string): string {
  return limitToOneQuestion(
    scrubCertifiedAiLanguage(draft, { stripAdviceMarkers: false }),
  );
}

function advisoryQuestionSanitize(text: string): string {
  let out = limitToOneQuestion(text);
  if (isReflectiveConversationShell(out)) {
    const beforeQ = out.split("?")[0]?.trim() ?? out;
    if (beforeQ.split(/\s+/).length >= 12) {
      out = beforeQ.replace(/[.!?]+$/, "") + ".";
    }
  }
  return out.trim();
}

export function certifyConversationDelivery(
  input: CertifyConversationDeliveryInput,
): CertifyConversationDeliveryResult {
  const messages = [
    ...input.messages.map((m) => ({
      role: m.role,
      content: m.content,
      id: m.id,
    })),
  ];
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user" || last.content !== input.userText) {
    messages.push({ role: "user", content: input.userText });
  }

  const topicAnchor = updateTopicAnchor({
    previous: input.priorTopicAnchor,
    userText: input.userText,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });
  const primaryTopic = topicAnchor.primaryTopic;

  // First gate for Chamber: understand before choosing an answer.
  let workingDraft = input.draftText;
  let understandingRegenerated = false;
  let understandingListenFirst = false;
  if (input.behaviorMode === "advisory" && input.experienceId === "chamber") {
    const understood = applyChamberUnderstandingGate({
      userText: input.userText,
      draftText: workingDraft,
      messages,
      specialistId: input.specialistId,
      specialistLabel: input.specialistLabel,
    });
    workingDraft = understood.text;
    understandingRegenerated = understood.regenerated;
    understandingListenFirst =
      understood.understanding.helpMode === "listen_question";
  }

  let prefsTone: ReturnType<typeof getPrefs>["aiTone"] = "balanced";
  try {
    prefsTone = getPrefs().aiTone;
  } catch {
    /* SSR / tests */
  }

  const recentAssistantTexts = input.messages
    .filter((m) => m.role === "assistant")
    .map((m) => m.content)
    .slice(-4);

  const delivered = deliverConversationalResponse({
    experienceId: input.experienceId,
    draftText: workingDraft,
    userText: input.userText,
    responseKind:
      input.repairActive || input.wasClarification ? "clarification" : "other",
    aiTone: prefsTone,
    recentAssistantTexts,
    preferBrevity: input.behaviorMode !== "advisory",
  });

  const grounded = applyGroundedAcknowledgement({
    draftText: delivered.text,
    userText: input.userText,
    seed: input.userText.length + delivered.text.length,
    primaryTopic,
  });

  const goldSafe = replaceBlockedDraft({
    draftText: grounded.text,
    userText: input.userText,
    topicAnchor: primaryTopic,
    clarificationOrRepair: Boolean(input.repairActive || input.wasClarification),
  });

  const continuity = applyTopicContinuityValidation({
    draftText: goldSafe.text,
    userText: input.userText,
    anchor: topicAnchor,
    previousAssistantText: recentAssistantTexts[recentAssistantTexts.length - 1],
    repairActive: Boolean(input.repairActive),
    wasClarification: Boolean(input.wasClarification),
  });

  const cqri = runConversationQualityAndRhythm({
    experienceId: input.experienceId,
    userText: input.userText,
    messages: input.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    draftText: continuity.text,
    responseKind: input.repairActive ? "repair" : "other",
    repairActive: Boolean(input.repairActive),
    thinkingMap: null,
    recentPhraseUsage: recentAssistantTexts,
  });

  const cie = processConversationTurn({
    conversationId: input.conversationId,
    experienceId: input.experienceId,
    userText: input.userText,
    messages,
    priorState: input.priorCieState ?? null,
    draftText: cqri.approvedText,
    repairActive: Boolean(input.repairActive || input.wasClarification),
    thinkingMap: null,
    validationMode: "full",
  });

  // CIE full mode already runs HCV inside processConversationTurn.
  // For advisory Chamber turns, CIE/HCV often overwrite expert drafts with
  // reflective shells — preserve a strong specialist draft when that happens.
  let regenerated = Boolean(cie.regenerated) || understandingRegenerated;
  let usedFallback = Boolean(cie.usedFallback);
  let text = cie.assistantText;
  const originalAdvisory = draftLooksLikeAdvisoryAnswer(workingDraft);

  if (input.behaviorMode === "advisory") {
    if (
      isReflectiveConversationShell(text) ||
      containsPermanentBanPhrase(text) ||
      (usedFallback && originalAdvisory)
    ) {
      if (understandingListenFirst && workingDraft.trim()) {
        // Keep the understanding-first listen/question — do not swap for advice.
        text = preserveAdvisoryDraft(workingDraft);
        regenerated = true;
        usedFallback = false;
      } else if (
        originalAdvisory &&
        !containsPermanentBanPhrase(workingDraft)
      ) {
        text = preserveAdvisoryDraft(workingDraft);
        regenerated = true;
        usedFallback = false;
      } else if (
        draftLooksLikeAdvisoryAnswer(input.draftText) &&
        !containsPermanentBanPhrase(input.draftText)
      ) {
        text = preserveAdvisoryDraft(input.draftText);
        regenerated = true;
        usedFallback = false;
      } else {
        text = buildAdvisorySafeFallback({
          userText: input.userText,
          topicAnchor: primaryTopic,
          specialistLabel: input.specialistLabel,
        });
        usedFallback = true;
      }
    } else {
      text = advisoryQuestionSanitize(text);
    }
  } else {
    const qCheck = validateTalkItOutQuestion({
      responseText: text,
      userText: input.userText,
      topicAnchor: primaryTopic,
      priorAssistantTexts: recentAssistantTexts,
    });
    if (!qCheck.passed && countQuestions(text) >= 2) {
      text = limitToOneQuestion(text);
      regenerated = true;
    }
  }

  text = scrubCertifiedAiLanguage(text, {
    stripAdviceMarkers: input.behaviorMode === "reflective",
  });

  if (containsPermanentBanPhrase(text) || !text.trim()) {
    text =
      input.behaviorMode === "advisory"
        ? originalAdvisory
          ? preserveAdvisoryDraft(input.draftText)
          : buildAdvisorySafeFallback({
              userText: input.userText,
              topicAnchor: primaryTopic,
              specialistLabel: input.specialistLabel,
            })
        : limitToOneQuestion(cqri.approvedText || input.draftText);
    usedFallback = !originalAdvisory;
  }

  if (input.behaviorMode === "advisory") {
    text = limitToOneQuestion(text);
  }

  let policy = evaluateChamberSharedResponsePolicy({
    userText: input.userText,
    responseText: text,
    behaviorMode: input.behaviorMode,
    onTopic: continuity.passed,
  });

  if (!policy.passed && input.behaviorMode === "advisory") {
    if (originalAdvisory && !containsPermanentBanPhrase(input.draftText)) {
      text = preserveAdvisoryDraft(input.draftText);
    } else {
      text = buildAdvisorySafeFallback({
        userText: input.userText,
        topicAnchor: primaryTopic,
        specialistLabel: input.specialistLabel,
      });
      usedFallback = true;
    }
    policy = evaluateChamberSharedResponsePolicy({
      userText: input.userText,
      responseText: text,
      behaviorMode: "advisory",
      onTopic: true,
    });
  }

  const cieState: ConversationRuntimeState = {
    ...cie.state,
    topicAnchor,
  };

  return {
    text: text.trim(),
    topicAnchor,
    cieState,
    policy,
    regenerated,
    usedFallback,
  };
}
