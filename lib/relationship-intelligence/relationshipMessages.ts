/**
 * Relationship messages — gentle offers and touchpoint suggestions.
 */

import type {
  Relationship,
  RelationshipOffer,
  RelationshipSignalHit,
  RelationshipSignalKind,
  TouchpointKind,
  TouchpointSuggestion,
} from "./types";

const TOUCHPOINTS: Record<RelationshipSignalKind, TouchpointSuggestion[]> = {
  follow_up: [
    {
      kind: "follow_up",
      label: "Follow up",
      gentlePrompt: "A short follow-up when you have a moment — no rush.",
    },
    {
      kind: "check_in",
      label: "Check in",
      gentlePrompt: "A light check-in to keep the thread warm.",
    },
  ],
  should_call: [
    {
      kind: "check_in",
      label: "Check in by phone",
      gentlePrompt: "A brief call when energy allows.",
    },
    {
      kind: "follow_up",
      label: "Follow up",
      gentlePrompt: "Close the loop on what you discussed.",
    },
  ],
  should_email: [
    {
      kind: "follow_up",
      label: "Send a follow-up email",
      gentlePrompt: "A short note — done is better than perfect.",
    },
    {
      kind: "share_update",
      label: "Share an update",
      gentlePrompt: "A quick progress update if it feels right.",
    },
  ],
  promised: [
    {
      kind: "follow_up",
      label: "Honor the promise",
      gentlePrompt: "One small step toward what you said you'd do.",
    },
    {
      kind: "thank_you",
      label: "Send a thank-you",
      gentlePrompt: "Acknowledge their patience if timing slipped.",
    },
  ],
  havent_talked: [
    {
      kind: "check_in",
      label: "Reconnect",
      gentlePrompt: "A low-pressure hello — no catch-up guilt required.",
    },
    {
      kind: "celebrate_milestone",
      label: "Celebrate something",
      gentlePrompt: "Share good news if you have any — a natural opener.",
    },
  ],
  referral: [
    {
      kind: "thank_you",
      label: "Thank the referrer",
      gentlePrompt: "Gratitude for the introduction.",
    },
    {
      kind: "follow_up",
      label: "Follow up on the intro",
      gentlePrompt: "A warm first touch with the new contact.",
    },
  ],
  reconnect: [
    {
      kind: "check_in",
      label: "Check in",
      gentlePrompt: "A simple reconnect message — no need to over-explain the gap.",
    },
    {
      kind: "share_update",
      label: "Share an update",
      gentlePrompt: "What's new on your side, briefly.",
    },
  ],
};

export function touchpointsForSignal(
  kind: RelationshipSignalKind,
): TouchpointSuggestion[] {
  return TOUCHPOINTS[kind] ?? TOUCHPOINTS.follow_up;
}

export function buildRelationshipOffer(
  signal: RelationshipSignalHit,
  mentionCount: number,
  now = new Date(),
): RelationshipOffer {
  let companionOffer: string;
  if (mentionCount >= 2 && signal.extractedName) {
    companionOffer = `You mentioned ${signal.extractedName} several times recently. Would it help if I remembered them?`;
  } else if (signal.kind === "reconnect" || signal.kind === "havent_talked") {
    companionOffer = signal.extractedName
      ? `You said you wanted to reconnect with ${signal.extractedName}. Would you like me to remember them for gentle follow-up later?`
      : "You mentioned wanting to reconnect with someone. Would you like me to remember them?";
  } else if (signal.extractedName) {
    companionOffer = `This sounds like ${signal.extractedName} may be important. Would you like me to remember them?`;
  } else {
    companionOffer =
      "This sounds like someone important. Would you like me to remember them?";
  }

  return {
    signal,
    mentionCount,
    companionOffer,
    suggestedTouchpoints: touchpointsForSignal(signal.kind),
    createdAt: now.toISOString(),
  };
}

export function rememberConfirmation(name: string): string {
  return `I'll remember ${name} — no pressure, just gentle support when you want it.`;
}

export function updateTouchpointForRelationship(
  relationship: Relationship,
): TouchpointSuggestion | null {
  if (relationship.nextSuggestedTouchpoint) {
    return relationship.nextSuggestedTouchpoint;
  }
  return {
    kind: "check_in",
    label: "Check in",
    gentlePrompt: `A light check-in with ${relationship.name} when it feels right.`,
  };
}
