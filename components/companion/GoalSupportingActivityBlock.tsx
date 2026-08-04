"use client";

/** @deprecated P0.56 — Not mounted. Goal activity counts live in goal intelligence layer. */

import { useMemo, useState } from "react";
import {
  buildGoalSupportingActivity,
  calculateGoalMomentum,
  decisionSupportsGoal,
  lessonSupportsGoal,
  type GoalSupportingActivity,
} from "@/lib/goals/goalIntelligence";
import { getProjects } from "@/lib/companionStore";
import { getEvidenceEntries } from "@/lib/evidenceBankStore";
import { getSavedGrowthWins } from "@/lib/growthWinsStore";
import { getJourneyEntries } from "@/lib/myJourneyStore";
import { readTodayPlanItems } from "@/lib/planMyDay/planDayItems";
import {
  evidenceSupportsGoal,
  planItemSupportsGoal,
  projectSupportsGoal,
  winSupportsGoal,
} from "@/lib/goals/goalLinking";
import type { OutcomeGoal } from "@/lib/goals/outcomeGoals";

type ActivityKey = keyof GoalSupportingActivity;

const ACTIVITY_LABELS: Record<ActivityKey, string> = {
  projects: "Projects",
  tasks: "Tasks",
  wins: "Wins",
  evidence: "Evidence",
  decisions: "Decisions",
  lessons: "Lessons",
};

export function GoalSupportingActivityBlock({ goal }: { goal: OutcomeGoal }) {
  const [expanded, setExpanded] = useState<ActivityKey | null>(null);
  const activity = useMemo(() => buildGoalSupportingActivity(goal), [goal]);
  const momentum = useMemo(() => calculateGoalMomentum(goal), [goal]);

  const detailItems = useMemo(() => {
    if (!expanded) return [];
    const wins = getSavedGrowthWins().filter((w) => winSupportsGoal(w, goal));
    const evidence = getEvidenceEntries().filter((e) =>
      evidenceSupportsGoal(e, goal),
    );
    const journey = getJourneyEntries();
    const projects = getProjects().filter((p) => projectSupportsGoal(p, goal));
    const tasks = readTodayPlanItems().filter((t) =>
      planItemSupportsGoal(t, goal),
    );

    switch (expanded) {
      case "wins":
        return wins.map((w) => w.whatHappened);
      case "evidence":
        return evidence.map((e) => e.whatHappened);
      case "decisions":
        return journey
          .filter((j) => decisionSupportsGoal(j, goal))
          .map((j) => j.title);
      case "lessons":
        return journey
          .filter((j) => lessonSupportsGoal(j, goal))
          .map((j) => j.title);
      case "projects":
        return projects.map((p) => p.name);
      case "tasks":
        return tasks.map((t) => t.title);
      default:
        return [];
    }
  }, [expanded, goal]);

  return (
    <div
      className="mt-3 rounded-lg border border-[#e7dfd4] bg-white/70 p-3"
      data-testid="goal-supporting-activity"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
          Supporting Activity
        </p>
        <p className="text-xs font-semibold text-[#6b635a]">
          {momentum.emoji} {momentum.label}
        </p>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {(Object.keys(ACTIVITY_LABELS) as ActivityKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() =>
              setExpanded((cur) => (cur === key ? null : key))
            }
            className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
              expanded === key
                ? "border-[#1e4f4f] bg-[#f0f8f8] text-[#1e4f4f]"
                : "border-[#e7dfd4] bg-white text-[#4b463f] hover:border-[#1e4f4f]/30"
            }`}
            data-testid={`goal-activity-${key}`}
          >
            {ACTIVITY_LABELS[key]}: {activity[key]}
          </button>
        ))}
      </div>
      {expanded && detailItems.length > 0 ? (
        <ul className="mt-2 space-y-1 border-t border-[#e7dfd4] pt-2 text-xs text-[#6b635a]">
          {detailItems.slice(0, 5).map((item, i) => (
            <li key={`${expanded}-${i}`}>· {item}</li>
          ))}
          {detailItems.length > 5 ? (
            <li className="text-[#9a8f82]">
              +{detailItems.length - 5} more
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
