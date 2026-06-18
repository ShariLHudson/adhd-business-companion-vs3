// Workspace Mode — the brain. Decides when "doing" beats "talking" and which
// surface should open BESIDE chat (collaborative action) vs. take over the
// screen (standalone). Pure logic, no UI — page.tsx wires the layout to this.
//
// Principle: Chat + Doing, not Chat → Tool → Chat → Tool. The conversation
// stays alive while the work happens.
//
// Mixed messages ("create a workshop but I'm exhausted") → validate emotion
// first, then offer workspace — never let emotional tools erase concrete work.

import { audioSuggestionLine, detectAudioRequest } from "./audioSuggestions";
import { matchCatalogFromText } from "./createCatalog";
import type { AppSection } from "./companionUi";
import { multiItemWorkspaceOfferLine } from "./multiItemWorkspace";
import {
  isExplicitCreationRequest,
  isContentBrainstorming,
  shouldSuppressCreatePending,
} from "./messageClassification";

export const WORKSPACE_SECTIONS: AppSection[] = [
  "projects",
  "content-generator",
  "google-workspace",
  "templates-library",
  "saved-work",
  "playbook",
  "how-do-i",
  "brain-dump",
  "time-block",
  "email-generator",
  "snippets",
  "business-profile",
  "client-avatars",
];

export const STANDALONE_SECTIONS: AppSection[] = [
  "breathe",
  "focus-audio",
  "activities",
  "spin-wheel",
  "focus-timer",
  "energy",
];

export function supportsWorkspace(section: AppSection): boolean {
  return WORKSPACE_SECTIONS.includes(section);
}

export const WORKSPACE_TITLES: Partial<Record<AppSection, string>> = {
  projects: "Projects",
  "content-generator": "Create",
  "google-workspace": "Google Workspace",
  "templates-library": "Templates",
  "saved-work": "Saved Work",
  playbook: "Strategies",
  "how-do-i": "How Do I",
  "brain-dump": "Clear My Mind",
  "time-block": "Momentum Appointments",
  "email-generator": "Email",
  snippets: "Snippets",
  "business-profile": "Business Profile",
  "client-avatars": "Client Avatar",
  "focus-audio": "Focus Audio",
  activities: "Help Me Right Now",
};

export function workspaceTitle(section: AppSection): string {
  return WORKSPACE_TITLES[section] ?? "Workspace";
}

export const WORKSPACE_EMOJI: Partial<Record<AppSection, string>> = {
  projects: "📁",
  "content-generator": "✨",
  "google-workspace": "📝",
  "templates-library": "📚",
  "saved-work": "📂",
  playbook: "📘",
  "brain-dump": "🧠",
  "time-block": "📅",
  "email-generator": "✉️",
  snippets: "📝",
  "business-profile": "💼",
  "client-avatars": "👤",
  "focus-audio": "🎧",
};

export type WorkspaceOffer = {
  section: AppSection;
  buttonLabel: string;
  line: string;
};

const DOING_VERB_RE =
  /\b(build|building|create|creating|make|making|write|writing|draft|drafting|outline|plan|planning|prepare|preparing|prep|prepping|organi[sz]e|organi[sz]ing|set up|put together|work on|map out|break (it |this )?down|schedule|time ?block|need to|want to|have to)\b/i;

const CONCRETE_OBJECT_RE =
  /\b(workshop|webinar|launch|course|program|workflow|project|email|post|caption|content|newsletter|script|copy|sales page|landing page|template|outline|framework|proposal|lead magnet|workbook|funnel|podcast|blog|article|offer|pricing page|video script|presentation|deck|slides|curriculum|masterclass|sop|checklist|avatar|business plan|marketing plan|google doc|ghl|claude prompt)\b/i;

const EMOTIONAL_BARRIER_RE =
  /\b(overwhelmed|anxious|exhausted|low energy|no energy|don'?t have (the )?energy|tired|stuck|can'?t start|don'?t know where to start|too much|scared|worried|drained|no motivation|freeze|frozen|paralyz|procrastinat)\b/i;

type WorkspaceTarget = {
  section: AppSection;
  buttonLabel: string;
  topic: string;
  topicLabel: string;
};

/** True when the user named a concrete thing to build — workspace beats Get Unstuck. */
export function hasConcreteWorkspaceTarget(text: string): boolean {
  return matchWorkspaceTarget(text.trim().toLowerCase()) !== null;
}

export function hasEmotionalBarrier(text: string): boolean {
  return EMOTIONAL_BARRIER_RE.test(text.trim().toLowerCase());
}

function matchWorkspaceTarget(t: string): WorkspaceTarget | null {
  const catalog = matchCatalogFromText(t);
  if (catalog?.route) {
    return {
      section: catalog.route,
      buttonLabel: "Open & Keep Chatting",
      topic: catalog.route,
      topicLabel: workspaceTitle(catalog.route),
    };
  }
  if (catalog?.type) {
    return {
      section: "content-generator",
      buttonLabel: "Open Create & Keep Chatting",
      topic: catalog.type.toLowerCase(),
      topicLabel: catalog.type,
    };
  }

  if (/\b(workshop|webinar|launch|course|program|workflow|project)\b/.test(t)) {
    const topic = t.match(
      /\b(workshop|webinar|launch|course|program|workflow|project)\b/,
    )?.[1];
    const label =
      topic === "workshop"
        ? "Workshop Project"
        : topic
          ? topic.charAt(0).toUpperCase() + topic.slice(1)
          : "Project";
    return {
      section: "projects",
      buttonLabel: "Build This Together",
      topic: topic ?? "project",
      topicLabel: label,
    };
  }
  if (
    /\b(email|post|caption|content|newsletter|script|copy|sales page|landing page|blog|article|video script)\b/.test(
      t,
    )
  ) {
    const topic =
      t.match(
        /\b(email|post|caption|content|newsletter|script|copy|sales page|landing page|blog|article|video script)\b/,
      )?.[1] ?? "content";
    return {
      section: "content-generator",
      buttonLabel: "Open Create & Keep Chatting",
      topic,
      topicLabel: topic,
    };
  }
  if (/\b(template|outline|framework|deck|slides|presentation|curriculum)\b/.test(t)) {
    const topic =
      t.match(
        /\b(template|outline|framework|deck|slides|presentation|curriculum)\b/,
      )?.[1] ?? "template";
    return {
      section: "templates-library",
      buttonLabel: "Open Template & Keep Chatting",
      topic,
      topicLabel: topic,
    };
  }
  if (
    /\b(time ?block|schedule|calendar|plan (my|the) (day|week)|weekly plan)\b/.test(
      t,
    )
  ) {
    return {
      section: "time-block",
      buttonLabel: "Open Momentum Appointments",
      topic: "plan",
      topicLabel: "plan",
    };
  }
  if (/\b(brain dump|clear my (head|mind)|get it (all )?out|dump)\b/.test(t)) {
    return {
      section: "brain-dump",
      buttonLabel: "Open Clear My Mind & Keep Chatting",
      topic: "thoughts",
      topicLabel: "thoughts",
    };
  }
  return null;
}

function hasSchedulingIntent(t: string): boolean {
  return /\b(time ?block|schedule|calendar|plan (?:my|the) (?:day|week)|block out|focused time|weekly plan)\b/i.test(
    t,
  );
}

function hasDoingIntent(t: string): boolean {
  if (isContentBrainstorming(t) && !isExplicitCreationRequest(t)) {
    return false;
  }
  if (shouldSuppressCreatePending(t) && !isExplicitCreationRequest(t)) {
    return false;
  }
  if (hasSchedulingIntent(t)) return true;
  if (/\b(brain dump|clear my (?:head|mind)|get it (?:all )?out)\b/i.test(t)) {
    return true;
  }
  return DOING_VERB_RE.test(t) && CONCRETE_OBJECT_RE.test(t);
}

function buildOfferLine(target: WorkspaceTarget, mixed: boolean): string {
  if (!mixed) {
    if (target.section === "projects" && target.topic === "workshop") {
      return (
        "This sounds like something we can build together. " +
        "Would you like me to open Workshop Builder and walk through it one step at a time?"
      );
    }
    if (target.section === "projects") {
      return "Want me to open the project so we can build it together, one section at a time?";
    }
    if (target.section === "content-generator") {
      return "Want me to open Create so we can write it together?";
    }
    if (target.section === "templates-library") {
      return "I can open a template and we'll work through it together — want to?";
    }
    if (target.section === "time-block") {
      return "Want to open the planner and map it out side-by-side?";
    }
    if (target.section === "brain-dump") {
      return multiItemWorkspaceOfferLine("brain-dump");
    }
    return "Would it help if we worked on that together, side-by-side?";
  }

  if (target.topic === "workshop") {
    return (
      "This workshop feels big, and your energy is low. We don't need to figure it all out in chat. " +
      "I can open a Workshop Builder and walk you through one small field at a time. " +
      "Would you like to build it together?"
    );
  }

  const feelsBig =
    target.section === "content-generator"
      ? `the ${target.topicLabel} feels big`
      : `the ${target.topicLabel} feels big`;

  return (
    `It sounds like ${feelsBig} and your energy is low. Let's make it smaller. ` +
    `Would it help if I opened this beside our chat so we can work on it together, one piece at a time?`
  );
}

export function detectAudioIntent(text: string): WorkspaceOffer | null {
  const { isAudio, categoryId } = detectAudioRequest(text);
  if (!isAudio) return null;
  return {
    section: "focus-audio",
    buttonLabel: "Open Focus Audio",
    line: audioSuggestionLine(categoryId),
  };
}

export function detectDoingIntent(text: string): WorkspaceOffer | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;

  // Audio requests route straight to Focus Audio (no conversational substitute).
  const audio = detectAudioIntent(t);
  if (audio) return audio;

  const target = matchWorkspaceTarget(t);
  if (!target || !hasDoingIntent(t)) return null;

  const mixed = hasEmotionalBarrier(t);

  return {
    section: target.section,
    buttonLabel: target.buttonLabel,
    line: buildOfferLine(target, mixed),
  };
}

/** Deterministic opening line when workspace offer is detected — no generic advice first. */
export function buildWorkspaceOfferChatReply(
  offer: WorkspaceOffer,
  userText: string,
): string {
  const mixed = hasEmotionalBarrier(userText);
  if (mixed && offer.section === "projects" && /\bworkshop\b/i.test(userText)) {
    return (
      "This workshop feels big, and your energy is low. We don't need to figure it all out in chat. " +
      "I can open a Workshop Builder and walk you through one small field at a time.\n\n" +
      "Would you like to build it together?"
    );
  }
  if (mixed) {
    return `${offer.line}\n\nWould you like to build it together?`;
  }
  if (offer.section === "projects" && /\bworkshop\b/i.test(userText)) {
    return (
      "This sounds like something we can build together. " +
      "Would you like me to open Workshop Builder and walk through it one step at a time?"
    );
  }
  return `${offer.line}`;
}

/** Nudge the model when local reply is not used. */
export function workspaceOfferHintForChat(offer: WorkspaceOffer): string {
  return (
    `WORKSPACE OFFER (handled in UI — do NOT name buttons): ` +
    `A "${offer.buttonLabel}" option will appear below your reply. ` +
    `Validate how they feel in 1–2 warm sentences ONLY. ` +
    `Then offer working side-by-side in the workspace — do NOT suggest jotting down, brainstorming, writing one idea, or any generic small step in chat. ` +
    `Do NOT give competing instructions before the workspace offer. ` +
    `If CURRENT WORKSPACE is already provided above, do NOT offer to open it — guide what is on screen.`
  );
}
