/**
 * Light Continue / Projects card fields — no creationRecord / deriveCreationIdentity.
 * humanReadableIdentity stays for Create write paths only.
 */

import {
  canonicalStatusFromEntry,
  resolveCanonicalWorkspaceStatus,
} from "./canonicalStatus";
import type { ActiveWorkspaceEntry } from "./types";

export function formatContinueLastWorkedLabel(
  iso: string | null | undefined,
): string {
  if (!iso) return "Recently";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Recently";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfThat = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const dayDiff = Math.round(
    (startOfToday.getTime() - startOfThat.getTime()) / (1000 * 60 * 60 * 24),
  );

  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (dayDiff === 0) return `Today at ${time}`;
  if (dayDiff === 1) return `Yesterday at ${time}`;
  if (dayDiff < 7) {
    const weekday = date.toLocaleDateString(undefined, { weekday: "long" });
    return `${weekday} at ${time}`;
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function continueCardFromRegistryEntry(entry: ActiveWorkspaceEntry): {
  title: string;
  creationType: string;
  statusLabel: string;
  lastWorkedLabel: string;
  progressSummary: string;
  currentFocusTitle: string | null;
} {
  const statusLabel =
    canonicalStatusFromEntry(entry) ||
    resolveCanonicalWorkspaceStatus({
      draftState: entry.draftState,
      progressLabel: entry.progressLabel,
      hasDraft: entry.hasDraft,
    });

  return {
    title: entry.title?.trim() || `Untitled ${entry.creationType || "work"}`,
    creationType: entry.creationType?.trim() || "Creation",
    statusLabel,
    lastWorkedLabel: formatContinueLastWorkedLabel(entry.lastActivityAt),
    progressSummary: entry.progressLabel?.trim() || statusLabel,
    currentFocusTitle: entry.currentFocusTitle ?? null,
  };
}
