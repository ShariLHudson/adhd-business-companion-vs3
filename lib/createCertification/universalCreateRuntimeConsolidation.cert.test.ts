/**
 * 093 — Universal Create runtime consolidation certification.
 * Proves a second Work Type ships through schema registration without
 * modifying shared map / focus / save / continue / command runtimes.
 */

/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearActiveWorkspaceRegistryForTests,
  listActiveContinueProjection,
  registerCreationDestinationWorkspace,
  upsertActiveWorkspace,
} from "@/lib/activeWorkspaceRegistry";
import { dispatchCreateWorkCommand } from "@/lib/createCommands";
import { runCreateAssistance } from "@/lib/createContextualAssistance";
import {
  applySectionLifecycleTransition,
  resolveCreateSectionLifecycleStatus,
} from "@/lib/createSectionLifecycle";
import {
  classifyCreatePersistencePath,
  isDurableSaveAcknowledged,
  resolveDurableSavePipeline,
} from "@/lib/creationDurable/savePipeline";
import { initializeWorkspaceV2Workflow } from "@/lib/createWorkspaceV2";
import { resolveCreateWorkRuntime } from "@/lib/createWorkRuntime";
import { openWorkshopMapSection } from "@/lib/workTypeSchema/openWorkshopMapSection";
import {
  CERT_PROBE_MAP_SECTIONS,
  CERT_PROBE_WORK_TYPE_ID,
  ensureCertProbeSchemaRegistered,
} from "@/lib/workTypeSchema/schemas/certProbe";
import { ensureEventPlanSchemaRegistered } from "@/lib/workTypeSchema/schemas/eventPlan";
import { getWorkTypeSchema } from "@/lib/workTypeSchema/registry";

describe("Universal Create runtime consolidation certification", () => {
  beforeEach(() => {
    clearActiveWorkspaceRegistryForTests();
    localStorage.clear();
    ensureEventPlanSchemaRegistered();
    ensureCertProbeSchemaRegistered();
  });

  it("1–3: schema-only Work Type gets Workshop Map + Current Focus open", () => {
    expect(getWorkTypeSchema(CERT_PROBE_WORK_TYPE_ID)).not.toBeNull();
    let wf = initializeWorkspaceV2Workflow("Cert Probe");
    expect((wf.templateSections ?? []).map((s) => s.id)).toEqual(
      CERT_PROBE_MAP_SECTIONS.map((s) => s.id),
    );
    wf = { ...wf, sessionId: "ws-cert-probe" };
    wf = openWorkshopMapSection(wf, "outcome");
    expect(wf.activeSectionId).toBe("outcome");
    const runtime = resolveCreateWorkRuntime({ workflow: wf });
    expect(runtime.workTypeId).toBe(CERT_PROBE_WORK_TYPE_ID);
    expect(runtime.activeSectionId).toBe("outcome");
  });

  it("4: shared section lifecycle", () => {
    let wf = {
      ...initializeWorkspaceV2Workflow("Cert Probe"),
      sessionId: "ws-life",
      sectionContent: { intent: "Prove extensibility" },
    };
    wf = applySectionLifecycleTransition(wf, "intent", {
      type: "complete_for_now",
    });
    expect(
      resolveCreateSectionLifecycleStatus(
        { id: "intent", content: "Prove extensibility", skipped: false },
        wf,
      ),
    ).toBe("complete_for_now");
  });

  it("5: durable save pipeline contract", () => {
    expect(
      isDurableSaveAcknowledged({ lastDurableOk: true, dirty: false }),
    ).toBe(true);
    expect(
      resolveDurableSavePipeline({ hasLocalRecovery: true, lastDurableOk: false })
        .pipeline,
    ).toBe("recovery_available");
    expect(classifyCreatePersistencePath("blueprintTemplate")).not.toBe(
      "durable_pipeline",
    );
  });

  it("6: Continue via registry projection", () => {
    const wf = {
      ...initializeWorkspaceV2Workflow("Cert Probe"),
      sessionId: "ws-continue-probe",
      selectedTemplateName: "Probe Work",
    };
    registerCreationDestinationWorkspace(wf);
    expect(
      listActiveContinueProjection().some((e) => e.workspaceId === "ws-continue-probe"),
    ).toBe(true);
  });

  it("7–8: shared command dispatcher archive/trash/restore/rename/duplicate", () => {
    upsertActiveWorkspace({
      workspaceId: "ws-cmd-probe",
      creationType: "Cert Probe",
      title: "Probe",
      currentFocusTitle: null,
      currentFocusId: null,
      progressLabel: "",
      lastActivityAt: new Date().toISOString(),
      draftState: "none",
      hasDraft: false,
      resumeTarget: "estate-create",
      runtimeCreationRecordId: "ws-cmd-probe",
      eventRecordId: null,
      projectHomeId: null,
      sessionId: "ws-cmd-probe",
      status: "active",
      createdAt: new Date().toISOString(),
    });
    const wf = {
      ...initializeWorkspaceV2Workflow("Cert Probe"),
      sessionId: "ws-cmd-probe",
      sectionContent: { intent: "x" },
      draftContent: "Draft body for export gate",
    };
    expect(
      dispatchCreateWorkCommand({
        commandId: "rename",
        workflow: wf,
        workId: "ws-cmd-probe",
        newTitle: "Renamed Probe",
      }).ok,
    ).toBe(true);
    expect(
      dispatchCreateWorkCommand({
        commandId: "duplicate",
        workflow: wf,
        workId: "ws-cmd-probe",
      }).workflow.sessionId,
    ).not.toBe("ws-cmd-probe");
    expect(
      dispatchCreateWorkCommand({
        commandId: "archive",
        workflow: wf,
        workId: "ws-cmd-probe",
      }).ok,
    ).toBe(true);
    expect(
      dispatchCreateWorkCommand({
        commandId: "restore",
        workflow: wf,
        workId: "ws-cmd-probe",
      }).ok,
    ).toBe(true);
    expect(
      dispatchCreateWorkCommand({
        commandId: "trash",
        workflow: wf,
        workId: "ws-cmd-probe",
      }).ok,
    ).toBe(true);
    expect(
      dispatchCreateWorkCommand({
        commandId: "export",
        workflow: wf,
        workId: "ws-cmd-probe",
        hasDraftText: true,
      }).openExport,
    ).toBe("export");
  });

  it("9: Event reference still boots through the same schema path", () => {
    const wf = initializeWorkspaceV2Workflow("Event Plan");
    expect(wf.selectedTemplateName).toBe("Event Plan");
    expect((wf.templateSections ?? []).length).toBeGreaterThan(5);
    const assist = runCreateAssistance({
      workflow: { ...wf, sessionId: "evt-1", activeSectionId: "purpose" },
      sectionId: "purpose",
      actionId: "help_me_think",
    });
    expect(assist.packet.workTypeId).toBe("event_plan");
    expect(assist.guidance.toLowerCase()).toContain("purpose");
  });
});
