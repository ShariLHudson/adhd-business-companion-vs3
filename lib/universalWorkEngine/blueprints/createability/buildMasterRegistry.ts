import type { BlueprintDefinition } from "../types";
import { certifyBlueprintCreateability } from "./certifyCreateability";
import { resolveCreateabilityManifest } from "./seedFromDeliverables";
import type {
  BlueprintCreateabilityCertification,
  CreateabilityGapEntry,
  MasterBlueprintOutputRegistryRow,
} from "./types";

export type BlueprintCreateabilityAuditBundle = {
  registryRows: MasterBlueprintOutputRegistryRow[];
  gaps: CreateabilityGapEntry[];
  certifications: BlueprintCreateabilityCertification[];
};

function gapSeverity(
  creationState: string,
  name: string,
): CreateabilityGapEntry["severity"] {
  const n = name.toLowerCase();
  if (
    creationState === "structured" ||
    /\b(pricing|budget|financial|inventory|dashboard)\b/.test(n)
  ) {
    return "critical";
  }
  if (/\b(plan|package|launch|export)\b/.test(n)) return "high";
  if (/\b(checklist|brief|copy|email)\b/.test(n)) return "moderate";
  return "low";
}

function remediationFor(
  creationState: string,
): CreateabilityGapEntry["remediation"] {
  switch (creationState) {
    case "direct":
      return "implement_direct";
    case "structured":
      return "implement_structured";
    case "composed":
      return "implement_composed";
    case "connected":
      return "connect_destination";
    case "draft_only":
      return "label_draft_only";
    case "future":
      return "move_to_future";
    default:
      return "remove_promise";
  }
}

/** Scan registered (or provided) Blueprints into master createability views. */
export function buildBlueprintCreateabilityAudit(
  blueprints: readonly BlueprintDefinition[],
): BlueprintCreateabilityAuditBundle {
  const registryRows: MasterBlueprintOutputRegistryRow[] = [];
  const gaps: CreateabilityGapEntry[] = [];
  const certifications: BlueprintCreateabilityCertification[] = [];

  const sorted = [...blueprints].sort((a, b) =>
    a.blueprintId.localeCompare(b.blueprintId),
  );

  for (const bp of sorted) {
    const manifest = resolveCreateabilityManifest(bp);
    const cert = certifyBlueprintCreateability(bp);
    certifications.push(cert);

    for (const o of manifest.outputs) {
      registryRows.push({
        blueprintId: bp.blueprintId,
        blueprintVersion: bp.version,
        workTypeIds: bp.compatibleWorkTypeIds,
        outputId: o.outputId,
        outputName: o.outputName,
        outputType: o.outputType,
        creationState: o.creationState,
        status: o.status,
        destination: o.destination,
        provisional: Boolean(o.provisional),
      });

      if (
        o.provisional ||
        o.status === "blocked" ||
        o.status === "future" ||
        o.status === "draft_only"
      ) {
        gaps.push({
          blueprintId: bp.blueprintId,
          blueprintVersion: bp.version,
          outputId: o.outputId,
          outputName: o.outputName,
          severity: gapSeverity(o.creationState, o.outputName),
          gap: o.provisional
            ? "No hand-authored Createability Manifest; deliverable promise unverified"
            : `Output status is ${o.status} (${o.creationState})`,
          remediation: remediationFor(o.creationState),
        });
      }
    }
  }

  return { registryRows, gaps, certifications };
}
