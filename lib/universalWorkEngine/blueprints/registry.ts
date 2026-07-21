/**
 * Authoritative Universal Blueprint registry.
 * Work Type packages register definitions only — never private registries.
 */

import type { BlueprintDefinition } from "./types";
import { UnknownBlueprintError } from "./types";
import { recordBlueprintAudit } from "./auditHistory";

/** blueprintId → version → definition (latest tracked separately). */
const byIdVersion = new Map<string, Map<string, BlueprintDefinition>>();
const latestVersionById = new Map<string, string>();

function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map((n) => Number.parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => Number.parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

export function registerBlueprint(definition: BlueprintDefinition): void {
  const id = definition.blueprintId?.trim();
  if (!id) throw new Error("Blueprint requires blueprintId");
  if (!definition.version?.trim()) {
    throw new Error(`Blueprint "${id}" requires version`);
  }
  if (!definition.compatibleWorkTypeIds?.length) {
    throw new Error(`Blueprint "${id}" requires compatibleWorkTypeIds`);
  }
  if (!definition.sections?.length) {
    throw new Error(`Blueprint "${id}" requires sections`);
  }
  if (!definition.supportedDepthModes?.length) {
    throw new Error(`Blueprint "${id}" requires supportedDepthModes`);
  }

  const versions = byIdVersion.get(id) ?? new Map<string, BlueprintDefinition>();
  versions.set(definition.version, {
    ...definition,
    blueprintId: id,
  });
  byIdVersion.set(id, versions);

  const currentLatest = latestVersionById.get(id);
  if (
    !currentLatest ||
    compareVersions(definition.version, currentLatest) >= 0
  ) {
    latestVersionById.set(id, definition.version);
  }

  recordBlueprintAudit({
    blueprintId: id,
    blueprintVersion: definition.version,
    action: "register",
    detail: `category=${definition.category}`,
  });
}

export function getBlueprint(
  blueprintId: string | null | undefined,
  version?: string | null,
): BlueprintDefinition | null {
  const id = blueprintId?.trim();
  if (!id) return null;
  const versions = byIdVersion.get(id);
  if (!versions) return null;
  if (version?.trim()) return versions.get(version.trim()) ?? null;
  const latest = latestVersionById.get(id);
  return latest ? (versions.get(latest) ?? null) : null;
}

/** Fail safely and visibly — never silent fallthrough. */
export function requireBlueprint(
  blueprintId: string,
  version?: string | null,
): BlueprintDefinition {
  const bp = getBlueprint(blueprintId, version);
  if (!bp) throw new UnknownBlueprintError(blueprintId);
  return bp;
}

export function resolveBlueprintVersion(
  blueprintId: string,
  preferredVersion?: string | null,
): string {
  const id = blueprintId.trim();
  const versions = byIdVersion.get(id);
  if (!versions || versions.size === 0) {
    throw new UnknownBlueprintError(id);
  }
  if (preferredVersion?.trim() && versions.has(preferredVersion.trim())) {
    return preferredVersion.trim();
  }
  const latest = latestVersionById.get(id);
  if (!latest) throw new UnknownBlueprintError(id);
  return latest;
}

export function listBlueprints(filter?: {
  category?: BlueprintDefinition["category"];
  workTypeId?: string;
}): BlueprintDefinition[] {
  const out: BlueprintDefinition[] = [];
  for (const [id, versions] of byIdVersion) {
    const latest = latestVersionById.get(id);
    if (!latest) continue;
    const bp = versions.get(latest);
    if (!bp) continue;
    if (filter?.category && bp.category !== filter.category) continue;
    if (
      filter?.workTypeId &&
      !bp.compatibleWorkTypeIds.includes(filter.workTypeId)
    ) {
      continue;
    }
    out.push(bp);
  }
  return out;
}

export function listBlueprintVersions(blueprintId: string): string[] {
  const versions = byIdVersion.get(blueprintId.trim());
  if (!versions) return [];
  return [...versions.keys()].sort(compareVersions);
}

export function isBlueprintRegistered(blueprintId: string): boolean {
  return byIdVersion.has(blueprintId.trim());
}

export function isBlueprintCompatibleWithWorkType(
  blueprintId: string,
  workTypeId: string,
  version?: string | null,
): boolean {
  const bp = getBlueprint(blueprintId, version);
  if (!bp) return false;
  return bp.compatibleWorkTypeIds.includes(workTypeId.trim());
}

export function clearBlueprintRegistryForTests(): void {
  byIdVersion.clear();
  latestVersionById.clear();
}
