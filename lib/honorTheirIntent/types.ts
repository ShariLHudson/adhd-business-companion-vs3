/**
 * Honor Their Intent™ — meet people where they are.
 * @see docs/companion-homestead/HONOR_THEIR_INTENT.md
 */

export const GUEST_ARRIVAL_MODES = [
  "come_to_work",
  "come_to_be_helped",
  "unclear",
] as const;

export type GuestArrivalMode = (typeof GUEST_ARRIVAL_MODES)[number];

export type HonorResponseStyle = "collaborator" | "companion" | "listen_first";

export type HonorTheirIntentInput = {
  userText?: string | null;
  overwhelmed?: boolean;
  /** Prior turn was productive work — enables gentle-awareness shift */
  sessionWasWork?: boolean;
};

export type HonorTheirIntentVerdict = {
  arrivalMode: GuestArrivalMode;
  responseStyle: HonorResponseStyle;
  /** Protect ADHD momentum — no emotional detours */
  honorMomentum: boolean;
  suppressEmotionalDetour: boolean;
  beginImmediately: boolean;
  stayInLivingRoom: boolean;
  /** Working session — only pause when need emerges naturally */
  gentleAwarenessOnly: boolean;
  /** Need emerged mid-work — caring pause now appropriate */
  emergentNeedDetected: boolean;
  /** Natural flow shift from work to conversation */
  flowShift: boolean;
  suggestedOpening: string | null;
  constitutionalPrinciple: typeof HONOR_THEIR_INTENT_PRINCIPLE;
};

export const HONOR_THEIR_INTENT_PRINCIPLE =
  "Meet them where they are — the guest chooses the door." as const;
