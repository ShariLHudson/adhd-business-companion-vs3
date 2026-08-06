/**
 * SOP Build Journey — Phase 1 (Experience Foundation) certification.
 *
 * Proves the Build Definition matches the approved specification, that
 * authoring is additive (no other Build Type changes), and that SOP stays
 * hidden. Phase 1 is foundation only — no conversation UI, no output
 * generation, no visibility change.
 *
 * @see docs/create-experience/SOP_BUILD_JOURNEY_SPECIFICATION.md
 * @see docs/create-experience/SOP_BUILD_JOURNEY_APPROVAL_RECORD.md
 */

import { describe, expect, it } from "vitest";
import { defaultTemplateFor, listPresetTemplates } from "@/lib/createTemplates";
import { workspaceV2Sections } from "@/lib/createWorkspaceSections";
import { resolveCanonicalCurrentFocus } from "@/lib/currentFocus/resolveCanonicalFocus";
import {
  applyDiscoveryAnswerToRuntimeCreationRecord,
  clearRuntimeCreationRecordsForTests,
} from "@/lib/currentFocus/creationRecord";
import type { CreateWorkflowState } from "@/lib/createWorkflowState";
import { V1_PRIORITY_REGISTRY_ITEMS } from "@/lib/createRegistry/items.v1Priority.seed";
import { computeIsUserVisible } from "@/lib/createRegistry/visibility";

const SOP_EXPECTED_SECTIONS = [
  "purpose",
  "intended-user",
  "before-you-begin",
  "steps",
  "completion-check",
  "troubleshooting",
] as const;

/**
 * SOP Reasoning-First Migration Phase 2 (2026-08-06) — three discovery
 * questions now precede the section flow this file certifies. Resolve
 * (skip) them first so these section-level tests exercise the same
 * section behavior they always have.
 */
function skipSopDiscovery(creationId: string): void {
  for (const id of [
    "sop-audience-type",
    "sop-starting-point",
    "sop-audience-size",
  ]) {
    applyDiscoveryAnswerToRuntimeCreationRecord(creationId, id, "", {
      skip: true,
    });
  }
}

function sopWorkflow(): CreateWorkflowState {
  const template = defaultTemplateFor("SOP");
  return {
    sessionId: "sop-phase1-test",
    selectedTypeLabel: "SOP",
    useTemplate: true,
    selectedTemplateId: template.id,
    templateSections: template.sections,
    sectionContent: {},
    skippedSectionIds: [],
    workspaceFirst: true,
    questionMode: "current_focus",
  } as CreateWorkflowState;
}

describe("1. SOP Build Definition matches the Knowledge Finger", () => {
  it("resolves the SOP preset by item type", () => {
    const template = defaultTemplateFor("SOP");
    expect(template.id).toBe("sop-default");
    expect(template.itemType).toBe("SOP");
  });

  it("has the approved sections, in order", () => {
    const template = defaultTemplateFor("SOP");
    expect(template.sections.map((s) => s.id)).toEqual([
      ...SOP_EXPECTED_SECTIONS,
    ]);
  });

  it("includes the four sections that make an SOP usable by someone else", () => {
    // Intended User / Before You Begin / Completion Check / Troubleshooting
    // were absent from the previous four-section template. They are the
    // difference between a document and something another person can follow.
    const ids = defaultTemplateFor("SOP").sections.map((s) => s.id);
    expect(ids).toContain("intended-user");
    expect(ids).toContain("before-you-begin");
    expect(ids).toContain("completion-check");
    expect(ids).toContain("troubleshooting");
  });

  it("preserves the section ids IDEAS_BY_SECTION is keyed on", () => {
    const ids = defaultTemplateFor("SOP").sections.map((s) => s.id);
    expect(ids).toContain("purpose");
    expect(ids).toContain("steps");
  });

  it("no longer carries the generic Scope / Notes headings", () => {
    const ids = defaultTemplateFor("SOP").sections.map((s) => s.id);
    expect(ids).not.toContain("scope");
    expect(ids).not.toContain("notes");
  });
});

describe("2. Every SOP section carries an authored prompt", () => {
  it("all sections have a non-empty prompt and why", () => {
    for (const s of defaultTemplateFor("SOP").sections) {
      expect(s.prompt?.trim().length ?? 0).toBeGreaterThan(0);
      expect(s.why?.trim().length ?? 0).toBeGreaterThan(0);
    }
  });

  it("no prompt is the label-derived fallback", () => {
    for (const s of defaultTemplateFor("SOP").sections) {
      expect(s.prompt).not.toMatch(/^What belongs in /);
    }
  });

  it("the first question asks for the outcome, per specification section 5", () => {
    const first = defaultTemplateFor("SOP").sections[0];
    expect(first.id).toBe("purpose");
    expect(first.prompt).toBe(
      "What should someone be able to accomplish after following this SOP?",
    );
  });
});

describe("3. Current Focus prefers the authored prompt", () => {
  it("opens an SOP with the outcome question, not the form phrasing", () => {
    clearRuntimeCreationRecordsForTests();
    resolveCanonicalCurrentFocus({
      creationId: "sop-phase1-test",
      workflow: sopWorkflow(),
    });
    skipSopDiscovery("sop-phase1-test");
    const focus = resolveCanonicalCurrentFocus({
      creationId: "sop-phase1-test",
      workflow: sopWorkflow(),
    });
    expect(focus).toBeTruthy();
    expect(focus!.sectionId).toBe("purpose");
    expect(focus!.prompt).toBe(
      "What should someone be able to accomplish after following this SOP?",
    );
    expect(focus!.prompt).not.toMatch(/^What belongs in /);
  });

  it("uses the authored reason as the Focus purpose", () => {
    clearRuntimeCreationRecordsForTests();
    resolveCanonicalCurrentFocus({
      creationId: "sop-phase1-test",
      workflow: sopWorkflow(),
    });
    skipSopDiscovery("sop-phase1-test");
    const focus = resolveCanonicalCurrentFocus({
      creationId: "sop-phase1-test",
      workflow: sopWorkflow(),
    });
    expect(focus!.purpose).toBe(
      "Starting with the result keeps every step pointed at something real.",
    );
  });

  it("advances to the next authored question once a section is answered", () => {
    clearRuntimeCreationRecordsForTests();
    const workflow = {
      ...sopWorkflow(),
      sectionContent: { purpose: "Izna can share a Loom without asking me." },
    } as CreateWorkflowState;
    resolveCanonicalCurrentFocus({
      creationId: "sop-phase1-test",
      workflow,
    });
    skipSopDiscovery("sop-phase1-test");
    const focus = resolveCanonicalCurrentFocus({
      creationId: "sop-phase1-test",
      workflow,
    });
    expect(focus!.sectionId).toBe("intended-user");
    expect(focus!.prompt).toBe("Who will be using these instructions?");
  });

  it("carries prompt and why through the section view", () => {
    const views = workspaceV2Sections(sopWorkflow());
    expect(views).toHaveLength(SOP_EXPECTED_SECTIONS.length);
    for (const v of views) {
      expect(v.prompt?.trim().length ?? 0).toBeGreaterThan(0);
      expect(v.why?.trim().length ?? 0).toBeGreaterThan(0);
    }
  });
});

describe("4. Authoring is additive — no other Build Type changes", () => {
  it("templates without authored prompts still resolve and keep derived questions", () => {
    const email = defaultTemplateFor("Email");
    expect(email.sections.length).toBeGreaterThan(0);
    // Email was not authored in Phase 1 — it must keep the fallback behavior.
    expect(email.sections.every((s) => s.prompt === undefined)).toBe(true);

    clearRuntimeCreationRecordsForTests();
    const focus = resolveCanonicalCurrentFocus({
      creationId: "email-phase1-test",
      workflow: {
        sessionId: "email-phase1-test",
        selectedTypeLabel: "Email",
        useTemplate: true,
        selectedTemplateId: email.id,
        templateSections: email.sections,
        sectionContent: {},
        skippedSectionIds: [],
        workspaceFirst: true,
        questionMode: "current_focus",
      } as CreateWorkflowState,
    });
    expect(focus!.prompt).toMatch(/^What belongs in /);
  });

  it("every other preset still resolves to a non-empty section list", () => {
    for (const preset of listPresetTemplates("*")) {
      expect(preset.sections.length).toBeGreaterThan(0);
      for (const s of preset.sections) {
        expect(s.id.trim().length).toBeGreaterThan(0);
        expect(s.label.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

describe("5. Registry agrees with the Build Definition", () => {
  const sop = V1_PRIORITY_REGISTRY_ITEMS.find((i) => i.id === "sop")!;

  it("declares a guided conversation, not a structured form", () => {
    expect(sop.builderType).toBe("guided-conversation");
    expect(sop.builderType).not.toBe("structured-form");
  });

  it("still declares the template it depends on", () => {
    expect(sop.dependencies).toContain("lib/createTemplates.ts#SOP_SECTIONS");
  });

  it("is not backed by a UWE package — no SOP engine was created", () => {
    expect(sop.owner).toBe("create-estate");
    expect(sop.route).toBe("create/estate/sop");
  });
});

describe("6. SOP remains hidden — Phase 1 changes no visibility", () => {
  const sop = V1_PRIORITY_REGISTRY_ITEMS.find((i) => i.id === "sop")!;

  it("stays needs-audit with every verification flag false", () => {
    expect(sop.lifecycleStatus).toBe("needs-audit");
    expect(sop.routeVerified).toBe(false);
    expect(sop.saveVerified).toBe(false);
    expect(sop.reopenVerified).toBe(false);
    expect(sop.requiredActionsVerified).toBe(false);
  });

  it("computes as not user visible", () => {
    expect(computeIsUserVisible(sop)).toBe(false);
  });
});
