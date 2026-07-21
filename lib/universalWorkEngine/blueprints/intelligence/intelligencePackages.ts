/**
 * Domain-aware Blueprint Intelligence packages (100).
 * Registered by Work Type — never hard-coded into one UI component.
 * No expert names in member-facing copy.
 */

import type { BlueprintDefinition } from "../types";
import type { BlueprintHealthFinding } from "./intelligenceTypes";

export type BlueprintIntelligencePackage = {
  workTypeId: string;
  /** Extra health findings for this Work Type. */
  evaluateDomainFindings: (
    blueprint: BlueprintDefinition,
  ) => readonly BlueprintHealthFinding[];
};

const packages = new Map<string, BlueprintIntelligencePackage>();

export function registerBlueprintIntelligencePackage(
  pkg: BlueprintIntelligencePackage,
): void {
  packages.set(pkg.workTypeId, pkg);
}

export function getBlueprintIntelligencePackage(
  workTypeId: string,
): BlueprintIntelligencePackage | null {
  return packages.get(workTypeId) ?? null;
}

export function clearBlueprintIntelligencePackagesForTests(): void {
  packages.clear();
}

export function evaluateDomainHealthFindings(
  blueprint: BlueprintDefinition,
): BlueprintHealthFinding[] {
  const out: BlueprintHealthFinding[] = [];
  for (const workTypeId of blueprint.compatibleWorkTypeIds) {
    const pkg = packages.get(workTypeId);
    if (!pkg) continue;
    out.push(...pkg.evaluateDomainFindings(blueprint));
  }
  return out;
}
