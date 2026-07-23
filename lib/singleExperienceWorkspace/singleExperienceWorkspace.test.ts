import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  BANNED_SPLIT_EXPERIENCE_PATTERNS,
  SINGLE_EXPERIENCE_READY_LINES,
  SINGLE_EXPERIENCE_WORKSPACE_RULE,
  coerceLayoutForWorkspaceOpen,
  containsBannedSplitExperienceCopy,
  rewriteBannedSplitExperienceCopy,
  isLegacyCreateSplitLayout,
  isSingleExperienceCreationSection,
  resolveCreationWorkspaceLayoutMode,
} from "./index";
import { applyOpenCreateWorkspaceState } from "@/lib/openCreateWorkspace";

describe("066 — Single Experience Workspace", () => {
  it("standard document exists", () => {
    expect(
      existsSync(
        resolve(
          process.cwd(),
          "docs/create-experience/standards/066_SINGLE_EXPERIENCE_WORKSPACE_STANDARD.md",
        ),
      ),
    ).toBe(true);
  });

  it("Creation Workspace layout is always workspace-focus", () => {
    expect(resolveCreationWorkspaceLayoutMode()).toBe("workspace-focus");
    expect(SINGLE_EXPERIENCE_WORKSPACE_RULE.legacySplitRetired).toBe(true);
    expect(coerceLayoutForWorkspaceOpen("content-generator", "split")).toBe(
      "workspace-focus",
    );
    expect(coerceLayoutForWorkspaceOpen("create", "split")).toBe(
      "workspace-focus",
    );
    expect(coerceLayoutForWorkspaceOpen("projects", "split")).toBe("split");
    expect(isSingleExperienceCreationSection("content-generator")).toBe(true);
  });

  it("applyOpenCreateWorkspaceState never opens Create in split", () => {
    const next = applyOpenCreateWorkspaceState(
      {
        workspacePanel: null,
        activeSection: "home",
        chatLayoutMode: "workspace-focus",
      },
      { userInitiated: true },
    );
    expect(next.chatLayoutMode).toBe("workspace-focus");
    expect(
      isLegacyCreateSplitLayout({
        workspacePanel: next.workspacePanel,
        chatLayoutMode: next.chatLayoutMode,
      }),
    ).toBe(false);
  });

  it("bans split-experience member copy", () => {
    expect(
      containsBannedSplitExperienceCopy(
        "Your Create workspace is open beside you — keep chatting here while you work in the panel.",
      ),
    ).toBe(true);
    expect(
      containsBannedSplitExperienceCopy(SINGLE_EXPERIENCE_READY_LINES.createReady),
    ).toBe(false);
    expect(BANNED_SPLIT_EXPERIENCE_PATTERNS.length).toBeGreaterThan(3);
  });

  it("rewrites dual-experience copy at egress", () => {
    const rewritten = rewriteBannedSplitExperienceCopy(
      "Opening **Create** beside us — chat stays right here.",
    );
    expect(rewritten).not.toMatch(/beside us|keep chatting|chat stays/i);
    expect(rewritten.length).toBeGreaterThan(10);
  });

  it("CPC wires single-experience Create layout helpers", () => {
    const client = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(client).toContain("resolveCreationWorkspaceLayoutMode");
    expect(client).toContain("estate-create-only");
    expect(client).not.toMatch(
      /Your \*\*Create\*\* workspace is open beside you/,
    );
    expect(client).not.toMatch(
      /Opening \*\*[^*]+\*\* beside us — chat stays right here/,
    );
  });
});
