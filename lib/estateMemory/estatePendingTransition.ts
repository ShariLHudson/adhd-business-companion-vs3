/**
 * Estate Pending Transition™ — permission-to-enter another room without losing intent.
 * When Spark asks "Would you like me to take us there?" the original goal stays queued.
 */

import type { AppSection } from "@/lib/companionUi";
import { estateRegistryEntryById } from "@/lib/estateIntelligence/estateRegistry";
import { getEstateRoomById } from "@/lib/estate/estateRoomRegistry";
import {
  estateDirectCommandArrivalLine,
  isDirectEstateRoomRequest,
} from "@/lib/estateIntelligence/estateCommandRouter";
import {
  estateEntryIdForSection,
  estateRoomDisplayName,
} from "./estateSectionMap";

const STORAGE_KEY = "spark:estate:pending-transition:v1";

export type EstatePendingTransition = {
  destinationEntryId: string;
  destinationSection: AppSection;
  originalUserIntent: string;
  followUpQuestion?: string;
  invitationLine?: string;
  offeredAtTurn: number;
  savedAt: string;
};

export function saveEstatePendingTransition(
  transition: EstatePendingTransition,
): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(transition));
  } catch {
    /* ignore */
  }
}

export function loadEstatePendingTransition(): EstatePendingTransition | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as EstatePendingTransition;
  } catch {
    return null;
  }
}

export function clearEstatePendingTransition(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function registerEstatePendingTransition(input: {
  destinationSection: AppSection;
  originalUserIntent: string;
  offeredAtTurn: number;
  destinationEntryId?: string;
  invitationLine?: string;
  /** Pass `false` to skip clarifying follow-up (direct room commands). */
  followUpQuestion?: string | false;
}): EstatePendingTransition {
  const intent = input.originalUserIntent.trim();
  const entryId =
    input.destinationEntryId ??
    estateEntryIdForSection(input.destinationSection) ??
    input.destinationSection;
  const pending: EstatePendingTransition = {
    destinationEntryId: entryId,
    destinationSection: input.destinationSection,
    originalUserIntent: intent,
    followUpQuestion:
      input.followUpQuestion === false
        ? undefined
        : (input.followUpQuestion ??
          inferEstateFollowUpQuestion(entryId, intent)),
    invitationLine: input.invitationLine,
    offeredAtTurn: input.offeredAtTurn,
    savedAt: new Date().toISOString(),
  };
  saveEstatePendingTransition(pending);
  return pending;
}

const ESTATE_OFFER_ALIGN_RE =
  /\b(?:take (?:us|you|me) (?:there|to)|go there together|head there together|step into|head there|go there|explore (?:them|it) together|visit the|shall we|creative studio|momentum institute|observatory|decision compass|peaceful places?|growth journal|momentum builder|clear my mind|journal gazebo|reading nook|greenhouse)\b/i;

const ESTATE_NAVIGATION_INVITE_RE =
  /\b(?:take (?:us|you|me) (?:there|to)|go to|visit the|head to|step into|open the|we could visit|would you like to go to|would you like me to take (?:us|you|me) to|want to go there together|head there together)\b/i;

const ESTATE_NAMED_PLACE_RE =
  /\b(?:journal gazebo|reading nook|greenhouse|observatory|creative studio|momentum institute|decision compass|peaceful places?|clear my mind|momentum builder|growth journal|library|conservatory|back deck|coffee house|music room|celebration room|seat at the pond|garden path)\b/i;

export function isEstateTransitionOfferMessage(assistantText: string): boolean {
  const t = assistantText.trim();
  if (!t) return false;

  const hasPlaceOrNavigation =
    ESTATE_NAMED_PLACE_RE.test(t) || ESTATE_NAVIGATION_INVITE_RE.test(t);
  if (!hasPlaceOrNavigation) return false;

  return (
    ESTATE_OFFER_ALIGN_RE.test(t) ||
    ESTATE_NAVIGATION_INVITE_RE.test(t) ||
    /\b(?:shall we|explore (?:them|it) together)\b/i.test(t)
  );
}

export function isEstateTransitionPendingExpired(
  pending: EstatePendingTransition,
  currentTurn: number,
  turnLimit = 3,
): boolean {
  return currentTurn - pending.offeredAtTurn > turnLimit;
}

function inferArtifactPhrase(userIntent: string): string | null {
  const t = userIntent.toLowerCase();
  if (/\bnewsletter\b/.test(t)) return "your newsletter";
  if (/\b(?:email|e-mail)\b/.test(t)) return "this email";
  if (/\bblog\s*post\b/.test(t)) return "your blog post";
  if (/\bpresentation\b/.test(t)) return "your presentation";
  if (/\bworkshop\b/.test(t)) return "your workshop";
  if (/\b(?:social|linkedin|facebook|instagram)\s+post\b/.test(t)) {
    return "your post";
  }
  if (/\bpost\b/.test(t)) return "your post";
  return null;
}

export function inferEstateFollowUpQuestion(
  entryId: string,
  userIntent: string,
): string {
  const t = userIntent.toLowerCase();

  switch (entryId) {
    case "creative-studio": {
      if (/\bnewsletter\b/.test(t)) return "Who are you writing it for?";
      if (/\b(?:email|e-mail)\b/.test(t)) return "Who is this email for?";
      if (/\bblog\b/.test(t)) {
        return "What's the main idea you want readers to walk away with?";
      }
      if (/\bworkshop\b/.test(t)) return "Who is this workshop for?";
      return "What are we creating together?";
    }
    case "library":
    case "observatory":
      if (/\bmarketing\b/.test(t)) {
        return "What part of marketing feels most useful to explore first?";
      }
      return "What would you like to understand better?";
    case "decision-compass":
      return "What's the choice sitting in front of you?";
    case "growth-journal":
      return "What's worth capturing while it's fresh?";
    case "peaceful-places":
    case "soundscapes-focus-audio":
      if (/\b(?:music|audio|sound)\b/.test(t)) {
        return "Rain, hearth, morning light — what kind of calm sounds right?";
      }
      return "What kind of calm would help most right now?";
    case "momentum-builder":
      return "What's the one thing that would make today feel a little easier?";
    case "clear-my-mind":
      return "What's crowding your head most right now?";
    default:
      return "What would you like to do next?";
  }
}

export function buildEstateArrivalContinuation(
  pending: EstatePendingTransition,
): string {
  if (isDirectEstateRoomRequest(pending.originalUserIntent)) {
    return estateDirectCommandArrivalLine(pending.destinationEntryId);
  }

  const room =
    getEstateRoomById(pending.destinationEntryId)?.trademark ??
    estateRegistryEntryById(pending.destinationEntryId)?.name ??
    estateRoomDisplayName(pending.destinationEntryId);
  const followUp =
    pending.followUpQuestion ??
    inferEstateFollowUpQuestion(
      pending.destinationEntryId,
      pending.originalUserIntent,
    );

  const artifact = inferArtifactPhrase(pending.originalUserIntent);

  if (pending.destinationEntryId === "creative-studio" && artifact) {
    const verb = /\bwrite|writing|draft\b/i.test(pending.originalUserIntent)
      ? "write"
      : "create";
    return [
      `Welcome to the ${room}.`,
      `Let's ${verb} ${artifact} together.`,
      followUp,
    ].join("\n\n");
  }

  if (pending.destinationEntryId === "library") {
    return [
      `We're in the ${room} now — same conversation, just surrounded by good resources.`,
      followUp,
    ].join("\n\n");
  }

  if (pending.destinationEntryId === "observatory") {
    return [
      `Welcome to the ${room}.`,
      `Let's gather what we need on this together.`,
      followUp,
    ].join("\n\n");
  }

  if (pending.destinationEntryId === "decision-compass") {
    return [
      `We're in the ${room} now.`,
      `Let's talk this through calmly.`,
      followUp,
    ].join("\n\n");
  }

  if (
    pending.destinationEntryId === "peaceful-places" ||
    pending.destinationEntryId === "soundscapes-focus-audio"
  ) {
    return [
      `We're in ${room} now — same conversation, softer surroundings.`,
      followUp,
    ].join("\n\n");
  }

  if (pending.destinationEntryId === "growth-journal") {
    return [
      `We're in your ${room} together.`,
      followUp,
    ].join("\n\n");
  }

  if (pending.destinationEntryId === "momentum-builder") {
    return [
      `Welcome to the ${room}.`,
      `Let's find one honest next step.`,
      followUp,
    ].join("\n\n");
  }

  return [
    `We're in ${room} now — same conversation, just a different place.`,
    followUp,
  ].join("\n\n");
}

export function estateTransitionAckForSection(
  section: AppSection,
  userIntent?: string,
): string {
  const pending = loadEstatePendingTransition();
  if (
    pending &&
    pending.destinationSection === section &&
    pending.originalUserIntent.trim()
  ) {
    return buildEstateArrivalContinuation(pending);
  }
  if (userIntent?.trim()) {
    const entryId = estateEntryIdForSection(section);
    if (entryId) {
      return buildEstateArrivalContinuation({
        destinationEntryId: entryId,
        destinationSection: section,
        originalUserIntent: userIntent.trim(),
        offeredAtTurn: 0,
        savedAt: new Date().toISOString(),
      });
    }
  }
  const entryId = estateEntryIdForSection(section);
  const room =
    getEstateRoomById(entryId ?? "")?.trademark ??
    (entryId ? estateRoomDisplayName(entryId) : "this room");
  if (userIntent?.trim() && isDirectEstateRoomRequest(userIntent)) {
    const resolvedId =
      loadEstatePendingTransition()?.destinationEntryId ?? entryId ?? section;
    return estateDirectCommandArrivalLine(resolvedId);
  }
  return `We're in ${room} now — same conversation, just a different place. What would you like to do next?`;
}
