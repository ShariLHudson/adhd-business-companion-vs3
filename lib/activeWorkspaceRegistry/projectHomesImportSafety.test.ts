/**
 * Guards the Vercel webpack failure:
 * ProjectHomes → registry → creationRecord must not circular-init.
 */
import { describe, expect, it } from "vitest";

describe("Project Homes Create import safety", () => {
  it("loads registry + creationRecord without circular TDZ", async () => {
    const registry = await import("@/lib/activeWorkspaceRegistry/registry");
    const creation = await import("@/lib/currentFocus/creationRecord");
    expect(typeof registry.listActiveWorkspaces).toBe("function");
    expect(typeof creation.ensureRuntimeCreationRecord).toBe("function");
    expect(typeof registry.archiveActiveWorkspace).toBe("function");
  });
});
