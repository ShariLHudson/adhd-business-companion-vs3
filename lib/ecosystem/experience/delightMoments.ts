// Founder Ecosystem — Phase 19 Founder Delight Moments.
// Wow, trust, relief, momentum, confidence — specific triggers from the stream.

import type { FounderEvent } from "../events";
import type { ID } from "../models";
import { buildFounderMemory } from "../memory/founderMemoryEngine";
import type { DelightMoment } from "./experienceTypes";

const DAY = 86_400_000;

let seq = 0;
const did = () => `delight-${++seq}`;

export function detectDelightMoments(
  events: FounderEvent[],
  founderId: ID,
  now: Date = new Date(),
): DelightMoment[] {
  seq = 0;
  const mine = events.filter((e) => e.founderId === founderId);
  const memory = buildFounderMemory(mine, founderId);
  const moments: DelightMoment[] = [];

  // Remembering a decision from weeks ago.
  const decisions = mine.filter((e) => e.type === "decision.created");
  const oldDecision = decisions.find(
    (d) => now.getTime() - new Date(d.ts).getTime() > 14 * DAY,
  );
  if (oldDecision) {
    moments.push({
      id: did(),
      kind: "trust",
      trigger: "decision-recall",
      message: `You decided "${String(oldDecision.data?.text ?? "").slice(0, 60)}…" a while back — still relevant?`,
      ts: oldDecision.ts,
    });
  }

  // Finding a lost document / draft.
  const docs = mine.filter((e) => e.type === "document.created");
  const dormantDoc = docs.find(
    (d) =>
      now.getTime() - new Date(d.ts).getTime() > 7 * DAY &&
      !mine.some(
        (e) =>
          e.refs?.documentId === d.refs?.documentId &&
          e.type === "document.exported" &&
          new Date(e.ts) > new Date(d.ts),
      ),
  );
  if (dormantDoc) {
    moments.push({
      id: did(),
      kind: "relief",
      trigger: "document-resurface",
      message: `Your draft "${String(dormantDoc.data?.title ?? "document")}" is still here — pick up where you left off.`,
      ts: dormantDoc.ts,
    });
  }

  // Knowing exactly what to work on (recent action completed chain).
  const recentActions = mine.filter((e) => e.type === "action.completed").slice(-3);
  if (recentActions.length >= 2) {
    moments.push({
      id: did(),
      kind: "momentum",
      trigger: "action-streak",
      message: "You've been finishing what you start — that's the loop working.",
      ts: recentActions[recentActions.length - 1]!.ts,
    });
  }

  // Celebrating a win.
  const projectDone = mine.filter((e) => e.type === "project.completed").slice(-1)[0];
  if (projectDone) {
    moments.push({
      id: did(),
      kind: "confidence",
      trigger: "project-completed",
      message: "Project completed — that's a real business milestone.",
      ts: projectDone.ts,
    });
  }

  // Connecting ideas automatically (opportunity linked to project).
  const opps = memory.opportunities.filter((o) => o.status !== "completed");
  if (opps.length > 0 && memory.projects.length > 0) {
    moments.push({
      id: did(),
      kind: "wow",
      trigger: "idea-connection",
      message: `Your opportunity "${opps[0]!.idea.slice(0, 50)}…" could connect to ${memory.projects[0]!.name}.`,
    });
  }

  // First focus session ever — confidence.
  const focusCount = mine.filter((e) => e.type === "focus.completed").length;
  if (focusCount === 1) {
    const f = mine.find((e) => e.type === "focus.completed")!;
    moments.push({
      id: did(),
      kind: "confidence",
      trigger: "first-focus",
      message: "First focus session done — you proved you can protect deep work.",
      ts: f.ts,
    });
  }

  return moments.slice(0, 6);
}
