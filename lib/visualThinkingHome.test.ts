import { describe, expect, it } from "vitest";
import {
  VISUAL_THINKING_CATEGORY_ORDER,
  VISUAL_THINKING_HOME_ORDER,
  getVisualThinkingHomeType,
  homeTypeIdForViewId,
  listVisualThinkingHomeByCategory,
  listVisualThinkingHomeTypes,
  resolveHomeTypeForMap,
} from "./visualThinkingHome";

describe("visualThinkingHome P0.43 / P0.51", () => {
  it("defines thirteen categorized home types with complete help", () => {
    expect(VISUAL_THINKING_HOME_ORDER).toHaveLength(13);
    for (const id of VISUAL_THINKING_HOME_ORDER) {
      const type = getVisualThinkingHomeType(id);
      expect(type.title.length).toBeGreaterThan(0);
      expect(type.shortDescription.length).toBeGreaterThan(10);
      expect(type.help.whatItIs.length).toBeGreaterThan(10);
      expect(type.help.whenToUse.length).toBeGreaterThan(10);
      expect(type.help.example.length).toBeGreaterThan(5);
      expect(type.help.howToBuild.length).toBeGreaterThanOrEqual(4);
      expect(VISUAL_THINKING_CATEGORY_ORDER).toContain(type.category);
    }
  });

  it("groups types into five categories with alphabetized items", () => {
    const groups = listVisualThinkingHomeByCategory();
    expect(groups).toHaveLength(5);
    expect(groups.map((g) => g.category)).toEqual(VISUAL_THINKING_CATEGORY_ORDER);
    const ids = groups.flatMap((g) => g.types).map((t) => t.id);
    expect(ids).toHaveLength(VISUAL_THINKING_HOME_ORDER.length);
    expect(new Set(ids)).toEqual(new Set(VISUAL_THINKING_HOME_ORDER));
    for (const group of groups) {
      const titles = group.types.map((t) => t.title);
      expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)));
    }
  });

  it("includes Brand Canvas without calendar planner or removed tools", () => {
    expect(getVisualThinkingHomeType("brand-canvas").title).toBe("Brand Canvas™");
    expect(getVisualThinkingHomeType("brand-canvas").mode).toBe("business-canvas");
    expect(VISUAL_THINKING_HOME_ORDER).not.toContain("calendar-planner");
    expect(VISUAL_THINKING_HOME_ORDER).not.toContain("client-avatar");
    expect(VISUAL_THINKING_HOME_ORDER).not.toContain("clear-my-mind");
    expect(VISUAL_THINKING_HOME_ORDER).not.toContain("workflow-map");
    expect(VISUAL_THINKING_HOME_ORDER).not.toContain("focus-map");
  });

  it("content ecosystem description mentions repurposing platforms", () => {
    const desc = getVisualThinkingHomeType("content-ecosystem").shortDescription;
    expect(desc.toLowerCase()).toMatch(/blog/);
    expect(desc.toLowerCase()).toMatch(/pinterest/);
  });

  it("lists home types in display order", () => {
    const types = listVisualThinkingHomeTypes();
    expect(types.map((t) => t.id)).toEqual(VISUAL_THINKING_HOME_ORDER);
  });

  it("resolves help for legacy maps without homeTypeId", () => {
    const resolved = resolveHomeTypeForMap({ mode: "mind-map" });
    expect(resolved.id).toBe("mind-map");
  });

  it("resolves priority matrix kanban maps to priority matrix home type", () => {
    const resolved = resolveHomeTypeForMap({
      homeTypeId: "priority-matrix",
      mode: "visual-kanban",
    });
    expect(resolved.id).toBe("priority-matrix");
    expect(resolved.title).toBe("Priority Matrix™");
  });

  it("aligns chat view ids to catalog home types", () => {
    expect(homeTypeIdForViewId("priority-matrix")).toBe("priority-matrix");
    expect(homeTypeIdForViewId("funnel-map")).toBe("sales-funnel");
    expect(homeTypeIdForViewId("customer-journey-map")).toBe("customer-journey");
  });
});
