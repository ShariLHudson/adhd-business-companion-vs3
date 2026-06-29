import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  SPLIT_CHAT_PANE_CLASS,
  SPLIT_LAYOUT_ROOT_CLASS,
  SPLIT_WORKSPACE_PANE_CLASS,
  WORKSPACE_PANEL_PADDING_CLASS,
  workspacePanelShellClass,
} from "./workspaceLayoutTokens";
import {
  defaultViewSizeForSection,
  loadWorkspaceViewSizePreference,
  mobileSplitLayout,
  resolveEffectiveViewSize,
  saveWorkspaceViewSizePreference,
  splitLayoutClassName,
  splitLayoutStyle,
  VIEW_SIZE_PRESETS,
  WORKSPACE_VIEW_SIZE_STORAGE_KEY,
} from "./workspaceViewSize";

function seedLocalStorage() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => mem.set(k, v),
    removeItem: (k: string) => mem.delete(k),
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", { localStorage: storage });
  return storage;
}

const AUDITED_PANEL_FILES = [
  "components/companion/FocusAreaPanel.tsx",
  "components/companion/ProjectsPanel.tsx",
  "components/companion/SavedWorkLibrary.tsx",
  "components/companion/BrainDumpPanel.tsx",
  "components/companion/TemplatesLibrary.tsx",
  "components/companion/SnippetsLibrary.tsx",
  "components/companion/StrategiesPanel.tsx",
  "components/companion/MyWorkHubPanel.tsx",
  "components/companion/ContentGeneratorPanel.tsx",
  "components/companion/SettingsPanel.tsx",
  "components/companion/ProfilePanel.tsx",
];

describe("workspace view size + layout tokens", () => {
  beforeEach(() => {
    seedLocalStorage();
  });

  it("major workspace panels import shared layout tokens", () => {
    const root = join(__dirname, "..");
    for (const rel of AUDITED_PANEL_FILES) {
      const src = readFileSync(join(root, rel), "utf8");
      expect(
        src.includes("workspaceLayoutTokens") ||
          src.includes("WorkspacePanelShell") ||
          src.includes("SceneRenderer") ||
          src.includes("CompanionWorkspaceShell") ||
          src.includes("FocusMyBrainRoomShell") ||
          src.includes("CinematicBackground"),
        `${rel} should use workspaceLayoutTokens, WorkspacePanelShell, SceneRenderer, CompanionWorkspaceShell, FocusMyBrainRoomShell, or CinematicBackground`,
      ).toBe(true);
    }
  });

  it("Balanced preset applies correct split config", () => {
    expect(VIEW_SIZE_PRESETS.balanced).toEqual({
      chat: 50,
      workspace: 50,
      label: "Balanced",
    });
    expect(splitLayoutClassName("balanced")).toContain(SPLIT_LAYOUT_ROOT_CLASS);
    expect(splitLayoutStyle("balanced")).toEqual({
      "--companion-chat-flex": "50",
      "--companion-workspace-flex": "50",
    });
  });

  it("Chat Focus preset applies correct split config", () => {
    expect(VIEW_SIZE_PRESETS["chat-focus"].chat).toBe(65);
    expect(VIEW_SIZE_PRESETS["chat-focus"].workspace).toBe(35);
    expect(splitLayoutStyle("chat-focus")["--companion-chat-flex"]).toBe("65");
  });

  it("Workspace Focus preset applies correct split config", () => {
    expect(VIEW_SIZE_PRESETS["workspace-focus"].chat).toBe(35);
    expect(VIEW_SIZE_PRESETS["workspace-focus"].workspace).toBe(65);
    expect(splitLayoutStyle("workspace-focus")["--companion-workspace-flex"]).toBe(
      "65",
    );
  });

  it("migrates legacy visual-focus layout preference to workspace-focus", () => {
    localStorage.setItem(WORKSPACE_VIEW_SIZE_STORAGE_KEY, "visual-focus");
    expect(loadWorkspaceViewSizePreference()).toBe("workspace-focus");
  });

  it("Decision Compass defaults to Workspace Focus without saved preference", () => {
    expect(defaultViewSizeForSection("decision-compass")).toBe("workspace-focus");
    expect(
      resolveEffectiveViewSize("decision-compass", null),
    ).toBe("workspace-focus");
  });

  it("Visual Focus workspace defaults to Workspace Focus layout", () => {
    expect(defaultViewSizeForSection("visual-focus")).toBe("workspace-focus");
  });

  it("preference persists in companion-workspace-view-size-v1", () => {
    expect(loadWorkspaceViewSizePreference()).toBeNull();
    saveWorkspaceViewSizePreference("chat-focus");
    expect(localStorage.getItem(WORKSPACE_VIEW_SIZE_STORAGE_KEY)).toBe(
      "chat-focus",
    );
    expect(loadWorkspaceViewSizePreference()).toBe("chat-focus");
  });

  it("Create defaults to Workspace Focus without saved preference", () => {
    expect(defaultViewSizeForSection("content-generator")).toBe(
      "workspace-focus",
    );
    expect(
      resolveEffectiveViewSize("content-generator", null),
    ).toBe("workspace-focus");
  });

  it("mobile uses tab/stack layout — not side-by-side shrink", () => {
    expect(mobileSplitLayout()).toBe("tabs");
    expect(SPLIT_CHAT_PANE_CLASS).toBe("companion-split-chat-pane");
    expect(SPLIT_WORKSPACE_PANE_CLASS).toBe("companion-split-workspace-pane");
  });

  it("split shell classes and panel tokens stay compatible with split view", () => {
    expect(workspacePanelShellClass({ inSplit: true })).toContain("max-w-2xl");
    expect(workspacePanelShellClass({ width: "full", inSplit: true })).toContain(
      "max-w-none",
    );
    expect(workspacePanelShellClass({ width: "standard" })).toContain(
      WORKSPACE_PANEL_PADDING_CLASS,
    );
    const saved = "balanced" as const;
    saveWorkspaceViewSizePreference(saved);
    expect(resolveEffectiveViewSize("projects", loadWorkspaceViewSizePreference())).toBe(
      "balanced",
    );
  });
});
