/**
 * Sprint 5 — Confidence Engine
 * Evidence-based confidence (not cheerleading). Tracks wins and surfaces proof.
 */

export type ConfidenceWinKind =
  | "decision_made"
  | "task_completed"
  | "project_started"
  | "project_finished"
  | "problem_solved"
  | "goal_reached"
  | "momentum_progress";

export type ConfidenceWin = {
  id: string;
  kind: ConfidenceWinKind;
  label: string;
  at: string;
  context?: string;
};

const STORAGE_KEY = "companion-confidence-engine-v1";
const MAX_WINS = 120;

function read(): ConfidenceWin[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ConfidenceWin[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(wins: ConfidenceWin[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wins.slice(-MAX_WINS)));
  } catch {
    /* noop */
  }
}

export function recordConfidenceWin(input: {
  kind: ConfidenceWinKind;
  label: string;
  context?: string;
}): ConfidenceWin {
  const win: ConfidenceWin = {
    id: `cw-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kind: input.kind,
    label: input.label.trim().slice(0, 200),
    context: input.context?.trim().slice(0, 300),
    at: new Date().toISOString(),
  };
  write([...read(), win]);
  return win;
}

export function getRecentConfidenceWins(limit = 12): ConfidenceWin[] {
  return [...read()].reverse().slice(0, limit);
}

export function countConfidenceWinsSince(days: number, now = new Date()): number {
  const cutoff = now.getTime() - days * 86_400_000;
  return read().filter((w) => new Date(w.at).getTime() >= cutoff).length;
}

export function confidenceEvidenceLines(wins: ConfidenceWin[]): string[] {
  const lines: string[] = [];
  const weekCount = countConfidenceWinsSince(7);
  if (weekCount >= 2) {
    lines.push(`You've followed through on ${weekCount} things this week.`);
  }
  const latest = wins[0];
  if (latest) {
    lines.push(`Recent progress: ${latest.label}.`);
  }
  const decisions = wins.filter((w) => w.kind === "decision_made").length;
  if (decisions >= 2) {
    lines.push(`You've made ${decisions} recent decisions — that's forward movement.`);
  }
  return lines.slice(0, 3);
}

export function confidenceEngineHintForChat(wins = getRecentConfidenceWins()): string {
  if (!wins.length) {
    return [
      "CONFIDENCE ENGINE (Sprint 5 — invisible):",
      "Build evidence-based confidence — not motivation or cheerleading.",
      "When the user completes something, acknowledge the specific win.",
      "Never shame. Never compare to others. Balance reality with progress.",
    ].join("\n");
  }

  const evidence = confidenceEvidenceLines(wins);
  return [
    "CONFIDENCE ENGINE (Sprint 5 — invisible):",
    "Surface evidence-based confidence — NOT hype.",
    ...evidence.map((e) => `Evidence you may reference naturally: "${e}"`),
    "Never shame, lecture, or compare. Balance unfinished work with real progress.",
  ].join("\n");
}
