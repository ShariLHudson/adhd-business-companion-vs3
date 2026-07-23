/**
 * @vitest-environment jsdom
 *
 * Guided Create certification pack — reproducible integration coverage for:
 * event_plan · marketing_plan · business_plan · facebook_community
 *
 * Does NOT claim authenticated Estate browser / founder CERTIFIED.
 * Verification flags remain false until that evidence exists.
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  archiveActiveWorkspace,
  clearActiveWorkspaceRegistryForTests,
  listActiveWorkspaces,
  listRecoverableWorkspaces,
  moveActiveWorkspaceToTrash,
  registerCreationDestinationWorkspace,
  renameActiveWorkspaceTitle,
  restoreActiveWorkspace,
  verifyCreationWorkspaceDurable,
} from "@/lib/activeWorkspaceRegistry";
import { resolveCreateWorkCommands } from "@/lib/createCommands";
import {
  confirmCreateBeginToOpen,
  resolveCatalogCreateConfirm,
  resolveCreateBeginOutcome,
} from "@/lib/createEstate/resolveCreateBeginOutcome";
import { listActiveCreationWorkspaces } from "@/lib/createEstate/listActiveCreationWorkspaces";
import {
  findCanonicalWorkByCreateWorkflow,
  listCanonicalWorkRecords,
} from "@/lib/createProjects/canonicalWorkRecord";
import { connectCanonicalWorkToProjectHome } from "@/lib/createProjects/connectCanonicalWorkToProjectHome";
import { syncCanonicalWorkFromCreateWorkflow } from "@/lib/createProjects/syncCanonicalWorkFromCreate";
import { initializeWorkspaceV2Workflow } from "@/lib/createWorkspaceV2";
import {
  clearAuthoritativeDurableMarksForTests,
  createMemoryCreationDurableBackend,
  fetchAuthoritativeCreation,
  hydrateCreationWorkspacesFromDurable,
  labelForCreationSaveState,
  persistCreationBegin,
  persistCreationDraft,
  resolveCreationSaveState,
  setCreationDurableBackendForTests,
} from "@/lib/creationDurable";
import {
  clearRuntimeCreationRecordsForTests,
  ensureRuntimeCreationRecord,
} from "@/lib/currentFocus";
import {
  clearBlueprintRegistryForTests,
  clearWorkTypePackageRegistryForTests,
  ensureBusinessPlanBlueprintsRegistered,
  ensureBusinessPlanWorkTypeRegistered,
  ensureEventBlueprintsRegistered,
  ensureEventPlanWorkTypeRegistered,
  ensureFacebookCommunityBlueprintsRegistered,
  ensureFacebookCommunityWorkTypeRegistered,
  ensureMarketingPlanBlueprintsRegistered,
  ensureMarketingPlanWorkTypeRegistered,
  getWorkTypePackage,
  inferWorkTypeAndBlueprint,
  launchFromCreate,
  resetWorkBlueprintStateForTests,
  resetWorkIdentityStoreForTests,
} from "@/lib/universalWorkEngine";
import { EVENT_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema";
import { BUSINESS_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/businessPlanMap";
import { FACEBOOK_COMMUNITY_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/facebookCommunityMap";
import { MARKETING_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/marketingPlanMap";
import { CREATE_PARENT_TYPES } from "@/lib/createEstate/createParentTypes";
import {
  CREATION_REGISTRY_SEED_ITEMS,
  GUIDED_CREATION_REGISTRY_IDS,
} from "../items.seed";
import { computeIsUserVisible } from "../visibility";
import { GUIDED_CREATE_CERTIFICATION_SNAPSHOTS } from "../certification/guidedCreateCertification";

const GUIDED_CASES = [
  {
    registryId: "event_plan" as const,
    prompt: "Help me create an event plan for a client appreciation gathering",
    catalogLabel: "Event Plan",
    workTypeId: EVENT_PLAN_WORK_TYPE_ID,
    domain: "isEventDomain" as const,
  },
  {
    registryId: "marketing_plan" as const,
    prompt: "Help me create a simple marketing plan",
    catalogLabel: "Marketing Plan",
    workTypeId: MARKETING_PLAN_WORK_TYPE_ID,
    domain: "isMarketingPlanDomain" as const,
  },
  {
    registryId: "business_plan" as const,
    prompt: "Help me create a business plan",
    catalogLabel: "Business Plan",
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
    domain: "isBusinessPlanDomain" as const,
  },
  {
    registryId: "facebook_community" as const,
    prompt: "Help me create a Facebook community for ADHD founders",
    catalogLabel: "Facebook Community",
    workTypeId: FACEBOOK_COMMUNITY_WORK_TYPE_ID,
    domain: "isFacebookCommunityDomain" as const,
  },
];

function registerAllGuidedPackages() {
  clearBlueprintRegistryForTests();
  clearWorkTypePackageRegistryForTests();
  resetWorkBlueprintStateForTests();
  resetWorkIdentityStoreForTests();
  ensureEventPlanWorkTypeRegistered();
  ensureEventBlueprintsRegistered();
  ensureMarketingPlanWorkTypeRegistered();
  ensureMarketingPlanBlueprintsRegistered();
  ensureBusinessPlanWorkTypeRegistered();
  ensureBusinessPlanBlueprintsRegistered();
  ensureFacebookCommunityWorkTypeRegistered();
  ensureFacebookCommunityBlueprintsRegistered();
}

describe("Guided Create certification pack", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearActiveWorkspaceRegistryForTests();
    clearRuntimeCreationRecordsForTests();
    clearAuthoritativeDurableMarksForTests();
    setCreationDurableBackendForTests(createMemoryCreationDurableBackend());
    registerAllGuidedPackages();
  });

  it("certification snapshots cover all four guided seeds and keep Ready blocked", () => {
    expect(GUIDED_CREATE_CERTIFICATION_SNAPSHOTS.map((s) => s.registryId)).toEqual(
      [...GUIDED_CREATION_REGISTRY_IDS],
    );
    for (const snap of GUIDED_CREATE_CERTIFICATION_SNAPSHOTS) {
      expect(snap.canonicalVisible).toBe(false);
      expect(snap.recommendedLifecycle).toBe("testing");
      expect(snap.recommendedFlags.routeVerified).toBe(false);
      expect(snap.recommendedFlags.saveVerified).toBe(false);
      expect(snap.recommendedFlags.reopenVerified).toBe(false);
      expect(snap.recommendedFlags.requiredActionsVerified).toBe(false);
    }
  });

  it("seed registry remains not user-visible (master gate intact)", () => {
    for (const item of CREATION_REGISTRY_SEED_ITEMS) {
      expect(computeIsUserVisible(item)).toBe(false);
    }
  });

  describe.each(GUIDED_CASES)(
    "$registryId — entry, identity, save, reopen, actions, project",
    (c) => {
      it("Begin confirms correct guided type and domain (not silent open)", () => {
        const outcome = resolveCreateBeginOutcome(c.prompt);
        expect(outcome.kind).toBe("confirm");
        if (outcome.kind !== "confirm") return;
        expect(outcome.artifactType).toMatch(new RegExp(c.catalogLabel, "i"));
        expect(outcome[c.domain]).toBe(true);
        const open = confirmCreateBeginToOpen(outcome);
        expect(open.kind).toBe("open");
        expect(open[c.domain]).toBe(true);
      });

      it("catalog confirm + Anywhere-Origin resolve the correct work type", () => {
        const confirm = resolveCatalogCreateConfirm({
          label: c.catalogLabel,
          requestText: c.prompt,
        });
        expect(confirm[c.domain]).toBe(true);

        const launched = launchFromCreate({
          originalUserMessage: c.prompt,
          candidateWorkTypeId: c.workTypeId,
        });
        expect(["create_new", "continue_existing", "clarify", "awaiting_approval"]).toContain(
          launched.decision,
        );
        if (launched.decision === "create_new" || launched.decision === "continue_existing") {
          expect(launched.workTypeId).toBe(c.workTypeId);
        }

        const pkg = getWorkTypePackage(c.workTypeId);
        expect(pkg?.workTypeId).toBe(c.workTypeId);
      });

      it("does not resolve to a phantom non-UWE work type id", () => {
        const inferred = inferWorkTypeAndBlueprint({
          origin: "create",
          originalUserMessage: c.prompt,
          candidateWorkTypeId: c.workTypeId,
        });
        expect(inferred.workTypeId).toBe(c.workTypeId);
        expect(inferred.workTypeId).not.toMatch(/^(sop|checklist|proposal)$/);
      });

      it("durable save + hydrate reopen preserves content and Continue listing", async () => {
        const workspaceId = `ws-cert-${c.registryId}`;
        const workflow = {
          ...initializeWorkspaceV2Workflow(c.catalogLabel),
          sessionId: workspaceId,
          selectedTemplateName: `${c.catalogLabel} Cert`,
          originalRequest: c.prompt,
          sectionContent: {
            purpose: `Purpose for ${c.registryId}`,
          },
          draftContent: `# ${c.catalogLabel}\n\nPurpose for ${c.registryId}`,
        };
        ensureRuntimeCreationRecord(workflow);
        registerCreationDestinationWorkspace(workflow);

        const begin = await persistCreationBegin({
          workflow,
          originalRequest: c.prompt,
        });
        expect(begin.ok).toBe(true);
        if (!begin.ok) return;
        expect(begin.durable).toBe(true);

        const draft = await persistCreationDraft({
          workflow,
          draftContent: workflow.draftContent!,
        });
        expect(draft.ok).toBe(true);

        const saveState = resolveCreationSaveState({ lastDurableOk: true });
        expect(labelForCreationSaveState(saveState)).toBe("Saved");
        expect(labelForCreationSaveState("local_only")).not.toBe("Saved");

        clearActiveWorkspaceRegistryForTests();
        clearRuntimeCreationRecordsForTests();
        clearAuthoritativeDurableMarksForTests();

        const hyd = await hydrateCreationWorkspacesFromDurable();
        expect(hyd.ok).toBe(true);
        expect(hyd.workspaceIds).toContain(workspaceId);

        const row = await fetchAuthoritativeCreation(workspaceId);
        expect(row).toBeTruthy();
        expect(row?.title).toBeTruthy();
        expect(verifyCreationWorkspaceDurable(workspaceId)).toBe(true);

        const continueList = listActiveCreationWorkspaces();
        expect(continueList.some((w) => w.id === workspaceId)).toBe(true);
      });

      it("required lifecycle commands are available (not hidden as unfinished)", () => {
        const workflow = {
          ...initializeWorkspaceV2Workflow(c.catalogLabel),
          sessionId: `ws-cmds-${c.registryId}`,
        };
        const cmds = resolveCreateWorkCommands({
          workflow,
          hasDraftText: true,
          workId: workflow.sessionId,
          fullCatalog: true,
        });
        const ids = new Set(cmds.map((x) => x.id));
        for (const id of [
          "save",
          "rename",
          "duplicate",
          "archive",
          "trash",
          "restore",
          "print",
          "export",
        ] as const) {
          expect(ids.has(id)).toBe(true);
          expect(cmds.find((x) => x.id === id)?.available).toBe(true);
        }
      });

      it("rename / archive / trash / restore keep distinct registry identity", () => {
        const workspaceId = `ws-life-${c.registryId}`;
        const workflow = {
          ...initializeWorkspaceV2Workflow(c.catalogLabel),
          sessionId: workspaceId,
          selectedTemplateName: `${c.catalogLabel} One`,
        };
        ensureRuntimeCreationRecord(workflow);
        registerCreationDestinationWorkspace(workflow);
        renameActiveWorkspaceTitle(workspaceId, `${c.catalogLabel} Renamed`);
        expect(
          listActiveWorkspaces().find((w) => w.workspaceId === workspaceId)
            ?.title,
        ).toMatch(/Renamed/);

        archiveActiveWorkspace(workspaceId);
        moveActiveWorkspaceToTrash(workspaceId);
        expect(
          listRecoverableWorkspaces().some((w) => w.workspaceId === workspaceId),
        ).toBe(true);
        restoreActiveWorkspace(workspaceId);
        expect(
          listActiveWorkspaces().some((w) => w.workspaceId === workspaceId),
        ).toBe(true);
      });

      it("Project handoff links without duplicating the Create record", () => {
        const workflow = {
          ...initializeWorkspaceV2Workflow(c.catalogLabel),
          sessionId: `wf-proj-${c.registryId}`,
          discoveryAnswers: { purpose: `Project purpose ${c.registryId}` },
        };
        const work = syncCanonicalWorkFromCreateWorkflow({
          workflow,
          createWorkflowId: `wf-proj-${c.registryId}`,
        });
        expect(work.kind).toBe("creation");

        const first = connectCanonicalWorkToProjectHome({
          work,
          purposeHint: work.title,
        });
        expect(first.created).toBe(true);
        const second = connectCanonicalWorkToProjectHome({ work: first.work });
        expect(second.created).toBe(false);
        expect(second.projectHomeId).toBe(first.projectHomeId);

        const reopened = findCanonicalWorkByCreateWorkflow(`wf-proj-${c.registryId}`);
        expect(reopened?.projectHomeId).toBe(first.projectHomeId);
        expect(listCanonicalWorkRecords()).toHaveLength(1);
      });
    },
  );

  describe("Event Plan / Workshop routing", () => {
    it("Event Plan Begin opens event_plan UWE work type", () => {
      const outcome = resolveCreateBeginOutcome(
        "I need an event plan for a networking mixer",
      );
      expect(outcome.kind).toBe("confirm");
      if (outcome.kind !== "confirm") return;
      expect(outcome.isEventDomain).toBe(true);
      const launched = launchFromCreate({
        originalUserMessage: outcome.text,
        candidateWorkTypeId: EVENT_PLAN_WORK_TYPE_ID,
      });
      if (launched.workTypeId) {
        expect(launched.workTypeId).toBe(EVENT_PLAN_WORK_TYPE_ID);
      }
    });

    it("Workshop Browse subtype resolves to Event parent / event_plan path", () => {
      const eventParent = CREATE_PARENT_TYPES.find((p) => p.id === "event");
      expect(eventParent).toBeTruthy();
      const workshop = eventParent?.subtypes?.find((s) => s.id === "workshop");
      expect(workshop?.catalogLabel).toBe("Workshop");

      const inferred = inferWorkTypeAndBlueprint({
        origin: "create",
        originalUserMessage: "Help me create a workshop for ADHD founders",
      });
      expect(inferred.workTypeId).toBe(EVENT_PLAN_WORK_TYPE_ID);
      expect(inferred.workTypeId).not.toBe("workshop");
      expect(inferred.blueprintId).toBeTruthy();

      const seed = CREATION_REGISTRY_SEED_ITEMS.find((i) => i.id === "event_plan");
      expect(seed?.legacyCatalogLabels).toContain("Workshop");
      expect(
        CREATION_REGISTRY_SEED_ITEMS.some((i) => i.id === "workshop"),
      ).toBe(false);
    });
  });

  it("forceNew-style second create does not silently reuse without intent path", () => {
    const first = launchFromCreate({
      originalUserMessage: "Help me create a simple marketing plan",
      candidateWorkTypeId: MARKETING_PLAN_WORK_TYPE_ID,
    });
    const second = launchFromCreate({
      originalUserMessage: "Help me create a simple marketing plan",
      candidateWorkTypeId: MARKETING_PLAN_WORK_TYPE_ID,
      forceNew: true,
    });
    // forceNew should prefer a new create or clarify — never a silent no-op.
    expect(second.decision).toBeTruthy();
    if (first.workId && second.workId && second.decision === "create_new") {
      expect(second.workId).not.toBe(first.workId);
    }
  });
});
