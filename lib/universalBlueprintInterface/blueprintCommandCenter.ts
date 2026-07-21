/**
 * 106 — Blueprint Command Center model.
 * Lightweight orientation — not a dashboard.
 */

import {
  buildSparkBlueprintHome,
  listBlueprintAudit,
  listWorkBlueprintStates,
  listWorkRelationships,
  formatWhereThisIsUsed,
  summarizeBlueprintUsage,
} from "@/lib/universalWorkEngine";
import { resolveBlueprintCapabilityManifest } from "./capabilityManifest";

export type BlueprintCommandCenterModel = {
  blueprintId: string;
  purpose: string;
  currentWorkLabel: string;
  recentChanges: readonly string[];
  connectionsLabel: string;
  businessGoalSupported: string;
  healthSummary: string;
  suggestedImprovement: string;
  nextHelpfulStep: string;
};

export function buildBlueprintCommandCenter(
  blueprintId: string,
): BlueprintCommandCenterModel {
  const home = buildSparkBlueprintHome(blueprintId);
  const manifest = resolveBlueprintCapabilityManifest(blueprintId);
  const works = listWorkBlueprintStates().filter(
    (w) => w.blueprintId === blueprintId,
  );
  const active = works[0] ?? null;
  const relCount = active
    ? listWorkRelationships(active.workId).length
    : home.usage.activeWorkCount;
  const audit = listBlueprintAudit()
    .filter((e) => e.blueprintId === blueprintId)
    .slice(0, 3)
    .map((e) => e.detail || e.action);

  const finding =
    home.health.findings.find((f) => f.severity !== "ok") ?? null;

  let nextHelpfulStep = "Continue editing when you are ready.";
  if (home.primaryAction === "create_work") {
    nextHelpfulStep = "Create Work from this Blueprint when you want to use it.";
  } else if (home.primaryAction === "publish_version") {
    nextHelpfulStep = "Publish when the structure feels ready to share.";
  } else if (manifest.capabilities.builderMode) {
    nextHelpfulStep = "Open Builder Mode to rearrange groups and sections.";
  }

  return {
    blueprintId,
    purpose: home.purpose || home.name,
    currentWorkLabel: active
      ? `Active Work ${active.workId} (${active.depthMode.replace(/_/g, " ")})`
      : home.quietSummary.usedByActiveWorksLabel,
    recentChanges: audit.length ? audit : ["No recent structure changes yet."],
    connectionsLabel: formatWhereThisIsUsed(
      summarizeBlueprintUsage(blueprintId),
    ).join(" · ") || "No connections yet",
    businessGoalSupported:
      relCount > 0
        ? "Connected work is linked — review relationships when helpful."
        : "No business goal link yet — connect when it clarifies purpose.",
    healthSummary: home.quietSummary.healthLabel,
    suggestedImprovement: finding
      ? `${finding.title} — ${finding.why}`
      : "Structure looks steady. Add only what would make the next step clearer.",
    nextHelpfulStep,
  };
}
