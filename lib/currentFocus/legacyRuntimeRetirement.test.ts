/**
 * 066 — Legacy Creation runtime retirement evidence.
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { initializeWorkspaceV2Workflow } from "@/lib/createWorkspaceV2";
import { documentCreationOpenAck } from "@/lib/collaborativeDocumentWorkflow";
import {
  clearAuthoritativeDurableMarksForTests,
  createMemoryCreationDurableBackend,
  persistCreationBegin,
  setCreationDurableBackendForTests,
} from "@/lib/creationDurable";
import {
  clearRuntimeCreationRecordsForTests,
  ensureRuntimeCreationRecord,
  resolveFocusForCreationDestination,
  submitCurrentFocusResponse,
  clearCreationDestinationSessionForTests,
} from "./index";
import {
  computeOwnershipRuntimeGates,
  is066ReadyForBrowserCertification,
  is066OwnershipRuntimeComplete,
} from "@/lib/singleExperienceWorkspace/interactionOwnership";

describe("066 — Legacy Creation runtime retirement", () => {
  beforeEach(() => {
    localStorage.clear();
    clearRuntimeCreationRecordsForTests();
    clearCreationDestinationSessionForTests();
    clearAuthoritativeDurableMarksForTests();
    setCreationDurableBackendForTests(createMemoryCreationDurableBackend());
  });

  it("Current Focus always resolves for Document without EventRecord", () => {
    const workflow = initializeWorkspaceV2Workflow("Email");
    const record = ensureRuntimeCreationRecord(workflow);
    const focus = resolveFocusForCreationDestination({
      ...workflow,
      sessionId: record.id,
    });
    expect(focus.focusId).toBeTruthy();
    expect(focus.prompt).toBeTruthy();
    expect(focus.creationId).toBe(record.id);
  });

  it("Focus submit advances non-event Creation via Runtime Creation Record", async () => {
    const workflow = {
      ...initializeWorkspaceV2Workflow("SOP"),
    };
    const record = ensureRuntimeCreationRecord(workflow);
    const withId = { ...workflow, sessionId: record.id };
    await persistCreationBegin({ workflow: withId });
    const focus = resolveFocusForCreationDestination(withId);
    const result = await submitCurrentFocusResponse(
      {
        creationId: record.id,
        focusId: focus.focusId,
        response: "Check inventory before opening.",
        responseType: "multiline",
        requestId: "sop-1",
        contextVersion: focus.contextVersion,
      },
      {
        workflow: withId,
        activeCreationId: record.id,
      },
    );
    expect(result.ok).toBe(true);
    expect(result.durable).toBe(true);
    expect(result.realityUpdated).toBe(true);
    expect(result.updatedWorkflow?.sectionContent).toBeTruthy();
    expect(result.nextFocus?.focusId).toBeTruthy();
  });

  it("Estate V2 panel is presentation-only (no answer capture)", () => {
    const panel = readFileSync(
      resolve(
        process.cwd(),
        "components/companion/CreateWorkspaceV2Panel.tsx",
      ),
      "utf8",
    );
    expect(panel).toContain('data-answer-capture="disabled"');
    expect(panel).toContain('data-creation-interaction-owner="current_focus"');
    expect(panel).toContain("Waiting for Current Focus");
    expect(panel).not.toMatch(
      /estatePresentation[\s\S]{0,200}SectionContentField/,
    );
  });

  it("WorkingPanel always mounts CurrentFocusInteraction", () => {
    const panel = readFileSync(
      resolve(
        process.cwd(),
        "components/companion/CreateEstateWorkingPanel.tsx",
      ),
      "utf8",
    );
    expect(panel).toContain("resolveFocusForCreationDestination");
    expect(panel).toContain("CurrentFocusInteraction");
    expect(panel).not.toContain("canonicalFocus && onSubmitCurrentFocus");
  });

  it("documentCreationOpenAck never promises beside chat", () => {
    const ack = documentCreationOpenAck("doc", "Newsletter");
    expect(ack).not.toMatch(/beside us|beside chat|Chat stays on the left/i);
    expect(ack).toMatch(/Current Focus|Create/i);
  });

  it("requestCreateOpen redirects content-generator to Estate", () => {
    const client = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(client).toMatch(
      /function requestCreateOpen[\s\S]{0,400}Estate Create is the only Creation runtime/,
    );
    expect(client).toContain("buildCreationDraftFromFocus");
  });

  it("ownership gates are computed from evidence; browser cert still false", () => {
    const gates = computeOwnershipRuntimeGates();
    expect(Object.values(gates).every(Boolean)).toBe(true);
    expect(is066OwnershipRuntimeComplete()).toBe(true);
    expect(is066ReadyForBrowserCertification()).toBe(false);
  });
});
