// Founder Ecosystem — Phase 2 dashboard selectors.
//
// Pure, testable functions that turn a founder's event stream into the
// dashboard data object. No UI, no side effects, no manual data. Missing data
// returns empty arrays / null — never fabricated values.

import type { FounderEvent, ID } from "./events";
import type {
  ActiveProjectView,
  BlockerItem,
  FounderDashboardData,
  FounderState,
  Level,
  MomentumSection,
  OpenDecisionView,
  OpportunityStatusLabel,
  OpportunityView,
  PainPointCategory,
  PainPointPattern,
  PriorityItem,
  TodaySection,
  WinItem,
} from "./dashboardTypes";

// ---- small helpers ------------------------------------------------------
const dayKey = (ts: string) => ts.slice(0, 10);
const todayKey = () => new Date().toISOString().slice(0, 10);
const isToday = (ts: string) => dayKey(ts) === todayKey();
const withinDays = (ts: string, days: number) =>
  Date.now() - new Date(ts).getTime() < days * 86400000;
const asString = (v: unknown): string | undefined =>
  typeof v === "string" ? v : undefined;
const asNumber = (v: unknown): number | undefined =>
  typeof v === "number" ? v : undefined;
const byTsAsc = (a: FounderEvent, b: FounderEvent) => (a.ts < b.ts ? -1 : 1);
const byTsDesc = (a: FounderEvent, b: FounderEvent) => (a.ts < b.ts ? 1 : -1);

function levelFromCount(n: number, med: number, high: number): Level {
  if (n >= high) return "high";
  if (n >= med) return "medium";
  return "low";
}

// Task ids that have a completion event (so we can find "open" tasks).
function completedTaskIds(events: FounderEvent[]): Set<ID> {
  const done = new Set<ID>();
  for (const e of events) {
    if (e.type === "task.completed" && e.refs?.taskId) done.add(e.refs.taskId);
  }
  return done;
}

// Open tasks (created, not completed), newest first, with their titles.
function openTasks(events: FounderEvent[]): PriorityItem[] {
  const done = completedTaskIds(events);
  return events
    .filter((e) => e.type === "task.created" && e.refs?.taskId)
    .filter((e) => !done.has(e.refs!.taskId!))
    .sort(byTsDesc)
    .map((e) => ({
      taskId: e.refs!.taskId!,
      title: asString(e.data?.title) ?? "Untitled task",
      projectId: e.refs?.projectId,
    }));
}

// ---- 1. Today -----------------------------------------------------------
export function selectToday(events: FounderEvent[]): TodaySection {
  const open = openTasks(events);

  // Active task: most recent task marked in-progress that isn't done; else the
  // newest open task.
  const done = completedTaskIds(events);
  const inProgress = events
    .filter(
      (e) =>
        e.type === "task.updated" &&
        e.data?.status === "in-progress" &&
        e.refs?.taskId &&
        !done.has(e.refs.taskId),
    )
    .sort(byTsDesc)[0];
  const activeTask: PriorityItem | null = inProgress
    ? {
        taskId: inProgress.refs!.taskId!,
        title: asString(inProgress.data?.title) ?? "Untitled task",
        projectId: inProgress.refs?.projectId,
      }
    : (open[0] ?? null);

  // Next scheduled time block: created, not completed, scheduledFor in the
  // future, earliest first. If no scheduledFor data exists, return null.
  const completedBlocks = new Set(
    events
      .filter((e) => e.type === "timeblock.completed" && e.refs?.timeBlockId)
      .map((e) => e.refs!.timeBlockId!),
  );
  const upcomingBlock = events
    .filter(
      (e) =>
        e.type === "timeblock.created" &&
        e.refs?.timeBlockId &&
        !completedBlocks.has(e.refs.timeBlockId) &&
        asString(e.data?.scheduledFor) &&
        asString(e.data?.scheduledFor)! >= new Date().toISOString(),
    )
    .sort((a, b) =>
      asString(a.data?.scheduledFor)! < asString(b.data?.scheduledFor)! ? -1 : 1,
    )[0];
  const nextTimeBlock = upcomingBlock
    ? {
        timeBlockId: upcomingBlock.refs!.timeBlockId!,
        title: asString(upcomingBlock.data?.title) ?? null,
        scheduledFor: asString(upcomingBlock.data?.scheduledFor) ?? null,
        durationMin: asNumber(upcomingBlock.data?.durationMin) ?? null,
        projectId: upcomingBlock.refs?.projectId,
      }
    : null;

  // Current focus session: a focus.started today with no later focus.completed.
  const focusStarts = events
    .filter((e) => e.type === "focus.started" && isToday(e.ts))
    .sort(byTsDesc);
  const lastCompleteTs = events
    .filter((e) => e.type === "focus.completed")
    .sort(byTsDesc)[0]?.ts;
  const ongoing = focusStarts.find(
    (s) => !lastCompleteTs || s.ts > lastCompleteTs,
  );
  const currentFocusSession = ongoing
    ? {
        startedAt: ongoing.ts,
        plannedMinutes: asNumber(ongoing.data?.plannedMinutes) ?? null,
        projectId: ongoing.refs?.projectId,
      }
    : null;

  // Wins today: completions of all kinds.
  const wins: WinItem[] = events
    .filter(
      (e) =>
        isToday(e.ts) &&
        (e.type === "task.completed" ||
          e.type === "project.completed" ||
          e.type === "focus.completed"),
    )
    .sort(byTsAsc)
    .map((e) => ({
      ts: e.ts,
      label:
        e.type === "task.completed"
          ? "Finished a task"
          : e.type === "project.completed"
            ? "Completed a project"
            : "Completed a focus session",
    }));

  // Blockers today: observed pain points + tasks flagged blocked.
  const blockers: BlockerItem[] = events
    .filter(
      (e) =>
        isToday(e.ts) &&
        (e.type === "painpoint.observed" ||
          (e.type === "task.updated" && e.data?.status === "blocked")),
    )
    .sort(byTsAsc)
    .map((e) => ({
      ts: e.ts,
      text:
        asString(e.data?.text) ??
        asString(e.data?.title) ??
        "Something got in the way",
      projectId: e.refs?.projectId,
    }));

  return {
    topPriorities: open.slice(0, 3),
    activeTask,
    nextTimeBlock,
    currentFocusSession,
    wins,
    blockers,
  };
}

// ---- 2. Active Projects -------------------------------------------------
export function selectActiveProjects(
  events: FounderEvent[],
): ActiveProjectView[] {
  const completed = new Set(
    events
      .filter((e) => e.type === "project.completed" && e.refs?.projectId)
      .map((e) => e.refs!.projectId!),
  );
  const created = events.filter(
    (e) => e.type === "project.created" && e.refs?.projectId,
  );
  const done = completedTaskIds(events);

  return created
    .filter((e) => !completed.has(e.refs!.projectId!))
    .map((e) => {
      const projectId = e.refs!.projectId!;
      const forProject = events.filter((x) => x.refs?.projectId === projectId);

      const statusEvent = forProject
        .filter(
          (x) => x.type === "project.stage_changed" || x.type === "project.updated",
        )
        .sort(byTsDesc)[0];
      const status =
        asString(statusEvent?.data?.to) ??
        asString(statusEvent?.data?.status) ??
        "in-progress";

      const nextTask = forProject
        .filter(
          (x) =>
            x.type === "task.created" &&
            x.refs?.taskId &&
            !done.has(x.refs.taskId),
        )
        .sort(byTsDesc)[0];

      const lastActivity =
        forProject.map((x) => x.ts).sort().slice(-1)[0] ?? null;

      const linkedDocuments = forProject
        .filter((x) => x.type === "document.created" && x.refs?.documentId)
        .map((x) => ({
          documentId: x.refs!.documentId!,
          title: asString(x.data?.title) ?? "Untitled document",
        }));

      const scheduledBlocks = forProject
        .filter((x) => x.type === "timeblock.created" && x.refs?.timeBlockId)
        .map((x) => ({
          timeBlockId: x.refs!.timeBlockId!,
          scheduledFor: asString(x.data?.scheduledFor) ?? null,
        }));

      const totalTasks = forProject.filter(
        (x) => x.type === "task.created",
      ).length;
      const completedTasks = forProject.filter(
        (x) => x.type === "task.completed",
      ).length;
      const progressEstimate =
        totalTasks > 0 ? completedTasks / totalTasks : null;

      return {
        projectId,
        name: asString(e.data?.title) ?? "Untitled project",
        status,
        nextAction: asString(nextTask?.data?.title) ?? null,
        lastActivity,
        linkedDocuments,
        scheduledBlocks,
        progressEstimate,
      };
    });
}

// ---- 3. Momentum --------------------------------------------------------
export function selectMomentum(events: FounderEvent[]): MomentumSection {
  const todays = events.filter((e) => isToday(e.ts));
  const moved = new Set<ID>();
  for (const e of todays) {
    if (
      (e.type === "task.completed" ||
        e.type === "focus.completed" ||
        e.type === "document.created" ||
        e.type === "project.stage_changed") &&
      e.refs?.projectId
    ) {
      moved.add(e.refs.projectId);
    }
  }
  const winsCaptured = todays.filter(
    (e) =>
      e.type === "task.completed" ||
      e.type === "project.completed" ||
      e.type === "focus.completed",
  ).length;

  return {
    tasksCompletedToday: todays.filter((e) => e.type === "task.completed").length,
    focusSessionsCompleted: todays.filter((e) => e.type === "focus.completed")
      .length,
    documentsCreated: todays.filter((e) => e.type === "document.created").length,
    projectsMovedForward: moved.size,
    winsCaptured,
  };
}

// ---- 4. Open Decisions --------------------------------------------------
export function selectOpenDecisions(events: FounderEvent[]): OpenDecisionView[] {
  const resolved = new Set(
    events
      .filter(
        (e) =>
          e.type === "decision.updated" &&
          (e.data?.status === "made" || e.data?.status === "dropped") &&
          e.refs?.decisionId,
      )
      .map((e) => e.refs!.decisionId!),
  );
  return events
    .filter(
      (e) =>
        e.type === "decision.created" &&
        e.refs?.decisionId &&
        !resolved.has(e.refs.decisionId),
    )
    .map((e) => {
      const decisionId = e.refs!.decisionId!;
      const mentions = events
        .filter((x) => x.refs?.decisionId === decisionId)
        .map((x) => x.ts)
        .sort();
      return {
        decisionId,
        text: asString(e.data?.text) ?? "Open decision",
        projectId: e.refs?.projectId,
        createdAt: e.ts,
        lastMentionedAt: mentions[mentions.length - 1] ?? e.ts,
        recommendedNextStep:
          "Pick one option and commit for now — you can adjust later. Done beats perfect.",
      };
    });
}

// ---- 5. Opportunities ---------------------------------------------------
const OPP_STATUS_MAP: Record<string, OpportunityStatusLabel> = {
  new: "idea",
  idea: "idea",
  exploring: "exploring",
  pursuing: "active",
  active: "active",
  won: "active",
  parked: "parked",
  lost: "parked",
};
export function selectOpportunities(events: FounderEvent[]): OpportunityView[] {
  return events
    .filter((e) => e.type === "opportunity.created" && e.refs?.opportunityId)
    .map((e) => {
      const opportunityId = e.refs!.opportunityId!;
      const latestUpdate = events
        .filter(
          (x) =>
            x.type === "opportunity.updated" &&
            x.refs?.opportunityId === opportunityId,
        )
        .sort(byTsDesc)[0];
      const rawStatus = asString(latestUpdate?.data?.status) ?? "idea";
      return {
        opportunityId,
        text: asString(e.data?.text) ?? "Captured idea",
        status: OPP_STATUS_MAP[rawStatus] ?? "idea",
        projectId: e.refs?.projectId,
        sourceEventId: e.id,
      };
    });
}

// ---- 6. Pain Points / Patterns -----------------------------------------
const PAIN_RULES: { category: PainPointCategory; label: string; re: RegExp; path: string }[] = [
  { category: "overwhelm", label: "Overwhelm", re: /overwhelm|too much|so much|drowning|everything at once/i, path: "Clear My Mind, then pick one next step" },
  { category: "low-energy", label: "Low energy", re: /low energy|no energy|tired|exhaust|drained|burn(t|ed) out/i, path: "Smaller steps today + Breathe & Reset" },
  { category: "procrastination", label: "Procrastination", re: /procrastinat|avoid|putting off|can'?t start|keep delaying/i, path: "The 2-Minute Entry" },
  { category: "email-overload", label: "Email overload", re: /\bemail|\binbox/i, path: "Time-block one focused inbox sweep" },
  { category: "decision-fatigue", label: "Decision fatigue", re: /decision|can'?t (decide|choose)|too many (choices|options)|stuck (choosing|between)/i, path: "Pick Then Learn" },
  { category: "focus-problems", label: "Focus problems", re: /focus|distract|attention|concentrat|scattered/i, path: "Focus Session + Focus Audio" },
  { category: "unfinished-projects", label: "Unfinished projects", re: /unfinished|never finish|abandon|half-?done|so many projects/i, path: "One Door at a Time" },
];
function classifyPain(text: string): { category: PainPointCategory; label: string; path: string } {
  for (const r of PAIN_RULES) if (r.re.test(text)) return { category: r.category, label: r.label, path: r.path };
  return { category: "other", label: "Other friction", path: "Talk it through with Shari" };
}
export function selectPainPoints(events: FounderEvent[]): PainPointPattern[] {
  const groups = new Map<PainPointCategory, PainPointPattern>();
  for (const e of events.filter((x) => x.type === "painpoint.observed")) {
    const text = asString(e.data?.text) ?? "";
    if (!text.trim()) continue;
    const { category, label, path } = classifyPain(text);
    const existing = groups.get(category);
    if (!existing) {
      groups.set(category, {
        category,
        label,
        occurrences: 1,
        firstSeen: e.ts,
        lastSeen: e.ts,
        relatedProjectIds: e.refs?.projectId ? [e.refs.projectId] : [],
        suggestedSupportPath: path,
      });
    } else {
      existing.occurrences += 1;
      if (e.ts < existing.firstSeen) existing.firstSeen = e.ts;
      if (e.ts > existing.lastSeen) existing.lastSeen = e.ts;
      if (e.refs?.projectId && !existing.relatedProjectIds.includes(e.refs.projectId))
        existing.relatedProjectIds.push(e.refs.projectId);
    }
  }
  return [...groups.values()].sort((a, b) => b.occurrences - a.occurrences);
}

// ---- 7. Founder State (support indicators, NOT a diagnosis) -------------
export function selectFounderState(events: FounderEvent[]): FounderState {
  const recent = events.filter((e) => withinDays(e.ts, 3));
  const completions = recent.filter(
    (e) =>
      e.type === "task.completed" ||
      e.type === "focus.completed" ||
      e.type === "project.completed",
  ).length;
  const focusDone = recent.filter((e) => e.type === "focus.completed").length;
  const activity = recent.length;
  const pains = recent.filter((e) => e.type === "painpoint.observed");
  const lowEnergyPains = pains.filter((e) =>
    /low energy|no energy|tired|exhaust|drained|burn/i.test(
      asString(e.data?.text) ?? "",
    ),
  ).length;
  const overwhelmPains = pains.filter((e) =>
    /overwhelm|too much|so much|drowning/i.test(asString(e.data?.text) ?? ""),
  ).length;

  return {
    momentum: levelFromCount(completions, 1, 4),
    focus: levelFromCount(focusDone, 1, 3),
    energy: lowEnergyPains >= 1 ? "low" : levelFromCount(activity, 3, 8),
    overwhelm: levelFromCount(overwhelmPains, 1, 2),
    confidence: levelFromCount(completions, 2, 5),
  };
}

// ---- Composer -----------------------------------------------------------
export function getFounderDashboardData(
  events: FounderEvent[],
  founderId: ID,
): FounderDashboardData {
  const mine = events.filter((e) => e.founderId === founderId);
  return {
    today: selectToday(mine),
    activeProjects: selectActiveProjects(mine),
    momentum: selectMomentum(mine),
    openDecisions: selectOpenDecisions(mine),
    opportunities: selectOpportunities(mine),
    painPoints: selectPainPoints(mine),
    founderState: selectFounderState(mine),
  };
}
