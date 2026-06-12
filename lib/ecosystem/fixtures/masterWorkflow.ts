// Founder Ecosystem — Master Workflow simulator.
// Replays the 20-step founder day (Monday morning → next day) as an event
// stream, so the integration test can prove every layer composes. Uses the
// Phase 1 `ev` builders; deterministic relative to `now`. Placeholder data.

import type { FounderEvent, NewEvent } from "../events";
import { ev } from "../events";

export const WORKFLOW_FOUNDER_ID = "founder-001";

export function simulateMasterWorkflow(
  founderId: string = WORKFLOW_FOUNDER_ID,
  nowDate: Date = new Date(),
): FounderEvent[] {
  const f = founderId;
  const out: FounderEvent[] = [];
  let n = 0;
  const ts = (daysAgo: number, hour: number, min = 0) => {
    const d = new Date(nowDate);
    d.setUTCDate(d.getUTCDate() - daysAgo);
    d.setUTCHours(hour, min, 0, 0);
    return d.toISOString();
  };
  const add = (ne: NewEvent, t: string) =>
    out.push({ id: `m${++n}`, ts: t, ...ne });

  // Active projects exist for the day.
  add(ev.projectCreated(f, "proj-app", "ADHD Business Ecosystem"), ts(0, 7));
  add(ev.projectCreated(f, "proj-funnel", "Sales Funnel"), ts(0, 7, 1));
  add(ev.projectCreated(f, "proj-workshop", "Workshop Launch"), ts(0, 7, 2));

  // STEP 1 — morning check-in.
  add(
    ev.checkin(
      f,
      { energy: "medium", focus: "high", motivation: "medium" },
      ["Launch Beta", "Get First 10 Users", "Complete Funnel"],
    ),
    ts(0, 8),
  );

  // STEP 2 — priority discovery ("too much to do") → captured items.
  add(ev.chatCoaching(f, "I have too much to do"), ts(0, 8, 5));
  add(ev.noteCaptured(f, "Catch up on emails", "task"), ts(0, 8, 6));
  add(ev.noteCaptured(f, "Finish the funnel", "task"), ts(0, 8, 7));
  add(ev.noteCaptured(f, "Build the app intelligence layer", "task"), ts(0, 8, 8));
  add(ev.noteCaptured(f, "Plan the workshop", "task"), ts(0, 8, 9));

  // STEP 3 — project selection (ADHD app).
  add(ev.workspaceOpened(f, "projects"), ts(0, 8, 12));

  // STEP 5 — decision support.
  add(
    ev.decisionCreated(
      f,
      "dec-engine",
      "Build the Founder Event Engine next — everything else depends on it",
      "proj-app",
    ),
    ts(0, 8, 20),
  );

  // STEP 6/7 — work session + time block (project + task auto-filled).
  add(ev.workspaceOpened(f, "time-block"), ts(0, 8, 25));
  add(
    {
      founderId: f,
      type: "timeblock.created",
      refs: { timeBlockId: "tb-app", projectId: "proj-app", workspace: "time-block" },
      data: {
        durationMin: 90,
        title: "Founder Event Engine",
        scheduledFor: ts(-0, 9), // later today
      },
    },
    ts(0, 8, 26),
  );

  // STEP 8 — focus session.
  add(ev.focusStarted(f, 90, "proj-app"), ts(0, 9));
  add(ev.focusCompleted(f, 90, "proj-app"), ts(0, 10, 30));

  // STEP 9/10 — document creation (SOP, Google Doc) + drafting.
  add(
    ev.documentCreated(f, "doc-sop", "sop", "Founder Event Engine SOP", "proj-app"),
    ts(0, 10, 35),
  );
  add(
    ev.assistedActionAccepted(f, "Help me draft the SOP", { documentId: "doc-sop" }),
    ts(0, 10, 40),
  );

  // STEP 11 — research.
  add(
    ev.research(
      f,
      "event-sourcing best practices",
      "Append-only events; derive state; keep them immutable.",
      ["https://example.com/event-sourcing"],
      { projectId: "proj-app", documentId: "doc-sop" },
    ),
    ts(0, 11),
  );

  // STEP 13 — interruption → opportunity (idea).
  add(
    ev.opportunityCreated(f, "opp-board", "A public Founder Board template idea"),
    ts(0, 11, 20),
  );

  // STEP 14 — brain dump.
  add(ev.noteCaptured(f, "Remind me about onboarding flow", "question"), ts(0, 11, 25));

  // STEP 16 — stuck detection: repeated outreach avoidance (5×).
  for (let i = 0; i < 5; i++) {
    add(
      ev.chatCoaching(f, "I keep avoiding the outreach emails for the funnel", {
        projectId: "proj-funnel",
      }),
      ts(0, 11, 30 + i),
    );
  }
  add(
    ev.painPointObserved(f, "pain-outreach", "Avoiding outreach again"),
    ts(0, 11, 40),
  );

  // STEP 18 — win capture (finished the SOP → exported).
  add(
    ev.documentExported(f, "doc-sop", "google-doc", "https://docs.google.com/PLACEHOLDER"),
    ts(0, 11, 50),
  );
  add(ev.taskCreated(f, "task-sop", "proj-app", "Write the SOP"), ts(0, 10, 34));
  add(ev.taskCompleted(f, "task-sop", "proj-app"), ts(0, 11, 51));

  // STEP 20 — next day: a new check-in. Everything before still remembered.
  add(
    ev.checkin(
      f,
      { energy: "high", focus: "medium", motivation: "high" },
      ["Complete Funnel", "First 10 Users"],
    ),
    ts(-1, 8), // next morning (one day after `now`)
  );

  return out;
}
