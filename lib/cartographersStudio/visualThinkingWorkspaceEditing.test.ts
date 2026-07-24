/**
 * Workspace Editing & Co-Creation Intelligence tests.
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
  getPrimaryDeliverable,
  startGenerationFromConfirmedPlan,
} from "@/lib/cartographersStudio/visualThinkingGenerationEngine";
import {
  clearPresentationPlan,
  planVisualThinkingPresentation,
} from "@/lib/cartographersStudio/visualThinkingPresentationIntelligence";
import {
  clearThinkingWorkspace,
  createThinkingWorkspace,
  type ThinkingWorkspaceState,
} from "@/lib/cartographersStudio/visualThinkingWorkspaceFoundation";
import {
  applyCoCreationAction,
  applyMergeDecision,
  assertScopedBlockMutation,
  autosaveEditingSession,
  clearEditingSession,
  createWorkspaceEditingSession,
  expandSelectedObjects,
  findMissingPieces,
  generateAlternatives,
  loadEditingSession,
  mergeSuggestionsForProtected,
  prepareAskBoard,
  projectCoCreationInspector,
  projectEditingAudit,
  projectThinkingObjectKnowledge,
  recoverEditingSession,
  researchSelectedArea,
  simplifySelectedObjects,
  undoContentEdit,
  updateSelection,
  writebackRequiresApproval,
  type WorkspaceEditingSession,
} from "@/lib/cartographersStudio/visualThinkingWorkspaceEditing";

function installSessionStorage() {
  const store = new Map<string, string>();
  (globalThis as { window: unknown }).window = {
    sessionStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    },
  };
}

function buildWorkspace(
  sections: string[],
  label = "guide",
): {
  workspace: ThinkingWorkspaceState;
  session: WorkspaceEditingSession;
} {
  const attached = sections.map((s, i) => `${i + 1}. ${s}`).join("\n");
  const raw = `Turn these into a step-by-step ${label}: ${attached}`;
  const request = applyRequestText(createVisualThinkingRequest({}), raw);
  const understanding = interpretVisualThinkingUnderstanding(request);
  let plan = orchestrateVisualThinkingExperience(understanding);
  plan = applyExperiencePlanOverride(plan, { kind: "confirm" });
  plan = {
    ...plan,
    researchStage: "not_at_all",
    primaryDeliverable: "step_by_step_guide",
    supportingDeliverables: ["checklist"],
    status: "ready_to_generate",
  };
  const knowledge = prepareVisualThinkingKnowledge({
    request,
    understanding,
    experiencePlan: plan,
    attachedStructuredContent: attached,
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
    suppliedContent: attached,
  });
  const presentationPlan = planVisualThinkingPresentation({
    understanding,
    experiencePlan: plan,
    knowledgePackage: knowledge.package,
    generationBundle,
  });
  const workspace = createThinkingWorkspace({
    understanding,
    experiencePlan: plan,
    knowledgePackage: knowledge.package,
    generationBundle,
    presentationPlan,
  });
  if (!workspace) throw new Error("workspace required");
  const session = createWorkspaceEditingSession({ workspace, generationBundle });
  return { workspace, session };
}

describe("Workspace Editing & Co-Creation", () => {
  beforeEach(() => {
    installSessionStorage();
    clearVisualThinkingRequestDraft();
    clearKnowledgeBundle();
    clearGenerationBundle();
    clearPresentationPlan();
    clearThinkingWorkspace();
    clearEditingSession();
  });

  it("projects ThinkingObject knowledge without layout fields", () => {
    const { workspace } = buildWorkspace([
      "Social Media",
      "Email",
      "Events",
    ]);
    const obj = workspace.objects.find((o) => o.sourceBlockId)!;
    const knowledge = projectThinkingObjectKnowledge(obj, obj.summary);
    expect(knowledge.workspaceObjectId).toBe(obj.id);
    expect(knowledge).not.toHaveProperty("x");
    expect(knowledge).not.toHaveProperty("y");
  });

  it("expands only the selected object (section editing)", () => {
    const built = buildWorkspace([
      "Social Media",
      "Email",
      "Events",
    ], "marketing strategy");
    let { workspace, session } = built;
    const primary = getPrimaryDeliverable(session.generationBundle)!;
    const target = workspace.objects.find(
      (o) => o.sourceBlockId && o.type !== "group" && o.title.toLowerCase().includes("social"),
    ) ?? workspace.objects.find((o) => o.sourceBlockId && o.type !== "group")!;
    const selected = updateSelection(session, workspace, [target.id]);
    session = selected.session;
    workspace = selected.workspace;

    const before = getPrimaryDeliverable(session.generationBundle)!;
    const result = expandSelectedObjects(session, workspace);
    expect(result.scopedEdit).toBe(true);
    expect(result.avoidedFullRegeneration).toBe(true);
    const after = getPrimaryDeliverable(result.generationBundle)!;
    expect(
      assertScopedBlockMutation(before, after, [target.sourceBlockId!]),
    ).toBe(true);
    const otherBlocks = before.blocks.filter((b) => b.id !== target.sourceBlockId);
    for (const b of otherBlocks) {
      const next = after.blocks.find((x) => x.id === b.id);
      expect(next?.content).toBe(b.content);
    }
    void primary;
  });

  it("simplifies only the selected lesson/section", () => {
    const built = buildWorkspace(
      ["Lesson one", "Lesson two", "Lesson three"],
      "learning guide",
    );
    let { workspace, session } = built;
    const target = workspace.objects.find((o) => o.sourceBlockId && o.type !== "group")!;
    const selected = updateSelection(session, workspace, [target.id]);
    const before = getPrimaryDeliverable(selected.session.generationBundle)!;
    const result = simplifySelectedObjects(selected.session, selected.workspace);
    const after = getPrimaryDeliverable(result.generationBundle)!;
    expect(assertScopedBlockMutation(before, after, [target.sourceBlockId!])).toBe(
      true,
    );
  });

  it("protects user edits from research overwrite", () => {
    const built = buildWorkspace(
      ["Equipment", "Recording", "Editing"],
      "podcast plan",
    );
    let { workspace, session } = built;
    const target = workspace.objects.find((o) => o.sourceBlockId)!;
    const selected = updateSelection(session, workspace, [target.id]);
    const edited = applyCoCreationAction(
      selected.session,
      selected.workspace,
      "edit_body",
      { content: "My custom equipment list — do not overwrite." },
    );
    expect(edited.workspace.objects.find((o) => o.id === target.id)?.metadata).toMatchObject(
      expect.objectContaining({ userEdited: true }),
    );

    const researched = researchSelectedArea(edited.session, edited.workspace, [
      {
        objectId: target.id,
        finding: "New researched gear list",
        sourceLabel: "vendor guide",
      },
    ]);
    expect(researched.session.pendingMergeSuggestions.length).toBeGreaterThan(0);
    const bodyAfter = getPrimaryDeliverable(researched.generationBundle)!
      .blocks.find((b) => b.id === target.sourceBlockId)?.content;
    expect(bodyAfter).toContain("My custom equipment list");
    expect(bodyAfter).not.toContain("New researched gear list");
  });

  it("content undo restores prior deliverable text", () => {
    const built = buildWorkspace(
      ["Executive Summary", "Operations", "Financial Risks"],
      "business plan",
    );
    let { workspace, session } = built;
    const target = workspace.objects.find((o) => o.sourceBlockId)!;
    const selected = updateSelection(session, workspace, [target.id]);
    const edited = applyCoCreationAction(
      selected.session,
      selected.workspace,
      "edit_body",
      { content: "Rewritten executive summary only." },
    );
    expect(
      getPrimaryDeliverable(edited.generationBundle)!.blocks.find(
        (b) => b.id === target.sourceBlockId,
      )?.content,
    ).toContain("Rewritten executive summary");

    const undone = undoContentEdit(edited.session, edited.workspace);
    expect(
      getPrimaryDeliverable(undone.generationBundle)!.blocks.find(
        (b) => b.id === target.sourceBlockId,
      )?.content,
    ).not.toContain("Rewritten executive summary");
  });

  it("find missing pieces returns suggestions without inserting", () => {
    const built = buildWorkspace(
      ["Venue", "Guests", "Program"],
      "event plan",
    );
    const { workspace, session } = built;
    const beforeCount = workspace.objects.length;
    const result = findMissingPieces(session, workspace);
    expect(result.session.pendingMissingPieces.length).toBeGreaterThan(0);
    expect(result.workspace.objects.length).toBe(beforeCount);
  });

  it("generate alternatives does not overwrite current work", () => {
    const built = buildWorkspace(
      ["HubSpot", "HighLevel", "Salesforce"],
      "CRM comparison",
    );
    let { workspace, session } = built;
    const target = workspace.objects.find((o) => o.sourceBlockId)!;
    const selected = updateSelection(session, workspace, [target.id]);
    const before = getPrimaryDeliverable(selected.session.generationBundle)!;
    const result = generateAlternatives(selected.session, selected.workspace);
    expect(result.session.pendingAlternatives.length).toBeGreaterThan(0);
    const after = getPrimaryDeliverable(result.generationBundle)!;
    expect(JSON.stringify(after.blocks)).toBe(JSON.stringify(before.blocks));
  });

  it("Ask Board prepares package without mutating workspace knowledge", () => {
    const built = buildWorkspace(
      ["Market risk", "Delivery risk", "Budget risk"],
      "risk review",
    );
    let { workspace, session } = built;
    const target = workspace.objects.find((o) => o.sourceBlockId)!;
    const selected = updateSelection(session, workspace, [target.id]);
    const result = prepareAskBoard(
      selected.session,
      selected.workspace,
      "What risks am I missing?",
    );
    expect(result.session.pendingBoardReview?.status).toBe("prepared");
    expect(result.session.pendingBoardReview?.objectIds).toEqual([target.id]);
    expect(result.avoidedFullRegeneration).toBe(true);
  });

  it("locked objects are not regenerated", () => {
    const built = buildWorkspace(
      ["Kickoff", "Beta", "Launch"],
      "timeline",
    );
    let { workspace, session } = built;
    const target = workspace.objects.find((o) => o.sourceBlockId)!;
    const selected = updateSelection(session, workspace, [target.id]);
    const locked = applyCoCreationAction(selected.session, selected.workspace, "lock");
    const before = getPrimaryDeliverable(locked.generationBundle)!;
    const regen = applyCoCreationAction(locked.session, locked.workspace, "expand");
    const after = getPrimaryDeliverable(regen.generationBundle)!;
    expect(
      after.blocks.find((b) => b.id === target.sourceBlockId)?.content,
    ).toBe(before.blocks.find((b) => b.id === target.sourceBlockId)?.content);
  });

  it("merge suggestions never silently discard user work", () => {
    const built = buildWorkspace(
      ["Offers", "Audiences", "Projects"],
      "relationship map",
    );
    let { workspace, session } = built;
    const target = workspace.objects.find((o) => o.sourceBlockId)!;
    const selected = updateSelection(session, workspace, [target.id]);
    const edited = applyCoCreationAction(
      selected.session,
      selected.workspace,
      "edit_body",
      { content: "User authoritative relationship note." },
    );
    const merges = mergeSuggestionsForProtected(edited.session, edited.workspace, {
      [target.id]: "Generated replacement",
    });
    const keep = applyMergeDecision(
      merges.session,
      merges.workspace,
      merges.session.pendingMergeSuggestions[0]!.id,
      "protected",
    );
    const content = getPrimaryDeliverable(keep.generationBundle)!
      .blocks.find((b) => b.id === target.sourceBlockId)?.content;
    expect(content).toContain("User authoritative");
  });

  it("inspector projects progressive co-creation actions", () => {
    const built = buildWorkspace(
      ["Price A", "Price B", "Criteria"],
      "decision matrix",
    );
    let { workspace, session } = built;
    const target = workspace.objects.find((o) => o.sourceBlockId)!;
    const selected = updateSelection(session, workspace, [target.id]);
    const inspector = projectCoCreationInspector(selected.session, selected.workspace);
    expect(inspector?.suggestedActions.some((a) => a.id === "expand")).toBe(true);
    expect(inspector?.progressiveSections).toContain("basics");
  });

  it("autosave and recovery restore editing session", () => {
    const built = buildWorkspace(
      ["Welcome", "Setup", "First win"],
      "onboarding checklist",
    );
    const { workspace, session } = built;
    const saved = autosaveEditingSession(session, workspace);
    expect(saved.autosaveAt).toBeTruthy();
    expect(loadEditingSession()?.id).toBe(session.id);
    const recovered = recoverEditingSession({
      workspace,
      generationBundle: session.generationBundle,
    });
    expect(recovered.session.id).toBe(session.id);
  });

  it("writeback boundary requires approval for estate systems", () => {
    expect(writebackRequiresApproval("projects")).toBe(true);
    expect(writebackRequiresApproval("strategy")).toBe(true);
    expect(writebackRequiresApproval("workspace_local")).toBe(false);
  });

  it("audit shows scoped edit avoided full regeneration", () => {
    const built = buildWorkspace(
      ["Draft", "Review", "Publish"],
      "newsletter process",
    );
    let { workspace, session } = built;
    const target = workspace.objects.find((o) => o.sourceBlockId)!;
    const selected = updateSelection(session, workspace, [target.id]);
    const result = expandSelectedObjects(selected.session, selected.workspace);
    const audit = projectEditingAudit(result);
    expect(audit.scopedEdit).toBe(true);
    expect(audit.avoidedFullRegeneration).toBe(true);
  });

  it("annotation stays separate from knowledge body", () => {
    const built = buildWorkspace(
      ["Opening", "Practice", "Closing"],
      "workshop outline",
    );
    let { workspace, session } = built;
    const target = workspace.objects.find((o) => o.sourceBlockId)!;
    const selected = updateSelection(session, workspace, [target.id]);
    const before = getPrimaryDeliverable(selected.session.generationBundle)!;
    const noted = applyCoCreationAction(selected.session, selected.workspace, "annotate", {
      annotationText: "Remind me to verify vendors",
      annotationType: "reminder",
    });
    const after = getPrimaryDeliverable(noted.generationBundle)!;
    expect(JSON.stringify(after.blocks)).toBe(JSON.stringify(before.blocks));
    expect(noted.session.annotations[0]?.text).toMatch(/vendors/i);
  });
});
