/**
 * Guards Vercel/Turbopack circular init on Project Homes.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Project Homes Create import safety", () => {
  it("loads panel graph without creationRecord", async () => {
    const panel = await import(
      "@/components/companion/projectHomes/ProjectHomesPrototypePanel"
    );
    const lite = await import("@/lib/projects/projectsContinueLite");
    const projectsStore = await import("@/lib/companionProjectsStore");
    expect(typeof panel.ProjectHomesPrototypePanel).toBe("function");
    expect(typeof lite.listLiteActiveWorkCards).toBe("function");
    expect(typeof projectsStore.getProjects).toBe("function");
  });

  it("listActiveCreationWorkspaces does not import humanReadableIdentity", () => {
    const src = readFileSync(
      join(process.cwd(), "lib/createEstate/listActiveCreationWorkspaces.ts"),
      "utf8",
    );
    expect(src).not.toMatch(
      /from ["']@\/lib\/activeWorkspaceRegistry\/humanReadableIdentity["']/,
    );
    expect(src).toContain("continueCardProjection");
  });

  it("listActiveWork does not import eventRecordStore or fat registry", () => {
    const src = readFileSync(
      join(process.cwd(), "lib/projects/activeWork/listActiveWork.ts"),
      "utf8",
    );
    expect(src).not.toMatch(/eventRecordStore/);
    expect(src).not.toMatch(
      /from ["']@\/lib\/currentFocus\/creationRecord["']/,
    );
    expect(src).not.toMatch(
      /from ["']@\/lib\/activeWorkspaceRegistry\/registry["']/,
    );
  });

  it("panel never references Create registry / fat companionStore", () => {
    const src = readFileSync(
      join(
        process.cwd(),
        "components/companion/projectHomes/ProjectHomesPrototypePanel.tsx",
      ),
      "utf8",
    );
    expect(src).toContain("projectsContinueLite");
    expect(src).toContain("companionProjectsEvents");
    expect(src).not.toMatch(
      /from ["']@\/lib\/activeWorkspaceRegistry\/registry["']/,
    );
    expect(src).not.toMatch(
      /from ["']@\/lib\/activeWorkspaceRegistry\/registryCore["']/,
    );
    expect(src).not.toMatch(/from ["']@\/lib\/companionStore["']/);
    expect(src).not.toMatch(
      /from ["']@\/lib\/currentFocus\/creationRecord["']/,
    );
    expect(src).not.toMatch(/from ["']@\/lib\/navigationContext["']/);
  });

  it("homeActions and ProjectBreakdown use companionProjectsStore leaf", () => {
    const homeActions = readFileSync(
      join(process.cwd(), "lib/projectHomes/homeActions.ts"),
      "utf8",
    );
    const breakdown = readFileSync(
      join(process.cwd(), "components/companion/ProjectBreakdown.tsx"),
      "utf8",
    );
    expect(homeActions).toContain("companionProjectsStore");
    expect(homeActions).not.toMatch(/from ["']@\/lib\/companionStore["']/);
    expect(breakdown).toContain("companionProjectsStore");
    expect(breakdown).not.toMatch(/from ["']@\/lib\/companionStore["']/);
  });

  it("registryCore has no persist trace / creationRecord static imports", () => {
    const src = readFileSync(
      join(process.cwd(), "lib/activeWorkspaceRegistry/registryCore.ts"),
      "utf8",
    );
    expect(src).not.toContain("workspacePersistTrace");
    expect(src).not.toMatch(
      /from ["']@\/lib\/currentFocus\/creationRecord["']/,
    );
    expect(src).not.toMatch(/creationDurable/);
  });

  it("projectHomes barrel exports lazy panel gate", () => {
    const src = readFileSync(
      join(process.cwd(), "components/companion/projectHomes/index.ts"),
      "utf8",
    );
    expect(src).toContain("ProjectHomesLazy");
    expect(src).not.toMatch(/from ["']\.\/ProjectHomesPrototypePanel["']/);
  });
});
