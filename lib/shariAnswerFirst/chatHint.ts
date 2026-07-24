/**
 * System hint injected into companion-chat when answer-first applies.
 */

import type { ShariResponseDecision } from "./types";
import { capabilityOfferLine } from "./capabilityOffers";
import { conversationModeFromHelpMode } from "./conversationModes";

export function shariAnswerFirstHintForChat(
  decision: ShariResponseDecision,
): string {
  if (!decision.directAnswerRequired && !decision.currentResearchRequired) {
    if (decision.explicitNavigationRequested) {
      return [
        "ANSWER-FIRST — EXPLICIT NAVIGATION:",
        "Obey the navigation request promptly. Do not lecture before navigating.",
      ].join("\n");
    }
    if (decision.explicitCreationRequested) {
      return [
        "ANSWER-FIRST — EXPLICIT CREATION:",
        "The member asked you to create something. Proceed with substantive creation support.",
        "Do not answer only with a how-to when they asked you to create it.",
      ].join("\n");
    }
    return "";
  }

  const offer = capabilityOfferLine(decision);
  const depthLine =
    decision.answerDepth === "comprehensive"
      ? "Provide thorough, practical detail — they asked for depth."
      : decision.answerDepth === "brief"
        ? "Keep it concise and useful."
        : "Use enough structure to be practical without becoming a rigid template.";

  const modeLine = {
    how_to_guidance:
      "Answer as practical how-to guidance in chat: preparation, ordered actions, decisions, common mistakes, and next steps as appropriate to the topic.",
    advice:
      "Give thoughtful advice with tradeoffs and a considered recommendation when appropriate. Preserve their agency. Do not auto-route to Decision Compass, Board, or Strategy.",
    comparison:
      "Compare meaningfully with criteria, tradeoffs, and when each option fits. Visual Thinking is optional only if they ask.",
    brainstorming:
      "Offer varied, practical ideas — not minor rewrites of one idea. Organize lightly. Do not force Create.",
    troubleshooting:
      "Acknowledge the problem, list likely causes simplest-first, give concrete checks, and expected results.",
    reflective_thinking:
      "Stay reflective. Ask one thoughtful open question. Do not dump a task list or route away.",
    simple_planning:
      "Help with lightweight planning in chat. Offer Projects only if tracking would clearly help.",
    explanation: "Explain clearly in warm, practical language.",
    direct_answer: "Answer the question directly and usefully.",
    research:
      decision.currentResearchRequired
        ? "Current information is needed. Be honest about research limits. Still share stable general methodology when useful."
        : "Share stable general guidance; do not pretend it is live research.",
  }[decision.primaryHelpMode] ??
    "Answer helpfully in ordinary conversation before suggesting other experiences.";

  const pyramidMode =
    decision.conversationMode ??
    conversationModeFromHelpMode(decision.primaryHelpMode);

  return [
    "SHARI CORE CONVERSATION (mandatory for this turn):",
    "Prime directive: help inside this conversation first. Capabilities are invitations, never prerequisites.",
    "1. Answer in chat first with substantive, practical help.",
    "2. Do NOT open Create, Projects, Research Library, Visual Thinking, Strategic Planning, or Chamber before answering.",
    "3. Do NOT reply with only a destination menu, research warning, or thin summary.",
    "4. Do NOT ask the member to choose a workflow, template, or output format before helping.",
    "5. Do NOT ask unnecessary profiling questions before helping.",
    `6. Conversation mode (internal): ${pyramidMode ?? decision.primaryHelpMode}.`,
    `7. Depth: ${decision.answerDepth}. ${depthLine}`,
    `8. ${modeLine}`,
    offer
      ? `9. After the answer, you may include at most ONE soft next step: "${offer}"`
      : "9. You may end without any platform offer.",
    "10. Sound like a capable friend sitting beside them — warm, calm, practical, no platform jargon.",
  ].join("\n");
}
