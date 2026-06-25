/**
 * Shari's voice for Clear My Mind™ — warm, grounded, never clinical.
 */

import type { BrainDumpEntry } from "./companionStore";
import type { ThoughtCluster } from "./brainDumpClusterModel";
import { generateMentalLandscapeInsight } from "./mentalLandscapeInsight";

export function shariPermissionLine(): string {
  return "You don't have to organize anything first. Messy is welcome — half sentences, voice notes, whatever comes out.";
}

export function shariReleasePrompt(count: number): string {
  if (count === 0) {
    return "What's taking up space in your head right now?";
  }
  return "Anything else on your mind?";
}

/** Immediate response after Hold this — received, not analyzed. */
export function shariImmediateHoldResponse(parts: string[]): string {
  const words = parts.join(" ").split(/\s+/).filter(Boolean).length;
  if (parts.length === 1 && words <= 14) {
    return "I've got this.";
  }
  if (parts.length === 1) {
    return "That's a lot to carry. I've got it.";
  }
  return "I've got all of this — every piece is held safely.";
}

export const CLEAR_MY_MIND_ACK_CONTINUE_LABEL =
  "See what I'm noticing";

export function shariReceiveAcknowledgment(entries: BrainDumpEntry[]): string {
  const count = entries.length;
  if (count === 0) {
    return "I'm here whenever you're ready.";
  }
  if (count === 1) {
    return "I hear you. That one's held safely now — you don't have to carry it alone anymore.";
  }
  if (count <= 3) {
    return "Thank you for trusting me with this. Every piece is held safely here.";
  }
  if (count <= 6) {
    return "That's a lot to hold in your head. I'm glad you let it out here — it's all safe with me now.";
  }
  return "You carried so much in there. I'm holding all of it now — you can breathe.";
}

export function shariUnderstandingOpener(
  clusters: ThoughtCluster[],
  totalThoughts: number,
): string {
  const insight = generateMentalLandscapeInsight(clusters, totalThoughts);
  return `I'm beginning to see what's here. ${insight}`;
}

export type ClearMyMindChoiceId =
  | "rest"
  | "explore"
  | "focus"
  | "return";

export type ClearMyMindChoice = {
  id: ClearMyMindChoiceId;
  label: string;
  subline: string;
};

export const CLEAR_MY_MIND_CHOICES: ClearMyMindChoice[] = [
  {
    id: "rest",
    label: "Leave it here for now",
    subline: "Relief is enough. I'll keep everything safe.",
  },
  {
    id: "explore",
    label: "Explore one theme",
    subline: "Only if something wants your attention.",
  },
  {
    id: "focus",
    label: "Make one thing today's focus",
    subline: "Just one — not a whole list.",
  },
  {
    id: "return",
    label: "Come back later",
    subline: "This will be here when you need it.",
  },
];

export function shariChoiceReflection(choiceId: ClearMyMindChoiceId): string {
  switch (choiceId) {
    case "rest":
      return "That's enough for today. You did the hard part.";
    case "explore":
      return "We'll take it gently — one thread at a time.";
    case "focus":
      return "One thing. That's all we need right now.";
    case "return":
      return "I'll be here whenever you're ready.";
  }
}
