/**
 * Permission Intelligence™ — relief through intentional exclusion.
 * @see constitution.ts — evaluatePermission
 */

import type { AssembledContext, PermissionDecision } from "./types";

const HEAVY_RE =
  /\b(launch|funnel|website|rebuild|newsletter draft|marketing plan)\b/i;

export function evaluatePermission(ctx: AssembledContext): PermissionDecision {
  if (ctx.cycleState === "protected" || ctx.dayMode === "celebration") {
    return { excluded: [], display: "none", summaryCount: 0 };
  }

  const excluded: PermissionDecision["excluded"] = [];

  for (const topic of ctx.exclusions) {
    excluded.push({
      label: topic,
      reason: "Intentionally left off today's scope.",
    });
  }

  for (const topic of ctx.suppressTopics) {
    if (!excluded.some((e) => e.label === topic)) {
      excluded.push({
        label: topic,
        reason: "Not relevant or duplicate — cognitive safeguard.",
      });
    }
  }

  if (ctx.dayMode === "health") {
    for (const c of ctx.candidates.filter((x) => !x.themes.includes("health"))) {
      excluded.push({
        label: c.label,
        reason: "Health day — business can wait.",
      });
    }
  }

  if (ctx.dayMode === "family") {
    for (const c of ctx.candidates.filter((x) => !x.themes.includes("courtesy"))) {
      excluded.push({
        label: c.label,
        reason: "Family first — not today.",
      });
    }
  }

  if (ctx.dayMode === "survival" || ctx.dayMode === "recovery") {
    for (const c of ctx.candidates.filter((x) => HEAVY_RE.test(x.label))) {
      excluded.push({
        label: c.label,
        reason: "Capacity mismatch — safely waiting.",
      });
    }
  }

  if (ctx.capacity.energy === "high" && ctx.capacity.motivation === "scattered") {
    for (const c of ctx.candidates.filter((x) => HEAVY_RE.test(x.label))) {
      if (!excluded.some((e) => e.label === c.label)) {
        excluded.push({
          label: c.label,
          reason: "Excitement is not unlimited capacity.",
        });
      }
    }
  }

  if (ctx.overloadDetected && ctx.captureLoad?.thoughtCount) {
    const cap = Math.max(0, ctx.captureLoad.thoughtCount - 3);
    if (cap > 0) {
      excluded.push({
        label: `${cap} captured thoughts`,
        reason: "Overwhelm guard — not listing all at once.",
      });
    }
  }

  return {
    excluded,
    display: ctx.permissionDisplay,
    summaryCount: excluded.length,
  };
}
