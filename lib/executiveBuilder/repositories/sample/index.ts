import {
  BUILD_MODES,
  ENTRY_POINTS,
  EXECUTIVE_BUILDER_PRINCIPLE,
  SAMPLE_BLUEPRINTS,
  SUGGESTED_BUILDS,
  getSampleBlueprint,
} from "../../sample/builderData";
import type { BuildBlueprint, BuildModeId } from "../../types";

export const executiveBuilderSampleRepository = {
  principle: () => EXECUTIVE_BUILDER_PRINCIPLE,
  buildModes: () => BUILD_MODES,
  entryPoints: () => ENTRY_POINTS,
  suggestedBuilds: () => SUGGESTED_BUILDS,
  blueprints: () => SAMPLE_BLUEPRINTS,
  get: (id: string) => getSampleBlueprint(id),
};

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function matchBlueprint(query: string, mode: BuildModeId): BuildBlueprint | undefined {
  const q = normalizeQuery(query);
  if (q.includes("restart") || q.includes("listening") || q.includes("shame")) {
    return applyMode(getSampleBlueprint("blueprint-listening-restart"), mode);
  }
  if (q.includes("research") && (q.includes("pipeline") || q.includes("build"))) {
    return applyMode(getSampleBlueprint("blueprint-research-pipeline"), mode);
  }
  if (q.includes("lead magnet") || q.includes("five minutes")) {
    return applyMode(getSampleBlueprint("blueprint-lead-magnet"), mode);
  }
  if (q.includes("listening rooms")) {
    return applyMode(getSampleBlueprint("blueprint-listening-restart"), mode);
  }
  if (q.includes("workshop") || q.includes("decision fatigue")) {
    return applyMode(getSampleBlueprint("blueprint-listening-restart"), mode);
  }
  if (q.includes("membership")) {
    return applyMode(getSampleBlueprint("blueprint-listening-restart"), mode);
  }
  return applyMode(SAMPLE_BLUEPRINTS[0], mode);
}

function applyMode(blueprint: BuildBlueprint | undefined, mode: BuildModeId): BuildBlueprint | undefined {
  if (!blueprint) return undefined;
  return {
    ...blueprint,
    buildMode: mode,
    title: blueprint.title,
    generatedAt: new Date().toISOString(),
  };
}

export { matchBlueprint, applyMode };
