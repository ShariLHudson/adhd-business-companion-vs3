export type {
  ResolvedWorkspaceEnvironment,
  WorkspaceEnvironmentAccessibilityPrefs,
  WorkspaceEnvironmentDefinition,
  WorkspaceEnvironmentId,
  WorkspaceEnvironmentKind,
  WorkspaceThemeDefinition,
  WorkspaceThemeId,
  WorkTypeWorkspacePreference,
} from "./types";

export {
  WORKSPACE_ENVIRONMENT_CATALOG,
  WORKSPACE_THEME_CATALOG,
  getWorkspaceEnvironment,
  getWorkspaceTheme,
} from "./environmentCatalog";

export {
  DEFAULT_WORK_TYPE_ENVIRONMENTS,
  INTENDED_WORK_TYPE_ENVIRONMENTS,
  getDefaultEnvironmentIdForWorkType,
} from "./defaultWorkTypeEnvironments";

export { DEFAULT_WORKSPACE_ENVIRONMENT_ACCESSIBILITY } from "./accessibilityDefaults";

export {
  getWorkTypeWorkspacePreference,
  setWorkTypeWorkspacePreference,
  clearWorkTypeWorkspacePreference,
  resetWorkTypeWorkspacePreferencesForTests,
} from "./preferenceStore";

export { resolveWorkspaceEnvironment } from "./resolveWorkspaceEnvironment";
