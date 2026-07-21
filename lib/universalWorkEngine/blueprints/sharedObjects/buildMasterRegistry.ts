import type { BlueprintDefinition } from "../types";
import { certifyBlueprintSharedObjects } from "./certifySharedObjects";
import { MASTER_OBJECT_TYPES, NON_DUPLICATION_OBJECT_TYPES } from "./objectTypes";
import { MASTER_RELATIONSHIP_TYPES } from "./relationshipTypes";
import { resolveSharedObjectManifest } from "./seedFromBlueprints";
import type {
  BlueprintSharedObjectDependencyEntry,
  DuplicateObjectAuditRow,
  SharedObjectCertification,
  SharedObjectGapEntry,
  SharedObjectTypeId,
} from "./types";

export type BlueprintSharedObjectAuditBundle = {
  objectTypes: typeof MASTER_OBJECT_TYPES;
  relationships: typeof MASTER_RELATIONSHIP_TYPES;
  dependencyRows: Array<
    BlueprintSharedObjectDependencyEntry & {
      blueprintId: string;
      blueprintVersion: string;
      workTypeIds: readonly string[];
    }
  >;
  gaps: SharedObjectGapEntry[];
  certifications: SharedObjectCertification[];
  duplicates: DuplicateObjectAuditRow[];
};

function gapSeverity(
  authority: string,
  objectTypeId: string,
): SharedObjectGapEntry["severity"] {
  if (
    objectTypeId === "business" ||
    objectTypeId === "create_artifact" ||
    objectTypeId === "universal_work"
  ) {
    return "critical";
  }
  if (authority === "user_provided" || objectTypeId === "project") return "high";
  if (authority === "completed_elsewhere") return "moderate";
  return "low";
}

function remediationFor(
  authority: string,
  objectTypeId: string,
): SharedObjectGapEntry["remediation"] {
  if (objectTypeId === "create_artifact") return "wire_create_artifact";
  if (objectTypeId === "project") return "wire_project_link";
  if (authority === "user_provided") return "label_user_provided";
  if (authority === "completed_elsewhere") return "label_completed_elsewhere";
  if (authority === "prepare") return "label_prepare_only";
  return "map_to_canonical";
}

export function buildBlueprintSharedObjectAudit(
  blueprints: readonly BlueprintDefinition[],
): BlueprintSharedObjectAuditBundle {
  const dependencyRows: BlueprintSharedObjectAuditBundle["dependencyRows"] = [];
  const gaps: SharedObjectGapEntry[] = [];
  const certifications: SharedObjectCertification[] = [];
  const typeUse = new Map<SharedObjectTypeId, number>();

  const sorted = [...blueprints].sort((a, b) =>
    a.blueprintId.localeCompare(b.blueprintId),
  );

  for (const bp of sorted) {
    const manifest = resolveSharedObjectManifest(bp);
    const cert = certifyBlueprintSharedObjects(bp);
    certifications.push(cert);

    for (const d of manifest.dependencies) {
      typeUse.set(d.objectTypeId, (typeUse.get(d.objectTypeId) ?? 0) + 1);
      dependencyRows.push({
        ...d,
        blueprintId: bp.blueprintId,
        blueprintVersion: bp.version,
        workTypeIds: bp.compatibleWorkTypeIds,
      });

      if (
        d.provisional ||
        d.status === "blocked" ||
        d.status === "missing" ||
        d.status === "duplicate_risk" ||
        d.status === "future"
      ) {
        gaps.push({
          blueprintId: bp.blueprintId,
          dependencyId: d.dependencyId,
          objectTypeId: d.objectTypeId,
          creationAuthority: d.creationAuthority,
          severity: gapSeverity(d.creationAuthority, d.objectTypeId),
          gap: d.provisional
            ? `Unwired ${d.objectTypeId} (${d.creationAuthority}) — promised via ${d.source}`
            : `Status ${d.status} for ${d.objectTypeId}`,
          remediation: remediationFor(d.creationAuthority, d.objectTypeId),
        });
      }
    }
  }

  const duplicates: DuplicateObjectAuditRow[] = NON_DUPLICATION_OBJECT_TYPES.map(
    (objectTypeId) => ({
      concept: objectTypeId,
      objectTypeId,
      modelClass: "unknown_requiring_review",
      finding: `Repo must prove a single canonical ${objectTypeId} model; competing Blueprint-local stores require migration (300 Phase 2–3).`,
      remediation:
        "Classify existing models as canonical / extension / duplicate_requiring_migration; migrate before production cert.",
    }),
  );

  // Attach usage counts for registry render convenience
  void typeUse;

  return {
    objectTypes: MASTER_OBJECT_TYPES,
    relationships: MASTER_RELATIONSHIP_TYPES,
    dependencyRows,
    gaps,
    certifications,
    duplicates,
  };
}
