/**
 * Cognitive load contributors — derived from available app signals.
 * Each factor documents its points; nothing is hidden.
 */

import type { EmotionalState } from "@/lib/companionEmotions";
import type { DayState, Project } from "@/lib/companionStore";
import type { UserSignalCount } from "@/lib/ecosystem/userIntelligenceEngine";
import type { CognitiveLoadInput, LoadContributor } from "./types";

const MS_DAY = 86_400_000;

const RSD_LOOP_RE =
  /\b(what if they|they'?re mad|they are mad|rejection|rejected|criticiz|judg(e|ing) me|afraid they|scared they)\b/i;
const SHAME_SELF_CRITICISM_RE =
  /\b(not good enough|feel like a fraud|imposter|impostor|failing|failure|ashamed|embarrassed|who am i to|i'?m behind|falling behind)\b/i;

function countSignal(
  counts: UserSignalCount[] | undefined,
  kind: "struggle" | "question" | "emotion",
  category: string,
  sinceMs: number,
): number {
  if (!counts?.length) return 0;
  return counts
    .filter((c) => c.kind === kind && c.category === category)
    .reduce((sum, c) => {
      const seen = new Date(c.lastSeen).getTime();
      return seen >= sinceMs ? sum + c.count : sum;
    }, 0);
}

function activeProjects(projects: Project[] | undefined): Project[] {
  if (!projects?.length) return [];
  return projects.filter(
    (p) =>
      p.status !== "completed" &&
      p.status !== "paused" &&
      (p.horizon === "now" || p.status === "active-focus"),
  );
}

/** Collect explainable load contributors from input signals. */
export function collectLoadContributors(
  input: CognitiveLoadInput = {},
): LoadContributor[] {
  const now = input.now ?? new Date();
  const since7d = now.getTime() - 7 * MS_DAY;
  const out: LoadContributor[] = [];
  const projects = input.projects ?? [];
  const active = activeProjects(projects);
  const counts = input.signalCounts;
  const text = input.recentText?.trim() ?? "";

  // ---- Business load -------------------------------------------------------
  if (active.length >= 1) {
    const points = Math.min(15, active.length * 5);
    out.push({
      id: "active_projects",
      domain: "business",
      label: "Active projects",
      points,
      detail:
        active.length === 1
          ? "1 active project is on your plate"
          : `${active.length} active projects are competing for attention`,
    });
  }

  const stalled = input.stalledProjectCount ?? 0;
  if (stalled > 0) {
    out.push({
      id: "stalled_projects",
      domain: "business",
      label: "Stalled projects",
      points: Math.min(12, stalled * 4),
      detail: `${stalled} project${stalled === 1 ? "" : "s"} paused or not started yet`,
    });
  }

  const overdue = input.overdueTaskCount ?? 0;
  if (overdue > 0) {
    out.push({
      id: "overdue_tasks",
      domain: "business",
      label: "Overdue tasks",
      points: Math.min(14, overdue * 5),
      detail: `${overdue} scheduled item${overdue === 1 ? "" : "s"} overdue or missed`,
    });
  }

  const missingNext = input.projectsMissingNextAction ?? 0;
  if (missingNext > 0) {
    out.push({
      id: "unresolved_next_actions",
      domain: "business",
      label: "Unresolved decisions",
      points: Math.min(12, missingNext * 4),
      detail: `${missingNext} project${missingNext === 1 ? "" : "s"} without a clear next action`,
    });
  }

  const openDumps = input.openBrainDumpCount ?? 0;
  if (openDumps > 0) {
    out.push({
      id: "open_captures",
      domain: "business",
      label: "Open captures",
      points: Math.min(12, openDumps * 3),
      detail: `${openDumps} brain-dump item${openDumps === 1 ? "" : "s"} still open`,
    });
  }

  if (openDumps >= 5) {
    out.push({
      id: "too_many_open_ideas",
      domain: "mental",
      label: "Too many open ideas",
      points: Math.min(10, Math.floor(openDumps / 2) * 2),
      detail: "The number of open items has increased — many ideas still uncaptured or unparked",
    });
  }

  const decisionSignals =
    countSignal(counts, "struggle", "decision_making", since7d) +
    countSignal(counts, "question", "help_me_prioritize", since7d);
  if (decisionSignals > 0) {
    out.push({
      id: "decision_load",
      domain: "business",
      label: "Unresolved decisions",
      points: Math.min(14, decisionSignals * 5),
      detail: "There are repeated unresolved decisions in recent conversations",
    });
  }

  // ---- Mental load ---------------------------------------------------------
  const overwhelmSignals =
    countSignal(counts, "struggle", "overwhelm", since7d) +
    countSignal(counts, "question", "im_overwhelmed", since7d);
  if (overwhelmSignals > 0) {
    out.push({
      id: "overwhelm_conversations",
      domain: "mental",
      label: "Overwhelm language",
      points: Math.min(18, overwhelmSignals * 6),
      detail: `You've mentioned overwhelm ${overwhelmSignals} time${overwhelmSignals === 1 ? "" : "s"} recently`,
    });
  }

  const stuckSignals =
    countSignal(counts, "struggle", "focus", since7d) +
    countSignal(counts, "emotion", "stuck", since7d) +
    countSignal(counts, "question", "dont_know_where_to_start", since7d);
  if (stuckSignals > 0) {
    out.push({
      id: "stuck_conversations",
      domain: "mental",
      label: "Stuck conversations",
      points: Math.min(14, stuckSignals * 4),
      detail: "Recent conversations suggest feeling stuck or scattered",
    });
  }

  const uncertainty =
    countSignal(counts, "emotion", "confused", since7d) +
    countSignal(counts, "struggle", "prioritization", since7d);
  if (uncertainty > 0) {
    out.push({
      id: "uncertainty",
      domain: "mental",
      label: "Decision fatigue",
      points: Math.min(10, uncertainty * 3),
      detail: "Some recent chats carried uncertainty about what to do next",
    });
  }

  // ---- Emotional load ------------------------------------------------------
  applyEmotionContributor(out, input.emotionalState, input.dayState);

  const frustration = countSignal(counts, "emotion", "frustrated", since7d);
  if (frustration > 0) {
    out.push({
      id: "frustration_signals",
      domain: "emotional",
      label: "Frustration",
      points: Math.min(12, frustration * 4),
      detail: "Recent conversations carried frustration or irritation",
    });
  }

  const burnoutText =
    countSignal(counts, "struggle", "follow_through", since7d) +
    (input.emotionalState === "emotional" ? 1 : 0);
  if (burnoutText > 1) {
    out.push({
      id: "burnout_signals",
      domain: "emotional",
      label: "Burnout signals",
      points: Math.min(12, burnoutText * 4),
      detail: "Signs of exhaustion or difficulty finishing things",
    });
  }

  if (text && RSD_LOOP_RE.test(text)) {
    out.push({
      id: "rsd_loop",
      domain: "emotional",
      label: "RSD / rejection sensitivity",
      points: 10,
      detail: "Recent language suggests fear of criticism or rejection",
    });
  } else if (
    countSignal(counts, "emotion", "frustrated", since7d) >= 2 &&
    countSignal(counts, "struggle", "decision_making", since7d) >= 1
  ) {
    out.push({
      id: "rsd_loop",
      domain: "emotional",
      label: "RSD / loop patterns",
      points: 6,
      detail: "Emotional reactivity may be amplifying decision load",
    });
  }

  if (text && SHAME_SELF_CRITICISM_RE.test(text)) {
    out.push({
      id: "shame_self_criticism",
      domain: "emotional",
      label: "Shame / self-criticism",
      points: 10,
      detail: "Recent tone carries self-criticism or shame — not failure, just heavy",
    });
  }

  // ---- Companion load ------------------------------------------------------
  const helpRequests =
    countSignal(counts, "question", "im_overwhelmed", since7d) +
    countSignal(counts, "question", "dont_know_where_to_start", since7d) +
    countSignal(counts, "question", "what_should_i_work_on", since7d);
  if (helpRequests >= 2) {
    out.push({
      id: "repeated_help_requests",
      domain: "companion",
      label: "Repeated help requests",
      points: Math.min(12, helpRequests * 3),
      detail: "Repeated requests for help on getting started or what to do",
    });
  }

  if (
    /\b(don'?t know what to do|what should i work on|still stuck|same problem|keep coming back)\b/i.test(
      text,
    )
  ) {
    out.push({
      id: "unresolved_topic_loop",
      domain: "companion",
      label: "Unresolved topic loop",
      points: 8,
      detail: "Returning to the same unresolved topic or question",
    });
  }

  const sameIssueSignals =
    countSignal(counts, "struggle", "overwhelm", since7d) +
    countSignal(counts, "struggle", "focus", since7d);
  if (sameIssueSignals >= 4) {
    out.push({
      id: "recurring_stuck_pattern",
      domain: "companion",
      label: "Recurring stuck pattern",
      points: Math.min(10, sameIssueSignals * 2),
      detail: "Similar stuck or overwhelm themes keep surfacing in chat",
    });
  }

  // ---- Environmental load --------------------------------------------------
  const blocksToday = input.timeBlocksToday ?? 0;
  if (blocksToday >= 3) {
    out.push({
      id: "schedule_density",
      domain: "environmental",
      label: "Schedule density",
      points: Math.min(10, blocksToday * 2),
      detail: `${blocksToday} time blocks on today's calendar`,
    });
  }

  const missed = input.missedBlocksToday ?? 0;
  if (missed > 0 && overdue === 0) {
    out.push({
      id: "schedule_pressure",
      domain: "environmental",
      label: "Schedule pressure",
      points: Math.min(10, missed * 5),
      detail: `${missed} block${missed === 1 ? "" : "s"} missed today — schedule may feel tight`,
    });
  }

  return out;
}

function applyEmotionContributor(
  out: LoadContributor[],
  emotion: EmotionalState | undefined,
  day: DayState | null | undefined,
): void {
  if (day?.overwhelm === "high") {
    out.push({
      id: "day_overwhelm",
      domain: "emotional",
      label: "High overwhelm today",
      points: 18,
      detail: "You marked overwhelm as high when adjusting your day",
    });
  } else if (day?.overwhelm === "medium") {
    out.push({
      id: "day_overwhelm",
      domain: "emotional",
      label: "Moderate overwhelm today",
      points: 10,
      detail: "You noted some overwhelm when checking in today",
    });
  }

  if (day?.energy === "low" && (day.overwhelm === "medium" || day.overwhelm === "high")) {
    out.push({
      id: "low_energy_high_load",
      domain: "emotional",
      label: "Low energy under load",
      points: 8,
      detail: "Energy is low while carry feels elevated",
    });
  }

  if (!emotion || emotion === "unclear" || emotion === "focused" || emotion === "building") {
    return;
  }
  if (emotion === "overwhelmed") {
    out.push({
      id: "current_overwhelm",
      domain: "emotional",
      label: "Current overwhelm",
      points: 14,
      detail: "Your recent message suggests you're carrying a lot right now",
    });
    return;
  }
  if (emotion === "stuck") {
    out.push({
      id: "current_stuck",
      domain: "emotional",
      label: "Feeling stuck",
      points: 10,
      detail: "Starting or moving forward feels hard at the moment",
    });
    return;
  }
  if (emotion === "emotional") {
    out.push({
      id: "emotional_support",
      domain: "emotional",
      label: "Emotional support needed",
      points: 8,
      detail: "Recent tone suggests you may need grounding before problem-solving",
    });
  }
}
