/**
 * Guided Exercises — structured thinking under Momentum Boosters.
 * Alphabetical by title; distinct from Help Me Right Now (immediate relief).
 */

import type { AppSection } from "./companionUi";
import { sortByDropdownLabel } from "./dropdownSort";
import { getActivityById } from "./companionActivities";

export type GuidedExerciseId =
  | "decision-compass"
  | "two-option"
  | "priority-sort"
  | "future-me-test"
  | "values-check"
  | "goal-clarifier";

export type GuidedExerciseMenuItem = {
  id: GuidedExerciseId;
  activityId: string;
  title: string;
  purpose: string;
  objectId: string;
};

const GUIDED_EXERCISE_ROWS: GuidedExerciseMenuItem[] = [
  {
    id: "decision-compass",
    activityId: "decision-compass",
    title: "ADHD Decision Compass",
    purpose: "Adaptive paths for action, strategy, and emotional decisions",
    objectId: "decision-compass",
  },
  {
    id: "future-me-test",
    activityId: "future-me-test",
    title: "Future Me",
    purpose: "Imagine living with each choice six months from now",
    objectId: "journal",
  },
  {
    id: "goal-clarifier",
    activityId: "goal-clarifier",
    title: "Goal Clarifier",
    purpose: "Name one goal and what done actually looks like",
    objectId: "growth",
  },
  {
    id: "priority-sort",
    activityId: "priority-sort",
    title: "Priority Sort",
    purpose: "Rank what matters most without a giant task list",
    objectId: "plan-my-day",
  },
  {
    id: "two-option",
    activityId: "two-option",
    title: "Quick Two Option Choice",
    purpose: "A fast 4-step helper for simple choices",
    objectId: "decision-compass",
  },
  {
    id: "values-check",
    activityId: "values-check",
    title: "Values Check",
    purpose: "See which choice aligns with what you care about",
    objectId: "decision-compass",
  },
];

/** Alphabetical guided exercise menu — only exercises that exist in the catalog. */
export function guidedExerciseMenu(): GuidedExerciseMenuItem[] {
  return sortByDropdownLabel(
    GUIDED_EXERCISE_ROWS.filter((row) => getActivityById(row.activityId)),
    (row) => row.title,
  );
}

export function isGuidedExerciseActivity(activityId: string): boolean {
  return GUIDED_EXERCISE_ROWS.some((row) => row.activityId === activityId);
}

export function standaloneSectionForActivity(activityId: string): AppSection {
  return isGuidedExerciseActivity(activityId) ? "guided-exercises" : "focus";
}
