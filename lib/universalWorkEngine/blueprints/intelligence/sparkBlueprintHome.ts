/**
 * Spark Blueprint Home view model (100 Phase A).
 * Calm primary view + quiet summary — not a dashboard.
 */

import { listBlueprintAudit } from "../auditHistory";
import { requireBlueprint } from "../registry";
import { evaluateBlueprintHealth } from "./blueprintHealth";
import { certifyBlueprint } from "./blueprintCertification";
import {
  getBlueprintIntelligenceProfile,
  resolveBlueprintLifecycleStatus,
  resolveBlueprintVisibility,
  upsertBlueprintIntelligenceProfile,
} from "./blueprintProfileStore";
import {
  previewBlueprintImpact,
  summarizeBlueprintUsage,
} from "./blueprintUsageImpact";
import type { SparkBlueprintHomeModel } from "./intelligenceTypes";

function countLabel(n: number, singular: string, plural?: string): string {
  const word = n === 1 ? singular : plural ?? `${singular}s`;
  return `${n} ${word}`;
}

export function buildSparkBlueprintHome(
  blueprintId: string,
  version?: string | null,
): SparkBlueprintHomeModel {
  const bp = requireBlueprint(blueprintId, version);
  if (!getBlueprintIntelligenceProfile(blueprintId)) {
    upsertBlueprintIntelligenceProfile({
      blueprintId,
      visibility: resolveBlueprintVisibility(blueprintId, bp.category),
      status: bp.category === "spark" ? "published" : "draft",
      purpose: bp.intendedUse || bp.description,
    });
  }
  const profile = getBlueprintIntelligenceProfile(blueprintId)!;
  const health = evaluateBlueprintHealth(bp);
  const usage = summarizeBlueprintUsage(blueprintId);
  const certification = certifyBlueprint(blueprintId, bp.version);
  const impact = previewBlueprintImpact({
    blueprintId,
    toVersion: bp.version,
  });

  const audit = listBlueprintAudit().filter((e) => e.blueprintId === blueprintId);
  const lastUpdated = audit[0]?.at ?? profile.updatedAt ?? null;

  const status = resolveBlueprintLifecycleStatus(blueprintId);
  let primaryAction: SparkBlueprintHomeModel["primaryAction"] = "continue_editing";
  if (status === "published" && usage.activeWorkCount >= 0) {
    primaryAction = "create_work";
  }
  if (status === "draft" && certification.status !== "not_ready") {
    primaryAction = "publish_version";
  }
  if (status === "draft") {
    primaryAction = usage.activeWorkCount > 0 ? "continue_editing" : "publish_version";
  }

  return {
    blueprintId: bp.blueprintId,
    name: bp.title,
    purpose: profile.purpose?.trim() || bp.intendedUse || bp.description || "",
    currentVersion: bp.version,
    status,
    visibility: resolveBlueprintVisibility(blueprintId, bp.category),
    lastUpdated,
    workTypeIds: bp.compatibleWorkTypeIds,
    primaryAction,
    quietSummary: {
      usedByActiveWorksLabel: `Used by ${countLabel(usage.activeWorkCount, "active Work", "active Works")}`,
      linkedProjectsLabel: countLabel(usage.linkedProjects, "linked Project"),
      linkedCalendarLabel: countLabel(usage.linkedCalendar, "Calendar item"),
      linkedTasksLabel: countLabel(usage.linkedTasks, "Task"),
      linkedVisualMapsLabel: countLabel(
        usage.linkedVisualThinking,
        "visual map",
      ),
      healthLabel: health.summaryLine,
    },
    health,
    usage,
    certification,
    impact,
  };
}

export function publishBlueprintVersion(blueprintId: string): void {
  upsertBlueprintIntelligenceProfile({
    blueprintId,
    status: "published",
  });
}
