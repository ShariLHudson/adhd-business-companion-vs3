import { DEFAULT_WORKSPACE_ENVIRONMENT_ACCESSIBILITY } from "./accessibilityDefaults";
import { getWorkspaceEnvironment } from "./environmentCatalog";
import { getDefaultEnvironmentIdForWorkType } from "./defaultWorkTypeEnvironments";
import { getWorkTypeWorkspacePreference } from "./preferenceStore";
import type {
  ResolvedWorkspaceEnvironment,
  WorkspaceEnvironmentAccessibilityPrefs,
  WorkspaceEnvironmentId,
} from "./types";

const FALLBACK_ENVIRONMENT: WorkspaceEnvironmentId = "minimal-workspace";

export function resolveWorkspaceEnvironment(input: {
  workTypeId: string;
  accessibility?: Partial<WorkspaceEnvironmentAccessibilityPrefs>;
}): ResolvedWorkspaceEnvironment | null {
  const workTypeId = input.workTypeId.trim();
  if (!workTypeId) return null;

  const preference = getWorkTypeWorkspacePreference(workTypeId);
  const defaultId = getDefaultEnvironmentIdForWorkType(workTypeId);
  const environmentId =
    preference?.environmentId ?? defaultId ?? FALLBACK_ENVIRONMENT;
  const fromPreference = Boolean(preference?.environmentId);

  // Prefer registered default over bare fallback when work type unknown
  if (!preference && !defaultId) {
    return null;
  }

  return {
    workTypeId,
    environment: getWorkspaceEnvironment(environmentId),
    themeId: preference?.themeId ?? "default",
    fromPreference,
    accessibility: {
      ...DEFAULT_WORKSPACE_ENVIRONMENT_ACCESSIBILITY,
      ...input.accessibility,
    },
  };
}
