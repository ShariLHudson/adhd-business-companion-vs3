/**
 * Intentional Restoration™ engine — Estate Guide as restorative experience.
 */

import {
  ESTATE_GUIDE_STORY_CHAINS,
  STORY_COMPANION_CHAINS,
  storyContextFromInput,
} from "./storyRegistry";
import { bestRestorationTrigger } from "./detection";
import { buildStoryPick } from "./storySnippets";
import {
  adaptiveCompanionSpread,
  canOfferRestorationNow,
  clearPendingReturn,
  loadRestorationStore,
  pickUnreadSpread,
  recordRestorationOffer,
  recordStoryRead,
  setPendingReturn,
} from "./store";
import type {
  RestorationDeliveryMode,
  RestorationEvaluation,
  RestorationInput,
  RestorationOfferResult,
  RestorationReturnResult,
  RestorationTrigger,
} from "./types";

const RESTORATION_ACCEPT_RE =
  /\b(?:yes|yeah|sure|okay|ok|i'?d love|tell me|read (?:it|more)|open the guide|show me|let'?s wander|sounds nice|that sounds)\b/i;

const RESTORATION_DECLINE_RE =
  /\b(?:no thanks|not now|stay (?:here|with)|keep working|later|maybe later|not really)\b/i;

const RETURN_READY_RE =
  /\b(?:ready to continue|back to work|let'?s continue|pick (?:it|this) back up|i'?m ready)\b/i;

function confidenceFromTrigger(
  trigger: RestorationTrigger,
): RestorationEvaluation["confidence"] {
  switch (trigger) {
    case "cognitive_overload":
    case "mental_fatigue":
    case "frustration":
      return "high";
    case "stuck":
    case "decision_fatigue":
    case "revision_loop":
      return "medium";
    default:
      return "low";
  }
}

function deliveryModeForTrigger(
  trigger: RestorationTrigger,
): RestorationDeliveryMode {
  if (trigger === "natural_pause" || trigger === "extended_work") return "tell_inline";
  if (trigger === "frustration" || trigger === "stuck") return "offer";
  return "offer";
}

function inferTaskLabel(input: RestorationInput): string | null {
  const t = input.userText.toLowerCase();
  if (/\bsop\b/.test(t)) return "your SOP";
  if (/\bnewsletter\b/.test(t)) return "the newsletter";
  if (/\bemail\b/.test(t)) return "the email";
  if (/\bproject\b/.test(t)) return "the project";
  if (/\bplan\b/.test(t)) return "the plan";
  if (input.workspace === "content-generator") return "what we were creating";
  if (input.workspace === "projects") return "your project";
  return null;
}

function selectStory(
  input: RestorationInput,
  trigger: RestorationTrigger,
): ReturnType<typeof buildStoryPick> {
  const store = loadRestorationStore();
  const context = storyContextFromInput({
    workspace: input.workspace,
    estatePlaceId: input.estatePlaceId,
    overwhelmed: input.overwhelmed,
    trigger,
  });

  let candidates = [...ESTATE_GUIDE_STORY_CHAINS[context]];

  const favorite = store.favoriteSpreadIds.at(-1);
  if (favorite && STORY_COMPANION_CHAINS[favorite]) {
    const companion = adaptiveCompanionSpread(
      favorite,
      STORY_COMPANION_CHAINS[favorite],
    );
    if (companion) candidates = [companion, ...candidates];
  }

  const spreadId = pickUnreadSpread(candidates);
  if (!spreadId) return null;

  const reason = `Matched ${context} context after ${trigger.replace(/_/g, " ")}`;
  return buildStoryPick(spreadId, reason);
}

export function evaluateRestorationOpportunity(
  input: RestorationInput,
): RestorationEvaluation | null {
  const trigger = bestRestorationTrigger(input);
  if (!trigger) return null;

  const turn = input.currentTurn ?? 0;
  if (!canOfferRestorationNow(turn)) return null;

  const story = selectStory(input, trigger);
  if (!story) return null;

  return {
    shouldOffer: true,
    trigger,
    confidence: confidenceFromTrigger(trigger),
    story,
    deliveryMode: deliveryModeForTrigger(trigger),
    returnContextLabel: inferTaskLabel(input),
  };
}

function offerIntro(trigger: RestorationTrigger): string {
  switch (trigger) {
    case "mental_fatigue":
    case "extended_work":
      return "You've been doing some really thoughtful work.";
    case "frustration":
    case "revision_loop":
      return "Sometimes a short change of scenery helps ideas settle.";
    case "stuck":
      return "When something won't budge, a different kind of quiet can help.";
    case "decision_fatigue":
      return "Your brain has been carrying a lot of choices.";
    case "cognitive_overload":
      return "I can feel how full everything is right now.";
    case "natural_pause":
      return "This feels like a natural moment to breathe.";
    default:
      return "You've been at this with real care.";
  }
}

function offerInvitation(story: RestorationEvaluation["story"]): string {
  const templates = [
    `Would you enjoy taking a few minutes to explore another part of the Estate? I have a story from ${story.title} I think you'd enjoy.`,
    `Would you like to read a couple of pages from the Estate Guide before we continue? There's ${story.teaser}.`,
    `How about we wander through the Gardens together and read a few pages about ${story.title} before returning?`,
    `I think your brain could use something different for a few minutes. There's a wonderful story about ${story.title} that many members enjoy.`,
  ];
  return templates[Math.abs(story.spreadId.length) % templates.length]!;
}

export function buildRestorationOffer(
  evaluation: RestorationEvaluation,
): RestorationOfferResult {
  const { story, trigger, deliveryMode } = evaluation;

  if (deliveryMode === "tell_inline") {
    return {
      intro: "Before we jump back in, I have a story I'd love to share with you.",
      invitation: story.conversationalSnippet,
      story,
      trigger,
      deliveryMode,
      responseHint: restorationHint(evaluation, "tell"),
      choices: ["I'd love to read more", "Stay with work"],
    };
  }

  return {
    intro: offerIntro(trigger),
    invitation: offerInvitation(story),
    story,
    trigger,
    deliveryMode,
    responseHint: restorationHint(evaluation, "offer"),
    choices: ["Tell me the story", "Open the Guide", "Stay with work"],
  };
}

export function formatRestorationOfferReply(offer: RestorationOfferResult): string {
  return [offer.intro, "", offer.invitation].join("\n");
}

export function formatInlineStoryReply(offer: RestorationOfferResult): string {
  return [
    offer.intro,
    "",
    offer.story.conversationalSnippet,
    "",
    "Would you like to read more in the Estate Guide, or stay here with me?",
  ].join("\n");
}

export function isRestorationAcceptance(text: string): boolean {
  return RESTORATION_ACCEPT_RE.test(text.trim());
}

export function isRestorationDecline(text: string): boolean {
  return RESTORATION_DECLINE_RE.test(text.trim());
}

export function isRestorationReturnReady(text: string): boolean {
  return RETURN_READY_RE.test(text.trim());
}

export function isRestorationOfferMessage(text: string): boolean {
  return (
    /\b(?:Estate Guide|read (?:a )?couple of pages|story from|wander through|something different for a few minutes)\b/i.test(
      text,
    ) ||
    /\b(?:Today's Adventure|more energy|tell you a bit of the story|before we jump back in)\b/i.test(
      text,
    )
  );
}

export function resolveRestorationReturn(
  taskLabel?: string | null,
): RestorationReturnResult {
  const pending = clearPendingReturn();
  const label = taskLabel ?? pending?.taskLabel ?? "what we were working on";

  return {
    welcomeBack: "I'm really glad you're here.",
    reconnectQuestion: `Feeling ready to continue with ${label}?`,
    responseHint: [
      "RESTORATION RETURN:",
      "Warm, brief — never 'break over' or productivity framing.",
      `Reconnect to: ${label}.`,
      'Optional: "Did anything in that story spark a new idea?"',
      "Member owns the pace.",
    ].join("\n"),
  };
}

export function restorationHint(
  evaluation: RestorationEvaluation,
  phase: "offer" | "tell" | "return",
): string {
  const lines = [
    "ESTATE RESTORATION (mandatory):",
    "The Estate Guide is restorative experience — NOT documentation, NOT a manual.",
    "Never say 'take a break' or 'you should rest.'",
    "Offer curiosity, beauty, story — optional always.",
    `Story: ${evaluation.story.title} (${evaluation.story.spreadId}).`,
    `Trigger: ${evaluation.trigger}. Phase: ${phase}.`,
    "Reading should feel like a peaceful walk with someone who knows every story.",
    "FORBIDDEN: feature tour, help article tone, numbered menu of rooms.",
  ];
  if (phase === "tell") {
    lines.push(
      "Tell the snippet conversationally — Shari voice, not quoted brochure.",
      "Member may listen in chat OR open the Guide — both valid.",
    );
  }
  return lines.join("\n");
}

export function acceptRestorationStory(
  spreadId: string,
  taskLabel: string | null,
  currentTurn: number,
): void {
  recordStoryRead(spreadId);
  if (taskLabel) {
    setPendingReturn(taskLabel, spreadId, currentTurn);
  }
}
