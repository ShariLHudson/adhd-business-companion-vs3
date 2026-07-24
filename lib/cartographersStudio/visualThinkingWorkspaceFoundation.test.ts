/**
 * Visual Thinking Workspace Foundation tests (Build 7).
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
  type VisualThinkingExperiencePlan,
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
  assessWorkspaceEntryEligibility,
  buildAskShariContext,
  clearThinkingWorkspace,
  createThinkingWorkspace,
  layoutIntentFromPresentation,
  loadThinkingWorkspace,
  planVisualThinkingWorkspace,
  projectInspector,
  projectVisibleWorkspaceObjects,
  saveThinkingWorkspace,
  workspacePreservesKnowledgeImmutability,
  type ThinkingWorkspaceInput,
  type ThinkingWorkspaceState,
} from "@/lib/cartographersStudio/visualThinkingWorkspaceFoundation";
import type { VisualThinkingGeneratedDeliverable } from "@/lib/cartographersStudio/visualThinkingGenerationEngine";

function requireWorkspace(input: ThinkingWorkspaceInput): ThinkingWorkspaceState {
  const ws = createThinkingWorkspace(input);
  if (!ws) throw new Error("Expected workspace creation to succeed");
  return ws;
}
import {
  __resetAdaptiveCompanionExplicitPrefsForTests,
  __resetAdaptiveSessionOverrideForTests,
} from "@/lib/adaptiveCompanionIntelligence";

function pipeline(
  raw: string,
  tweak?: (plan: VisualThinkingExperiencePlan) => VisualThinkingExperiencePlan,
  attached?: string,
): ThinkingWorkspaceInput {
  const request = applyRequestText(createVisualThinkingRequest({}), raw);
  const understanding = interpretVisualThinkingUnderstanding(request);
  let plan = orchestrateVisualThinkingExperience(understanding);
  plan = applyExperiencePlanOverride(plan, { kind: "confirm" });
  if (tweak) plan = { ...tweak(plan), status: "ready_to_generate" };
  const knowledge = prepareVisualThinkingKnowledge({
    request,
    understanding,
    experiencePlan: plan,
    attachedStructuredContent: attached ?? raw,
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
    suppliedContent: ctx.suppliedContent ?? attached ?? null,
  });
  const presentationPlan = planVisualThinkingPresentation({
    understanding,
    experiencePlan: plan,
    knowledgePackage: knowledge.package,
    generationBundle,
  });
  return {
    understanding,
    experiencePlan: plan,
    knowledgePackage: knowledge.package,
    generationBundle,
    presentationPlan,
  };
}

describe("Visual Thinking Workspace Foundation", () => {
  beforeEach(() => {
    clearVisualThinkingRequestDraft();
    clearKnowledgeBundle();
    clearGenerationBundle();
    clearPresentationPlan();
    clearThinkingWorkspace();
    __resetAdaptiveCompanionExplicitPrefsForTests();
    __resetAdaptiveSessionOverrideForTests();
  });

  it("opens workspace from presentation + knowledge + deliverables", () => {
    const input = pipeline(
      "Turn these into a step-by-step guide: 1. Greet 2. Collect 3. Confirm",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "step_by_step_guide",
        supportingDeliverables: ["checklist"],
      }),
      "1. Greet\n2. Collect\n3. Confirm",
    );
    const ws = requireWorkspace(input);
    expect(ws.version).toBe("vts-thinking-workspace-1");
    expect(ws.presentationPlanId).toBe(input.presentationPlan.id);
    expect(ws.generationRunId).toBe(input.generationBundle.run.id);
    expect(ws.objects.length).toBeGreaterThan(0);
    expect(ws.workspacePlanId).toBeTruthy();
    expect(ws.layoutIntent).toBe(
      layoutIntentFromPresentation(input.presentationPlan),
    );
    const plan = planVisualThinkingWorkspace(input);
    expect(plan?.status).toMatch(/ready|partial/);
  });

  it("selection updates and inspector reflects selection", () => {
    const input = pipeline(
      "Steps: 1. Open 2. Review 3. Close",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "step_by_step_guide",
      }),
      "1. Open\n2. Review\n3. Close",
    );
    let ws = requireWorkspace(input);
    const first = ws.objects.find((o) => o.type !== "group");
    expect(first).toBeTruthy();
    ws = applyWorkspaceAction(ws, { kind: "select", objectId: first!.id });
    expect(ws.selection.primaryObjectId).toBe(first!.id);
    const inspector = projectInspector(ws, input.generationBundle.deliverables);
    expect(inspector?.title).toBe(first!.title);
    expect(inspector?.details.length).toBeGreaterThan(0);
  });

  it("groups collapse and expand without rewriting knowledge", () => {
    const manySteps = Array.from({ length: 20 }, (_, i) => `${i + 1}. Step ${i + 1}`).join(
      "\n",
    );
    const input = pipeline(
      `Turn into a step-by-step guide:\n${manySteps}`,
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "step_by_step_guide",
      }),
      manySteps,
    );
    let ws = requireWorkspace(input);
    expect(ws.groups.length).toBeGreaterThan(0);
    const groupId = ws.groups[0]!.id;
    const beforeSummaries = ws.objects
      .filter((o) => o.immutable)
      .map((o) => o.summary)
      .sort();
    ws = applyWorkspaceAction(ws, { kind: "collapse_group", groupId });
    expect(ws.groups[0]!.collapsed).toBe(true);
    const visibleCollapsed = projectVisibleWorkspaceObjects(ws);
    expect(
      visibleCollapsed.every(
        (o) => o.type === "group" || o.groupId !== groupId,
      ),
    ).toBe(true);
    ws = applyWorkspaceAction(ws, { kind: "expand_group", groupId });
    expect(ws.groups[0]!.collapsed).toBe(false);
    const afterSummaries = ws.objects
      .filter((o) => o.immutable)
      .map((o) => o.summary)
      .sort();
    expect(afterSummaries).toEqual(beforeSummaries);
  });

  it("pan, zoom, fit, and reset view work", () => {
    const input = pipeline(
      "Checklist: pack, ship, confirm",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "checklist",
      }),
      "- pack\n- ship\n- confirm",
    );
    let ws = requireWorkspace(input);
    const z0 = ws.viewport.zoom;
    ws = applyWorkspaceAction(ws, { kind: "pan", panX: 40, panY: -20 });
    expect(ws.viewport.panX).toBe(40);
    expect(ws.viewport.panY).toBe(-20);
    ws = applyWorkspaceAction(ws, { kind: "zoom", zoom: z0 + 0.2 });
    expect(ws.viewport.zoom).toBeGreaterThan(z0);
    ws = applyWorkspaceAction(ws, { kind: "fit_content" });
    expect(ws.viewport.zoom).toBeGreaterThan(0);
    ws = applyWorkspaceAction(ws, { kind: "reset_view" });
    expect(ws.focusMode).toBe(false);
  });

  it("focus mode dims context around selection", () => {
    const input = pipeline(
      "Steps: 1. Prepare 2. Record 3. Review",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "step_by_step_guide",
      }),
      "1. Prepare\n2. Record\n3. Review",
    );
    let ws = requireWorkspace(input);
    const id = ws.objects.find((o) => o.type !== "group")!.id;
    ws = applyWorkspaceAction(ws, { kind: "select", objectId: id });
    ws = applyWorkspaceAction(ws, { kind: "focus_mode", enabled: true });
    expect(ws.focusMode).toBe(true);
    expect(ws.focusedObjectId).toBe(id);
    ws = applyWorkspaceAction(ws, { kind: "focus_mode", enabled: false });
    expect(ws.focusMode).toBe(false);
  });

  it("search highlights and centers matches", () => {
    const input = pipeline(
      "Steps: 1. Greeting 2. Collect details 3. Confirm",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "step_by_step_guide",
      }),
      "1. Greeting\n2. Collect details\n3. Confirm",
    );
    let ws = requireWorkspace(input);
    ws = applyWorkspaceAction(ws, { kind: "search", query: "Collect" });
    expect(ws.searchMatchIds.length).toBeGreaterThan(0);
    expect(ws.selection.primaryObjectId).toBe(ws.searchMatchIds[0]);
  });

  it("Ask Shari context is selection and workspace aware", () => {
    const input = pipeline(
      "Steps: 1. Start 2. Finish",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "step_by_step_guide",
      }),
      "1. Start\n2. Finish",
    );
    let ws = requireWorkspace(input);
    const id = ws.objects.find((o) => o.type !== "group")!.id;
    ws = applyWorkspaceAction(ws, { kind: "select", objectId: id });
    const ctx = buildAskShariContext(ws);
    expect(ctx.workspaceId).toBe(ws.id);
    expect(ctx.selectedObjectId).toBe(id);
    expect(ctx.suggestedPrompts.length).toBeGreaterThan(0);
    expect(ctx.suggestedPrompts.every((p) => typeof p === "string")).toBe(true);
  });

  it("Add Idea creates distinct user objects; generated stay immutable", () => {
    const input = pipeline(
      "Steps: 1. One 2. Two",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "step_by_step_guide",
      }),
      "1. One\n2. Two",
    );
    let ws = requireWorkspace(input);
    const before = ws;
    ws = applyWorkspaceAction(ws, {
      kind: "add_idea",
      title: "What about timing?",
      ideaType: "question",
    });
    const idea = ws.objects.find((o) => o.userCreated);
    expect(idea?.type).toBe("question");
    expect(idea?.immutable).toBe(false);
    expect(workspacePreservesKnowledgeImmutability(before, ws)).toBe(true);
    const genCountBefore = before.objects.filter((o) => o.immutable).length;
    const genCountAfter = ws.objects.filter((o) => o.immutable).length;
    expect(genCountAfter).toBe(genCountBefore);
  });

  it("movement and organize never change knowledge summaries", () => {
    const input = pipeline(
      "Steps: 1. Alpha 2. Beta 3. Gamma",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "step_by_step_guide",
      }),
      "1. Alpha\n2. Beta\n3. Gamma",
    );
    let ws = requireWorkspace(input);
    const target = ws.objects.find((o) => o.immutable && o.type !== "group")!;
    const before: ThinkingWorkspaceState = ws;
    ws = applyWorkspaceAction(ws, {
      kind: "move",
      objectId: target.id,
      x: target.x + 80,
      y: target.y + 40,
    });
    expect(workspacePreservesKnowledgeImmutability(before, ws)).toBe(true);
    const mid = ws;
    ws = applyWorkspaceAction(ws, { kind: "auto_organize" });
    expect(ws.pendingLayoutProposal).toBeTruthy();
    expect(workspacePreservesKnowledgeImmutability(mid, ws)).toBe(true);
    ws = applyWorkspaceAction(ws, { kind: "accept_layout_proposal" });
    expect(ws.pendingLayoutProposal).toBeNull();
    expect(workspacePreservesKnowledgeImmutability(mid, ws)).toBe(true);
  });

  it("delete removes user notes only", () => {
    const input = pipeline(
      "Steps: 1. Keep me 2. Next action 3. Finish up",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "step_by_step_guide",
      }),
      "1. Keep me\n2. Next action\n3. Finish up",
    );
    let ws = requireWorkspace(input);
    const generated = ws.objects.find((o) => o.immutable)!;
    ws = applyWorkspaceAction(ws, {
      kind: "add_idea",
      title: "scratch note",
    });
    const noteId = ws.selection.primaryObjectId!;
    const blocked = applyWorkspaceAction(ws, {
      kind: "delete_user_object",
      objectId: generated.id,
    });
    expect(blocked.objects.some((o) => o.id === generated.id)).toBe(true);
    ws = applyWorkspaceAction(ws, {
      kind: "delete_user_object",
      objectId: noteId,
    });
    expect(ws.objects.some((o) => o.id === noteId)).toBe(false);
  });

  it("group / ungroup and undo support organization only", () => {
    const input = pipeline(
      "Steps: 1. Prepare 2. Record 3. Review",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "step_by_step_guide",
      }),
      "1. Prepare\n2. Record\n3. Review",
    );
    let ws = requireWorkspace(input);
    const ids = ws.objects
      .filter((o) => o.immutable && o.type !== "group")
      .slice(0, 2)
      .map((o) => o.id);
    expect(ids.length).toBe(2);
    ws = applyWorkspaceAction(ws, { kind: "group", objectIds: ids, title: "Pair" });
    expect(ws.groups.some((g) => g.title === "Pair")).toBe(true);
    const groupId = ws.groups.find((g) => g.title === "Pair")!.id;
    ws = applyWorkspaceAction(ws, { kind: "ungroup", groupId });
    expect(ws.groups.some((g) => g.id === groupId)).toBe(false);
    ws = applyWorkspaceAction(ws, { kind: "group", objectIds: ids });
    ws = applyWorkspaceAction(ws, { kind: "undo" });
    expect(ws.groups.some((g) => g.objectIds.includes(ids[0]!))).toBe(false);
  });

  it("persists zoom, pan, selection, and organization", () => {
    const store: Record<string, string> = {};
    const prev = (globalThis as { window?: unknown }).window;
    (globalThis as { window: unknown }).window = {
      sessionStorage: {
        setItem: (k: string, v: string) => {
          store[k] = v;
        },
        getItem: (k: string) => store[k] ?? null,
        removeItem: (k: string) => {
          delete store[k];
        },
      },
    };
    try {
      const input = pipeline(
        "Steps: 1. Save 2. Restore",
        (p) => ({
          ...p,
          researchStage: "not_at_all",
          primaryDeliverable: "step_by_step_guide",
        }),
        "1. Save\n2. Restore",
      );
      let ws = requireWorkspace(input);
      const id = ws.objects.find((o) => o.type !== "group")!.id;
      ws = applyWorkspaceAction(ws, { kind: "select", objectId: id });
      ws = applyWorkspaceAction(ws, { kind: "pan", panX: 12, panY: 8 });
      ws = applyWorkspaceAction(ws, { kind: "zoom", zoom: 1.2 });
      saveThinkingWorkspace(ws);
      const loaded = loadThinkingWorkspace();
      expect(loaded?.id).toBe(ws.id);
      expect(loaded?.selection.primaryObjectId).toBe(id);
      expect(loaded?.viewport.panX).toBe(12);
      expect(loaded?.viewport.zoom).toBe(1.2);
    } finally {
      if (prev === undefined) {
        delete (globalThis as { window?: unknown }).window;
      } else {
        (globalThis as { window: unknown }).window = prev;
      }
    }
  });

  it("large workspace projection stays responsive for 200+ objects", () => {
    const input = pipeline(
      "Show me how. Steps: 1. Prepare 2. Record 3. Review 4. Publish 5. Share",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "step_by_step_guide",
      }),
      "1. Prepare\n2. Record\n3. Review\n4. Publish\n5. Share",
    );
    let ws = requireWorkspace(input);
    const extras = Array.from({ length: 220 }, (_, i) => ({
      ...ws.objects[0]!,
      id: `bulk_${i}`,
      title: `Idea ${i}`,
      summary: `Summary ${i}`,
      x: (i % 20) * 40,
      y: Math.floor(i / 20) * 40,
      sourceBlockId: null,
      immutable: true,
      userCreated: false,
    }));
    ws = { ...ws, objects: [...ws.objects, ...extras] };
    const t0 = Date.now();
    const visible = projectVisibleWorkspaceObjects(ws);
    const elapsed = Date.now() - t0;
    expect(visible.length).toBeGreaterThan(200);
    expect(elapsed).toBeLessThan(50);
  });

  it("substantive build_for_me result creates a Workspace Plan", () => {
    const input = pipeline(
      "I need to learn how to make a Loom video and upload it to YouTube.",
      (p) => ({
        ...p,
        researchStage: "during_generation",
        primaryDeliverable: "step_by_step_guide",
        supportingDeliverables: ["checklist"],
        interactionStyle: "build_for_me",
      }),
    );
    const assessment = assessWorkspaceEntryEligibility(input);
    expect(assessment.allowed).toBe(true);
    expect(assessment.substantive).toBe(true);
    const plan = planVisualThinkingWorkspace(input);
    expect(plan).toBeTruthy();
    expect(plan!.primaryDeliverableId).toBeTruthy();
    const ws = requireWorkspace(input);
    expect(ws.objects.some((o) => /loom|youtube|record|upload/i.test(o.title + o.summary))).toBe(
      true,
    );
  });

  it("request-echo result is rejected before workspace creation", () => {
    const input = pipeline(
      "Turn these into a step-by-step guide: 1. Greet 2. Collect 3. Confirm",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "step_by_step_guide",
        interactionStyle: "build_for_me",
      }),
      "1. Greet\n2. Collect\n3. Confirm",
    );
    const echo: VisualThinkingGeneratedDeliverable = {
      ...input.generationBundle.deliverables[0]!,
      title: `Guide: ${input.understanding.rawRequest}`,
      purpose: input.understanding.rawRequest,
      blocks: [
        {
          id: "e1",
          type: "heading",
          title: "Overview",
          content: input.understanding.rawRequest,
          order: 0,
          parentId: null,
          metadata: {},
          editable: true,
          userEdited: false,
        },
        {
          id: "e2",
          type: "paragraph",
          title: null,
          content: input.understanding.rawRequest,
          order: 1,
          parentId: null,
          metadata: {},
          editable: true,
          userEdited: false,
        },
        {
          id: "e3",
          type: "numbered_step",
          title: "Step 1",
          content: `Complete step 1 for ${input.understanding.rawRequest.slice(0, 40)}`,
          order: 2,
          parentId: null,
          metadata: {},
          editable: true,
          userEdited: false,
        },
      ],
    };
    const rejected = {
      ...input,
      generationBundle: {
        ...input.generationBundle,
        deliverables: [echo],
      },
      presentationPlan: {
        ...input.presentationPlan,
        primaryDeliverableId: echo.id,
      },
    };
    const assessment = assessWorkspaceEntryEligibility(rejected);
    expect(assessment.allowed).toBe(false);
    expect(createThinkingWorkspace(rejected)).toBeNull();
    expect(planVisualThinkingWorkspace(rejected)).toBeNull();
  });

  it("user-led request creates a calm starter workspace", () => {
    const input = pipeline("I want to make my own map of my business.");
    const assessment = assessWorkspaceEntryEligibility(input);
    expect(assessment.userLedExempt || assessment.allowed).toBe(true);
    const ws = requireWorkspace(input);
    expect(ws.workspaceMode === "user_led" || ws.layoutIntent === "free_workspace").toBe(
      true,
    );
    expect(ws.objects.length).toBeGreaterThan(0);
  });

  it("Ask Shari context includes selected object scope without auto-modifying", () => {
    const input = pipeline(
      "Steps: 1. Open 2. Review 3. Close",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "step_by_step_guide",
      }),
      "1. Open\n2. Review\n3. Close",
    );
    let ws = requireWorkspace(input);
    const step = ws.objects.find((o) => o.type === "step") ?? ws.objects[0]!;
    ws = applyWorkspaceAction(ws, { kind: "select", objectId: step.id });
    const ctx = buildAskShariContext(ws, "Explain this step.");
    expect(ctx.selectedObjectIds).toEqual([step.id]);
    expect(ctx.userQuestion).toBe("Explain this step.");
    expect(ctx.suggestedPrompts.length).toBeGreaterThan(0);
    expect(ws.objects.find((o) => o.id === step.id)?.summary).toBe(step.summary);
  });
});
