/**
 * Spec 129 — Context-aware Create suggestions.
 * Match Work Type / recent activity; never show unrelated Event templates for Marketing/Media work.
 */

import type { CreateCatalogCategory } from "@/lib/createCatalog";
import { resolveWorkTypeIdFromLabel } from "@/lib/workTypeSchema/registry";
import { EVENT_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema";
import { MARKETING_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/marketingPlanMap";
import type { ActiveCreationWorkspaceSummary } from "./listActiveCreationWorkspaces";

/** Catalog category ids that are event-shaped. */
const EVENT_CATEGORY_IDS = new Set([
  "events",
  "event",
  "workshops",
  "retreats",
]);

/** Catalog category ids that are marketing / media-shaped. */
const MARKETING_CATEGORY_IDS = new Set([
  "marketing",
  "content",
  "media",
  "social",
  "communications",
]);

export type CreateSuggestionContext = {
  workTypeId?: string | null;
  kindLabel?: string | null;
};

function inferWorkTypeIdFromKindLabel(kindLabel: string): string {
  const resolved = resolveWorkTypeIdFromLabel(kindLabel);
  if (resolved) return resolved;
  const label = kindLabel.toLowerCase();
  // Media / content calendars are marketing-shaped (not Event Plan).
  if (/\b(media|content|calendar|newsletter|campaign|social)\b/.test(label)) {
    return MARKETING_PLAN_WORK_TYPE_ID;
  }
  return EVENT_PLAN_WORK_TYPE_ID;
}

/** Infer preferred guided-framework Work Type from the most recent active Work. */
export function inferPreferredWorkTypeIdFromActiveWork(
  workspaces: readonly ActiveCreationWorkspaceSummary[],
): string {
  const recent = workspaces[0];
  if (!recent?.kindLabel?.trim()) return EVENT_PLAN_WORK_TYPE_ID;
  return inferWorkTypeIdFromKindLabel(recent.kindLabel);
}

export function resolveSuggestionContext(
  workspaces: readonly ActiveCreationWorkspaceSummary[],
): CreateSuggestionContext {
  const recent = workspaces[0];
  if (!recent) return {};
  return {
    kindLabel: recent.kindLabel,
    workTypeId: inferWorkTypeIdFromKindLabel(recent.kindLabel),
  };
}

function isEventContext(ctx: CreateSuggestionContext): boolean {
  const id = (ctx.workTypeId ?? "").trim();
  if (id === EVENT_PLAN_WORK_TYPE_ID) return true;
  const label = (ctx.kindLabel ?? "").toLowerCase();
  return /\b(event|retreat|workshop|webinar|conference|summit)\b/.test(label);
}

function isMarketingContext(ctx: CreateSuggestionContext): boolean {
  const id = (ctx.workTypeId ?? "").trim();
  if (id === MARKETING_PLAN_WORK_TYPE_ID) return true;
  const label = (ctx.kindLabel ?? "").toLowerCase();
  return /\b(marketing|media|content|calendar|newsletter|campaign)\b/.test(
    label,
  );
}

/**
 * Filter browse catalog so suggestions match current Work context.
 * Empty context → unchanged catalog (first-time / no active work).
 */
export function filterCatalogByWorkContext(
  catalog: readonly CreateCatalogCategory[],
  ctx: CreateSuggestionContext,
): CreateCatalogCategory[] {
  if (!ctx.workTypeId && !ctx.kindLabel) {
    return catalog.map((c) => ({ ...c, items: [...c.items] }));
  }

  if (isMarketingContext(ctx) && !isEventContext(ctx)) {
    return catalog
      .filter((cat) => !EVENT_CATEGORY_IDS.has(cat.id.toLowerCase()))
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => {
          const label = item.label.toLowerCase();
          // Drop event-shaped items even when nested under other categories.
          return !/\b(event|retreat|workshop|webinar|conference)\b/.test(label);
        }),
      }))
      .filter((cat) => cat.items.length > 0)
      .sort((a, b) => {
        const aBoost = MARKETING_CATEGORY_IDS.has(a.id.toLowerCase()) ? 0 : 1;
        const bBoost = MARKETING_CATEGORY_IDS.has(b.id.toLowerCase()) ? 0 : 1;
        return aBoost - bBoost;
      });
  }

  if (isEventContext(ctx)) {
    return catalog
      .map((cat) => ({ ...cat, items: [...cat.items] }))
      .sort((a, b) => {
        const aBoost = EVENT_CATEGORY_IDS.has(a.id.toLowerCase()) ? 0 : 1;
        const bBoost = EVENT_CATEGORY_IDS.has(b.id.toLowerCase()) ? 0 : 1;
        return aBoost - bBoost;
      });
  }

  return catalog.map((c) => ({ ...c, items: [...c.items] }));
}

/** True when a guided-framework Work Type fits the active context. */
export function isWorkTypeRelevantToContext(
  workTypeId: string,
  ctx: CreateSuggestionContext,
): boolean {
  const id = workTypeId.trim();
  if (!ctx.workTypeId && !ctx.kindLabel) return true;
  if (isMarketingContext(ctx) && !isEventContext(ctx)) {
    return id !== EVENT_PLAN_WORK_TYPE_ID;
  }
  if (isEventContext(ctx)) {
    return id === EVENT_PLAN_WORK_TYPE_ID || id === ctx.workTypeId;
  }
  return true;
}
