/**
 * Recognition Intelligence — evaluates today's single recognition moment.
 * Delegates queue building and priority to recognitionQueue.ts.
 */

import { pickRotatingMessage } from "./messageLibrary";
import { getRecognitionStore } from "./recognitionStore";
import {
  buildRecognitionQueue,
  pickTodaysRecognition,
} from "./recognitionQueue";
import type {
  CelebrationMode,
  RecognitionContext,
  RecognitionEvent,
  RecognitionMoment,
  RecognitionPlannedEffect,
} from "./types";

function titleForEvent(event: RecognitionEvent): string {
  switch (event.type) {
    case "birthday":
      return "Happy birthday";
    case "anniversary":
      return "Anniversary";
    case "membership_anniversary":
      return "App anniversary";
    case "vacation_countdown":
      return "Coming up";
    case "business_milestone":
    case "project_milestone":
      return "Milestone";
    case "conversation_milestone":
      return "A moment worth noting";
    case "custom_event":
      return "For you";
    default:
      return "For you";
  }
}

/** Full mode's visual per event type — Settings promises "confetti, candles, or banners". */
function plannedEffectForEvent(
  event: RecognitionEvent,
): RecognitionPlannedEffect {
  switch (event.type) {
    case "birthday":
      return "birthday_cake";
    case "anniversary":
    case "membership_anniversary":
      return "confetti";
    case "business_milestone":
    case "project_milestone":
      return "fireworks";
    case "vacation_countdown":
      return "balloons";
    case "conversation_milestone":
    case "custom_event":
    default:
      return "celebration_banner";
  }
}

/**
 * Returns the single highest-priority recognition moment for today, or null.
 * Full mode plans a visual effect (rendered by CelebrationEffects); Simple
 * mode is message-only (plannedEffect stays null); Off returns no moment.
 */
export function evaluateRecognitionMoment(
  ctx: RecognitionContext = {},
): RecognitionMoment | null {
  const store = getRecognitionStore();
  const celebrationMode: CelebrationMode =
    ctx.celebrationMode ?? store.celebrationMode ?? "full";
  if (celebrationMode === "off") return null;

  const queue = buildRecognitionQueue(ctx);
  const pick = pickTodaysRecognition(queue, ctx.now);
  if (!pick) return null;

  const year = (ctx.now ?? new Date()).getFullYear();
  const rotationKey = `${pick.milestoneKey}:${year}`;
  const message = pickRotatingMessage(
    pick.messageCategory,
    rotationKey,
    pick.messageVars ?? {},
  );

  return {
    id: pick.id,
    type: pick.type,
    milestoneKey: pick.milestoneKey,
    title: titleForEvent(pick),
    message,
    shariState: pick.shariState,
    plannedEffect:
      celebrationMode === "full" ? plannedEffectForEvent(pick) : null,
    celebrationMode,
  };
}

/** Build context from companion store snapshots. */
export function buildRecognitionContext(input: {
  now?: Date;
  userName?: string;
  memberSinceIso?: string | null;
  conversationCount?: number;
  projectCount?: number;
  completedProjectCount?: number;
  hasCreatedContent?: boolean;
}): RecognitionContext {
  const store = getRecognitionStore();
  return {
    now: input.now,
    celebrationMode: store.celebrationMode,
    userName: input.userName,
    birthday: store.birthday,
    personalDates: store.personalDates,
    memberSinceIso: input.memberSinceIso,
    conversationCount: input.conversationCount,
    projectCount: input.projectCount,
    completedProjectCount: input.completedProjectCount,
    hasCreatedContent: input.hasCreatedContent,
    businessMilestones: store.businessMilestones,
  };
}
