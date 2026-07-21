/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_WORK_TYPE_ENVIRONMENTS,
  WORKSPACE_ENVIRONMENT_CATALOG,
  getDefaultEnvironmentIdForWorkType,
  resetWorkTypeWorkspacePreferencesForTests,
  resolveWorkspaceEnvironment,
  setWorkTypeWorkspacePreference,
} from "./index";

describe("091 workspace environment foundation", () => {
  beforeEach(() => {
    resetWorkTypeWorkspacePreferencesForTests();
  });

  it("assigns defaults for all registered UWE Work Types", () => {
    expect(DEFAULT_WORK_TYPE_ENVIRONMENTS.marketing_plan).toBe(
      "creative-marketing-studio",
    );
    expect(DEFAULT_WORK_TYPE_ENVIRONMENTS.event_plan).toBe(
      "event-planning-studio",
    );
    expect(DEFAULT_WORK_TYPE_ENVIRONMENTS.business_plan).toBe(
      "executive-planning-office",
    );
    for (const [workTypeId, envId] of Object.entries(
      DEFAULT_WORK_TYPE_ENVIRONMENTS,
    )) {
      expect(WORKSPACE_ENVIRONMENT_CATALOG[envId]).toBeTruthy();
      expect(getDefaultEnvironmentIdForWorkType(workTypeId)).toBe(envId);
    }
  });

  it("resolves Work Type default without preference", () => {
    const resolved = resolveWorkspaceEnvironment({
      workTypeId: "marketing_plan",
    });
    expect(resolved?.environment.id).toBe("creative-marketing-studio");
    expect(resolved?.environment.estatePlaceId).toBe("creative-studio");
    expect(resolved?.fromPreference).toBe(false);
    expect(resolved?.themeId).toBe("default");
  });

  it("remembers per–Work Type preference without changing default catalog", () => {
    setWorkTypeWorkspacePreference({
      workTypeId: "business_plan",
      environmentId: "mountain-cabin",
      themeId: "fireplace",
    });
    const resolved = resolveWorkspaceEnvironment({
      workTypeId: "business_plan",
    });
    expect(resolved?.environment.id).toBe("mountain-cabin");
    expect(resolved?.themeId).toBe("fireplace");
    expect(resolved?.fromPreference).toBe(true);
    expect(getDefaultEnvironmentIdForWorkType("business_plan")).toBe(
      "executive-planning-office",
    );
  });

  it("returns null for unknown Work Type with no preference", () => {
    expect(
      resolveWorkspaceEnvironment({ workTypeId: "unknown_work_type" }),
    ).toBeNull();
  });
});
