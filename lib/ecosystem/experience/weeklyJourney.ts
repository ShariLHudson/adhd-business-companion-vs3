// Founder Ecosystem — Phase 19 Weekly Review experience.

import type { FounderEvent } from "../events";
import type { ID } from "../models";
import { getFounderIntelligence } from "../intelligence/founderIntelligenceEngine";
import type { WeeklyReview } from "./experienceTypes";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function buildWeeklyReview(
  events: FounderEvent[],
  founderId: ID,
  now: Date = new Date(),
): WeeklyReview {
  const since = now.getTime() - WEEK_MS;
  const mine = events.filter(
    (e) => e.founderId === founderId && new Date(e.ts).getTime() >= since,
  );
  const intel = getFounderIntelligence(mine, founderId, now.toISOString());

  const projectsAdvanced = mine
    .filter(
      (e) =>
        e.type === "project.stage_changed" ||
        e.type === "task.completed" ||
        e.type === "project.completed",
    )
    .map((e) => {
      const pid = e.refs?.projectId;
      const title = pid
        ? (mine.find((x) => x.type === "project.created" && x.refs?.projectId === pid)?.data
            ?.title as string)
        : null;
      return title ?? (e.type === "project.completed" ? "Project completed" : "Project advanced");
    })
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 6);

  const wins = mine
    .filter(
      (e) =>
        e.type === "task.completed" ||
        e.type === "focus.completed" ||
        e.type === "action.completed" ||
        e.type === "project.completed",
    )
    .map((e) => {
      if (e.type === "focus.completed") return "Focus session completed";
      if (e.type === "project.completed") return "Project milestone";
      return String(e.data?.title ?? "Task completed");
    })
    .slice(-8);

  const challenges = [
    ...intel.risks.map((r) => r.label),
    ...intel.patterns
      .filter((p) => p.severity === "high" || p.severity === "medium")
      .map((p) => p.label),
  ].slice(0, 5);

  const patterns = intel.patterns.map((p) => p.label).slice(0, 5);
  const opportunities = intel.opportunities.map((o) => o.text).slice(0, 5);

  const summary =
    wins.length > 0
      ? `This week: ${wins.length} wins, ${projectsAdvanced.length} project(s) advanced.`
      : "This week is a fresh start — one intentional win can shift momentum.";

  return {
    projectsAdvanced,
    wins,
    challenges,
    patterns,
    opportunities,
    summary,
  };
}
