/**
 * Decision tool routing — ADHD Decision Compass vs Quick Two Option Choice.
 */

import { getActivityById } from "./companionActivities";
import { stepInstruction } from "./activityFields";
import type { HelpMeRightNowMenuItem } from "./focusToolDefinitions";
import { HELP_ME_RIGHT_NOW_MENU } from "./focusToolDefinitions";
import { guidedExerciseMenu } from "./guidedExercises";
import {
  isDecisionCompassOfferSignal,
  isExplicitDecisionCompassRequest,
} from "./decisionCompassRouting";
import { bestHowDoIMatch } from "./howDoIContent";
import {
  decisionCompassOpensBesideChat,
  DECISION_COMPASS_SPLIT_SECTION,
} from "./decisionCompassSessionAuthority";

export const DECISION_COMPASS_ACTIVITY_ID = "decision-compass";
export const QUICK_TWO_OPTION_ACTIVITY_ID = "two-option";

export function isDecisionCompassActivityId(activityId: string): boolean {
  return activityId === DECISION_COMPASS_ACTIVITY_ID;
}

export function isQuickTwoOptionActivityId(activityId: string): boolean {
  return activityId === QUICK_TWO_OPTION_ACTIVITY_ID;
}

export function helpMeRightNowDecisionMenuItem(): HelpMeRightNowMenuItem | undefined {
  return HELP_ME_RIGHT_NOW_MENU.find(
    (item) => item.activityId === DECISION_COMPASS_ACTIVITY_ID,
  );
}

export function helpMeRightNowOpensDecisionCompass(
  item: HelpMeRightNowMenuItem,
): boolean {
  return item.activityId === DECISION_COMPASS_ACTIVITY_ID;
}

export function guidedExerciseOpensDecisionCompass(activityId: string): boolean {
  return activityId === DECISION_COMPASS_ACTIVITY_ID;
}

export function chatPhraseOffersDecisionCompass(text: string): boolean {
  return (
    isDecisionCompassOfferSignal(text) || isExplicitDecisionCompassRequest(text)
  );
}

export function howDoIDecisionSearchOpensCompass(term: string): boolean {
  return bestHowDoIMatch(term)?.openActivityId === DECISION_COMPASS_ACTIVITY_ID;
}

export function quickTwoOptionFirstHourStepText(): string | null {
  const activity = getActivityById(QUICK_TWO_OPTION_ACTIVITY_ID);
  if (!activity?.steps[1]) return null;
  return stepInstruction(activity.steps[1]);
}

export function decisionCompassOpensSplitWorkspace(): boolean {
  const beside = decisionCompassOpensBesideChat();
  return (
    beside.section === DECISION_COMPASS_SPLIT_SECTION &&
    beside.layout === "split"
  );
}

export function quickTwoOptionIsLegacyStepHelper(): boolean {
  const activity = getActivityById(QUICK_TWO_OPTION_ACTIVITY_ID);
  if (!activity || activity.customUi) return false;
  return activity.steps.length === 4;
}

export function noHelpMeRightNowItemRoutesToQuickTwoOption(): boolean {
  return !HELP_ME_RIGHT_NOW_MENU.some(
    (item) =>
      item.activityId === QUICK_TWO_OPTION_ACTIVITY_ID ||
      (item.id as string) === "quick-decision-compass",
  );
}
