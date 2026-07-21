import type { BlueprintDefinition } from "../types";
import { makeDependencyId, mapKnownContextKey } from "./mapKnownContextKey";
import {
  BLUEPRINT_PROFILE_CONTEXT_STANDARD_ID,
  type BlueprintContextDependencyEntry,
  type BlueprintProfileContextManifest,
} from "./types";

/**
 * Seed a provisional context-connection manifest from adaptiveQuestions[].knownContextKeys.
 * Honest default: blocked until Business Estate load/prefill/sync is certified (273/278).
 */
export function seedProfileContextManifestFromKnownContext(
  blueprint: BlueprintDefinition,
): BlueprintProfileContextManifest {
  const dependencies: BlueprintContextDependencyEntry[] = [];
  const seen = new Set<string>();

  for (const q of blueprint.adaptiveQuestions ?? []) {
    for (const key of q.knownContextKeys ?? []) {
      const trimmed = key.trim();
      if (!trimmed) continue;
      const dependencyId = makeDependencyId(
        blueprint.blueprintId,
        q.id,
        trimmed,
      );
      if (seen.has(dependencyId)) continue;
      seen.add(dependencyId);
      const mapped = mapKnownContextKey(trimmed);
      dependencies.push({
        dependencyId,
        questionId: q.id,
        knownContextKey: trimmed,
        canonicalFieldId: mapped.canonicalFieldId,
        entity: mapped.entity,
        prefillBehavior: "never_ask_if_reliable",
        status: "blocked",
        provisional: true,
        notes:
          "Seeded from knownContextKeys. Remains blocked until profile load, prefill, and sync are certified (273–278).",
      });
    }
  }

  // Every Blueprint at least depends on active business selection.
  const activeBizId = makeDependencyId(
    blueprint.blueprintId,
    "system",
    "active_business",
  );
  if (!seen.has(activeBizId)) {
    dependencies.unshift({
      dependencyId: activeBizId,
      questionId: "system",
      knownContextKey: "active_business",
      canonicalFieldId: "business.business_id",
      entity: "business",
      prefillBehavior: "confirm_if_ambiguous",
      status: "blocked",
      provisional: true,
      notes:
        "Required active-business gate (278 Gate 1). Blocked until Business Estate load is wired.",
    });
  }

  return {
    blueprintId: blueprint.blueprintId,
    blueprintVersion: blueprint.version,
    standardId: BLUEPRINT_PROFILE_CONTEXT_STANDARD_ID,
    dependencies,
  };
}

/** Prefer hand-authored manifest; otherwise seed from knownContextKeys. */
export function resolveProfileContextManifest(
  blueprint: BlueprintDefinition,
): BlueprintProfileContextManifest {
  if (blueprint.profileContextManifest?.dependencies?.length) {
    return {
      ...blueprint.profileContextManifest,
      blueprintId: blueprint.blueprintId,
      blueprintVersion: blueprint.version,
      standardId: BLUEPRINT_PROFILE_CONTEXT_STANDARD_ID,
    };
  }
  return seedProfileContextManifestFromKnownContext(blueprint);
}
