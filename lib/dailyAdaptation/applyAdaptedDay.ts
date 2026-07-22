import {
  loadTodayPlanItems,
  readTodayPlanItems,
  saveTodayPlanItems,
} from "@/lib/planMyDay/planDayItems";
import {
  loadPlanWorkflowState,
  savePlanWorkflowState,
} from "@/lib/planMyDay/completePlanWorkflow";
import type { PlanDayItem } from "@/lib/planMyDay/types";
import type { AdaptedDayProposal } from "./types";

/**
 * Apply an accepted adapted-day proposal to today's plan items.
 * Soft adjustments only — never deletes member history or wipes Today's List.
 */
export function applyAdaptedDayProposal(
  proposal: AdaptedDayProposal,
  fallbackItems?: PlanDayItem[],
): PlanDayItem[] {
  // Prefer the hydrated today list (unparks parked items). Fall back to a
  // raw read, then to caller-provided items so Adapt never clears a live list.
  let items = loadTodayPlanItems();
  if (items.length === 0) {
    items = readTodayPlanItems();
  }
  if (items.length === 0 && fallbackItems && fallbackItems.length > 0) {
    items = saveTodayPlanItems(fallbackItems);
  }
  if (items.length === 0) return items;

  const byId = new Map(items.map((item) => [item.id, item]));
  const now = new Date().toISOString();
  let startWithId: string | null = null;
  const keepIds: string[] = [];
  const laterIds: string[] = [];

  for (const adapted of proposal.items) {
    if (adapted.bucket === "add-a-break") continue;
    const existing = byId.get(adapted.itemId);
    if (!existing) continue;

    if (adapted.bucket === "start-with-this") {
      startWithId = adapted.itemId;
      byId.set(adapted.itemId, {
        ...existing,
        column: "doing",
        focusRank: 100,
        notes: adapted.note
          ? mergeNote(existing.notes, adapted.note)
          : existing.notes,
        updatedAt: now,
      });
      continue;
    }

    if (adapted.bucket === "keep-today") {
      keepIds.push(adapted.itemId);
      byId.set(adapted.itemId, {
        ...existing,
        column: existing.column === "doing" ? "doing" : "today",
        notes: adapted.note
          ? mergeNote(existing.notes, adapted.note)
          : existing.notes,
        updatedAt: now,
      });
      continue;
    }

    if (adapted.bucket === "make-smaller") {
      keepIds.push(adapted.itemId);
      byId.set(adapted.itemId, {
        ...existing,
        column: "today",
        notes: mergeNote(
          existing.notes,
          adapted.note ?? "Make this smaller today",
        ),
        durationMinutes: existing.durationMinutes
          ? Math.max(10, Math.round(existing.durationMinutes / 2))
          : 15,
        updatedAt: now,
      });
      continue;
    }

    if (
      adapted.bucket === "move-later" ||
      adapted.bucket === "delegate-or-ask" ||
      adapted.bucket === "remove"
    ) {
      laterIds.push(adapted.itemId);
      // Stay on Today's List — soft "later" — so Adapt never looks like a wipe.
      byId.set(adapted.itemId, {
        ...existing,
        column: "today",
        priority: "low",
        focusRank: existing.focusRank && existing.focusRank < 50
          ? existing.focusRank
          : 10,
        notes: mergeNote(
          existing.notes,
          adapted.bucket === "delegate-or-ask"
            ? "Consider asking for help"
            : "Moved later from Adapt My Day",
        ),
        updatedAt: now,
      });
    }
  }

  const next = saveTodayPlanItems(Array.from(byId.values()));
  syncWorkflowFromAdaptedProposal(proposal, next, {
    startWithId,
    keepIds,
    laterIds,
  });
  return next;
}

function syncWorkflowFromAdaptedProposal(
  proposal: AdaptedDayProposal,
  items: PlanDayItem[],
  buckets: {
    startWithId: string | null;
    keepIds: string[];
    laterIds: string[];
  },
): void {
  const prior = loadPlanWorkflowState();
  const orderedTaskIds = [
    ...(buckets.startWithId ? [buckets.startWithId] : []),
    ...buckets.keepIds.filter((id) => id !== buckets.startWithId),
  ];
  const parkedTaskIds = buckets.laterIds.filter(
    (id) => !orderedTaskIds.includes(id),
  );
  const primaryOutcomeId =
    buckets.startWithId ?? orderedTaskIds[0] ?? prior.primaryOutcomeId;

  savePlanWorkflowState({
    ...prior,
    stage: prior.stage === "capture" ? "planned" : prior.stage,
    primaryOutcomeId,
    currentTaskId: primaryOutcomeId,
    orderedTaskIds:
      orderedTaskIds.length > 0 ? orderedTaskIds : prior.orderedTaskIds,
    secondaryOutcomeIds: orderedTaskIds.slice(1, 3),
    parkedTaskIds:
      parkedTaskIds.length > 0 ? parkedTaskIds : prior.parkedTaskIds,
    firstStepText: proposal.startWithTitle
      ? `Begin with “${proposal.startWithTitle}” — the gentlest useful start for right now.`
      : prior.firstStepText,
    fitMessage: proposal.guidance,
    companionNotes: [
      proposal.guidance,
      ...prior.companionNotes.filter((note) => note !== proposal.guidance),
    ].slice(0, 4),
  });

  // Touch items length so TypeScript / linters know we used the applied list.
  void items.length;
}

function mergeNote(
  existing: string | undefined,
  addition: string,
): string {
  const base = existing?.trim() ?? "";
  if (!base) return addition;
  if (base.includes(addition)) return base;
  return `${base}\n${addition}`;
}
