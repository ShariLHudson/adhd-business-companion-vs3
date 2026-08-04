/**
 * P0.50 — grouped, searchable goal picker data (archived goals excluded).
 */

import { listOutcomeGoals, type OutcomeGoal } from "./outcomeGoals";

export type GoalPickerGroup = {
  category: string;
  goals: OutcomeGoal[];
};

const CATEGORY_ORDER = [
  "Revenue Goals",
  "Membership Goals",
  "Content Goals",
  "Health Goals",
  "Business Goals",
  "Product Goals",
  "General Goals",
] as const;

export function goalPickerCategory(goal: OutcomeGoal): string {
  const tid =
    goal.trackingTypeId ??
    goal.metrics?.find((m) => !m.archived)?.trackingTypeId ??
    goal.metrics?.[0]?.trackingTypeId;

  switch (tid) {
    case "revenue":
      return "Revenue Goals";
    case "members":
    case "subscribers":
    case "email_subscribers":
      return "Membership Goals";
    case "content_pieces":
    case "videos":
    case "followers":
      return "Content Goals";
    case "weight":
    case "hours":
      return "Health Goals";
    case "clients":
    case "leads":
    case "sales_calls":
    case "affiliates":
      return "Business Goals";
    case "products":
    case "courses":
    case "chapters":
      return "Product Goals";
    default:
      return "General Goals";
  }
}

export function listLinkableOutcomeGoals(): OutcomeGoal[] {
  return listOutcomeGoals();
}

export function groupGoalsForPicker(
  goals: OutcomeGoal[] = listLinkableOutcomeGoals(),
): GoalPickerGroup[] {
  const byCategory = new Map<string, OutcomeGoal[]>();
  for (const goal of goals) {
    const category = goalPickerCategory(goal);
    const list = byCategory.get(category) ?? [];
    list.push(goal);
    byCategory.set(category, list);
  }

  const ordered = CATEGORY_ORDER.filter((c) => byCategory.has(c)).map(
    (category) => ({
      category,
      goals: byCategory.get(category)!,
    }),
  );

  for (const [category, groupGoals] of byCategory) {
    if (!CATEGORY_ORDER.includes(category as (typeof CATEGORY_ORDER)[number])) {
      ordered.push({ category, goals: groupGoals });
    }
  }

  return ordered;
}

export function filterGoalPickerGroups(
  groups: GoalPickerGroup[],
  query: string,
): GoalPickerGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  return groups
    .map((group) => ({
      ...group,
      goals: group.goals.filter((g) => g.statement.toLowerCase().includes(q)),
    }))
    .filter((group) => group.goals.length > 0);
}
