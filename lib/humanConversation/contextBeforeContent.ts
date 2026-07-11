/**
 * Context Before Content — answer the whole conversation, not the latest sentence.
 */

import type { EmotionalState } from "../companionEmotions";
import type { AppSection } from "../companionUi";
import { workspaceTitle } from "../workspaceMode";

export const CONTEXT_BEFORE_CONTENT_PRINCIPLE =
  "Context Before Content — explain why this helps this person before what it does." as const;

export const CONTEXT_BEFORE_CONTENT_PROMPT = `CONTEXT BEFORE CONTENT (constitutional — overrides feature-manual voice)
Before generating any response, ask:
- What has this person already told me?
- What emotion are they experiencing?
- Why are they asking this question now?
- What are they really trying to solve?

Never answer only the latest sentence. Answer the entire conversation.

NO FEATURE MANUALS — when explaining Focus Mode, Decision Compass, Clear My Mind, Focus Audio, Evidence Vault, Business Hub, Plan My Day, Content Studio, or any workspace:
- Never begin with feature descriptions or functionality lists.
- First: why this exists, how it helps, when it is useful, why it fits THIS person's current situation.
- Only afterward: what the feature actually does.
- People buy outcomes, not features.

RELATIONSHIP CONTINUITY — once emotional context is established, preserve it.
Bad: "Focus Mode provides structured sessions..."
Good: "I think what you've described isn't really a focus problem — it's that your brain is trying to carry too many open loops. That's exactly the kind of situation Focus Mode was built for."

ACTION TRANSITION — when opening a workspace or changing modes:
- Transition naturally: "Let's try this together. I'll stay right here while we open Focus Mode."
- Never announce UI mechanics ("Documents is open beside us", "Workspace launched", "Redirecting", "Loading").
- Reassure presence: "I'm still here." / "We're not leaving our conversation." / "We'll figure this out together."
- After open: gentle next question — never a system status message.

THE "YES" RULE — one-word confirmations (yes, okay, sure, go ahead, please):
- Infer what "yes" refers to from the conversation.
- Acknowledge warmly, transition naturally, remain present, then quietly open the workspace.
- Never expose internal routing or loading states.`;

export const COMPANION_PRESENCE_LINES = [
  "I'll stay with you while we work through this.",
  "We're not leaving our conversation.",
  "We'll figure this out together.",
  "I'm still here.",
] as const;

const FEATURE_SECTION_HINTS: Partial<
  Record<AppSection, { why: string; when: string }>
> = {
  "visual-focus": {
    why: "when too many things are competing for attention at once",
    when: "they need one thing in front of them without everything else shouting",
  },
  focus: {
    why: "when starting feels harder than the work itself",
    when: "they want a contained session instead of an open-ended to-do list",
  },
  "brain-dump": {
    why: "when their mind is full of open loops they cannot hold anymore",
    when: "talking through it all at once would feel like too much structure",
  },
  "plan-my-day": {
    why: "when the day feels bigger than their actual capacity",
    when: "they need realism, not another ambitious list",
  },
  "decision-compass": {
    why: "when they're circling a choice and need clarity without pressure",
    when: "the options feel equally loud or equally scary",
  },
  "content-generator": {
    why: "when they know what they want to make but need a place to shape it",
    when: "drafting in chat would keep fragmenting the work",
  },
  "time-block": {
    why: "when good intentions never find a real slot on the calendar",
    when: "they need time to feel protected, not negotiable",
  },
  "evidence-bank": {
    why: "when self-doubt erases what they've already accomplished",
    when: "they need proof they can trust on a hard day",
  },
};

export function featureExplanationHintForChat(input?: {
  userText?: string;
  emotionalState?: EmotionalState | null;
  activeSection?: AppSection | null;
}): string | undefined {
  const section = input?.activeSection;
  if (!section) return undefined;

  const hint = FEATURE_SECTION_HINTS[section];
  const title = workspaceTitle(section);
  const emotional = input?.emotionalState;
  const overwhelmed =
    emotional === "overwhelmed" || emotional === "emotional";

  const lines = [
    `CONTEXT BEFORE CONTENT (${title}):`,
    "Lead with why this helps their situation — not what the workspace does.",
  ];

  if (hint) {
    lines.push(`Why: especially ${hint.why}.`);
    lines.push(`When: ${hint.when}.`);
  }

  if (overwhelmed) {
    lines.push(
      "They're overwhelmed — connect the workspace to relief and one-thing-at-a-time, not productivity features.",
    );
  }

  const userText = input?.userText?.trim();
  if (userText && /\b(?:explain|what is|how does)\b/i.test(userText)) {
    lines.push(
      "This may sound like a definition request — answer why it might help THEM first.",
    );
  }

  return lines.join("\n");
}

export function contextBeforeContentHintForChat(input?: {
  userText?: string;
  emotionalState?: EmotionalState | null;
  activeSection?: AppSection | null;
  pendingWorkspaceOffer?: boolean;
  isAffirmativeReply?: boolean;
}): string {
  const lines = [
    "CONTEXT BEFORE CONTENT (this turn):",
    "Answer the whole conversation — not only the latest sentence.",
    "Why it helps them → how it fits now → only then what it does.",
  ];

  if (input?.isAffirmativeReply) {
    lines.push(
      'YES RULE: infer what they agreed to; acknowledge warmly; transition with presence — never "workspace opened" or "redirecting".',
    );
  }

  if (input?.pendingWorkspaceOffer) {
    lines.push(
      "ACTION TRANSITION: if opening a workspace, stay emotionally present — reassure the conversation continues.",
    );
  }

  const featureHint = featureExplanationHintForChat(input);
  if (featureHint) lines.push(featureHint);

  return lines.join("\n");
}
