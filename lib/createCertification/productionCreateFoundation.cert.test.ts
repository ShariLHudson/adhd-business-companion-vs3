/**
 * @vitest-environment jsdom
 *
 * Production certification — universal Create foundation
 * Event Plan = reference Work Type implementation.
 *
 * Pass gate for:
 *   feat(create): certify universal Create foundation with Event reference implementation
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  archiveActiveWorkspace,
  clearActiveWorkspaceRegistryForTests,
  hydrateActiveWorkspaceRegistryFromRuntimeRecords,
  listActiveWorkspaces,
  listRecoverableWorkspaces,
  moveActiveWorkspaceToTrash,
  peekRegistryWorkspaceEntry,
  permanentlyDeleteActiveWorkspace,
  registerCreationDestinationWorkspace,
  renameActiveWorkspaceTitle,
  restoreActiveWorkspace,
  upsertActiveWorkspace,
} from "@/lib/activeWorkspaceRegistry";
import { resolveCreateWorkCommands } from "@/lib/createCommands";
import { duplicateCreationWorkspace } from "@/lib/createCommands/duplicateCreationWorkspace";
import { EMPTY_CREATE_WORKFLOW } from "@/lib/createWorkflow";
import {
  markSectionCompleteForNow,
  reopenSectionForEditing,
  updateWorkspaceV2SectionContent,
} from "@/lib/createWorkspaceV2";
import {
  clearFocusRecoveryBuffer,
  labelForCreationSaveState,
  resolveCreationSaveState,
  writeFocusRecoveryBuffer,
  readFocusRecoveryBuffer,
} from "@/lib/creationDurable";
import { resolveFocusForCreationDestination } from "@/lib/currentFocus/resolveCanonicalFocus";
import {
  clearRuntimeCreationRecordsForTests,
  getRuntimeCreationRecord,
} from "@/lib/currentFocus/creationRecord";
import { applyEventWorkspaceToCreateWorkflow } from "@/lib/eventCreationWorkspace/applyWorkspaceToCreateWorkflow";
import { processEventsIntelligenceTurn } from "@/lib/eventsIntelligence";
import {
  EVENT_080_WORKSHOP_MAP_IDS,
  ensureEventSectionsComplete,
} from "@/lib/eventsIntelligence/eventSections";
import {
  clearActiveEventRecord,
  getEventRecord,
  upsertEventRecord,
} from "@/lib/eventsIntelligence/eventRecordStore";
import { resolveFacilitatedSectionStatus } from "@/lib/facilitatedCreation";
import {
  EVENT_PLAN_MAP_SECTIONS,
  openWorkshopMapSection,
} from "@/lib/workTypeSchema";
import {
  PRODUCTION_CREATE_FOUNDATION_CHECKS,
  productionCertCheckCount,
} from "./productionCreateFoundationCert";

function createEventWorkspace(
  userText: string,
  opts?: { forceStart?: boolean },
) {
  if (opts?.forceStart) clearActiveEventRecord();
  const start = processEventsIntelligenceTurn({
    userText,
    forceStart: opts?.forceStart,
  });
  expect(start.record).toBeTruthy();
  const record = start.record!;
  const workflow = applyEventWorkspaceToCreateWorkflow(
    {
      ...EMPTY_CREATE_WORKFLOW,
      sessionId: record.id,
      originalRequest: userText,
      workingIntent: `Create ${record.eventTypeLabel || "Event"}`,
      selectedTypeLabel: record.eventTypeLabel || "Event Plan",
    },
    record,
  );
  registerCreationDestinationWorkspace(workflow);
  return { record, workflow, workId: record.id };
}

describe("Production Create foundation certification (Event reference)", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearActiveWorkspaceRegistryForTests();
    clearRuntimeCreationRecordsForTests();
  });

  afterEach(() => {
    clearActiveWorkspaceRegistryForTests();
    clearRuntimeCreationRecordsForTests();
  });

  it("cert matrix is complete (≥ 35 production checks)", () => {
    expect(productionCertCheckCount()).toBeGreaterThanOrEqual(35);
    expect(PRODUCTION_CREATE_FOUNDATION_CHECKS.map((c) => c.id).length).toBe(
      new Set(PRODUCTION_CREATE_FOUNDATION_CHECKS.map((c) => c.id)).size,
    );
  });

  describe("Event lifecycle", () => {
    it("create Event → Work ID + full shared map", () => {
      const { workId, workflow } = createEventWorkspace(
        "I need help creating a leadership retreat weekend",
      );
      expect(workId).toMatch(/\S/);
      expect(workflow.templateSections?.length).toBe(
        EVENT_PLAN_MAP_SECTIONS.length,
      );
      expect(workflow.showAllWorkspaceSections).toBe(true);
      expect(listActiveWorkspaces().some((e) => e.workspaceId === workId)).toBe(
        true,
      );
    });

    it("refresh / reopen restores same Work ID", () => {
      const { workId, workflow } = createEventWorkspace(
        "Create a spring workshop event",
      );
      const filled = updateWorkspaceV2SectionContent(
        workflow,
        "purpose",
        "Deepen trust",
      );
      registerCreationDestinationWorkspace(filled);
      upsertEventRecord({
        ...getEventRecord(workId)!,
        sections: ensureEventSectionsComplete(
          getEventRecord(workId)!.sections.map((s) =>
            s.id === "purpose"
              ? { ...s, content: "Deepen trust", status: "drafting" }
              : s,
          ),
        ),
      });

      // Simulate refresh — clear registry heal from stores
      clearActiveWorkspaceRegistryForTests();
      hydrateActiveWorkspaceRegistryFromRuntimeRecords();
      const entry = listActiveWorkspaces().find((e) => e.workspaceId === workId);
      expect(entry?.workspaceId).toBe(workId);
      expect(getEventRecord(workId)?.sections.find((s) => s.id === "purpose")?.content).toBe(
        "Deepen trust",
      );
    });

    it("duplicate → new Work ID; rename preserves Work ID", () => {
      const { workId, workflow } = createEventWorkspace(
        "Create a community meetup event",
      );
      const copy = duplicateCreationWorkspace(workflow);
      expect(copy.sessionId).not.toBe(workId);
      expect(copy.sessionId).toMatch(/^work-/);
      expect(copy.sectionContent).toEqual(workflow.sectionContent);

      renameActiveWorkspaceTitle(workId, "Renamed Meetup");
      expect(peekRegistryWorkspaceEntry(workId)?.workspaceId).toBe(workId);
      expect(peekRegistryWorkspaceEntry(workId)?.title).toMatch(/Renamed Meetup/);
    });

    it("archive → restore → reopen same Work ID; permanent delete blocks restore", () => {
      const { workId } = createEventWorkspace("Create a fundraiser event");
      archiveActiveWorkspace(workId);
      expect(listActiveWorkspaces().find((e) => e.workspaceId === workId)).toBeFalsy();
      expect(listRecoverableWorkspaces().some((e) => e.workspaceId === workId)).toBe(
        true,
      );

      const restored = restoreActiveWorkspace(workId);
      expect(restored?.workspaceId).toBe(workId);
      expect(listActiveWorkspaces().some((e) => e.workspaceId === workId)).toBe(
        true,
      );

      // reopen after restore
      let wf = applyEventWorkspaceToCreateWorkflow(
        {
          ...EMPTY_CREATE_WORKFLOW,
          sessionId: workId,
          selectedTypeLabel: "Fundraiser",
        },
        getEventRecord(workId)!,
      );
      wf = openWorkshopMapSection(wf, "purpose");
      expect(resolveFocusForCreationDestination(wf).creationId).toBe(workId);

      permanentlyDeleteActiveWorkspace(workId);
      expect(restoreActiveWorkspace(workId)).toBeNull();
    });

    it("trash is recoverable with same Work ID", () => {
      const { workId } = createEventWorkspace("Create a training day event");
      moveActiveWorkspaceToTrash(workId);
      expect(peekRegistryWorkspaceEntry(workId)?.status).toBe("trashed");
      const restored = restoreActiveWorkspace(workId);
      expect(restored?.workspaceId).toBe(workId);
      expect(restored?.status).toBe("active");
    });
  });

  describe("Sections — every Event map section", () => {
    it("every section opens, saves, completes, reopens with version snapshot", () => {
      const { workflow: base } = createEventWorkspace(
        "Help me plan a multi-day conference event",
      );
      expect(EVENT_080_WORKSHOP_MAP_IDS.length).toBe(
        EVENT_PLAN_MAP_SECTIONS.length,
      );

      for (const section of EVENT_PLAN_MAP_SECTIONS) {
        let wf = openWorkshopMapSection(base, section.id);
        const focus = resolveFocusForCreationDestination(wf);
        expect(focus.sectionId, `open ${section.id}`).toBe(section.id);
        expect(focus.focusId).toBe(`section:${section.id}`);

        const text = `Cert content for ${section.title}`;
        wf = updateWorkspaceV2SectionContent(wf, section.id, text);
        expect(wf.sectionContent?.[section.id]).toBe(text);

        wf = markSectionCompleteForNow(wf, section.id);
        expect(wf.completedSectionIds).toContain(section.id);
        expect(wf.completedSectionVersions?.[section.id]?.content).toBe(text);
        expect(
          resolveFacilitatedSectionStatus(
            {
              id: section.id,
              content: text,
              skipped: false,
            },
            wf,
          ),
        ).toBe("complete_for_now");

        // Still openable — not locked
        wf = openWorkshopMapSection(wf, section.id);
        expect(resolveFocusForCreationDestination(wf).sectionId).toBe(section.id);

        wf = reopenSectionForEditing(wf, section.id);
        expect(wf.completedSectionIds).not.toContain(section.id);
        expect(wf.sectionContent?.[section.id]).toBe(text);
        expect(wf.completedSectionVersions?.[section.id]?.content).toBe(text);
      }
    });

    it("autosave recovery buffer + refresh preserve section content", () => {
      const { workId, workflow } = createEventWorkspace(
        "Create a webinar event for coaches",
      );
      const focusId = "section:audience";
      writeFocusRecoveryBuffer({
        creationId: workId,
        focusId,
        text: "Coaches in year one",
      });
      expect(readFocusRecoveryBuffer(workId, focusId)).toBe("Coaches in year one");

      const next = updateWorkspaceV2SectionContent(
        workflow,
        "audience",
        "Coaches in year one",
      );
      upsertEventRecord({
        ...getEventRecord(workId)!,
        sections: ensureEventSectionsComplete(
          getEventRecord(workId)!.sections.map((s) =>
            s.id === "audience"
              ? { ...s, content: "Coaches in year one", status: "drafting" }
              : s,
          ),
        ),
      });
      expect(
        getEventRecord(workId)?.sections.find((s) => s.id === "audience")
          ?.content,
      ).toBe("Coaches in year one");
      expect(next.sectionContent?.audience).toBe("Coaches in year one");

      clearFocusRecoveryBuffer(workId, focusId);
      expect(readFocusRecoveryBuffer(workId, focusId)).toBeNull();
    });
  });

  describe("Continue — multiple Events", () => {
    it("newest first; archived + trashed recoverable; hydrate does not resurrect trash", () => {
      // Two distinct Event Work IDs (forceStart = brand-new Work ID)
      const a = createEventWorkspace(
        "I need help creating a leadership retreat weekend",
        { forceStart: true },
      );
      const b = createEventWorkspace(
        "Help me plan a workshop event for coaches",
        { forceStart: true },
      );
      expect(a.workId).not.toBe(b.workId);

      // Force ordering: A older, B newer
      const older = "2020-01-01T00:00:00.000Z";
      const newer = "2026-07-20T00:00:00.000Z";
      const seedA = peekRegistryWorkspaceEntry(a.workId)!;
      const seedB = peekRegistryWorkspaceEntry(b.workId)!;
      upsertActiveWorkspace({ ...seedA, lastActivityAt: older, status: "active" });
      upsertActiveWorkspace({ ...seedB, lastActivityAt: newer, status: "active" });

      const active = listActiveWorkspaces();
      expect(active.length).toBeGreaterThanOrEqual(2);
      const ids = active.map((e) => e.workspaceId);
      expect(ids).toContain(a.workId);
      expect(ids).toContain(b.workId);
      expect(ids.indexOf(b.workId)).toBeLessThan(ids.indexOf(a.workId));

      archiveActiveWorkspace(a.workId);
      moveActiveWorkspaceToTrash(b.workId);
      const recoverable = listRecoverableWorkspaces();
      expect(recoverable.find((e) => e.workspaceId === a.workId)?.status).toBe(
        "archived",
      );
      expect(recoverable.find((e) => e.workspaceId === b.workId)?.status).toBe(
        "trashed",
      );

      hydrateActiveWorkspaceRegistryFromRuntimeRecords();
      expect(
        listActiveWorkspaces().find((e) => e.workspaceId === b.workId),
      ).toBeFalsy();

      const restoredB = restoreActiveWorkspace(b.workId);
      expect(restoredB?.workspaceId).toBe(b.workId);
    });
  });

  describe("Recovery + save honesty", () => {
    it("local / offline / failed never claim Saved securely", () => {
      for (const state of ["local_only", "dirty", "failed", "saving"] as const) {
        expect(labelForCreationSaveState(state).startsWith("Saved")).toBe(
          false,
        );
      }
      expect(labelForCreationSaveState("saved")).toBe("Saved securely");

      expect(
        resolveCreationSaveState({
          dirty: true,
          hasLocalRecovery: true,
          offline: true,
          lastDurableOk: false,
        }),
      ).toBe("local_only");

      expect(
        resolveCreationSaveState({
          lastDurableOk: true,
          dirty: false,
          submitting: false,
        }),
      ).toBe("saved");

      expect(
        resolveCreationSaveState({
          failureMessage: "That didn’t finish saving securely.",
          lastDurableOk: false,
        }),
      ).toBe("failed");
      expect(
        resolveCreationSaveState({
          submitting: true,
          lastDurableOk: null,
        }),
      ).toBe("saving");
    });

    it("crash-tab style recovery: buffer survives localStorage-only reload", () => {
      const { workId } = createEventWorkspace("Create a panel event");
      writeFocusRecoveryBuffer({
        creationId: workId,
        focusId: "section:speakers",
        text: "Three speakers drafted",
      });
      // Simulate new JS context reading same localStorage
      const raw = localStorage.getItem("spark.creationFocusRecovery.v1");
      expect(raw).toBeTruthy();
      expect(readFocusRecoveryBuffer(workId, "section:speakers")).toBe(
        "Three speakers drafted",
      );
    });
  });

  describe("Routing + export + a11y contracts", () => {
    it("map → focus → Continue Work ID routing", () => {
      const { workId, workflow } = createEventWorkspace(
        "Create a summit event for founders",
      );
      const opened = openWorkshopMapSection(workflow, "run_of_show");
      const focus = resolveFocusForCreationDestination(opened);
      expect(focus.creationId).toBe(workId);
      expect(focus.sectionId).toBe("run_of_show");

      const entry = listActiveWorkspaces().find((e) => e.workspaceId === workId);
      expect(entry?.workspaceId).toBe(workId);
      expect(entry?.resumeTarget).toBe("estate-create");
      expect(getRuntimeCreationRecord(workId)?.id).toBe(workId);
    });

    it("export commands gated by draft; toolbar binds Work ID in source", () => {
      const { workId, workflow } = createEventWorkspace(
        "Create a networking event",
      );
      const withoutDraft = resolveCreateWorkCommands({
        workflow: { ...workflow, sessionId: workId, draftContent: null },
        hasDraftText: false,
      });
      expect(withoutDraft.find((c) => c.id === "print")?.enabled).toBe(false);
      expect(withoutDraft.find((c) => c.id === "export")?.enabled).toBe(false);
      expect(withoutDraft.find((c) => c.id === "share")?.enabled).toBe(false);

      const withDraft = resolveCreateWorkCommands({
        workflow: {
          ...workflow,
          sessionId: workId,
          draftContent: "Summit outline",
        },
        hasDraftText: true,
      });
      expect(withDraft.find((c) => c.id === "print")?.enabled).toBe(true);
      expect(withDraft.find((c) => c.id === "share")?.enabled).toBe(true);

      const toolbarSrc = readFileSync(
        join(
          process.cwd(),
          "components/companion/CreateWorkCommandToolbar.tsx",
        ),
        "utf8",
      );
      expect(toolbarSrc).toContain("data-workspace-id");
      expect(toolbarSrc).toContain("data-testid={`create-cmd-${cmd.id}`}");
      expect(toolbarSrc).toContain("ExportActions");
      expect(
        withDraft.map((c) => c.id).filter((id) =>
          ["print", "export", "share"].includes(id),
        ),
      ).toHaveLength(3);
    });

    it("accessibility contracts: map rows, focus field, commands", () => {
      const mapSrc = readFileSync(
        join(process.cwd(), "components/companion/CreateWorkspaceV2Panel.tsx"),
        "utf8",
      );
      expect(mapSrc).toContain("aria-label={`${section.label}");
      expect(mapSrc).toContain("workshop-map-row-");
      expect(mapSrc).toContain('role="list"');

      const focusSrc = readFileSync(
        join(process.cwd(), "components/companion/CurrentFocusInteraction.tsx"),
        "utf8",
      );
      expect(focusSrc).toContain('aria-label="Current Focus response"');
      expect(focusSrc).toContain("CreationSaveStateBadge");
      expect(focusSrc).toContain("current-focus-save");

      const badgeSrc = readFileSync(
        join(process.cwd(), "components/companion/CreationSaveStateBadge.tsx"),
        "utf8",
      );
      expect(badgeSrc).toContain("creation-save-state");
      expect(badgeSrc).toContain("aria-live");

      const estateSrc = readFileSync(
        join(process.cwd(), "components/companion/CreateEstateWorkingPanel.tsx"),
        "utf8",
      );
      expect(estateSrc).toContain("openWorkshopMapSection");
      expect(estateSrc).toContain("section-complete-for-now");
      expect(estateSrc).toContain("section-reopen");
    });
  });
});
