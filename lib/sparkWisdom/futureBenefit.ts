/**
 * Spec 129 — Future Benefit™
 */

import type { FutureBenefitPlan } from "./types";

export function planFutureBenefit(
  message: string,
  hiddenGoal: string | null,
): FutureBenefitPlan {
  const lower = message.toLowerCase();
  const notes: string[] = [];

  const remember =
    /\b(remember|don't forget|next time|for later)\b/i.test(message) ||
    Boolean(hiddenGoal);
  if (remember) notes.push("Propose memory update after permission — not auto-save");

  const organize =
    /\b(organize|sort|structure|project|plan)\b/i.test(message) ||
    /\b(sop|newsletter|pricing|website|marketing)\b/i.test(message);
  if (organize) notes.push("Quiet link to Business Brain / project — prepare, don't act");

  const connectLater =
    /\b(related|connect|ties to|reminds me)\b/i.test(message) || Boolean(hiddenGoal);
  if (connectLater) notes.push("Note LIG connection opportunity for future retrieval");

  const reduceFutureWork =
    /\b(every time|again and again|repeated|template|automate)\b/i.test(lower) ||
    /\b(sop|process|va)\b/i.test(lower);
  if (reduceFutureWork) notes.push("Frame outcome as less future repetition");

  const preventFrustration =
    /\b(frustrat|tired of|sick of|always happens)\b/i.test(lower);
  if (preventFrustration) {
    notes.push("Name pattern — prevent same frustration tomorrow");
  }

  return {
    remember,
    organize,
    connectLater,
    reduceFutureWork,
    preventFrustration,
    notes,
  };
}
