import { beforeAll, describe, expect, it } from "vitest";
import {
  ensureEventBlueprintsRegistered,
  ensureEventPlanWorkTypeRegistered,
} from "@/lib/universalWorkEngine";
import { EVENT_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema";
import {
  BLUEPRINT_SOURCE_BROADEN_ORDER,
  browseCompatibleBlueprintsAutoBroaden,
  defaultRecommendedBlueprintIds,
} from "./browseBlueprints";

describe("Spec 127 — never empty structure browse", () => {
  beforeAll(() => {
    ensureEventPlanWorkTypeRegistered();
    ensureEventBlueprintsRegistered();
  });

  it("broaden order is Company → Personal → Spark → Recommended → All", () => {
    expect(BLUEPRINT_SOURCE_BROADEN_ORDER).toEqual([
      "company",
      "personal",
      "spark",
      "recommended",
      "all",
    ]);
  });

  it("company filter auto-broadens when empty instead of dead-ending", () => {
    const result = browseCompatibleBlueprintsAutoBroaden({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      source: "company",
    });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.broadened).toBe(true);
    expect(result.broadenNote).toMatch(/widened/i);
    expect(result.effectiveSource).not.toBe("company");
  });

  it("recommended with matches does not broaden", () => {
    const recommendedBlueprintIds = defaultRecommendedBlueprintIds(
      EVENT_PLAN_WORK_TYPE_ID,
    );
    expect(recommendedBlueprintIds.length).toBeGreaterThan(0);
    const result = browseCompatibleBlueprintsAutoBroaden({
      workTypeId: EVENT_PLAN_WORK_TYPE_ID,
      source: "recommended",
      recommendedBlueprintIds,
    });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.broadened).toBe(false);
    expect(result.broadenNote).toBeNull();
    expect(result.effectiveSource).toBe("recommended");
  });
});
