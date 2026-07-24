/**
 * Visual Thinking Intelligent Layout Engine tests (Build 8).
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  applyRequestText,
  clearVisualThinkingRequestDraft,
  createVisualThinkingRequest,
} from "@/lib/cartographersStudio/visualThinkingRequest";
import { interpretVisualThinkingUnderstanding } from "@/lib/cartographersStudio/visualThinkingUnderstanding";
import {
  applyExperiencePlanOverride,
  orchestrateVisualThinkingExperience,
} from "@/lib/cartographersStudio/visualThinkingExperienceOrchestrator";
import {
  clearKnowledgeBundle,
  knowledgeHandoffToGenerationContext,
  prepareVisualThinkingKnowledge,
} from "@/lib/cartographersStudio/visualThinkingKnowledgeIntelligence";
import {
  clearGenerationBundle,
  startGenerationFromConfirmedPlan,
} from "@/lib/cartographersStudio/visualThinkingGenerationEngine";
import {
  clearPresentationPlan,
  planVisualThinkingPresentation,
} from "@/lib/cartographersStudio/visualThinkingPresentationIntelligence";
import {
  applyWorkspaceAction,
  clearThinkingWorkspace,
  createThinkingWorkspace,
  type ThinkingObject,
  type ThinkingWorkspaceState,
  type WorkspaceLayoutIntent,
} from "@/lib/cartographersStudio/visualThinkingWorkspaceFoundation";
import {
  applyLayoutPositions,
  classifyConnectorKind,
  computeFocusViewport,
  computeLayout,
  createLayoutProposal,
  layoutEnginePreservesContent,
  layoutSpacingForProfile,
  resolveLayoutProfile,
  supportedLayoutIntents,
} from "@/lib/cartographersStudio/visualThinkingLayoutEngine";
import {
  __resetAdaptiveCompanionExplicitPrefsForTests,
  __resetAdaptiveSessionOverrideForTests,
} from "@/lib/adaptiveCompanionIntelligence";

function makeObject(
  partial: Partial<ThinkingObject> & Pick<ThinkingObject, "id" | "title" | "type">,
): ThinkingObject {
  return {
    summary: partial.summary ?? partial.title,
    sourceKind: "generated_block",
    sourceBlockId: partial.sourceBlockId ?? partial.id,
    sourceKnowledgeItemId: null,
    deliverableId: "d1",
    groupId: null,
    x: partial.x ?? 0,
    y: partial.y ?? 0,
    width: 200,
    height: 72,
    collapsed: false,
    userCreated: false,
    immutable: true,
    pinned: false,
    manuallyMoved: false,
    visualRole: "supporting",
    metadata: {},
    ...partial,
  };
}

function workspaceFromSteps(raw: string): ThinkingWorkspaceState {
  const request = applyRequestText(createVisualThinkingRequest({}), raw);
  const understanding = interpretVisualThinkingUnderstanding(request);
  let plan = orchestrateVisualThinkingExperience(understanding);
  plan = applyExperiencePlanOverride(plan, { kind: "confirm" });
  plan = {
    ...plan,
    researchStage: "not_at_all",
    primaryDeliverable: "step_by_step_guide",
    status: "ready_to_generate",
  };
  const knowledge = prepareVisualThinkingKnowledge({
    request,
    understanding,
    experiencePlan: plan,
    attachedStructuredContent: raw,
  });
  const ctx = knowledgeHandoffToGenerationContext(knowledge.handoff, {
    requestId: request.id,
    understandingId: understanding.id,
    rawRequest: request.rawRequest,
    userFacingGoal: understanding.userFacingGoal,
    successDefinition: understanding.successDefinition,
  });
  const generationBundle = startGenerationFromConfirmedPlan(plan, {
    requestId: ctx.requestId,
    understandingId: ctx.understandingId,
    rawRequest: ctx.rawRequest,
    userFacingGoal: ctx.userFacingGoal,
    successDefinition: ctx.successDefinition,
    suppliedContent: ctx.suppliedContent ?? raw,
  });
  const presentationPlan = planVisualThinkingPresentation({
    understanding,
    experiencePlan: plan,
    knowledgePackage: knowledge.package,
    generationBundle,
  });
  const ws = createThinkingWorkspace({
    understanding,
    experiencePlan: plan,
    knowledgePackage: knowledge.package,
    generationBundle,
    presentationPlan,
  });
  if (!ws) {
    throw new Error("Expected substantive workspace for layout tests");
  }
  return ws;
}

describe("Visual Thinking Layout Engine", () => {
  beforeEach(() => {
    clearVisualThinkingRequestDraft();
    clearKnowledgeBundle();
    clearGenerationBundle();
    clearPresentationPlan();
    clearThinkingWorkspace();
    __resetAdaptiveCompanionExplicitPrefsForTests();
    __resetAdaptiveSessionOverrideForTests();
  });

  it("supports all layout intents", () => {
    const intents = supportedLayoutIntents();
    expect(intents).toEqual(
      expect.arrayContaining([
        "process",
        "hierarchy",
        "relationship",
        "comparison",
        "timeline",
        "decision",
        "grouped_ideas",
        "learning_progression",
        "journey",
        "free_workspace",
      ]),
    );
    expect(intents).toHaveLength(10);
  });

  it.each([
    "process",
    "hierarchy",
    "relationship",
    "comparison",
    "timeline",
    "decision",
    "grouped_ideas",
    "learning_progression",
    "journey",
    "free_workspace",
  ] as WorkspaceLayoutIntent[])("lays out intent: %s", (intent) => {
    const objects = [
      makeObject({ id: "a", title: "Alpha", type: "decision" }),
      makeObject({ id: "b", title: "Beta", type: "step" }),
      makeObject({ id: "c", title: "Gamma", type: "concept" }),
      makeObject({ id: "d", title: "Delta", type: "warning" }),
      makeObject({ id: "e", title: "Epsilon", type: "comparison" }),
    ];
    const result = computeLayout({
      intent,
      objects,
      groups: [],
      connectors: [
        {
          id: "c1",
          fromObjectId: "a",
          toObjectId: "b",
          kind: "follows",
          label: "next",
          semantic: true,
        },
      ],
      profile: "desktop",
    });
    expect(Object.keys(result.positionsById)).toHaveLength(objects.length);
    expect(result.readingOrder).toHaveLength(objects.length);
    const xs = Object.values(result.positionsById).map((p) => p.x);
    const ys = Object.values(result.positionsById).map((p) => p.y);
    // Not all piled on one point — intentional spacing
    expect(new Set(xs.map((x) => Math.round(x))).size + new Set(ys.map((y) => Math.round(y))).size).toBeGreaterThan(2);
    expect(layoutEnginePreservesContent(objects, objects)).toBe(true);
  });

  it("process sequencing keeps reading order forward", () => {
    const objects = [
      makeObject({ id: "1", title: "Start", type: "title" }),
      makeObject({ id: "2", title: "Step one", type: "step" }),
      makeObject({ id: "3", title: "Step two", type: "step" }),
      makeObject({ id: "4", title: "Done", type: "action" }),
    ];
    const result = computeLayout({
      intent: "process",
      objects,
      groups: [],
      connectors: [],
      profile: "desktop",
    });
    expect(result.readingOrder[0]).toBe("1");
    const yOrXProgress =
      result.positionsById["2"]!.x >= result.positionsById["1"]!.x - 1 ||
      result.positionsById["2"]!.y >= result.positionsById["1"]!.y - 1;
    expect(yOrXProgress).toBe(true);
  });

  it("hierarchy preserves visual levels", () => {
    const objects = Array.from({ length: 7 }, (_, i) =>
      makeObject({
        id: `h${i}`,
        title: `Node ${i}`,
        type: i === 0 ? "title" : "concept",
      }),
    );
    const result = computeLayout({
      intent: "hierarchy",
      objects,
      groups: [],
      connectors: [],
    });
    const root = result.positionsById["h0"]!;
    const child = result.positionsById["h1"]!;
    expect(child.y).toBeGreaterThan(root.y);
  });

  it("timeline orders chronologically left-to-right on desktop", () => {
    const objects = [
      makeObject({ id: "p", title: "Past", type: "concept" }),
      makeObject({ id: "n", title: "Now", type: "step" }),
      makeObject({ id: "f", title: "Future", type: "action" }),
    ];
    const result = computeLayout({
      intent: "timeline",
      objects,
      groups: [],
      connectors: [],
      profile: "desktop",
    });
    expect(result.positionsById["p"]!.x).toBeLessThan(result.positionsById["n"]!.x);
    expect(result.positionsById["n"]!.x).toBeLessThan(result.positionsById["f"]!.x);
  });

  it("comparison aligns options without stacking into one column", () => {
    const objects = [
      makeObject({ id: "crit", title: "Shared criteria", type: "summary" }),
      makeObject({ id: "o1", title: "Option A", type: "comparison" }),
      makeObject({ id: "o2", title: "Option B", type: "comparison" }),
    ];
    const result = computeLayout({
      intent: "comparison",
      objects,
      groups: [],
      connectors: [],
    });
    expect(result.positionsById["o1"]!.x).not.toBe(result.positionsById["crit"]!.x);
  });

  it("decision layout places decision above options", () => {
    const objects = [
      makeObject({ id: "dec", title: "Should we hire?", type: "decision" }),
      makeObject({ id: "c1", title: "Budget", type: "concept" }),
      makeObject({ id: "o1", title: "Hire", type: "comparison" }),
      makeObject({ id: "u1", title: "Unknowns", type: "question" }),
    ];
    const result = computeLayout({
      intent: "decision",
      objects,
      groups: [],
      connectors: [],
    });
    expect(result.positionsById["dec"]!.y).toBeLessThanOrEqual(
      result.positionsById["o1"]!.y,
    );
  });

  it("relationship keeps a central primary concept", () => {
    const objects = [
      makeObject({ id: "hub", title: "Core idea", type: "concept" }),
      makeObject({ id: "a", title: "Related A", type: "concept" }),
      makeObject({ id: "b", title: "Related B", type: "concept" }),
      makeObject({ id: "c", title: "Related C", type: "concept" }),
    ];
    const result = computeLayout({
      intent: "relationship",
      objects,
      groups: [],
      connectors: [
        {
          id: "1",
          fromObjectId: "hub",
          toObjectId: "a",
          kind: "related_to",
          label: null,
          semantic: true,
        },
        {
          id: "2",
          fromObjectId: "hub",
          toObjectId: "b",
          kind: "related_to",
          label: null,
          semantic: true,
        },
        {
          id: "3",
          fromObjectId: "hub",
          toObjectId: "c",
          kind: "related_to",
          label: null,
          semantic: true,
        },
      ],
    });
    expect(result.placements.find((p) => p.objectId === "hub")?.visualRole).toBe(
      "primary",
    );
  });

  it("grouped ideas cluster with intentional group spacing", () => {
    const objects = [
      makeObject({ id: "s1", title: "Step 1", type: "step" }),
      makeObject({ id: "s2", title: "Step 2", type: "step" }),
      makeObject({ id: "w1", title: "Caution", type: "warning" }),
      makeObject({ id: "g1", title: "Term", type: "glossary_term" }),
    ];
    const spacing = layoutSpacingForProfile("desktop");
    const result = computeLayout({
      intent: "grouped_ideas",
      objects,
      groups: [],
      connectors: [],
    });
    const step = result.positionsById["s1"]!;
    const warn = result.positionsById["w1"]!;
    const distance = Math.hypot(step.x - warn.x, step.y - warn.y);
    expect(distance).toBeGreaterThan(spacing.gapX);
  });

  it("pinned objects and user notes do not move on layout apply", () => {
    const objects = [
      makeObject({ id: "p", title: "Pinned", type: "step", pinned: true, x: 10, y: 10 }),
      makeObject({
        id: "n",
        title: "My note",
        type: "note",
        userCreated: true,
        immutable: false,
        x: 20,
        y: 20,
      }),
      makeObject({ id: "m", title: "Movable", type: "step", x: 0, y: 0 }),
    ];
    const proposal = createLayoutProposal({
      intent: "process",
      objects,
      groups: [],
      connectors: [],
    });
    const after = applyLayoutPositions(objects, proposal.positionsById);
    expect(after.find((o) => o.id === "p")!.x).toBe(10);
    expect(after.find((o) => o.id === "n")!.x).toBe(20);
    expect(
      after.find((o) => o.id === "m")!.x !== 0 ||
        after.find((o) => o.id === "m")!.y !== 0,
    ).toBe(true);
  });

  it("auto organize proposes then accept/reject respects manual overrides", () => {
    let ws = workspaceFromSteps("1. Greet\n2. Collect\n3. Confirm");
    const target = ws.objects.find((o) => o.immutable && o.type !== "group")!;
    ws = applyWorkspaceAction(ws, {
      kind: "move",
      objectId: target.id,
      x: 999,
      y: 888,
    });
    expect(ws.objects.find((o) => o.id === target.id)!.manuallyMoved).toBe(true);
    ws = applyWorkspaceAction(ws, { kind: "pin", objectId: target.id });
    ws = applyWorkspaceAction(ws, { kind: "auto_organize" });
    expect(ws.pendingLayoutProposal).toBeTruthy();
    ws = applyWorkspaceAction(ws, { kind: "accept_layout_proposal" });
    expect(ws.objects.find((o) => o.id === target.id)!.x).toBe(999);
    expect(ws.objects.find((o) => o.id === target.id)!.y).toBe(888);

    ws = applyWorkspaceAction(ws, { kind: "auto_organize" });
    ws = applyWorkspaceAction(ws, { kind: "reject_layout_proposal" });
    expect(ws.pendingLayoutProposal).toBeNull();
  });

  it("focus mode viewport centers selection", () => {
    const objects = [
      makeObject({ id: "a", title: "A", type: "step", x: 800, y: 600 }),
    ];
    const vp = computeFocusViewport(objects, "a", 1);
    expect(vp).toBeTruthy();
    expect(vp!.panX).not.toBe(0);
  });

  it("responsive profiles change spacing; mobile stays readable", () => {
    expect(resolveLayoutProfile(500)).toBe("mobile");
    expect(resolveLayoutProfile(800)).toBe("tablet");
    expect(resolveLayoutProfile(1200)).toBe("desktop");
    const mobile = layoutSpacingForProfile("mobile");
    expect(mobile.objectW).toBeGreaterThanOrEqual(200);
    expect(mobile.gapY).toBeGreaterThanOrEqual(28);
  });

  it("classifies connectors without decorative kinds", () => {
    expect(classifyConnectorKind("follows")).toBe("sequence");
    expect(classifyConnectorKind("depends_on")).toBe("dependency");
    expect(classifyConnectorKind("related_to")).toBe("association");
  });

  it("layout suggestions never auto-apply intent", () => {
    const objects = Array.from({ length: 14 }, (_, i) =>
      makeObject({ id: `o${i}`, title: `Idea ${i}`, type: "concept" }),
    );
    const result = computeLayout({
      intent: "relationship",
      objects,
      groups: [],
      connectors: [],
    });
    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.intent).toBe("relationship");
  });

  it("performance: 200 objects layout stays under 50ms", () => {
    const objects = Array.from({ length: 200 }, (_, i) =>
      makeObject({ id: `b${i}`, title: `Item ${i}`, type: "concept" }),
    );
    const t0 = Date.now();
    const result = computeLayout({
      intent: "grouped_ideas",
      objects,
      groups: [],
      connectors: [],
    });
    const elapsed = Date.now() - t0;
    expect(Object.keys(result.positionsById)).toHaveLength(200);
    expect(elapsed).toBeLessThan(50);
  });

  it("workspace create uses layout engine and keeps knowledge immutable", () => {
    const ws = workspaceFromSteps("1. Open\n2. Review\n3. Close");
    expect(ws.layoutSuggestions).toBeDefined();
    expect(ws.pendingLayoutProposal).toBeNull();
    const before = ws.objects.map((o) => o.summary).sort();
    let next = applyWorkspaceAction(ws, { kind: "auto_organize" });
    next = applyWorkspaceAction(next, { kind: "accept_layout_proposal" });
    const after = next.objects.map((o) => o.summary).sort();
    expect(after).toEqual(before);
  });
});
