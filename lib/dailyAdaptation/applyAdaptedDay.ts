import {
  readTodayPlanItems,
  updatePlanItem,
} from "@/lib/planMyDay/planDayItems";
import type { PlanDayItem } from "@/lib/planMyDay/types";
import type { AdaptedDayProposal } from "./types";

/**
 * Apply an accepted adapted-day proposal to today's plan items.
 * Soft adjustments only — never deletes member history.
 */
export function applyAdaptedDayProposal(proposal: AdaptedDayProposal): PlanDayItem[] {
  let items = readTodayPlanItems();
  if (items.length === 0) return items;

  for (const adapted of proposal.items) {
    if (adapted.bucket === "add-a-break") continue;
    const existing = items.find((item) => item.id === adapted.itemId);
    if (!existing) continue;

    if (adapted.bucket === "start-with-this") {
      items = updatePlanItem(items, adapted.itemId, {
        column: "doing",
        focusRank: 100,
        notes: adapted.note
          ? mergeNote(existing.notes, adapted.note)
          : existing.notes,
      });
      continue;
    }

    if (adapted.bucket === "keep-today") {
      items = updatePlanItem(items, adapted.itemId, {
        column: existing.column === "doing" ? "doing" : "today",
      });
      continue;
    }

    if (adapted.bucket === "make-smaller") {
      items = updatePlanItem(items, adapted.itemId, {
        column: "today",
        notes: mergeNote(
          existing.notes,
          adapted.note ?? "Make this smaller today",
        ),
        durationMinutes: existing.durationMinutes
          ? Math.max(10, Math.round(existing.durationMinutes / 2))
          : 15,
      });
      continue;
    }

    if (
      adapted.bucket === "move-later" ||
      adapted.bucket === "delegate-or-ask" ||
      adapted.bucket === "remove"
    ) {
      items = updatePlanItem(items, adapted.itemId, {
        column: "ready",
        notes: mergeNote(
          existing.notes,
          adapted.bucket === "delegate-or-ask"
            ? "Consider asking for help"
            : "Moved later from Adapt My Day",
        ),
      });
    }
  }

  return items;
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
