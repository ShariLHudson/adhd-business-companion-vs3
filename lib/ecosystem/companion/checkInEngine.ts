// Founder Ecosystem — Phase 13 Proactive Check-In Engine.
// Supportive, optional observations — re-engage a frequently-mentioned project,
// gently note a dormant one, ride current momentum, revisit a parked idea, or
// offer a weekly look-back. NEVER nags, guilts, or pressures: every check-in is
// phrased as an invitation the founder can decline. Pure.

import type { FounderEvent, ID } from "../events";
import type { FounderIntelligence } from "../intelligence/intelligenceTypes";
import { getFounderIntelligence } from "../intelligence/founderIntelligenceEngine";
import { detectMomentumPatterns } from "./momentumPatternEngine";
import type { CheckIn } from "./companionTypes";

const DAY = 86_400_000;
const DORMANT_DAYS = 14;

let seq = 0;
const cid = () => `checkin:${++seq}`;

type ProjInfo = { id: ID; title: string; last: number };

function projectInfo(events: FounderEvent[]): ProjInfo[] {
  const titles = new Map<ID, string>();
  const last = new Map<ID, number>();
  const completed = new Set<ID>();
  for (const e of events) {
    const pid = e.refs?.projectId;
    if (e.type === "project.created" && pid)
      titles.set(pid, (e.data?.title as string) ?? "a project");
    if (e.type === "project.completed" && pid) completed.add(pid);
    if (pid) last.set(pid, Math.max(last.get(pid) ?? 0, new Date(e.ts).getTime()));
  }
  return [...titles.entries()]
    .filter(([id]) => !completed.has(id))
    .map(([id, title]) => ({ id, title, last: last.get(id) ?? 0 }));
}

export type CheckInOptions = { now?: Date; intel?: FounderIntelligence; limit?: number };

export function generateCheckIns(
  events: FounderEvent[],
  founderId: ID,
  opts: CheckInOptions = {},
): CheckIn[] {
  seq = 0;
  const now = opts.now ?? new Date();
  const mine = events.filter((e) => e.founderId === founderId);
  const intel = opts.intel ?? getFounderIntelligence(mine, founderId, now.toISOString());
  const momentum = detectMomentumPatterns(mine, founderId, intel);
  const projects = projectInfo(mine);
  const out: CheckIn[] = [];

  // 1) Re-engage — a project mentioned a lot recently.
  const frequent = intel.memory.frequentProjects[0];
  if (frequent && frequent.mentions >= 3) {
    out.push({
      id: cid(),
      kind: "re-engage",
      message: `You've mentioned ${frequent.label} several times lately. Want to spend a little time on it today?`,
      tone: "supportive",
    });
  }

  // 2) Momentum — ride the project with the most pull.
  if (momentum.bestProject) {
    out.push({
      id: cid(),
      kind: "momentum",
      message: `${momentum.bestProject.label} has the most momentum right now. Want to keep that going?`,
      relatedId: momentum.bestProject.id,
      tone: "supportive",
    });
  }

  // 3) Dormant — a project gone quiet (noted gently, never guilt).
  const dormant = projects
    .filter((p) => p.last > 0 && now.getTime() - p.last > DORMANT_DAYS * DAY)
    .sort((a, b) => a.last - b.last)[0];
  if (dormant) {
    const days = Math.floor((now.getTime() - dormant.last) / DAY);
    out.push({
      id: cid(),
      kind: "dormant-project",
      message: `It's been about ${days} days since ${dormant.title}. No rush — want to take a quick look together?`,
      relatedId: dormant.id,
      tone: "supportive",
    });
  }

  // 4) Opportunity — a parked idea worth revisiting.
  const parked = intel.opportunities.find(
    (o) => o.status === "idea" || o.status === "parked",
  );
  if (parked) {
    out.push({
      id: cid(),
      kind: "opportunity",
      message: `Earlier you captured an idea: "${parked.text}". Want to explore it, or leave it parked for now?`,
      relatedId: parked.id,
      tone: "supportive",
    });
  }

  // 5) Reflection — only when there's been real activity to look back on.
  if (intel.wins.length >= 3) {
    out.push({
      id: cid(),
      kind: "reflection",
      message: `You've had a few wins this week. Want to take a minute to look back at what worked?`,
      tone: "supportive",
    });
  }

  return out.slice(0, opts.limit ?? 4);
}

// Guard used by tests + callers: a check-in must never pressure or guilt.
const PRESSURE_RE = /\b(you (should|must|need to|have to|failed|forgot|never)|why haven'?t you|behind|lazy|disappointing)\b/i;
export function isSupportiveCheckIn(c: CheckIn): boolean {
  return c.tone === "supportive" && !PRESSURE_RE.test(c.message);
}
