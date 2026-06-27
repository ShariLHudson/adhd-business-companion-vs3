/**
 * Action Transition — warm human workspace opens.
 * Never announce UI mechanics; reassure the conversation continues.
 */

import type { EmotionalState } from "../companionEmotions";
import type { AppSection } from "../companionUi";
import {
  displayTitleForWorkspaceOpen,
  type ClearMyMindPanelView,
} from "../workspaceOpeningRule";

export type ActionTransitionPhase = "opening" | "opened";

export type ActionTransitionContext = {
  phase?: ActionTransitionPhase;
  emotionalState?: EmotionalState | null;
  userText?: string;
  lastAssistantText?: string;
  /** User replied yes / okay / sure to a prior offer — "Yes Rule". */
  isAffirmative?: boolean;
  view?: ClearMyMindPanelView;
  mobile?: boolean;
  seed?: number;
};

export const WORKSPACE_TRANSITION_THINKING_LINES = [
  "Getting one small workspace ready.",
  "Finding the simplest place to begin.",
  "Preparing a space where we can focus on one thing at a time.",
] as const;

const AFFIRMATIVE_ACKS = [
  "Perfect.",
  "Let's make this easier.",
  "Sounds good.",
  "Okay — let's try this together.",
] as const;

function pickAck(ctx?: ActionTransitionContext): string {
  const seed = ctx?.seed ?? 0;
  if (ctx?.isAffirmative) {
    return AFFIRMATIVE_ACKS[Math.abs(seed) % AFFIRMATIVE_ACKS.length]!;
  }
  return "Let's try this together.";
}

function presenceLine(
  section: AppSection,
  ctx?: ActionTransitionContext,
): string {
  const overwhelmed =
    ctx?.emotionalState === "overwhelmed" ||
    ctx?.emotionalState === "emotional";

  if (section === "visual-focus" || section === "focus") {
    return "Nothing else has to compete for your attention for a little while.";
  }
  if (section === "brain-dump") {
    if (ctx?.view === "my-thoughts") {
      return "Pick one that feels doable — I'm still here while you choose.";
    }
    return "We can sort through everything together — one piece at a time.";
  }
  if (section === "plan-my-day") {
    return "Let's see what today can actually hold, not what it demands.";
  }
  if (section === "content-generator") {
    return "We can shape this together — no pressure to get it perfect.";
  }
  if (section === "time-block") {
    return "Let's find a slot that fits your energy.";
  }
  if (section === "decision-compass") {
    return "We can look at this from a few angles together.";
  }
  if (section === "projects") {
    return "I'm still here while we figure out what matters most.";
  }
  if (section === "evidence-bank") {
    return "Your wins are worth keeping close.";
  }
  if (section === "welcome-room") {
    return "Take your time — we're not leaving this conversation.";
  }
  if (overwhelmed) {
    return "I'm still right here with you — we don't have to rush.";
  }
  return "I'm still here with you.";
}

function nextStepQuestion(
  section: AppSection,
  ctx?: ActionTransitionContext,
): string {
  if (section === "brain-dump" && ctx?.view === "my-thoughts") {
    return "What feels like the smallest honest start?";
  }
  if (section === "visual-focus" || section === "focus") {
    return "Where would you like to begin?";
  }
  if (section === "plan-my-day") {
    return "What's the one thing that would make today feel lighter?";
  }
  if (section === "content-generator") {
    return "What are we working on first?";
  }
  if (section === "time-block") {
    return "What needs a home on your calendar?";
  }
  if (section === "decision-compass") {
    return "What's the decision sitting heaviest right now?";
  }
  if (section === "projects") {
    return "Which project is calling for attention?";
  }
  if (section === "brain-dump") {
    return "Want to tell me what's on your mind?";
  }
  return "What would help most right now?";
}

export function workspaceTransitionThinkingLine(seed?: number): string {
  const idx =
    Math.abs(seed ?? 0) % WORKSPACE_TRANSITION_THINKING_LINES.length;
  return WORKSPACE_TRANSITION_THINKING_LINES[idx]!;
}

/** Pre-open — companion stays present while workspace appears. */
export function buildWorkspaceOpeningTransition(
  section: AppSection,
  ctx?: ActionTransitionContext,
): string {
  const title = displayTitleForWorkspaceOpen(section, ctx?.view);
  const ack = pickAck(ctx);
  return `${ack} I'll stay right here with you while we open **${title}**.\n\nWe're not leaving our conversation.`;
}

/** Post-open — verified workspace visible; Companion Presence. */
export function buildWorkspaceOpenedTransition(
  section: AppSection,
  ctx?: ActionTransitionContext,
): string {
  if (ctx?.mobile) {
    const ack = ctx?.isAffirmative ? pickAck(ctx) : "There we go.";
    return `${ack} Tap **Chat** anytime — I'm still here with you.\n\n${nextStepQuestion(section, ctx)}`;
  }

  const opener = ctx?.isAffirmative ? pickAck(ctx) : "There we go.";
  return `${opener} ${presenceLine(section, ctx)}\n\n${nextStepQuestion(section, ctx)}`;
}

export function buildActionTransitionAck(
  section: AppSection,
  ctx?: ActionTransitionContext,
): string {
  const phase = ctx?.phase ?? "opened";
  if (phase === "opening") {
    return buildWorkspaceOpeningTransition(section, ctx);
  }
  return buildWorkspaceOpenedTransition(section, ctx);
}

export function buildAffirmativeWorkspaceTransition(
  section: AppSection,
  ctx?: Omit<ActionTransitionContext, "isAffirmative">,
): string {
  return buildActionTransitionAck(section, { ...ctx, isAffirmative: true });
}
