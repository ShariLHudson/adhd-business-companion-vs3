/**
 * Continuity Phase 1 — developer diagnostics (not user-facing).
 */

import {
  buildContinuityManifest,
  CONTINUITY_STORAGE_KEYS,
  type ContinuityManifestItem,
} from "./continuityManifest";

export type ContinuityAuditRow = ContinuityManifestItem & {
  status: "resumable";
};

export function buildContinuityAuditRows(): ContinuityAuditRow[] {
  return buildContinuityManifest().items.map((item) => ({
    ...item,
    status: "resumable",
  }));
}

export function formatContinuityAuditTable(): string {
  const rows = buildContinuityAuditRows();
  if (!rows.length) {
    return "Continuity audit: no resumable items in local storage.";
  }
  const lines = [
    "Continuity audit",
    "================",
    ...rows.map(
      (r) =>
        `[${r.type}] ${r.title}\n` +
        `  id: ${r.id}\n` +
        `  storage: ${r.storageKey}\n` +
        `  lastTouchedAt: ${r.lastTouchedAt}\n` +
        `  location: ${r.location}\n` +
        `  resume: ${r.resumeAction}\n` +
        (r.nextStep ? `  next: ${r.nextStep}\n` : ""),
    ),
    "",
    `Storage keys: ${Object.values(CONTINUITY_STORAGE_KEYS).join(", ")}`,
  ];
  return lines.join("\n");
}

let hookInstalled = false;

/** Dev console: `window.__companionContinuityAudit()` */
export function installContinuityAuditHook(): void {
  if (typeof window === "undefined" || hookInstalled) return;
  if (process.env.NODE_ENV === "production") return;
  hookInstalled = true;
  (
    window as Window & { __companionContinuityAudit?: () => string }
  ).__companionContinuityAudit = () => {
    const table = formatContinuityAuditTable();
    console.info(table);
    return table;
  };
}

export function resetContinuityAuditHookForTests(): void {
  hookInstalled = false;
  if (typeof window !== "undefined") {
    delete (window as Window & { __companionContinuityAudit?: () => string })
      .__companionContinuityAudit;
  }
}
