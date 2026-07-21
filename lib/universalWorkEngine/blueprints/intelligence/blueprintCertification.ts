/**
 * Blueprint Certification skeleton (100).
 * Blocks only data-loss / broken-behavior risks — not optional advice.
 */

import { assertBlueprintCompatible } from "../initializeFromBlueprint";
import { requireBlueprint } from "../registry";
import type { BlueprintDefinition } from "../types";
import { evaluateBlueprintHealth } from "./blueprintHealth";
import { summarizeBlueprintUsage } from "./blueprintUsageImpact";
import type {
  BlueprintCertificationIssue,
  BlueprintCertificationResult,
} from "./intelligenceTypes";

function issue(
  id: string,
  blocking: boolean,
  title: string,
  detail: string,
): BlueprintCertificationIssue {
  return { id, blocking, title, detail };
}

export function certifyBlueprint(
  blueprintId: string,
  version?: string | null,
): BlueprintCertificationResult {
  const bp = requireBlueprint(blueprintId, version);
  return certifyBlueprintDefinition(bp);
}

export function certifyBlueprintDefinition(
  blueprint: BlueprintDefinition,
): BlueprintCertificationResult {
  const blockers: BlueprintCertificationIssue[] = [];
  const advisories: BlueprintCertificationIssue[] = [];

  if (!blueprint.title?.trim()) {
    blockers.push(
      issue(
        "title",
        true,
        "Name is missing",
        "A blueprint needs a name before it can be published.",
      ),
    );
  }

  const live = blueprint.sections.filter(
    (s) => !s.softDeleted && s.role !== "hidden_system",
  );
  if (live.length === 0) {
    blockers.push(
      issue(
        "sections",
        true,
        "No sections",
        "Add at least one section so Work can be created from this blueprint.",
      ),
    );
  }

  const ids = new Set<string>();
  for (const s of live) {
    if (ids.has(s.id)) {
      blockers.push(
        issue(
          `dup-${s.id}`,
          true,
          "Duplicate section identity",
          `Section id “${s.id}” appears more than once. Publishing would risk content landing in the wrong place.`,
        ),
      );
    }
    ids.add(s.id);
    if (!s.title?.trim()) {
      blockers.push(
        issue(
          `label-${s.id}`,
          true,
          "Unlabeled section",
          "Every section needs a readable label.",
        ),
      );
    }
  }

  if (!blueprint.compatibleWorkTypeIds?.length) {
    blockers.push(
      issue(
        "work-type",
        true,
        "No Work Type",
        "This blueprint is not attached to a Work Type yet.",
      ),
    );
  }

  const health = evaluateBlueprintHealth(blueprint, {
    includeHiddenDispositions: true,
  });
  for (const f of health.findings) {
    if (f.severity === "ok") continue;
    if (f.severity === "attention" && (f.kind === "duplicate" || f.kind === "structure")) {
      continue; // already covered as blockers when applicable
    }
    advisories.push(
      issue(f.id, false, f.title, f.why),
    );
  }

  let canCreateWork = blockers.length === 0;
  if (canCreateWork && blueprint.compatibleWorkTypeIds[0]) {
    try {
      assertBlueprintCompatible(
        blueprint.blueprintId,
        blueprint.compatibleWorkTypeIds[0]!,
        blueprint.version,
      );
      canCreateWork = true;
    } catch {
      canCreateWork = false;
      blockers.push(
        issue(
          "create-work",
          true,
          "Cannot create Work",
          "This blueprint is not ready to create Work yet. Fix structure before publishing.",
        ),
      );
    }
  }

  const usage = summarizeBlueprintUsage(blueprint.blueprintId);
  const existingWorksProtected = true;

  if (usage.activeWorkCount > 0) {
    advisories.push(
      issue(
        "existing-works",
        false,
        "Existing Work stays on its version",
        `${usage.activeWorkCount} active Work${usage.activeWorkCount === 1 ? "" : "s"} will keep ${Object.keys(usage.worksByVersion).join(", ") || "their current version"}. New Work will use ${blueprint.version}.`,
      ),
    );
  }

  let status: BlueprintCertificationResult["status"] = "ready_to_publish";
  if (blockers.length > 0) status = "not_ready";
  else if (advisories.length > 0) status = "ready_with_suggestions";

  return {
    status,
    evaluatedAt: new Date().toISOString(),
    blockers,
    advisories,
    canCreateWork,
    existingWorksProtected,
  };
}
