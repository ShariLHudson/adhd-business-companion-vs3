import { describe, expect, it, beforeEach } from "vitest";
import {
  headerPoolsForTests,
  pickRotatedPhrase,
  resolveCompanionHeader,
} from "./companionDynamicHeader";
import {
  buildAppFeatureNavOffer,
  resolveAppFeatureNavTarget,
} from "./appFeatureNavigation";

describe("companionDynamicHeader", () => {
  it("rotates phrases within a pool", () => {
    const pool = headerPoolsForTests().overwhelm!;
    const a = pickRotatedPhrase(pool);
    const b = pickRotatedPhrase(pool);
    expect(a).not.toBe(b);
  });

  it("uses overwhelm pool when emotion is overwhelmed", () => {
    const line = resolveCompanionHeader({
      calmHome: true,
      isIdle: true,
      workspaceActiveBeside: false,
      workspacePanel: null,
      emotion: "overwhelmed",
      recentUserTexts: [],
    });
    expect(line).toMatch(/sort this out|loudest|one thing at a time/i);
  });

  it("uses create pool when builder is active", () => {
    const line = resolveCompanionHeader({
      calmHome: false,
      isIdle: false,
      workspaceActiveBeside: true,
      workspacePanel: "content-generator",
      emotion: "building",
      recentUserTexts: [],
      createBuilderActive: true,
    });
    expect(line).toMatch(/build this together|one question at a time/i);
  });

  it("uses client avatar pool when that workspace is open", () => {
    const line = resolveCompanionHeader({
      calmHome: false,
      isIdle: true,
      workspaceActiveBeside: true,
      workspacePanel: "client-avatars",
      emotion: "building",
      recentUserTexts: [],
    });
    expect(line).toMatch(/audience|people you help/i);
  });

  it("prefers kickoff header over workspace pool", () => {
    const line = resolveCompanionHeader({
      calmHome: false,
      isIdle: true,
      workspaceActiveBeside: true,
      workspacePanel: "client-avatars",
      emotion: "building",
      recentUserTexts: [],
      kickoffHeader: "Tell me about the people you help",
    });
    expect(line).toBe("Tell me about the people you help");
  });

  it("keeps header stable during active create work", () => {
    const ctx = {
      calmHome: false,
      isIdle: false,
      workspaceActiveBeside: true,
      workspacePanel: "content-generator" as const,
      emotion: "building" as const,
      recentUserTexts: ["I need a newsletter about pricing"],
      createBuilderActive: true,
      kickoffHeader: "One question at a time.",
    };
    const first = resolveCompanionHeader(ctx, null);
    const second = resolveCompanionHeader(
      { ...ctx, recentUserTexts: ["something else entirely"] },
      first,
    );
    expect(first).toBe("One question at a time.");
    expect(second).toBe("One question at a time.");
  });
});

describe("appFeatureNavigation", () => {
  it("routes celebration sound questions to settings celebrations", () => {
    const target = resolveAppFeatureNavTarget(
      "How do I turn off celebration sounds?",
    );
    expect(target?.kind).toBe("settings");
    if (target?.kind === "settings") {
      expect(target.section).toBe("celebrations");
    }
  });

  it("builds answer plus navigation offer", () => {
    const offer = buildAppFeatureNavOffer(
      "How do I turn off celebration sounds?",
    );
    expect(offer?.reply).toMatch(/Celebrations/i);
    expect(offer?.reply).toMatch(/take you directly/i);
    expect(offer?.acceptLabel).toMatch(/Celebration/i);
  });
});
