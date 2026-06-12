// Founder Ecosystem — Phase 6 Advisor Execution Layer.
//
// Translates the board's unified recommendations + the intelligence layer into
// concrete, trackable EXECUTION STEPS — each with a next action, project/task
// context, an energy/effort estimate, and an owning advisor. Pure derivation;
// status is managed by founderActivityTracker.

import type { FounderEvent, ID } from "../events";
import type { Level } from "../dashboardTypes";
import type {
  FounderIntelligence,
  FounderRisk,
} from "../intelligence/intelligenceTypes";
import type { AdvisorId } from "../board/advisorTypes";
import { routeAdvisors } from "../board/advisorRouter";

export type StepStatus = "pending" | "done" | "skipped";

export type ExecutionStep = {
  id: ID;
  advisor: AdvisorId;
  action: string; // the suggested next action
  reason: string; // why — keeps it explainable
  context: { projectId?: ID; projectTitle?: string; taskId?: ID };
  effort: Level; // energy/effort estimate
  priority: Level;
  status: StepStatus;
  sourceEventIds: ID[];
};

const RISK_ADVISOR: Record<FounderRisk["type"], AdvisorId> = {
  "project-stalled": "productivity",
  "task-overdue": "accountability",
  "no-sales-activity": "sales",
  "no-marketing-activity": "marketing",
  "repeated-overwhelm": "wellness",
  "unfinished-priorities": "accountability",
};

function estimateEffort(text: string): Level {
  if (
    /\b(message one|send one|do the 2-?minute|one post|two minutes|pick (the )?three|reschedule|reply)\b/i.test(
      text,
    )
  )
    return "low";
  if (
    /\b(systemi|write (the )?steps|rewrite|rebuild|launch|redo|build (out|a)|map out (the|a) (whole|full))\b/i.test(
      text,
    )
  )
    return "high";
  return "medium";
}

function projectTitle(events: FounderEvent[], pid?: ID): string | undefined {
  if (!pid) return undefined;
  const t = events.find(
    (e) => e.type === "project.created" && e.refs?.projectId === pid,
  )?.data?.title;
  return typeof t === "string" ? t : undefined;
}

export function buildExecutionPlan(
  intel: FounderIntelligence,
  events: FounderEvent[] = [],
): ExecutionStep[] {
  const steps: ExecutionStep[] = [];
  const seen = new Set<string>();

  // 1) Recommendations → steps (advisor attributed by routing the action text).
  for (const rec of intel.recommendations) {
    const advisor = routeAdvisors(`${rec.text} ${rec.reason}`).primary;
    const pid = rec.relatedObjectIds[0];
    steps.push({
      id: `step-${rec.id}`,
      advisor,
      action: rec.text,
      reason: rec.reason,
      context: { projectId: pid, projectTitle: projectTitle(events, pid) },
      effort: estimateEffort(rec.text),
      priority: rec.confidence,
      status: "pending",
      sourceEventIds: rec.sourceEventIds,
    });
    seen.add(rec.text);
  }

  // 2) Risks → steps (their suggested action), owned by the relevant advisor.
  for (const risk of intel.risks) {
    if (seen.has(risk.suggestedAction)) continue;
    const pid = risk.relatedProjectIds[0];
    steps.push({
      id: `step-${risk.id}`,
      advisor: RISK_ADVISOR[risk.type],
      action: risk.suggestedAction,
      reason: risk.label,
      context: { projectId: pid, projectTitle: projectTitle(events, pid) },
      effort: estimateEffort(risk.suggestedAction),
      priority: risk.severity,
      status: "pending",
      sourceEventIds: risk.sourceEventIds,
    });
    seen.add(risk.suggestedAction);
  }

  // Highest priority first.
  const rank = (l: Level) => (l === "high" ? 3 : l === "medium" ? 2 : 1);
  return steps.sort((a, b) => rank(b.priority) - rank(a.priority));
}

// Group steps by advisor — the dashboard's "top priorities per advisor" panel.
export function stepsByAdvisor(
  steps: ExecutionStep[],
): Record<AdvisorId, ExecutionStep[]> {
  const out = {} as Record<AdvisorId, ExecutionStep[]>;
  for (const s of steps) {
    (out[s.advisor] ??= []).push(s);
  }
  return out;
}
