// Founder Ecosystem — Phase 4 sample dataset.
// ~45 days of activity for one placeholder founder, with deliberately embedded
// patterns (unfinished tasks, focus abandonment, time-block cancellations,
// repeated overwhelm/low-energy, procrastination language, a sales gap, and
// wins concentrated on one project). Built off `now` so it's deterministic.

import type { FounderEvent } from "../../events";

export const HISTORY_FOUNDER_ID = "founder-001";

function at(now: Date, daysAgo: number, hour: number, min = 0): string {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(hour, min, 0, 0);
  return d.toISOString();
}

export function sampleFounderHistory(
  founderId: string = HISTORY_FOUNDER_ID,
  nowDate: Date = new Date(),
): FounderEvent[] {
  const f = founderId;
  const e: FounderEvent[] = [];
  let n = 0;
  const id = () => `h${++n}`;

  const push = (
    type: FounderEvent["type"],
    daysAgo: number,
    hour: number,
    extra: Partial<FounderEvent> = {},
  ) => {
    e.push({ id: id(), founderId: f, type, ts: at(nowDate, daysAgo, hour), ...extra });
  };

  // Projects
  push("project.created", 45, 9, {
    refs: { projectId: "proj-app" },
    data: { title: "ADHD App" },
  });
  push("project.created", 40, 10, {
    refs: { projectId: "proj-funnel" },
    data: { title: "Sales Funnel" },
  });

  // Wins concentrated on the ADHD App project (tasks, focus, finished doc).
  for (let i = 0; i < 5; i++) {
    push("task.created", 30 - i * 2, 9, {
      refs: { taskId: `app-task-${i}`, projectId: "proj-app" },
      data: { title: `App task ${i}` },
    });
    push("task.completed", 30 - i * 2, 11, {
      refs: { taskId: `app-task-${i}`, projectId: "proj-app" },
    });
  }
  push("document.created", 12, 14, {
    refs: { documentId: "doc-app", projectId: "proj-app" },
    data: { docType: "sop", title: "App onboarding SOP" },
  });
  push("document.exported", 12, 15, {
    refs: { documentId: "doc-app" },
    data: { provider: "google-doc" },
  });

  // Unfinished tasks (created, never completed) — on the funnel.
  for (let i = 0; i < 6; i++) {
    push("task.created", 25 - i * 2, 13, {
      refs: { taskId: `funnel-task-${i}`, projectId: "proj-funnel" },
      data: { title: `Funnel task ${i}` },
    });
  }

  // Focus sessions: morning completions + several abandoned (no completion).
  for (let i = 0; i < 4; i++) {
    push("focus.started", 20 - i * 3, 8, {
      refs: { projectId: "proj-app" },
      data: { plannedMinutes: 25 },
    });
    push("focus.completed", 20 - i * 3, 8, {
      refs: { projectId: "proj-app" },
      data: { actualMinutes: 25 },
    });
  }
  for (let i = 0; i < 3; i++) {
    push("focus.started", 18 - i * 3, 16, { refs: { projectId: "proj-funnel" } });
  }

  // Time-block cancellations (created, never completed).
  for (let i = 0; i < 3; i++) {
    push("timeblock.created", 15 - i * 2, 10, {
      refs: { timeBlockId: `tb-${i}`, projectId: "proj-app", workspace: "time-block" },
      data: { durationMin: 60 },
    });
  }
  push("timeblock.completed", 14, 11, { refs: { timeBlockId: "tb-0" } });

  // Repeated overwhelm + low energy (some in the last week → risk).
  for (let i = 0; i < 4; i++) {
    push("painpoint.observed", 6 - i, 9, {
      refs: { painPointId: "pain-ow", projectId: "proj-funnel" },
      data: { text: "Feeling overwhelmed, too much going on" },
    });
  }
  for (let i = 0; i < 3; i++) {
    push("painpoint.observed", 12 - i * 2, 17, {
      refs: { painPointId: "pain-le" },
      data: { text: "Low energy today, exhausted" },
    });
  }

  // Procrastination language in chat.
  for (let i = 0; i < 3; i++) {
    push("chat.coaching", 10 - i * 2, 14, {
      userMessage: "I keep procrastinating and putting off those emails.",
      refs: { projectId: "proj-funnel" },
    });
  }

  // Repeated mentions of the funnel (no time block ever scheduled for it).
  for (let i = 0; i < 4; i++) {
    push("chat.coaching", 8 - i, 15, {
      userMessage: "I really need to finish the funnel this week.",
      refs: { projectId: "proj-funnel" },
    });
  }

  // Sales activity only early (last sales event ~20 days ago → sales risk).
  push("chat.coaching", 20, 11, {
    userMessage: "Sent a sales proposal to a prospect and did some outreach.",
    refs: { projectId: "proj-funnel" },
  });
  // Marketing activity recently (so no marketing risk; supports a timing insight).
  for (let i = 0; i < 4; i++) {
    push("chat.coaching", 9 - i * 2, 10, {
      userMessage: "Worked on marketing — drafted content for the funnel campaign.",
      refs: { projectId: "proj-funnel" },
    });
  }

  // Opportunities + a decision.
  push("opportunity.created", 7, 12, {
    refs: { opportunityId: "opp-1", projectId: "proj-app", workspace: "clear-my-mind" },
    data: { text: "Group coaching cohort idea" },
  });
  push("opportunity.created", 4, 12, {
    refs: { opportunityId: "opp-2" },
    data: { text: "Partner with a productivity newsletter" },
  });
  push("decision.created", 5, 16, {
    refs: { decisionId: "dec-1", projectId: "proj-funnel" },
    data: { text: "Beta cohort or full launch first?" },
  });

  return e;
}
