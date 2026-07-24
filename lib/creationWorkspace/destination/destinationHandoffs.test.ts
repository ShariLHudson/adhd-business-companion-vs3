import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  editWorkspaceItem,
  prepareCreationWorkspaceHandoff,
  runRequestIntoCreationWorkspace,
} from "../index";
import {
  __resetDestinationHandoffStorageForTests,
  __resetHandoffRegistryForTests,
  approveCreationWorkspaceProjectHandoff,
  approveSelectedStrategyCandidates,
  buildCreateHandoff,
  buildEstateHandoff,
  buildProjectHandoff,
  buildStrategyHandoff,
  buildVisualHandoff,
  consumeCreationWorkspaceCreateHandoff,
  consumeCreationWorkspaceEstateHandoff,
  consumeCreationWorkspaceProjectHandoff,
  consumeCreationWorkspaceStrategyHandoff,
  consumeCreationWorkspaceVisualHandoff,
  detectCreateHandoffConflict,
  getHandoffRegistryEntry,
  hydrateCreateWorkflowFromHandoff,
  inferInitialVisualRepresentation,
  isHandoffReusable,
  peekCreateHandoff,
  resolveDestinationReturnActions,
  setEstateProposalApproval,
  applyApprovedEstateProposals,
  storeCreateHandoff,
  updateProjectProposalSelection,
  validateCreateHandoff,
  validateVisualSubstance,
  buildDestinationSyncPreview,
  applySyncPreviewDecision,
  markHandoffCompleted,
} from "./index";

vi.mock("@/lib/projectHomes/homeActions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/projectHomes/homeActions")>(
    "@/lib/projectHomes/homeActions",
  );
  return {
    ...actual,
    createPersistedProjectHomeWithResult: vi.fn((input) => ({
      persisted: true,
      home: {
        id: `proj_${input.name.slice(0, 12)}`,
        name: input.name,
        purpose: input.purpose,
        projectHomeId: input.projectHomeId,
        currentFocus: "Review approved work",
        nextSuggestedStep: "Open the first phase",
        status: "in-progress",
        archived: false,
        isSample: false,
        lastWorkedAt: new Date().toISOString(),
      },
      error: null,
    })),
  };
});

describe("Creation Workspace destination handoffs", () => {
  beforeEach(() => {
    __resetHandoffRegistryForTests();
    __resetDestinationHandoffStorageForTests();
  });

  function fiveDayWorkspace() {
    const result = runRequestIntoCreationWorkspace(
      "Create a five-day social media content plan.",
      { persist: false },
    );
    expect(result.workspace).toBeTruthy();
    return result.workspace!;
  }

  it("1–5: Create handoff hydrates native sections with order, edits, sources; no prompt regen", () => {
    let ws = fiveDayWorkspace();
    const day = ws.items.find((i) => i.type === "timeline_item")!;
    ws = editWorkspaceItem(ws, day.id, {
      body: "Edited Day body UNIQUE_MARKER with CTA and visual idea.",
    });
    const handoff = buildCreateHandoff(ws);
    expect(handoff.version).toBe("creation-workspace-create-handoff-v1");
    expect(handoff.sections.length).toBeGreaterThanOrEqual(5);
    expect(handoff.userEditedItemIds).toContain(day.id);

    const session = hydrateCreateWorkflowFromHandoff(handoff);
    const labels = (session.workflow.templateSections ?? []).map((s) => s.label);
    const orderedTitles = [...handoff.sections]
      .sort((a, b) => a.order - b.order)
      .map((s) => s.title);
    expect(labels.slice(0, orderedTitles.length)).toEqual(orderedTitles);

    const editedContent =
      session.workflow.sectionContent?.[day.id] ?? "";
    expect(editedContent).toContain("UNIQUE_MARKER");
    expect(editedContent).toContain("Preserved your edits");
    // Must not be regenerating from the original prompt alone
    expect(session.workflow.originalRequest).toBe(handoff.purpose);
    expect(editedContent).not.toBe(handoff.purpose);
  });

  it("6–8: stale and consumed handoffs rejected; active Create not overwritten silently", () => {
    const ws = fiveDayWorkspace();
    const handoff = buildCreateHandoff(ws);
    const stale = validateCreateHandoff({
      ...handoff,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    });
    expect(stale.ok).toBe(false);

    storeCreateHandoff(handoff);
    const conflict = detectCreateHandoffConflict({
      hasActiveWorkspaceSession: true,
      hasFilledSections: true,
    });
    expect(conflict.kind).toBe("active_unsaved");

    const blocked = consumeCreationWorkspaceCreateHandoff({
      handoff,
      hasFilledSections: true,
      hasActiveWorkspaceSession: true,
    });
    expect(blocked.ok).toBe(false);
    expect(blocked.stage).toBe("conflict");
    expect(peekCreateHandoff()?.id).toBe(handoff.id);

    const opened = consumeCreationWorkspaceCreateHandoff({
      handoff,
      hasFilledSections: true,
      hasActiveWorkspaceSession: true,
      conflictOverride: "open_as_new",
    });
    expect(opened.ok).toBe(true);
    if (opened.ok) {
      expect(opened.workflow.sectionContent).toBeTruthy();
      expect(Object.keys(opened.workflow.sectionContent!).length).toBeGreaterThan(
        0,
      );
    }
    expect(isHandoffReusable(handoff.id)).toBe(false);
    const reuse = consumeCreationWorkspaceCreateHandoff({ handoff });
    expect(reuse.ok).toBe(false);
  });

  it("9–13: Visual Thinking consumes key, opens substantive objects, five days, rejects title-only", () => {
    const ws = fiveDayWorkspace();
    const visual = buildVisualHandoff(ws);
    expect(visual.version).toBe("creation-workspace-visual-handoff-v1");
    const substance = validateVisualSubstance(visual);
    expect(substance.valid).toBe(true);
    expect(substance.fiveDayGroupsOk).toBe(true);
    expect(inferInitialVisualRepresentation(visual)).toBe(
      "campaign_sequence_timeline",
    );

    const titleOnly = validateVisualSubstance({
      ...visual,
      sections: visual.sections.map((s) => ({ ...s, body: "short" })),
      groups: [],
      timelines: [],
    });
    expect(titleOnly.valid).toBe(false);

    const consumed = consumeCreationWorkspaceVisualHandoff({ handoff: visual });
    if (!consumed.ok) {
      throw new Error(
        `visual consume failed: ${consumed.stage} — ${consumed.reason}`,
      );
    }
    expect(consumed.thinkingWorkspace.objects.length).toBeGreaterThan(0);
    expect(consumed.handoff.researchCollectionIds).toEqual(
      visual.researchCollectionIds,
    );
    expect(consumed.initialRepresentation).toBe("campaign_sequence_timeline");
  });

  it("14–16: Projects opens proposal review; creates only approved; preserves task edits", () => {
    const ws = fiveDayWorkspace();
    const project = buildProjectHandoff(ws);
    const opened = consumeCreationWorkspaceProjectHandoff({ handoff: project });
    expect(opened.ok).toBe(true);
    if (!opened.ok) return;

    const task = opened.handoff.phases[0]?.tasks[0];
    expect(task).toBeTruthy();
    let next = updateProjectProposalSelection(opened.handoff, {
      taskId: task!.id,
      title: "Edited task UNIQUE",
    });
    const removeTarget = next.phases[0]?.tasks[1];
    if (removeTarget) {
      next = updateProjectProposalSelection(next, {
        taskId: removeTarget.id,
        selected: false,
      });
    }

    const approved = approveCreationWorkspaceProjectHandoff({
      handoff: next,
      mode: "approve_selected",
    });
    expect(approved.ok).toBe(true);
    if (approved.ok) {
      expect(approved.createdTaskTitles).toContain("Edited task UNIQUE");
      if (removeTarget) {
        expect(approved.createdTaskTitles).not.toContain(removeTarget.title);
      }
      expect(approved.projectId).toBeTruthy();
      expect(getHandoffRegistryEntry(project.id)?.destinationEntityId).toBe(
        approved.projectId,
      );
    }
  });

  it("17–18: Strategy opens candidates and does not auto-approve", () => {
    const ws = fiveDayWorkspace();
    const strategy = buildStrategyHandoff(ws);
    expect(strategy.autoApproved).toBe(false);
    expect(strategy.requiresReview).toBe(true);
    expect(
      [
        ...strategy.options,
        ...strategy.evidence,
        ...strategy.possibleInitiatives,
      ].every((c) => !c.approved),
    ).toBe(true);

    const opened = consumeCreationWorkspaceStrategyHandoff({ handoff: strategy });
    expect(opened.ok).toBe(true);
    if (opened.ok) expect(opened.autoApprovedCount).toBe(0);

    const approved = approveSelectedStrategyCandidates(strategy);
    expect(approved.ok).toBe(true);
    if (approved.ok) {
      expect(approved.approvedIds.length).toBeGreaterThan(0);
      expect(
        approved.handoff.options
          .filter((o) => o.selected)
          .every((o) => o.approved),
      ).toBe(true);
    }
  });

  it("19: Business Estate proposals require field-level approval", () => {
    const ws = fiveDayWorkspace();
    const estate = buildEstateHandoff(ws);
    expect(estate.requiresFieldApproval).toBe(true);
    expect(estate.silentWritebackAllowed).toBe(false);
    const opened = consumeCreationWorkspaceEstateHandoff({ handoff: estate });
    expect(opened.ok).toBe(true);
    if (!opened.ok) return;

    const bare = applyApprovedEstateProposals(opened.handoff);
    expect(bare.ok).toBe(false);

    const withApproval = setEstateProposalApproval(
      opened.handoff,
      opened.handoff.proposals[0]!.id,
      true,
    );
    const applied = applyApprovedEstateProposals(withApproval);
    expect(applied.ok).toBe(true);
    if (applied.ok) {
      expect(applied.applied.length).toBe(1);
      expect(applied.skipped.length).toBeGreaterThan(0);
    }
  });

  it("20–24: registry, return paths, sync approval, failed handoffs retryable", () => {
    const ws = fiveDayWorkspace();
    const create = buildCreateHandoff(ws);
    expect(getHandoffRegistryEntry(create.id)?.status).toBe("prepared");

    const returns = resolveDestinationReturnActions({
      returnContext: create.returnContext,
      researchCollectionIds: create.researchCollectionIds,
      includeOriginalRequest: true,
    });
    expect(returns.some((r) => r.id === "return_to_creation_workspace")).toBe(
      true,
    );

    markHandoffCompleted(create.id, "create_asset_1");
    const edited = ws.items[0]!;
    const preview = buildDestinationSyncPreview({
      workspace: ws,
      editedItemId: edited.id,
    });
    expect(preview).toBeTruthy();
    expect(preview!.actions).toContain("update_destination");
    const sync = applySyncPreviewDecision({
      handoffId: create.id,
      action: "keep_destination",
    });
    expect(sync.ok).toBe(true);

    const visual = buildVisualHandoff(ws);
    const bad = consumeCreationWorkspaceVisualHandoff({
      handoff: {
        ...visual,
        sections: visual.sections.map((s) => ({ ...s, body: "x" })),
        groups: [],
        timelines: [],
        sequences: [],
      },
    });
    expect(bad.ok).toBe(false);
    expect(getHandoffRegistryEntry(visual.id)?.status).toBe("failed");
    expect(isHandoffReusable(visual.id)).toBe(true);
  });

  it("25: simple Create bypass still works; prepare stores create handoff", () => {
    const bypass = runRequestIntoCreationWorkspace(
      "Write a short thank-you email.",
      { persist: false },
    );
    expect(bypass.openDecision.open).toBe(false);
    expect(bypass.openDecision.bypassTo).toBe("create");

    const ws = fiveDayWorkspace();
    const option = {
      id: "create",
      label: "Continue Editing in Create",
      description: "",
      destination: "create" as const,
      reason: "test",
      confidence: 0.9,
      primary: true,
      requiresClarification: false,
    };
    const { handoff } = prepareCreationWorkspaceHandoff({ workspace: ws, option });
    expect(handoff.payload).toContain("creation-workspace-create-handoff-v1");
    expect(peekCreateHandoff()?.workspaceId).toBe(ws.id);
  });

  it("26: unknown mentoring program multi-destination payloads are substantive", () => {
    const result = runRequestIntoCreationWorkspace(
      "Create a mentoring program for high-school robotics volunteers.",
      { persist: false },
    );
    const ws = result.workspace!;
    const create = buildCreateHandoff(ws);
    const visual = buildVisualHandoff(ws);
    const project = buildProjectHandoff(ws);
    expect(create.sections.length).toBeGreaterThanOrEqual(3);
    expect(create.sections.every((s) => s.body.trim().length > 0)).toBe(true);
    expect(visual.sections.length).toBeGreaterThanOrEqual(3);
    expect(project.phases.length).toBeGreaterThan(0);
    expect(project.phases.some((p) => p.tasks.length > 0)).toBe(true);
  });
});
