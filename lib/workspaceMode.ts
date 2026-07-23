// Workspace Mode — the brain. Decides when "doing" beats "talking" and which
// surface should open as Current Focus (collaborative action) vs. take over the
// screen (standalone). Pure logic, no UI — page.tsx wires the layout to this.
//
// Principle: One experience — conversation continues inside the workspace.
// Dual split (chat left / work right) is retired.
//
// Mixed messages ("create a workshop but I'm exhausted") → validate emotion
// first, then offer workspace — never let emotional tools erase concrete work.

import { audioSuggestionLine, detectAudioRequest } from "./audioSuggestions";
import { shouldBlockStressAutoToolRouting } from "./stressRouting";
import { matchCatalogFromText } from "./createCatalog";
import {
  containsVisualStructurePhrase,
  resolveDecisionStructureWorkspaceOffer,
  resolveVisualStructureWorkspaceOffer,
} from "./visualStructureRouting";
import type { AppSection } from "./companionUi";
import { estateCreativeStudioInvite } from "@/lib/estate/estateTransitionInviteCopy";
import { multiItemWorkspaceOfferLine } from "./multiItemWorkspace";
import {
  isExplicitCreationRequest,
  isContentBrainstorming,
  shouldSuppressCreatePending,
} from "./messageClassification";

export const WORKSPACE_SECTIONS: AppSection[] = [
  "projects",
  "my-work",
  "content-generator",
  "google-workspace",
  "templates-library",
  "saved-work",
  "playbook",
  "how-do-i",
  "time-block",
  "email-generator",
  "snippets",
  "business-profile",
  "client-avatars",
  "decision-compass",
  "today",
  "wins-this-week",
  "evidence-bank",
  "growth",
  "confidence-vault",
  "growth-journal",
  "growth-greenhouse",
  "growth-portfolio",
  "visual-focus",
  "welcome-room",
];

export const STANDALONE_SECTIONS: AppSection[] = [
  "brain-dump",
  "life-experience",
  "the-gallery",
  "plan-my-day",
  "breathe",
  "focus",
  "focus-audio",
  "activities",
  "guided-exercises",
  "spin-wheel",
  "focus-timer",
  "energy",
  "user-memory",
];

export function supportsWorkspace(section: AppSection): boolean {
  return WORKSPACE_SECTIONS.includes(section);
}

export const WORKSPACE_TITLES: Partial<Record<AppSection, string>> = {
  projects: "Chamber of Momentum",
  "my-work": "Other",
  "content-generator": "Create",
  "google-workspace": "Google Workspace",
  "templates-library": "Templates",
  "saved-work": "Created Content",
  playbook: "Strategy Chamber",
  "how-do-i": "How Do I",
  "momentum-institute": "Chamber of Momentum",
  "chamber-of-momentum": "Chamber of Momentum",
  "chamber-project-entry": "Chamber of Momentum",
  "project-homes": "Projects",
  "brain-dump": "Clear My Mind",
  "time-block": "Calendar",
  "email-generator": "Email",
  snippets: "Snippets",
  "business-profile": "Business Profile",
  "client-avatars": "Audience Profile",
  "decision-compass": "Decision Compass",
  today: "Today",
  "plan-my-day": "Plan My Day",
  "visual-focus": "Visual Thinking",
  "wins-this-week": "Celebration Garden",
  "evidence-bank": "Evidence Vault",
  growth: "Your Story",
  "growth-capture": "Capture a Moment",
  "growth-library": "Achievement Library",
  "growth-reports": "Celebration Room",
  "confidence-vault": "Highlights",
  "my-journey": "Wins Timeline",
  "growth-journal": "Journal Gazebo",
  "growth-greenhouse": "Growth Greenhouse",
  "growth-portfolio": "Hall of Accomplishments",
  "user-memory": "Memory",
  "welcome-room": "Welcome Room",
  "life-experience": "Life Experience Room",
  "the-gallery": "Asset Library",
  "focus-audio": "Peaceful Moments",
  "focus-timer": "Focus",
  settings: "Settings",
  profile: "Profile",
  focus: "Focus",
  progress: "Progress",
  activities: "Activities",
};

const EXTRA_AREA_TITLES: Partial<Record<AppSection, string>> = {
  home: "Chat",
  settings: "Settings",
  profile: "Profile",
  focus: "Focus",
  progress: "Progress",
  energy: "Today's Reality",
  activities: "Activities",
  "guided-exercises": "Guided Exercises",
  "spin-wheel": "Spin Wheel",
  games: "Quick Recharge",
  "quick-recharge": "Quick Recharge",
  grow: "Grow",
  "momentum-builder": "Chamber of Momentum",
  "grow-momentum-builders": "Chamber of Momentum",
  "goals-projects": "Chamber of Momentum",
  "grow-spark-cards": "Spark Cards",
  "grow-guilds": "Guilds",
  "grow-daily-discoveries": "Daily Discoveries",
  "grow-business-history": "Business History Today",
  "grow-observatory": "Observatory",
  "content-types": "Content Types",
  breathe: "Breathe",
};

function humanizeSectionId(section: AppSection): string {
  return section
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** User-facing name for any ecosystem area — never returns the word "Workspace". */
export function workspaceAreaTitle(section: AppSection): string {
  return (
    WORKSPACE_TITLES[section] ??
    EXTRA_AREA_TITLES[section] ??
    humanizeSectionId(section)
  );
}

export function workspaceTitle(section: AppSection): string {
  return workspaceAreaTitle(section);
}

import { WORKSPACE_OBJECT_ID, workspaceObjectId } from "./workspaceObjectIds";

export { workspaceObjectId, WORKSPACE_OBJECT_ID };

/** @deprecated Use workspaceObjectId() and CompanionObjectVisual — emoji removed from features. */
export const WORKSPACE_EMOJI: Partial<Record<AppSection, string>> = {};

export type WorkspaceOffer = {
  section: AppSection;
  buttonLabel: string;
  line: string;
  visualFocusMode?: import("./visualFocus/types").VisualFocusMode;
  /** Momentum Institute — Estate Intelligence opens a specific drawer */
  instituteDrawerId?: string;
  /** Chamber of Momentum — open a specific Chamber member immediately */
  chamberMemberId?: import("./chamber/chamberMemberRegistry").ChamberMemberId;
  /** Global Estate menu overlay — profile, settings, etc. */
  estateMenuActionId?: import("@/lib/estateMenu/menuConfig").EstateMenuActionId;
  secondary?: {
    section: AppSection;
    buttonLabel: string;
  };
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
  const visualOffer = resolveVisualStructureWorkspaceOffer(t);
  if (visualOffer) {
    return {
      section: visualOffer.section,
      buttonLabel: "Open Visual Thinking",
      topic: visualOffer.visualFocusMode ?? visualOffer.section,
      topicLabel: "Visual Thinking",
    };
  }
  const decisionOffer = resolveDecisionStructureWorkspaceOffer(t);
  if (decisionOffer) {
    return {
      section: decisionOffer.section,
      buttonLabel: "Open Decision Compass",
      topic: decisionOffer.section,
      topicLabel: "Decision Compass",
    };
  }

  const catalog = matchCatalogFromText(t);
  if (catalog?.route) {
    return {
      section: catalog.route,
      buttonLabel: "Open Workspace",
      topic: catalog.route,
      topicLabel: workspaceTitle(catalog.route),
    };
  }
  if (catalog?.type) {
    return {
      section: "content-generator",
      buttonLabel: "Let's Create",
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
      buttonLabel: "Open Create",
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
      buttonLabel: "Open Template",
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
      buttonLabel: "Open Calendar",
      topic: "plan",
      topicLabel: "plan",
    };
  }
  if (/\b(brain dump|clear my (head|mind)|get it (all )?out|dump)\b/.test(t)) {
    return {
      section: "brain-dump",
      buttonLabel: "Open Clear My Mind",
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
      return estateCreativeStudioInvite();
    }
    if (target.section === "templates-library") {
      return "I can open a template and we'll work through it together — want to?";
    }
    if (target.section === "time-block") {
      return "Want to open the planner and map it out together?";
    }
    if (target.section === "brain-dump") {
      return multiItemWorkspaceOfferLine("brain-dump");
    }
    return "Would it help if we worked on that together in the workspace?";
  }

  if (target.topic === "workshop") {
    return (
      "This workshop feels big, and your energy is low. " +
      "I can open your workshop workspace and walk you through one small field at a time. " +
      "Would you like to build it together?"
    );
  }

  const feelsBig =
    target.section === "content-generator"
      ? `the ${target.topicLabel} feels big`
      : `the ${target.topicLabel} feels big`;

  return (
    `It sounds like ${feelsBig} and your energy is low. Let's make it smaller. ` +
    `Would it help if we stepped into the workspace together, one piece at a time?`
  );
}

export function detectAudioIntent(text: string): WorkspaceOffer | null {
  if (shouldBlockStressAutoToolRouting(text)) return null;
  const { isAudio, categoryId } = detectAudioRequest(text);
  if (!isAudio) return null;
  return {
    section: "focus-audio",
    buttonLabel: "Open Peaceful Moments",
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
      "This workshop feels big, and your energy is low. " +
      "I can open your workshop workspace and walk you through one small field at a time.\n\n" +
      "Would you like to build it together?"
    );
  }
  if (mixed) {
    return `${offer.line}\n\nWould you like to build it together?`;
  }
  if (offer.section === "projects" && /\bworkshop\b/i.test(userText)) {
    return (
      "This sounds like something we can build together. " +
      "Would you like me to open your workshop workspace and walk through it one step at a time?"
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
    `Then invite them into the living workspace together (066 — never promise dual split layout). ` +
    `Do NOT suggest jotting down, brainstorming, writing one idea, or any generic small step in chat. ` +
    `Do NOT give competing instructions before the workspace offer. ` +
    `If CURRENT WORKSPACE is already provided above, do NOT offer to open it — guide what is on screen.`
  );
}
