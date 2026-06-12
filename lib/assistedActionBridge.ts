// Bridge from accepted advice → assisted execution in the app.

import {
  filterAssistedActionForArtifact,
  isProposalArtifact,
} from "./artifactType";
import type { AppSection } from "./companionUi";
import type { SidebarToolId } from "./companionUi";

export type AssistedAction = {
  id: string;
  section: AppSection;
  itemType?: string;
  title: string;
  brief: string;
  /** Short line on the action card below chat. */
  offerLine: string;
  /** Full assistant reply when offering help. */
  helpMessage: string;
  /** Message when the workspace opens. */
  openAck: string;
  buttonLabel: string;
  emoji: string;
  tool?: SidebarToolId;
};

const ACTION_ACCEPTANCE_RE =
  /^(?:yes|yep|yeah|yup|ok(?:ay)?|sure|sounds good|works for me|perfect|i like it|that'?s good|that'?s fine|that works|looks good|correct|right|good|that one|use that|let'?s do it|please do|go ahead|i can do that|i'll do that|i will do that|i can try that|ok i'?ll do it|sounds doable|let'?s go|count me in)\.?$/i;

const SUGGESTS_ACTION_RE =
  /\b(how about|what if you|you could|try |maybe |start with|want to |could you|one tiny|one small|just one|pick one|respond to|reply to|send (?:one|an?)|write (?:one|an?))\b/i;

const ASSIST_OFFER_RE =
  /\b(would you like (?:me to )?help|want me to help|i can open create|write it together|do that together|work on it together|open create)\b/i;

export function isActionAcceptance(text: string): boolean {
  return ACTION_ACCEPTANCE_RE.test(text.trim());
}

export function assistantOfferedAssistedHelp(lastAssistantText: string): boolean {
  return ASSIST_OFFER_RE.test(lastAssistantText.trim());
}

function detectAssistedActionUncached(
  lastAssistantText: string,
): AssistedAction | null {
  const text = lastAssistantText.trim();
  if (!text || assistantOfferedAssistedHelp(text)) return null;

  const t = text.toLowerCase();
  const suggests =
    SUGGESTS_ACTION_RE.test(t) ||
    /\?\s*$/.test(text) ||
    /\b(want to try|give it a try|solid step|small step|tiny step)\b/.test(t);

  if (!suggests) return null;

  if (/\bproposals?\b/.test(t) && /\b(?:write|draft|build|create|save|export|print|google doc)\b/.test(t)) {
    return {
      id: "proposal",
      section: "content-generator",
      itemType: "Proposal",
      title: "Proposal",
      brief: text.slice(0, 200),
      offerLine: "I can keep working on your proposal in Create beside us.",
      helpMessage:
        "Want help with your **proposal**? **Create** is open beside us — we can keep drafting, add a section, or save/export when you're ready.",
      openAck:
        "Your **Proposal** is in **Create** beside us — tell me what section to work on next.",
      buttonLabel: "Continue Proposal",
      emoji: "📄",
    };
  }

  if (
    /\bemails?\b/.test(t) &&
    (/\b(?:respond|reply|send|write|draft|answer|one email|an email)\b/.test(t) ||
      /\bhow about\b.*\bemails?\b/.test(t))
  ) {
    return {
      id: "email",
      section: "content-generator",
      itemType: "Email",
      title: "Email reply",
      brief: text.slice(0, 200),
      offerLine: "I can open Create and help you draft the email beside us.",
      helpMessage:
        "Great — that's a solid step. Would you like me to help draft the email? I can open **Create** beside us and we can write it together.",
      openAck:
        "Opening **Create** with **Email** — tell me who it's to and what you want to say, and we'll draft it together.",
      buttonLabel: "Help Me Draft It",
      emoji: "✉️",
    };
  }

  if (
    /\b(?:linkedin\s+)?posts?\b/.test(t) ||
    /\bsocial\s+(?:media\s+)?post\b/.test(t)
  ) {
    return {
      id: "post",
      section: "content-generator",
      itemType: "Post",
      title: "Social post",
      brief: text.slice(0, 200),
      offerLine: "I can open Create and help you write the post together.",
      helpMessage:
        "Nice. Would you like help writing that post? I can open **Create** beside us and we can draft it together.",
      openAck:
        "Opening **Create** for your post — share the angle and we'll shape it together.",
      buttonLabel: "Help Me Write It",
      emoji: "📱",
    };
  }

  if (/\b(?:marketing|content)\s+plan\b/.test(t) || /\b\d+[- ]day\s+plan\b/.test(t)) {
    return {
      id: "plan",
      section: "content-generator",
      itemType: "Plan",
      title: "Marketing plan",
      brief: text.slice(0, 200),
      offerLine: "I can open Create and build the plan with you step by step.",
      helpMessage:
        "Good choice. Would you like help building that plan? I can open **Create** beside us and we'll map it out together.",
      openAck:
        "Opening **Create** for your plan — we'll build it one piece at a time.",
      buttonLabel: "Help Me Plan It",
      emoji: "📋",
    };
  }

  if (
    /\b(?:phone|sales|client|follow[- ]?up)\s+calls?\b/.test(t) ||
    (/\bcalls?\b/.test(t) &&
      /\b(?:make|prep|prepare|script|return|few)\b/.test(t))
  ) {
    return {
      id: "call-prep",
      section: "content-generator",
      itemType: "Plan",
      title: "Call prep",
      brief: `Call preparation: ${text.slice(0, 160)}`,
      offerLine: "I can help you prep a short script or call plan in Create.",
      helpMessage:
        "Want help preparing for the call? I can open **Create** and we'll build a quick script or talking points together.",
      openAck:
        "Opening **Create** for call prep — we'll shape what you want to say before you dial.",
      buttonLabel: "Help Me Prep",
      emoji: "📞",
    };
  }

  if (
    /\binbox\b/.test(t) &&
    /\b(?:organiz|sort|triage|clear|clean|respond|deal with)\b/.test(t)
  ) {
    return {
      id: "inbox",
      section: "brain-dump",
      title: "Inbox sorting",
      brief: text.slice(0, 200),
      offerLine: "We can sort what's in your head first, then pick a strategy.",
      helpMessage:
        "Want help getting started? We can use **Clear My Mind** to capture what's in the inbox mentally, then talk through a simple sort-together plan.",
      openAck:
        "Opening **Clear My Mind** — dump what's weighing on you about the inbox, and we'll sort it together.",
      buttonLabel: "Open Clear My Mind",
      emoji: "🧠",
      tool: "brain-dump",
    };
  }

  if (/\b(workshop|webinar|course|project)\b/.test(t) && suggests) {
    const topic =
      t.match(/\b(workshop|webinar|course|project)\b/)?.[1] ?? "project";
    return {
      id: "project",
      section: "projects",
      itemType: topic,
      title: topic.charAt(0).toUpperCase() + topic.slice(1),
      brief: text.slice(0, 200),
      offerLine: "I can open Projects and we'll build it together, one field at a time.",
      helpMessage: `Want help with that ${topic}? I can open **Projects** beside us and we'll work through it step by step.`,
      openAck: `Opening **Projects** — let's build your ${topic} together.`,
      buttonLabel: "Build Together",
      emoji: "📁",
    };
  }

  if (/\b(time block|schedule|block out|calendar)\b/.test(t) && suggests) {
    return {
      id: "time-block",
      section: "time-block",
      title: "Time block",
      brief: text.slice(0, 200),
      offerLine: "I can open Time Block and map it out beside our chat.",
      helpMessage:
        "Want help scheduling it? I can open **Time Block** and we'll place it on your day together.",
      openAck: "Opening **Time Block** — let's find a spot that actually works.",
      buttonLabel: "Open Time Block",
      emoji: "📅",
      tool: "time-block",
    };
  }

  return null;
}

/** Detect a concrete small-step suggestion Shari made that maps to an in-app tool. */
export function assistantSuggestedAction(
  lastAssistantText: string,
  lockedArtifactType?: string | null,
): AssistedAction | null {
  return filterAssistedActionForArtifact(
    detectAssistedActionUncached(lastAssistantText),
    lockedArtifactType,
  );
}

export function assistedActionHintForChat(
  lastAssistantText: string,
  lockedArtifactType?: string | null,
): string | undefined {
  const action = assistantSuggestedAction(lastAssistantText, lockedArtifactType);
  if (!action) {
    if (lockedArtifactType && isProposalArtifact(lockedArtifactType)) {
      return (
        "LOCKED PROPOSAL: Never suggest drafting an email. Offer to continue the proposal, save it, export to Google Docs (button in Create), or print."
      );
    }
    return undefined;
  }
  return (
    `ASSISTED ACTION (if user agrees): They may accept your suggested step. ` +
    `Do NOT end with encouragement alone. Offer to help execute in-app: "${action.helpMessage.replace(/\*\*/g, "")}" ` +
    `The app will show a button to open ${action.buttonLabel}.`
  );
}
