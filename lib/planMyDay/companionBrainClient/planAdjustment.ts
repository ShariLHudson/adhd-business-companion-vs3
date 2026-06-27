/**
 * Today's Plan adjustments — swap recommendations without changing Today's Reality.
 * Companion Brain client — uses judgment + board state, not page reasoning.
 */

import type { CompanionJudgmentResult, CompanionProposal } from "@/lib/companionBrain";
import { getProjects, todayStr } from "@/lib/companionStore";
import type { PlanDayItem, PlanItemColumn } from "@/lib/planMyDay/types";
import {
  readParkingLotPlanItems,
  saveTodayPlanItems,
  updatePlanItem,
  bringParkingLotItemToToday,
} from "@/lib/planMyDay/planDayItems";
import { proposalsToPlanItems } from "./materializeProposals";
import { whyTodayForItem } from "./whyToday";

export const PLAN_ADJUSTMENT_INTRO =
  "Want to swap something? Let's see what else might fit today.";

export const PLAN_ADJUSTMENT_REALITY_LINK =
  "My day actually changed — update Today's Reality";

export type PlanSwapSource =
  | "ready"
  | "held"
  | "parking-lot"
  | "proposal"
  | "deadline"
  | "project";

export type PlanSwapOption = {
  id: string;
  title: string;
  source: PlanSwapSource;
  sourceLabel: string;
  itemId?: string;
  proposalId?: string;
  reason: string;
};

export type PlanSwapOffer = {
  currentItemId: string;
  currentTitle: string;
  alternatives: PlanSwapOption[];
};

export type PlanAdjustmentPresentation = {
  intro: string;
  offers: PlanSwapOffer[];
  extras: PlanSwapOption[];
};

function normTitle(title: string): string {
  return title.trim().toLowerCase();
}

function focusItems(items: PlanDayItem[]): PlanDayItem[] {
  return items.filter(
    (i) => !i.done && (i.column === "today" || i.column === "doing"),
  );
}

function existingTitles(items: PlanDayItem[]): Set<string> {
  return new Set(items.map((i) => normTitle(i.title)));
}

function optionFromItem(
  item: PlanDayItem,
  source: PlanSwapSource,
  sourceLabel: string,
  reason: string,
): PlanSwapOption {
  return {
    id: `item-${item.id}`,
    title: item.title,
    source,
    sourceLabel,
    itemId: item.id,
    reason,
  };
}

function optionFromProposal(
  proposal: CompanionProposal,
  reason: string,
): PlanSwapOption {
  return {
    id: `proposal-${proposal.id}`,
    title: proposal.label,
    source: "proposal",
    sourceLabel: "Shari's suggestion",
    proposalId: proposal.id,
    reason,
  };
}

function gatherAlternativePool(
  items: PlanDayItem[],
  judgment: CompanionJudgmentResult,
): PlanSwapOption[] {
  const titles = existingTitles(items);
  const today = todayStr();
  const pool: PlanSwapOption[] = [];
  const projectNames = new Set(
    getProjects()
      .filter((p) => p.status !== "completed")
      .map((p) => normTitle(p.name)),
  );

  for (const item of items) {
    if (item.done) continue;
    if (item.column === "ready") {
      pool.push(
        optionFromItem(item, "ready", "Ready when you are", "Already on your board"),
      );
    }
    if (item.column === "parked") {
      pool.push(
        optionFromItem(
          item,
          "held",
          "Being held",
          "Carried for you — still available",
        ),
      );
    }
    if (
      item.dueDate &&
      item.dueDate >= today &&
      item.column !== "today" &&
      item.column !== "doing"
    ) {
      pool.push(
        optionFromItem(
          item,
          "deadline",
          "Upcoming deadline",
          `Due ${item.dueDate === today ? "today" : item.dueDate}`,
        ),
      );
    }
    if (item.projectId) {
      const project = getProjects().find((p) => p.id === item.projectId);
      if (project) {
        pool.push(
          optionFromItem(
            item,
            "project",
            project.name,
            "Connected to an active project",
          ),
        );
      }
    }
  }

  for (const parked of readParkingLotPlanItems()) {
    if (titles.has(normTitle(parked.title))) continue;
    pool.push({
      id: `parking-${parked.id}`,
      title: parked.title,
      source: "parking-lot",
      sourceLabel: "Parking lot",
      itemId: parked.id,
      reason: "Waiting for the right day",
    });
  }

  for (const proposal of judgment.proposals) {
    if (titles.has(normTitle(proposal.label))) continue;
    const reason =
      proposal.reason?.trim() ||
      "Another path Shari had in mind for today";
    pool.push(optionFromProposal(proposal, reason));
  }

  for (const candidate of judgment.momentum.label
    ? items.filter((i) =>
        normTitle(i.title).includes(normTitle(judgment.momentum.label!)),
      )
    : []) {
    if (candidate.column === "today" || candidate.column === "doing") continue;
    pool.push(
      optionFromItem(candidate, "ready", "Momentum fit", "Aligns with today's momentum"),
    );
  }

  const seen = new Set<string>();
  return pool.filter((opt) => {
    const key = normTitle(opt.title);
    if (seen.has(key)) return false;
    seen.add(key);
    if (projectNames.has(key)) return true;
    return true;
  });
}

export function gatherPlanAdjustmentPresentation(
  items: PlanDayItem[],
  judgment: CompanionJudgmentResult,
): PlanAdjustmentPresentation {
  const focus = focusItems(items);
  const pool = gatherAlternativePool(items, judgment);
  const used = new Set<string>();

  const offers: PlanSwapOffer[] = focus.map((current) => {
    const currentKey = normTitle(current.title);
    const alternatives = pool
      .filter((opt) => normTitle(opt.title) !== currentKey)
      .filter((opt) => !used.has(opt.id))
      .slice(0, 3);
    alternatives.forEach((a) => used.add(a.id));
    return {
      currentItemId: current.id,
      currentTitle: current.title,
      alternatives,
    };
  });

  const extras = pool.filter((opt) => !used.has(opt.id)).slice(0, 5);

  return {
    intro: PLAN_ADJUSTMENT_INTRO,
    offers,
    extras,
  };
}

function resolveSwapInItem(
  items: PlanDayItem[],
  option: PlanSwapOption,
  targetColumn: PlanItemColumn,
  judgment: CompanionJudgmentResult,
): { items: PlanDayItem[]; swapInId: string | null } {
  if (option.itemId) {
    const onBoard = items.some((i) => i.id === option.itemId);
    if (onBoard) {
      return {
        items: updatePlanItem(items, option.itemId, { column: targetColumn }),
        swapInId: option.itemId,
      };
    }
    if (option.source === "parking-lot") {
      const brought = bringParkingLotItemToToday(option.itemId);
      const hit = brought.find((i) => i.id === option.itemId);
      if (hit) {
        return {
          items: updatePlanItem(brought, option.itemId, { column: targetColumn }),
          swapInId: option.itemId,
        };
      }
    }
  }

  if (option.proposalId) {
    const proposal = judgment.proposals.find((p) => p.id === option.proposalId);
    if (!proposal) return { items, swapInId: null };
    const created = proposalsToPlanItems([proposal], null, judgment).map(
      (item) => ({
        ...item,
        column: targetColumn,
        notes: whyTodayForItem(item, judgment),
      }),
    );
    const next = saveTodayPlanItems([...items, ...created]);
    return { items: next, swapInId: created[0]?.id ?? null };
  }

  return { items, swapInId: null };
}

/** Swap a focus item for an alternative — reality unchanged. */
export function applyPlanSwap(
  items: PlanDayItem[],
  swapOutId: string,
  option: PlanSwapOption,
  judgment: CompanionJudgmentResult,
): PlanDayItem[] {
  const swapOut = items.find((i) => i.id === swapOutId);
  if (!swapOut) return items;

  const targetColumn: PlanItemColumn =
    swapOut.column === "doing" ? "doing" : "today";

  let next = updatePlanItem(items, swapOutId, {
    column: "ready",
    notes: swapOut.notes,
  });

  const resolved = resolveSwapInItem(next, option, targetColumn, judgment);
  return resolved.items;
}

/** Hide a focus item for today without changing reality. */
export function hidePlanItemForToday(
  items: PlanDayItem[],
  itemId: string,
): PlanDayItem[] {
  return updatePlanItem(items, itemId, { column: "parked" });
}

/** Promote an extra alternative into today's focus. */
export function addPlanAlternativeToFocus(
  items: PlanDayItem[],
  option: PlanSwapOption,
  judgment: CompanionJudgmentResult,
): PlanDayItem[] {
  const resolved = resolveSwapInItem(items, option, "today", judgment);
  return resolved.items;
}
