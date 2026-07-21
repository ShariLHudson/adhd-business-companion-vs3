import type { BlueprintDefinition } from "../types";
import { certifyBlueprintContextConnection } from "./certifyContextConnection";
import { resolveProfileContextManifest } from "./seedFromKnownContext";
import type {
  BlueprintContextConnectionCertification,
  ContextSyncGapEntry,
  MasterBlueprintContextRegistryRow,
  RepeatedQuestionRiskEntry,
} from "./types";

export type BlueprintProfileContextAuditBundle = {
  registryRows: MasterBlueprintContextRegistryRow[];
  gaps: ContextSyncGapEntry[];
  certifications: BlueprintContextConnectionCertification[];
  repeatedQuestionRisks: RepeatedQuestionRiskEntry[];
};

function gapSeverity(
  entity: string,
  key: string,
): ContextSyncGapEntry["severity"] {
  if (entity === "business" || key === "active_business") return "critical";
  if (entity === "client_avatar" || entity === "offer") return "high";
  if (entity === "business_dna" || entity === "brand") return "moderate";
  return "low";
}

function remediationFor(
  entity: string,
): ContextSyncGapEntry["remediation"] {
  if (entity === "business") return "wire_profile_load";
  if (entity === "client_avatar" || entity === "offer") {
    return "implement_prefill";
  }
  return "suppress_repeat_question";
}

/** Scan registered Blueprints into master context-connection views (277). */
export function buildBlueprintProfileContextAudit(
  blueprints: readonly BlueprintDefinition[],
): BlueprintProfileContextAuditBundle {
  const registryRows: MasterBlueprintContextRegistryRow[] = [];
  const gaps: ContextSyncGapEntry[] = [];
  const certifications: BlueprintContextConnectionCertification[] = [];
  const repeatedQuestionRisks: RepeatedQuestionRiskEntry[] = [];

  const sorted = [...blueprints].sort((a, b) =>
    a.blueprintId.localeCompare(b.blueprintId),
  );

  for (const bp of sorted) {
    const manifest = resolveProfileContextManifest(bp);
    const cert = certifyBlueprintContextConnection(bp);
    certifications.push(cert);

    for (const d of manifest.dependencies) {
      registryRows.push({
        blueprintId: bp.blueprintId,
        blueprintVersion: bp.version,
        workTypeIds: bp.compatibleWorkTypeIds,
        dependencyId: d.dependencyId,
        knownContextKey: d.knownContextKey,
        canonicalFieldId: d.canonicalFieldId,
        entity: d.entity,
        status: d.status,
        provisional: Boolean(d.provisional),
      });

      if (
        d.provisional ||
        d.status === "blocked" ||
        d.status === "missing" ||
        d.status === "future" ||
        d.status === "stale" ||
        d.status === "conflict"
      ) {
        gaps.push({
          blueprintId: bp.blueprintId,
          blueprintVersion: bp.version,
          dependencyId: d.dependencyId,
          knownContextKey: d.knownContextKey,
          canonicalFieldId: d.canonicalFieldId,
          severity: gapSeverity(d.entity, d.knownContextKey),
          gap: d.provisional
            ? "No live profile wire; knownContextKey promise unverified"
            : `Context status is ${d.status}`,
          remediation: remediationFor(d.entity),
        });
      }
    }

    for (const q of bp.adaptiveQuestions ?? []) {
      const keys = q.knownContextKeys ?? [];
      if (keys.length === 0) continue;
      repeatedQuestionRisks.push({
        blueprintId: bp.blueprintId,
        questionId: q.id,
        knownContextKeys: keys,
        risk: "high",
        reason:
          "Question declares knownContextKeys but Context Connection is not certified — risk of asking again.",
      });
    }
  }

  return { registryRows, gaps, certifications, repeatedQuestionRisks };
}
