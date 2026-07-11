/**
 * Intentional Restoration — Estate Guide as restorative experience.
 * @see docs/estate/ESTATE_RESTORATION_GUIDE.md
 */

export type RestorationTrigger =
  | "mental_fatigue"
  | "frustration"
  | "stuck"
  | "revision_loop"
  | "decision_fatigue"
  | "cognitive_overload"
  | "natural_pause"
  | "extended_work";

export type RestorationDeliveryMode = "offer" | "tell_inline" | "open_guide";

export type EstateGuideStoryPick = {
  spreadId: string;
  title: string;
  placeId: string | null;
  teaser: string;
  /** 1–2 pages told conversationally in chat */
  conversationalSnippet: string;
  blockType: string;
  reason: string;
};

export type RestorationEvaluation = {
  shouldOffer: boolean;
  trigger: RestorationTrigger;
  confidence: "low" | "medium" | "high";
  story: EstateGuideStoryPick;
  deliveryMode: RestorationDeliveryMode;
  returnContextLabel: string | null;
};

export type RestorationOfferChoice =
  | "Tell me the story"
  | "Open the Guide"
  | "Stay with work"
  | "I'd love to read more";

export type RestorationOfferResult = {
  intro: string;
  invitation: string;
  story: EstateGuideStoryPick;
  trigger: RestorationTrigger;
  deliveryMode: RestorationDeliveryMode;
  responseHint: string;
  choices: readonly RestorationOfferChoice[];
};

export type RestorationReturnResult = {
  welcomeBack: string;
  reconnectQuestion: string;
  responseHint: string;
};

export type RestorationSessionStore = {
  version: 1;
  readSpreadIds: string[];
  favoriteSpreadIds: string[];
  declinedAtTurns: number[];
  lastOfferAtTurn: number | null;
  lastOfferAt: string | null;
  lastOfferedSpreadId?: string | null;
  pendingReturn?: {
    taskLabel: string;
    spreadId: string;
    offeredAtTurn: number;
  };
};

export type RestorationInput = {
  userText: string;
  currentTurn?: number;
  emotionalState?: string | null;
  overwhelmed?: boolean;
  workspace?: string | null;
  estatePlaceId?: string | null;
  lastAssistantText?: string | null;
};
