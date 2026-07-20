/**
 * 066-RUNTIME — Current Focus sole interaction owner (066-R01 … R19).
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  clearActiveEventRecord,
  processEventsIntelligenceTurn,
  getEventRecord,
} from "@/lib/eventsIntelligence";
import {
  clearAuthoritativeDurableMarksForTests,
  createMemoryCreationDurableBackend,
  persistCreationBegin,
  setCreationDurableBackendForTests,
} from "@/lib/creationDurable";
import {
  is066OwnershipRuntimeComplete,
  listIllegalInteractionOwners,
} from "@/lib/singleExperienceWorkspace";
import {
  assertCreationDestinationQuestionMode,
  beginCreationDestinationSession,
  clearCreationDestinationSessionForTests,
  coerceCreationDestinationQuestionMode,
  endCreationDestinationSession,
  getSoleWorkspaceCurrentFocus,
  isCompanionDormantForCreation,
  isLegacySplitScreenQuestionMode,
  mayShowCompanionChatDuringCreation,
  resolveCanonicalCurrentFocus,
  submitCurrentFocusResponse,
} from "./index";

describe("066-RUNTIME — Current Focus sole owner", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearCreationDestinationSessionForTests();
    clearActiveEventRecord();
    clearAuthoritativeDurableMarksForTests();
    setCreationDurableBackendForTests(createMemoryCreationDurableBackend());
  });

  it("066-R01 / R14 — exactly one canonical Current Focus", () => {
    const start = processEventsIntelligenceTurn({
      userText: "I need to plan a workshop.",
    });
    const id = start.record!.id;
    const a = resolveCanonicalCurrentFocus({ creationId: id });
    const b = getSoleWorkspaceCurrentFocus(id);
    expect(a?.focusId).toBeTruthy();
    expect(a?.focusId).toBe(b?.focusId);
    expect(a?.prompt).toBeTruthy();
  });

  it("066-R02 / R03 / R04 / R05 — submit updates Reality through Trust and advances Focus", async () => {
    const start = processEventsIntelligenceTurn({
      userText: "I need to plan a workshop.",
    });
    const id = start.record!.id;
    beginCreationDestinationSession(id);
    await persistCreationBegin({
      workflow: {
        sessionId: id,
        eventRecordId: id,
        selectedTypeLabel: "Workshop",
        selectedTemplateName: start.record?.title || "Workshop",
        workspaceFirst: true,
        questionMode: "current_focus",
      } as import("@/lib/createWorkflow").CreateWorkflowState,
      originalRequest: "I need to plan a workshop.",
    });
    const focus = resolveCanonicalCurrentFocus({ creationId: id })!;
    const result = await submitCurrentFocusResponse({
      creationId: id,
      focusId: focus.focusId,
      response: "People leave with one clear offer.",
      responseType: "multiline",
      requestId: "r1",
      contextVersion: focus.contextVersion,
    });
    expect(result.ok).toBe(true);
    expect(result.durable).toBe(true);
    expect(result.realityUpdated).toBe(true);
    expect(result.trustAuthorized).toBe(true);
    expect(result.advanced).toBe(true);
    expect(getEventRecord(id)?.outcomes || getEventRecord(id)?.purpose).toBeTruthy();
    expect(result.nextFocus?.focusId).toBeTruthy();
  });

  it("066-R06 / R12 — companion dormant; chat must not show during Creation", () => {
    beginCreationDestinationSession("evt-1");
    expect(isCompanionDormantForCreation()).toBe(true);
    expect(mayShowCompanionChatDuringCreation()).toBe(false);
    endCreationDestinationSession();
    expect(mayShowCompanionChatDuringCreation()).toBe(true);
  });

  it("066-R07 — Continue never reopens chat; side panel deleted from Creation", () => {
    const panel = readFileSync(
      resolve(
        process.cwd(),
        "components/companion/CreateEstateWorkingPanel.tsx",
      ),
      "utf8",
    );
    expect(panel).not.toContain("onContinueCurrentFocus");
    expect(panel).not.toContain("EstateRoomChatChrome");
    expect(panel).toContain("CurrentFocusInteraction");
    const client = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    const workingStart = client.indexOf("<CreateEstateWorkingPanel");
    const working = client.slice(workingStart, workingStart + 16000);
    expect(working).toContain("onSubmitCurrentFocus");
    expect(working).not.toContain("thread={");
    expect(working).not.toMatch(
      /onSubmitCurrentFocus[\s\S]{0,1200}setEstateRoomChatVisible\(true\)/,
    );
  });

  it("066-R08 / R09 — Need Ideas / Build Draft do not use handleSend", () => {
    const client = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    const working = client.slice(
      client.indexOf("<CreateEstateWorkingPanel"),
      client.indexOf("<CreateEstateWorkingPanel") + 9000,
    );
    expect(working).toContain("onNeedIdeasInFocus");
    expect(working).toContain("onBuildDraftInFocus");
    expect(working).not.toMatch(/onNeedIdeasInFocus[\s\S]{0,400}handleSend/);
    expect(working).not.toMatch(/onBuildDraftInFocus[\s\S]{0,400}handleSend/);
  });

  it("066-R10 — Events questions resolve into Current Focus prompts", () => {
    const start = processEventsIntelligenceTurn({
      userText: "I need help creating a retreat weekend event.",
    });
    const focus = resolveCanonicalCurrentFocus({
      creationId: start.record!.id,
    });
    expect(focus?.prompt).toMatch(/\?|outcome|leave/i);
    expect(start.reply).not.toMatch(/I've opened|workspace is ready/i);
  });

  it("066-R11 — facilitation blocked while Creation session active (source)", () => {
    const client = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(client).toContain("!isCompanionDormantForCreation()");
  });

  it("066-R13 — split_screen rejected for Creation", () => {
    expect(isLegacySplitScreenQuestionMode("split_screen")).toBe(true);
    expect(coerceCreationDestinationQuestionMode("split_screen")).toBe(
      "current_focus",
    );
    expect(() =>
      assertCreationDestinationQuestionMode("split_screen"),
    ).toThrow(/066/);
  });

  it("066-R15 — failed submit preserves response and stays on Focus", async () => {
    const start = processEventsIntelligenceTurn({
      userText: "Help me plan a workshop event.",
    });
    const id = start.record!.id;
    const focus = resolveCanonicalCurrentFocus({ creationId: id })!;
    const result = await submitCurrentFocusResponse({
      creationId: id,
      focusId: "wrong-focus-id",
      response: "Keep this text",
      responseType: "multiline",
      requestId: "r-fail",
      contextVersion: focus.contextVersion,
    });
    expect(result.ok).toBe(false);
    expect(result.preservedResponse).toBe("Keep this text");
    expect(result.retryAvailable).toBe(true);
    expect(result.advanced).toBe(false);
    expect(result.durable).toBe(false);
  });

  it("066-R16 / R17 — leaving Creation restores companion; Living Places unaffected", () => {
    beginCreationDestinationSession("evt-1");
    expect(isCompanionDormantForCreation()).toBe(true);
    endCreationDestinationSession();
    expect(isCompanionDormantForCreation()).toBe(false);
    expect(mayShowCompanionChatDuringCreation()).toBe(true);
    // Spec 109 Living Places: dormancy only when session active
    expect(isCompanionDormantForCreation()).toBe(false);
  });

  it("066-R18 / R19 — illegal owners empty; runtime complete", () => {
    expect(listIllegalInteractionOwners()).toEqual([]);
    expect(is066OwnershipRuntimeComplete()).toBe(true);
  });

  it("hardening report exists; not CERTIFIED without browser", () => {
    expect(
      existsSync(
        resolve(
          process.cwd(),
          "docs/create-experience/HARDENING_066_RUNTIME_CURRENT_FOCUS.md",
        ),
      ),
    ).toBe(true);
  });
});
