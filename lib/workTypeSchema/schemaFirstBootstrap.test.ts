import { describe, expect, it, beforeEach } from "vitest";
import { initializeWorkspaceV2Workflow } from "@/lib/createWorkspaceV2";
import { openWorkshopMapSection } from "@/lib/workTypeSchema/openWorkshopMapSection";
import { getWorkTypeSchema } from "@/lib/workTypeSchema/registry";
import { ensureEventPlanSchemaRegistered } from "@/lib/workTypeSchema/schemas/eventPlan";
import {
  CERT_PROBE_MAP_SECTIONS,
  CERT_PROBE_WORK_TYPE_ID,
  ensureCertProbeSchemaRegistered,
} from "@/lib/workTypeSchema/schemas/certProbe";
import { applyWorkTypeMapToCreateWorkflow } from "@/lib/workTypeSchema/applyWorkTypeMapToWorkflow";
import { EVENT_PLAN_SCHEMA } from "@/lib/workTypeSchema/schemas/eventPlan";

describe("schema-first Create bootstrap", () => {
  beforeEach(() => {
    // Do not clear the shared registry (parallel vitest files share the Map).
    ensureEventPlanSchemaRegistered();
    ensureCertProbeSchemaRegistered();
  });

  it("Event Plan / Workshop resolve through event_plan schema map", () => {
    const wf = initializeWorkspaceV2Workflow("Event Plan");
    const ids = (wf.templateSections ?? []).map((s) => s.id);
    expect(ids).toEqual(EVENT_PLAN_SCHEMA.sections.map((s) => s.id));
    expect(wf.showAllWorkspaceSections).toBe(true);

    const workshop = initializeWorkspaceV2Workflow("Workshop");
    expect((workshop.templateSections ?? []).map((s) => s.id)).toEqual(ids);
  });

  it("registers a minimal Work Type via schema only and opens Current Focus", () => {
    expect(getWorkTypeSchema(CERT_PROBE_WORK_TYPE_ID)).not.toBeNull();
    const wf = initializeWorkspaceV2Workflow("Cert Probe");
    expect((wf.templateSections ?? []).map((s) => s.id)).toEqual(
      CERT_PROBE_MAP_SECTIONS.map((s) => s.id),
    );
    expect(wf.activeSectionId).toBe("intent");

    const opened = openWorkshopMapSection(wf, "outcome");
    expect(opened.activeSectionId).toBe("outcome");
  });

  it("hydrates missing schema sections on older records safely", () => {
    const stale = {
      ...initializeWorkspaceV2Workflow("Cert Probe"),
      templateSections: [{ id: "intent", title: "Intent", prompt: "" }],
      sectionContent: { intent: "Ship the probe" },
    };
    const schema = getWorkTypeSchema(CERT_PROBE_WORK_TYPE_ID)!;
    const hydrated = applyWorkTypeMapToCreateWorkflow(stale, schema, {
      preserveActiveSection: true,
      sectionContent: stale.sectionContent,
    });
    expect((hydrated.templateSections ?? []).map((s) => s.id)).toEqual(
      CERT_PROBE_MAP_SECTIONS.map((s) => s.id),
    );
    expect(hydrated.sectionContent?.intent).toBe("Ship the probe");
  });
});
