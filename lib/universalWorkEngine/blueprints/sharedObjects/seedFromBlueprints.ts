import type { BlueprintDefinition } from "../types";
import { resolveCreateabilityManifest } from "../createability/seedFromDeliverables";
import {
  authorityFromCreateabilityState,
  makeSharedDependencyId,
  mapKnownContextKeyToObject,
  mapLabelToSharedObject,
} from "./mapToObjectType";
import {
  MASTER_SHARED_OBJECT_LIBRARY_STANDARD_ID,
  type BlueprintSharedObjectDependencyEntry,
  type BlueprintSharedObjectManifest,
  type SharedObjectCreationAuthority,
} from "./types";

function emptyAuthorityCounts(): Record<SharedObjectCreationAuthority, number> {
  return {
    fully_create: 0,
    prepare: 0,
    user_provided: 0,
    completed_elsewhere: 0,
  };
}

/**
 * Seed provisional shared-object manifest from deliverables + knownContext + createability.
 * Honest default: blocked until canonical wires are certified (295–300).
 */
export function seedSharedObjectManifestFromBlueprint(
  blueprint: BlueprintDefinition,
): BlueprintSharedObjectManifest {
  const dependencies: BlueprintSharedObjectDependencyEntry[] = [];
  const seen = new Set<string>();

  const push = (entry: BlueprintSharedObjectDependencyEntry) => {
    if (seen.has(entry.dependencyId)) return;
    seen.add(entry.dependencyId);
    dependencies.push(entry);
  };

  // Always require Universal Work + Create Artifact + Business.
  for (const sys of [
    {
      objectTypeId: "universal_work" as const,
      creationAuthority: "fully_create" as const,
      sourceLabel: "canonical_universal_work",
    },
    {
      objectTypeId: "create_artifact" as const,
      creationAuthority: "fully_create" as const,
      sourceLabel: "create_artifact_sot",
    },
    {
      objectTypeId: "business" as const,
      creationAuthority: "user_provided" as const,
      sourceLabel: "active_business",
    },
    {
      objectTypeId: "project" as const,
      creationAuthority: "completed_elsewhere" as const,
      sourceLabel: "create_to_project_link",
    },
  ]) {
    push({
      dependencyId: makeSharedDependencyId(
        blueprint.blueprintId,
        sys.objectTypeId,
        sys.sourceLabel,
      ),
      objectTypeId: sys.objectTypeId,
      creationAuthority: sys.creationAuthority,
      status: "blocked",
      source: "system_required",
      sourceLabel: sys.sourceLabel,
      provisional: true,
      notes:
        "System-required shared object. Blocked until canonical identity and Create↔Project integrity are certified (295–300).",
    });
  }

  for (const d of blueprint.deliverables ?? []) {
    const mapped = mapLabelToSharedObject(d);
    push({
      dependencyId: makeSharedDependencyId(
        blueprint.blueprintId,
        mapped.objectTypeId,
        d,
      ),
      objectTypeId: mapped.objectTypeId,
      creationAuthority: mapped.creationAuthority,
      status: "blocked",
      source: "deliverable",
      sourceLabel: d,
      provisional: true,
      notes: `Promised deliverable maps to ${mapped.objectTypeId} with authority “${mapped.creationAuthority}”.`,
    });
  }

  for (const q of blueprint.adaptiveQuestions ?? []) {
    for (const key of q.knownContextKeys ?? []) {
      const mapped = mapKnownContextKeyToObject(key);
      if (!mapped) continue;
      push({
        dependencyId: makeSharedDependencyId(
          blueprint.blueprintId,
          mapped.objectTypeId,
          `ctx_${key}`,
        ),
        objectTypeId: mapped.objectTypeId,
        creationAuthority: "user_provided",
        status: "blocked",
        source: "known_context",
        sourceLabel: key,
        provisional: true,
        notes:
          "Known-context field must load from canonical profile objects — not re-asked as a duplicate record (273–278 / 295).",
      });
    }
  }

  const createability = resolveCreateabilityManifest(blueprint);
  for (const o of createability.outputs) {
    const mapped = mapLabelToSharedObject(o.outputName);
    const authority = authorityFromCreateabilityState(o.creationState);
    push({
      dependencyId: makeSharedDependencyId(
        blueprint.blueprintId,
        mapped.objectTypeId,
        `out_${o.outputId}`,
      ),
      objectTypeId: mapped.objectTypeId,
      creationAuthority: authority,
      status: "blocked",
      source: "createability_destination",
      sourceLabel: o.outputName,
      provisional: true,
      notes: `Createability state “${o.creationState}” → authority “${authority}”; destination must be a shared object, not a private Blueprint copy.`,
    });
  }

  return {
    blueprintId: blueprint.blueprintId,
    blueprintVersion: blueprint.version,
    standardId: MASTER_SHARED_OBJECT_LIBRARY_STANDARD_ID,
    dependencies,
  };
}

export function resolveSharedObjectManifest(
  blueprint: BlueprintDefinition,
): BlueprintSharedObjectManifest {
  if (blueprint.sharedObjectManifest?.dependencies?.length) {
    return {
      ...blueprint.sharedObjectManifest,
      blueprintId: blueprint.blueprintId,
      blueprintVersion: blueprint.version,
      standardId: MASTER_SHARED_OBJECT_LIBRARY_STANDARD_ID,
    };
  }
  return seedSharedObjectManifestFromBlueprint(blueprint);
}

export function countAuthorities(
  deps: readonly BlueprintSharedObjectDependencyEntry[],
): Record<SharedObjectCreationAuthority, number> {
  const counts = emptyAuthorityCounts();
  for (const d of deps) {
    counts[d.creationAuthority] += 1;
  }
  return counts;
}
