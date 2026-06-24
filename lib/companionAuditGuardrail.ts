/**
 * P0.12 — Companion behavior audit guardrail (shared markers + tests).
 */

import markers from "./companion-audit-guardrail-markers.json";

export const COMPANION_BEHAVIOR_PATH_MARKERS = markers as readonly string[];

export const COMPANION_AUDIT_COMMAND = "npm run audit:companion";

export const COMPANION_AUDIT_WARNING = [
  "⚠️ Companion behavior changed.",
  "Run:",
  COMPANION_AUDIT_COMMAND,
  "before commit.",
].join("\n");

export const COMPANION_AUDIT_STATE_FILE = ".companion-audit-state.json";

export type CompanionAuditState = {
  lastRunAt: string;
  lastPassRate: number;
  lastGitCommit: string | null;
  companionFingerprint: string;
};

export function normalizeRepoPath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

export function isCompanionBehaviorPath(filePath: string): boolean {
  const norm = normalizeRepoPath(filePath);
  if (!norm || norm.startsWith("node_modules/")) return false;
  return COMPANION_BEHAVIOR_PATH_MARKERS.some((marker) => norm.includes(marker));
}

export function filterCompanionBehaviorPaths(paths: string[]): string[] {
  return [...new Set(paths.filter(isCompanionBehaviorPath))].sort();
}
