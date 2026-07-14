import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CREATE_ROOM_PREPARED_STATE_MESSAGE,
  isCartographerMapRoutingIntent,
  isLegacyCreateBlockedSection,
  isProjectCreationRoutingIntent,
  resolveLegacyCreateWorkspaceGuard,
} from "./blockLegacyCreateWorkspaceRouting";

describe("blockLegacyCreateWorkspaceRouting", () => {
  it("routes project creation to Project Homes — not legacy projects panel", () => {
    expect(isProjectCreationRoutingIntent("Create a new project")).toBe(true);
    expect(
      resolveLegacyCreateWorkspaceGuard({
        section: "projects",
        userText: "Create a new project",
      }),
    ).toEqual({ kind: "project_homes" });
    expect(
      resolveLegacyCreateWorkspaceGuard({
        section: "content-generator",
        userText: "Start a project",
      }),
    ).toEqual({ kind: "project_homes" });
  });

  it("routes workflow / mind / decision maps to Cartographer's Studio", () => {
    expect(isCartographerMapRoutingIntent("Create a workflow map")).toBe(true);
    expect(
      resolveLegacyCreateWorkspaceGuard({
        section: "content-generator",
        userText: "Create a workflow map",
      }),
    ).toEqual({ kind: "cartographers_studio" });
    expect(
      resolveLegacyCreateWorkspaceGuard({
        section: "visual-focus",
        userText: "Make a mind map",
      }),
    ).toEqual({ kind: "allow" });
  });

  it("keeps SOP / document / content in prepared state — never old Create or saved-work", () => {
    for (const phrase of [
      "Create an SOP",
      "Create a document",
      "Write a social post",
      "Create content",
    ]) {
      const decision = resolveLegacyCreateWorkspaceGuard({
        section: "content-generator",
        userText: phrase,
      });
      expect(decision).toEqual({
        kind: "prepared_state",
        message: CREATE_ROOM_PREPARED_STATE_MESSAGE,
      });
    }

    expect(
      resolveLegacyCreateWorkspaceGuard({
        section: "saved-work",
        userText: "Create an SOP",
      }),
    ).toEqual({
      kind: "prepared_state",
      message: CREATE_ROOM_PREPARED_STATE_MESSAGE,
    });
  });

  it("blocks blank ui_nav opens of content-generator with prepared state", () => {
    expect(
      resolveLegacyCreateWorkspaceGuard({
        section: "content-generator",
        userText: "",
      }),
    ).toEqual({
      kind: "prepared_state",
      message: CREATE_ROOM_PREPARED_STATE_MESSAGE,
    });
  });

  it("allows non-create sections including time-block and chamber", () => {
    expect(isLegacyCreateBlockedSection("time-block")).toBe(false);
    expect(isLegacyCreateBlockedSection("chamber-of-momentum")).toBe(false);
    expect(
      resolveLegacyCreateWorkspaceGuard({
        section: "time-block",
        userText: "open appointments",
      }),
    ).toEqual({ kind: "allow" });
    expect(
      resolveLegacyCreateWorkspaceGuard({
        section: "chamber-of-momentum",
        userText: "Open Chamber of Momentum",
      }),
    ).toEqual({ kind: "allow" });
  });

  it("allows in-place sync when Create panel is already open", () => {
    expect(
      resolveLegacyCreateWorkspaceGuard({
        section: "content-generator",
        userText: "add a paragraph",
        alreadyOpen: true,
      }),
    ).toEqual({ kind: "allow" });
  });
});

describe("blockLegacyCreateWorkspaceRouting — CompanionPageClient wiring", () => {
  const client = readFileSync(
    resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
    "utf8",
  );

  it("guards shared legacy openers and redirects project/map completions", () => {
    expect(client).toContain("resolveLegacyCreateWorkspaceGuard");
    expect(client).toContain("redirectLegacyCreateWorkspaceIfNeeded");
    const projectOpen = client.match(
      /function completeImmediateCreateProjectOpen\([\s\S]*?\r?\n  function /,
    )?.[0];
    const momentumOpen = client.match(
      /function completeImmediateMomentumOpen\([\s\S]*?\r?\n  function /,
    )?.[0];
    const createOpen = client.match(
      /function completeImmediateCreateOpen\([\s\S]*?\r?\n  function /,
    )?.[0];
    expect(projectOpen).toContain("openProjectHomesPrototypeCore()");
    expect(projectOpen).not.toContain('openSectionBesideChatCore("projects"');
    expect(momentumOpen).toContain("openProjectHomesPrototypeCore()");
    expect(momentumOpen).not.toContain('openSectionBesideChatCore("projects"');
    expect(createOpen).toContain("redirectLegacyCreateWorkspaceIfNeeded");
    expect(createOpen).not.toContain("openCreateWithResolvedArtifact");
  });

  it("disconnects Documents / SOPs / Content menu from split opens", () => {
    expect(client).not.toMatch(
      /onOpenDocuments=\{\(\) =>\s*\n\s*openSectionBesideChatCore\("content-generator"/,
    );
    expect(client).not.toMatch(
      /onOpenSops=\{\(\) =>\s*\n\s*openSectionBesideChatCore\("saved-work"/,
    );
    expect(client).not.toMatch(
      /onOpenContent=\{\(\) => openCreateWorkspace/,
    );
  });

  it("preserves explicit Chamber and Plan My Day time-block wiring", () => {
    expect(client).toContain("onOpenChamber={() => openChamberOfMomentumCore()}");
    expect(client).toMatch(/openWorkspaceBesideChatCore\("time-block"/);
  });
});
