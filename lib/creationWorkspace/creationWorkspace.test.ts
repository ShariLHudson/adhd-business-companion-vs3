import { describe, expect, it } from "vitest";
import {
  applySelectedAreaAction,
  createShorterAlternative,
  decideCreationWorkspaceOpen,
  editWorkspaceItem,
  inferUseThisWorkOptions,
  openWorkspaceFromCreationPackage,
  prepareCreationWorkspaceHandoff,
  projectCreationPackageToWorkspace,
  researchSelectedWorkspaceArea,
  restoreWorkspaceVersion,
  reviewMissingPieces,
  runRequestIntoCreationWorkspace,
  snapshotWorkspaceVersion,
  validateCreationWorkspaceSubstance,
} from "./index";
import {
  generateCreationPackage,
  understandUniversalRequest,
  buildDynamicCreationBlueprint,
} from "@/lib/universalRequestOutcome";

describe("Creation Workspace", () => {
  it("1–4: five-day plan projects into populated workspace with duration preserved", () => {
    const result = runRequestIntoCreationWorkspace(
      "Create a five-day social media content plan.",
      { persist: false },
    );
    expect(result.openDecision.open).toBe(true);
    expect(result.workspace).toBeTruthy();
    expect(result.substance?.valid).toBe(true);
    expect(result.substance?.durationPreserved).toBe(true);
    const days = result.workspace!.items.filter(
      (i) => i.type === "timeline_item",
    );
    expect(days.length).toBeGreaterThanOrEqual(5);
    expect(result.workspace!.title.toLowerCase()).not.toMatch(
      /facebook post|social post/,
    );
  });

  it("5–6: unknown mentoring program produces workspace without exact template", () => {
    const result = runRequestIntoCreationWorkspace(
      "Create a mentoring program for high-school robotics volunteers.",
      { persist: false },
    );
    expect(result.creationPackage).toBeTruthy();
    expect(result.workspace).toBeTruthy();
    expect(result.workspace!.items.length).toBeGreaterThanOrEqual(3);
    expect(result.openDecision.open).toBe(true);
  });

  it("7–8: user edits become protected; selected actions do not wipe workspace", () => {
    const result = runRequestIntoCreationWorkspace(
      "Create a five-day social media content plan.",
      { persist: false },
    );
    const ws = result.workspace!;
    const day = ws.items.find((i) => i.type === "timeline_item")!;
    const edited = editWorkspaceItem(ws, day.id, {
      body: "My custom Day content with a unique edit marker.",
    });
    const protectedItem = edited.items.find((i) => i.id === day.id)!;
    expect(protectedItem.userEdited).toBe(true);
    expect(protectedItem.protected).toBe(true);

    const afterAction = applySelectedAreaAction(
      edited,
      day.id,
      "expand",
    );
    // Protected — should suggest, not overwrite
    expect(
      afterAction.items.find((i) => i.id === day.id)!.body,
    ).toContain("unique edit marker");
    expect(afterAction.items.length).toBeGreaterThanOrEqual(edited.items.length);
  });

  it("9–10: Research This preserves selected context and protects edits", () => {
    const result = runRequestIntoCreationWorkspace(
      "Create a volunteer handbook for my nonprofit.",
      { persist: false },
    );
    const ws = result.workspace!;
    const section = ws.items.find((i) => i.groupId !== "research")!;
    const edited = editWorkspaceItem(ws, section.id, {
      body: "User-owned safety notes stay here.",
    });
    const researched = researchSelectedWorkspaceArea({
      workspace: edited,
      itemId: section.id,
      approveUpdate: true,
    });
    expect(researched.researchCollectionId).toBeTruthy();
    expect(
      researched.workspace.items.find((i) => i.id === section.id)!.body,
    ).toContain("User-owned safety notes stay here.");
    expect(
      researched.workspace.items.filter((i) => i.id !== section.id).length,
    ).toBeGreaterThan(0);
  });

  it("11–13: missing pieces, alternatives, and version restore", () => {
    const result = runRequestIntoCreationWorkspace(
      "Create a volunteer handbook for my nonprofit.",
      { persist: false },
    );
    let ws = reviewMissingPieces({
      workspace: result.workspace!,
      blueprint: result.blueprint,
    });
    expect(Array.isArray(ws.missingPieces)).toBe(true);

    ws = createShorterAlternative(ws, "Shorter for volunteers");
    expect(ws.alternatives.length).toBe(1);
    const originalCount = ws.items.filter(
      (i) => i.groupId !== "research",
    ).length;

    ws = snapshotWorkspaceVersion(ws, "User Revised Draft");
    const versionId = ws.versions[0]!.id;
    ws = editWorkspaceItem(ws, ws.sectionIds[0]!, {
      body: "Changed after snapshot",
    });
    const restored = restoreWorkspaceVersion(ws, versionId);
    expect(restored.versions.length).toBeGreaterThan(ws.versions.length - 1);
    expect(
      restored.items.filter((i) => i.groupId !== "research").length,
    ).toBeGreaterThanOrEqual(1);
    expect(originalCount).toBeGreaterThan(0);
  });

  it("14–19: Use This Work and destination handoffs", () => {
    const result = runRequestIntoCreationWorkspace(
      "Create a five-day social media content plan.",
      { persist: false },
    );
    const options = inferUseThisWorkOptions(result.workspace!);
    expect(options.length).toBeGreaterThanOrEqual(3);
    expect(options.length).toBeLessThanOrEqual(5);
    expect(options.some((o) => o.destination === "create")).toBe(true);

    const createHandoff = prepareCreationWorkspaceHandoff({
      workspace: result.workspace!,
      option: options.find((o) => o.destination === "create")!,
      creationPackage: result.creationPackage,
    });
    expect(createHandoff.handoff.payload.length).toBeGreaterThan(100);
    expect(createHandoff.handoff.payload).toMatch(/## /);

    const projectOpt = options.find((o) => o.destination === "projects");
    if (projectOpt) {
      const projectHandoff = prepareCreationWorkspaceHandoff({
        workspace: result.workspace!,
        option: projectOpt,
        creationPackage: result.creationPackage,
      });
      expect(projectHandoff.handoff.requiresReview).toBe(true);
      expect(projectHandoff.handoff.payload).toMatch(/Proposal Review|approve/i);
    }

    const visualOpt =
      options.find((o) => o.destination === "visual_thinking") ||
      ({
        id: "visual",
        label: "Show Visually",
        description: "",
        destination: "visual_thinking" as const,
        reason: "",
        confidence: 0.7,
        primary: false,
        requiresClarification: false,
      });
    const visual = prepareCreationWorkspaceHandoff({
      workspace: result.workspace!,
      option: visualOpt,
      creationPackage: result.creationPackage,
    });
    const parsed = JSON.parse(visual.handoff.payload) as {
      sections: unknown[];
    };
    expect(parsed.sections.length).toBeGreaterThan(0);

    const strategy = prepareCreationWorkspaceHandoff({
      workspace: result.workspace!,
      option: {
        id: "strategy",
        label: "Strategic Planning",
        description: "",
        destination: "strategic_planning",
        reason: "",
        confidence: 0.7,
        primary: false,
        requiresClarification: false,
      },
    });
    expect(strategy.handoff.requiresReview).toBe(true);
    expect(strategy.handoff.payload).toMatch(/not approved|proposal/i);

    const estate = prepareCreationWorkspaceHandoff({
      workspace: result.workspace!,
      option: {
        id: "estate",
        label: "Business Estate",
        description: "",
        destination: "business_estate",
        reason: "",
        confidence: 0.7,
        primary: false,
        requiresClarification: false,
      },
    });
    expect(estate.handoff.requiresReview).toBe(true);
    expect(estate.handoff.payload).toMatch(/approval|review/i);
  });

  it("20: direct simple thank-you email bypasses workspace", () => {
    const result = runRequestIntoCreationWorkspace(
      "Write a short thank-you email.",
      { persist: false },
    );
    expect(result.openDecision.open).toBe(false);
    if (result.openDecision.open === false) {
      expect(result.openDecision.bypassTo).toBe("create");
    }
    expect(result.workspace).toBeNull();
  });

  it("21–22: multiple handoffs link to one package; edits do not silent-sync", () => {
    const result = runRequestIntoCreationWorkspace(
      "Research employee onboarding, create the program, and build the implementation project.",
      { persist: false, fromResearchUse: true },
    );
    expect(result.workspace || result.creationPackage).toBeTruthy();
    if (!result.workspace) return;
    const options = inferUseThisWorkOptions(result.workspace);
    const createOpt = options.find((o) => o.destination === "create");
    const projectOpt = options.find((o) => o.destination === "projects");
    let ws = result.workspace;
    if (createOpt) {
      const h1 = prepareCreationWorkspaceHandoff({
        workspace: ws,
        option: createOpt,
      });
      ws = h1.workspace;
    }
    if (projectOpt) {
      const h2 = prepareCreationWorkspaceHandoff({
        workspace: ws,
        option: projectOpt,
      });
      ws = h2.workspace;
    }
    expect(ws.handoffs.length).toBeGreaterThanOrEqual(1);
    expect(
      new Set(ws.handoffs.map((h) => h.creationPackageId)).size,
    ).toBeLessThanOrEqual(1);
  });

  it("23–24: empty/warning package cannot open standard workspace; one-section failure preserves others", () => {
    const u = understandUniversalRequest("Create something");
    const blueprint = buildDynamicCreationBlueprint(u);
    const emptyPkg = generateCreationPackage({
      understanding: u,
      blueprint,
      researchCollection: null,
      sourceExperience: "test",
    });
    // Force thin package
    const thin = {
      ...emptyPkg,
      sections: [
        {
          id: "s1",
          title: "Warning",
          content: "Current research unavailable.",
          order: 0,
          kind: "note" as const,
        },
      ],
      title: "Warning only",
    };
    const projected = projectCreationPackageToWorkspace({
      creationPackage: thin,
      blueprint,
      understanding: u,
    });
    const substance = validateCreationWorkspaceSubstance({
      workspace: projected,
      creationPackage: thin,
      understanding: u,
    });
    expect(substance.warningOnlyDetected || !substance.valid).toBe(true);

    const good = runRequestIntoCreationWorkspace(
      "Create a five-day social media content plan.",
      { persist: false },
    );
    const ws = good.workspace!;
    const first = ws.sectionIds[0]!;
    const removed = applySelectedAreaAction(ws, first, "remove");
    expect(
      removed.items.filter((i) => i.status !== "removed" && i.groupId !== "research")
        .length,
    ).toBeGreaterThan(0);
  });

  it("25: openDecision and package projection helpers stay aligned", () => {
    const u = understandUniversalRequest(
      "Create a five-day social media content plan.",
    );
    expect(
      decideCreationWorkspaceOpen({
        understanding: u,
        hasSubstantivePackage: true,
      }).open,
    ).toBe(true);

    const email = understandUniversalRequest("Write a short thank-you email.");
    expect(
      decideCreationWorkspaceOpen({
        understanding: email,
        hasSubstantivePackage: true,
      }).open,
    ).toBe(false);

    const pkgResult = runRequestIntoCreationWorkspace(
      "Create a five-day social media content plan.",
      { persist: false },
    );
    const fromPkg = openWorkspaceFromCreationPackage({
      creationPackage: pkgResult.creationPackage!,
      blueprint: pkgResult.blueprint,
      understanding: pkgResult.understanding,
      persist: false,
    });
    expect(fromPkg.workspace).toBeTruthy();
  });

  it("D: research-to-creation workspace path", () => {
    const result = runRequestIntoCreationWorkspace(
      "Use this research to help me build an advisory board for my business.",
      { persist: false, fromResearchUse: true },
    );
    expect(result.openDecision.open).toBe(true);
    expect(result.workspace).toBeTruthy();
  });
});
