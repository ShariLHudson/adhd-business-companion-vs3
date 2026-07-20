import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearRuntimeCreationRecordsForTests,
  ensureRuntimeCreationRecord,
  verifyRuntimeRecordDurable,
  wasLastRuntimePersistDurable,
} from "./creationRecord";
import { verifyHydratedWorkspaceIdentity } from "./exactWorkspacePersist";
import { BUILD_DRAFT_TIMEOUT_MS } from "./buildCreationDraft";
import { EMPTY_CREATE_WORKFLOW } from "@/lib/createWorkflow";
import {
  clearActiveWorkspaceRegistryForTests,
  registerCreationDestinationWorkspace,
  verifyCreationWorkspaceDurable,
} from "@/lib/activeWorkspaceRegistry";

describe("074 — Production Hardening Persistence & Reliability", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => {
        mem.set(k, v);
      },
      removeItem: (k: string) => {
        mem.delete(k);
      },
      get length() {
        return mem.size;
      },
      key: (i: number) => [...mem.keys()][i] ?? null,
    });
    vi.stubGlobal("window", { localStorage });
    clearRuntimeCreationRecordsForTests();
    clearActiveWorkspaceRegistryForTests();
  });

  it("Build Draft has a finite timeout bound", () => {
    expect(BUILD_DRAFT_TIMEOUT_MS).toBeGreaterThan(5_000);
    expect(BUILD_DRAFT_TIMEOUT_MS).toBeLessThanOrEqual(60_000);
  });

  it("durable persist + read-back for runtime + registry", () => {
    const workflow = {
      ...EMPTY_CREATE_WORKFLOW,
      selectedTypeLabel: "Workshop",
      selectedTemplateName: "Simple Productivity Workshop",
      sessionId: "ws-074-1",
      workspaceFirst: true,
      questionMode: "current_focus" as const,
      templateSections: [
        { id: "purpose", label: "Purpose" },
        { id: "audience", label: "Audience" },
      ],
      sectionContent: { purpose: "Help ADHD founders" },
    };
    ensureRuntimeCreationRecord(workflow);
    expect(wasLastRuntimePersistDurable()).toBe(true);
    expect(verifyRuntimeRecordDurable("ws-074-1")).toBe(true);

    registerCreationDestinationWorkspace(workflow);
    expect(verifyCreationWorkspaceDurable("ws-074-1")).toBe(true);
  });

  it("verifyHydratedWorkspaceIdentity rejects ID-only bootstrap without schema match", () => {
    const workflow = {
      ...EMPTY_CREATE_WORKFLOW,
      selectedTypeLabel: "Workshop",
      sessionId: "ws-074-2",
      workspaceFirst: true,
      questionMode: "current_focus" as const,
      templateSections: [
        { id: "purpose", label: "Purpose" },
        { id: "dates", label: "Dates" },
      ],
      sectionContent: { purpose: "Clarity" },
    };
    ensureRuntimeCreationRecord(workflow);

    // Wrong schema (reconstructed) must fail
    const reconstructed = {
      ...workflow,
      templateSections: [{ id: "overview", label: "Overview" }],
      sectionContent: {},
    };
    expect(
      verifyHydratedWorkspaceIdentity(reconstructed, "ws-074-2"),
    ).toBe(false);

    // Exact schema + answers must pass
    expect(verifyHydratedWorkspaceIdentity(workflow, "ws-074-2")).toBe(true);
  });

  it("homeWelcome and build draft never claim safety without verify (source)", async () => {
    const { readFileSync } = await import("fs");
    const { resolve } = await import("path");
    const home = readFileSync(
      resolve(process.cwd(), "lib/homeWelcome.ts"),
      "utf8",
    );
    expect(home).toContain("safeLocalStorageSet");
    const draft = readFileSync(
      resolve(process.cwd(), "lib/currentFocus/buildCreationDraft.ts"),
      "utf8",
    );
    expect(draft).toContain("AbortController");
    expect(draft).toContain("verifyRuntimeRecordDurable");
    expect(draft).not.toMatch(
      /Your work is still here — Retry keeps you in this workspace/,
    );
  });
});
