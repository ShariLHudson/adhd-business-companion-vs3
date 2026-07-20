/**
 * Guards the Vercel/Turbopack failure:
 * ProjectHomes → listActiveWork → listActiveCreationWorkspaces must not
 * load workspacePersistenceDiagnostics (creationRecord circular init).
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Project Homes Create import safety", () => {
  it("loads registry + creationRecord without circular TDZ", async () => {
    const registry = await import("@/lib/activeWorkspaceRegistry/registry");
    const creation = await import("@/lib/currentFocus/creationRecord");
    expect(typeof registry.listActiveWorkspaces).toBe("function");
    expect(typeof creation.ensureRuntimeCreationRecord).toBe("function");
    expect(typeof registry.archiveActiveWorkspace).toBe("function");
  });

  it("listActiveCreationWorkspaces does not import the fat barrel or diagnostics", () => {
    const src = readFileSync(
      join(process.cwd(), "lib/createEstate/listActiveCreationWorkspaces.ts"),
      "utf8",
    );
    expect(src).not.toMatch(
      /from ["']@\/lib\/activeWorkspaceRegistry["']/,
    );
    expect(src).not.toContain("workspacePersistenceDiagnostics");
  });

  it("registry does not import workspacePersistenceDiagnostics", () => {
    const src = readFileSync(
      join(process.cwd(), "lib/activeWorkspaceRegistry/registry.ts"),
      "utf8",
    );
    expect(src).not.toContain("workspacePersistenceDiagnostics");
    expect(src).toContain("workspacePersistTrace");
  });

  it("barrel does not re-export dumpWorkspacePersistence", () => {
    const src = readFileSync(
      join(process.cwd(), "lib/activeWorkspaceRegistry/index.ts"),
      "utf8",
    );
    expect(src).not.toMatch(/dumpWorkspacePersistence/);
  });

  it("listActiveWork imports eventRecordStore leaf, not eventsIntelligence barrel", () => {
    const src = readFileSync(
      join(process.cwd(), "lib/projects/activeWork/listActiveWork.ts"),
      "utf8",
    );
    expect(src).not.toMatch(
      /from ["']@\/lib\/eventsIntelligence["']/,
    );
    expect(src).toContain("eventsIntelligence/eventRecordStore");
    expect(src).not.toMatch(/from ["']@\/lib\/projectHomes["']/);
  });

  it("breaks Events ↔ Event Workspace barrel SCC", () => {
    const resolveCreation = readFileSync(
      join(process.cwd(), "lib/creationEcosystem/resolveCreation.ts"),
      "utf8",
    );
    expect(resolveCreation).not.toMatch(
      /from ["']@\/lib\/eventsIntelligence["']/,
    );

    const buildWs = readFileSync(
      join(process.cwd(), "lib/eventCreationWorkspace/buildEventWorkspace.ts"),
      "utf8",
    );
    expect(buildWs).not.toMatch(
      /from ["']@\/lib\/eventsIntelligence\/eventCapabilityRegistry["']/,
    );
    expect(buildWs).toContain(
      "eventCapabilityRegistry/dynamicSectionRuntime",
    );

    const guide = readFileSync(
      join(process.cwd(), "lib/eventsIntelligence/guideEventPlanning.ts"),
      "utf8",
    );
    expect(guide).not.toMatch(
      /from ["']@\/lib\/eventCreationWorkspace["']/,
    );

    const registry = readFileSync(
      join(process.cwd(), "lib/activeWorkspaceRegistry/registry.ts"),
      "utf8",
    );
    expect(registry).not.toMatch(
      /from ["']@\/lib\/eventCreationWorkspace["']/,
    );
    expect(registry).toContain(
      "eventCreationWorkspace/applyWorkspaceToCreateWorkflow",
    );
  });

  it("loads Project Homes Active Work graph without circular TDZ", async () => {
    const activeWork = await import("@/lib/projects/activeWork");
    const panel = await import(
      "@/components/companion/projectHomes/ProjectHomesPrototypePanel"
    );
    expect(typeof activeWork.listActiveWorkCards).toBe("function");
    expect(typeof panel.ProjectHomesPrototypePanel).toBe("function");
  });
});
