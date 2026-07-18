/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearNavigationStackForTests,
  getNavigationStack,
  hasDestinationOriginBeneath,
  jumpToNavigationIndex,
  peekNavigationFrame,
  popNavigationFrame,
  pushNavigationFrame,
  setNavigationCurrent,
} from "./stack";
import { backLabelForFrame, buildStackBreadcrumb } from "./labels";

describe("navigationContext stack", () => {
  beforeEach(() => {
    clearNavigationStackForTests();
  });

  afterEach(() => {
    clearNavigationStackForTests();
  });

  it("pushes and pops frames with restore fields", () => {
    pushNavigationFrame({
      destinationId: "project-homes",
      label: "Projects",
      kind: "destination",
      scrollY: 120,
      selectedId: "proj-1",
    });
    setNavigationCurrent({
      destinationId: "project-task",
      label: "Task Details",
      kind: "nested",
    });
    expect(peekNavigationFrame()?.destinationId).toBe("project-homes");
    expect(peekNavigationFrame()?.scrollY).toBe(120);

    const restored = popNavigationFrame();
    expect(restored?.destinationId).toBe("project-homes");
    expect(restored?.selectedId).toBe("proj-1");
    expect(getNavigationStack().frames).toHaveLength(0);
  });

  it("supports nested Projects › Project › Task breadcrumb jump", () => {
    pushNavigationFrame({
      destinationId: "project-homes",
      label: "Projects",
      kind: "destination",
    });
    pushNavigationFrame({
      destinationId: "project",
      label: "Website Redesign",
      kind: "nested",
      selectedId: "website",
    });
    pushNavigationFrame({
      destinationId: "project-task",
      label: "Task Details",
      kind: "nested",
      selectedId: "task-1",
    });
    setNavigationCurrent({
      destinationId: "project-task-edit",
      label: "Edit Task",
      kind: "nested",
    });

    const crumbs = buildStackBreadcrumb(getNavigationStack());
    expect(crumbs.map((c) => c.label)).toEqual([
      "Projects",
      "Website Redesign",
      "Task Details",
      "Edit Task",
    ]);

    const project = jumpToNavigationIndex(1);
    expect(project?.label).toBe("Website Redesign");
    expect(getNavigationStack().frames.map((f) => f.label)).toEqual([
      "Projects",
    ]);
    expect(getNavigationStack().current?.label).toBe("Website Redesign");
  });

  it("caps stack depth", () => {
    for (let i = 0; i < 20; i++) {
      pushNavigationFrame({
        destinationId: `d-${i}`,
        label: `D${i}`,
        kind: "nested",
      });
    }
    expect(getNavigationStack().frames.length).toBeLessThanOrEqual(12);
  });

  it("detects destination origin beneath for Living Place leave", () => {
    expect(hasDestinationOriginBeneath()).toBe(false);
    pushNavigationFrame({
      destinationId: "talk-it-out",
      label: "Talk It Out",
      kind: "destination",
    });
    expect(hasDestinationOriginBeneath()).toBe(true);
  });

  it("formats contextual back labels", () => {
    pushNavigationFrame({
      destinationId: "chamber-of-momentum",
      label: "Chamber of Momentum",
      kind: "destination",
    });
    expect(backLabelForFrame(peekNavigationFrame())).toBe(
      "Back to Chamber of Momentum",
    );
  });
});

