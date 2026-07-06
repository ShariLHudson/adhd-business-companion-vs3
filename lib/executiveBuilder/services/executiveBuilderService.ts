import { executiveBuilderSampleRepository, matchBlueprint } from "../repositories/sample";
import type { BuildBlueprint, BuildModeId, BuildSessionView } from "../types";

export function getBuildModes() {
  return executiveBuilderSampleRepository.buildModes();
}

export function getBuilderEntryPoints() {
  return executiveBuilderSampleRepository.entryPoints();
}

export function getSuggestedBuilds() {
  return executiveBuilderSampleRepository.suggestedBuilds();
}

export function getBuilderBootstrap() {
  return {
    entryPoints: getBuilderEntryPoints(),
    buildModes: getBuildModes(),
    suggestedBuilds: getSuggestedBuilds().map((s) => ({ id: s.id, phrase: s.phrase })),
    sampleBlueprintId: "blueprint-listening-restart",
  };
}

/** Compose a complete implementation blueprint — nothing executed. */
export function composeBuildSession(
  query: string,
  buildMode: BuildModeId = "standard-build",
): BuildSessionView | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const blueprint = matchBlueprint(trimmed, buildMode);
  if (!blueprint) return null;

  return {
    product: "founder",
    query: trimmed,
    blueprint: { ...blueprint, generatedAt: new Date().toISOString() },
    generatedAt: new Date().toISOString(),
  };
}

export function composeBuildFromBlueprintId(
  blueprintId: string,
  buildMode: BuildModeId = "standard-build",
): BuildSessionView | null {
  const blueprint = executiveBuilderSampleRepository.get(blueprintId);
  if (!blueprint) return null;
  return {
    product: "founder",
    query: blueprint.title,
    blueprint: { ...blueprint, buildMode, generatedAt: new Date().toISOString() },
    generatedAt: new Date().toISOString(),
  };
}

export function getBlueprintById(id: string): BuildBlueprint | undefined {
  return executiveBuilderSampleRepository.get(id);
}

export class ExecutiveBuilderService {
  compose(query: string, mode?: BuildModeId) {
    return composeBuildSession(query, mode);
  }

  composeFromId(id: string, mode?: BuildModeId) {
    return composeBuildFromBlueprintId(id, mode);
  }

  bootstrap() {
    return getBuilderBootstrap();
  }

  sampleRepository() {
    return executiveBuilderSampleRepository;
  }
}

export const executiveBuilderService = new ExecutiveBuilderService();
