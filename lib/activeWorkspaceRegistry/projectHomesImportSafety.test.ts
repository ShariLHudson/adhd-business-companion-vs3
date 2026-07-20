/**
 * Guards Vercel/Turbopack circular init:
 * Project Homes must not statically load fat registry → creationRecord.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Project Homes Create import safety", () => {
  it("loads registryCore + panel without creationRecord TDZ", async () => {
    const core = await import("@/lib/activeWorkspaceRegistry/registryCore");
    const panel = await import(
      "@/components/companion/projectHomes/ProjectHomesPrototypePanel"
    );
    expect(typeof core.listActiveWorkspaces).toBe("function");
    expect(typeof core.archiveActiveWorkspace).toBe("function");
    expect(typeof panel.ProjectHomesPrototypePanel).toBe("function");
  });

  it("listActiveWork does not import fat registry or hydrate", () => {
    const src = readFileSync(
      join(process.cwd(), "lib/projects/activeWork/listActiveWork.ts"),
      "utf8",
    );
    expect(src).not.toContain("hydrateActiveWorkspaceRegistry");
    expect(src).not.toMatch(
      /from ["']@\/lib\/activeWorkspaceRegistry\/registry["']/,
    );
    expect(src).not.toMatch(/from ["']@\/lib\/activeWorkspaceRegistry["']/);
  });

  it("panel imports registryCore, not fat registry", () => {
    const src = readFileSync(
      join(
        process.cwd(),
        "components/companion/projectHomes/ProjectHomesPrototypePanel.tsx",
      ),
      "utf8",
    );
    expect(src).toContain("activeWorkspaceRegistry/registryCore");
    expect(src).not.toMatch(
      /from ["']@\/lib\/activeWorkspaceRegistry\/registry["']/,
    );
  });

  it("projections import registryCore only", () => {
    const src = readFileSync(
      join(process.cwd(), "lib/activeWorkspaceRegistry/projections.ts"),
      "utf8",
    );
    expect(src).toContain("./registryCore");
    expect(src).not.toMatch(/from ["']\.\/registry["']/);
  });

  it("registryCore has no static creationRecord / Event Workspace imports", () => {
    const src = readFileSync(
      join(process.cwd(), "lib/activeWorkspaceRegistry/registryCore.ts"),
      "utf8",
    );
    expect(src).not.toMatch(
      /from ["']@\/lib\/currentFocus\/creationRecord["']/,
    );
    expect(src).not.toMatch(
      /from ["']@\/lib\/eventsIntelligence\/eventRecordStore["']/,
    );
    expect(src).not.toContain("resolveCanonicalFocus");
    expect(src).not.toContain("eventCreationWorkspace");
  });

  it("canonicalWorkRecord does not statically import homeActions", () => {
    const src = readFileSync(
      join(process.cwd(), "lib/createProjects/canonicalWorkRecord.ts"),
      "utf8",
    );
    expect(src).not.toContain("homeActions");
  });

  it("projectsBridge does not import homeActions", () => {
    const src = readFileSync(
      join(process.cwd(), "lib/eventsIntelligence/projectsBridge.ts"),
      "utf8",
    );
    expect(src).not.toContain("homeActions");
    expect(src).not.toContain("projectHomes");
  });
});
