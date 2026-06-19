import type { CSSProperties } from "react";
import type { AppSection } from "./companionUi";
import {
  SPLIT_LAYOUT_ROOT_CLASS,
  type WorkspacePanelWidth,
} from "./workspaceLayoutTokens";

export const WORKSPACE_VIEW_SIZE_STORAGE_KEY = "companion-workspace-view-size-v1";

export type WorkspaceViewSizePreset =
  | "balanced"
  | "chat-focus"
  | "workspace-focus"
  | "visual-focus";

export const VIEW_SIZE_PRESET_LABELS: Record<WorkspaceViewSizePreset, string> =
  {
    balanced: "Balanced",
    "chat-focus": "Chat Focus",
    "workspace-focus": "Workspace Focus",
    "visual-focus": "Visual Focus",
  };

export const VIEW_SIZE_PRESETS: Record<
  WorkspaceViewSizePreset,
  { chat: number; workspace: number; label: string }
> = {
  balanced: { chat: 50, workspace: 50, label: VIEW_SIZE_PRESET_LABELS.balanced },
  "chat-focus": {
    chat: 65,
    workspace: 35,
    label: VIEW_SIZE_PRESET_LABELS["chat-focus"],
  },
  "workspace-focus": {
    chat: 35,
    workspace: 65,
    label: VIEW_SIZE_PRESET_LABELS["workspace-focus"],
  },
  "visual-focus": {
    chat: 25,
    workspace: 75,
    label: VIEW_SIZE_PRESET_LABELS["visual-focus"],
  },
};

const ALL_PRESETS: WorkspaceViewSizePreset[] = [
  "balanced",
  "chat-focus",
  "workspace-focus",
  "visual-focus",
];

export function isWorkspaceViewSizePreset(
  value: string | null | undefined,
): value is WorkspaceViewSizePreset {
  return ALL_PRESETS.includes(value as WorkspaceViewSizePreset);
}

/** Smart default per workspace — user saved preference overrides this. */
export function defaultViewSizeForSection(
  section: AppSection | null | undefined,
): WorkspaceViewSizePreset {
  if (!section) return "chat-focus";
  switch (section) {
    case "decision-compass":
    case "brain-dump":
      return "visual-focus";
    case "content-generator":
    case "projects":
      return "workspace-focus";
    case "templates-library":
    case "snippets":
    case "playbook":
      return "balanced";
    default:
      return "balanced";
  }
}

export function resolveEffectiveViewSize(
  section: AppSection | null | undefined,
  savedPreference: WorkspaceViewSizePreset | null,
): WorkspaceViewSizePreset {
  if (savedPreference) return savedPreference;
  return defaultViewSizeForSection(section);
}

export function loadWorkspaceViewSizePreference(): WorkspaceViewSizePreset | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(WORKSPACE_VIEW_SIZE_STORAGE_KEY);
    return isWorkspaceViewSizePreset(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function saveWorkspaceViewSizePreference(
  preset: WorkspaceViewSizePreset,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WORKSPACE_VIEW_SIZE_STORAGE_KEY, preset);
  } catch {
    /* ignore */
  }
}

export function splitLayoutClassName(
  preset: WorkspaceViewSizePreset,
): string {
  return `${SPLIT_LAYOUT_ROOT_CLASS} companion-split--${preset}`;
}

export function splitLayoutStyle(
  preset: WorkspaceViewSizePreset,
): CSSProperties {
  const proportions = VIEW_SIZE_PRESETS[preset];
  return {
    "--companion-chat-flex": String(proportions.chat),
    "--companion-workspace-flex": String(proportions.workspace),
  } as CSSProperties;
}

/** Mobile never uses side-by-side split — tabs or stacked single pane. */
export type MobileSplitLayout = "tabs";

export function mobileSplitLayout(): MobileSplitLayout {
  return "tabs";
}

/** Recommended inner panel width when embedded in split workspace. */
export function splitWorkspacePanelWidth(
  section: AppSection | null | undefined,
): WorkspacePanelWidth {
  switch (section) {
    case "decision-compass":
    case "brain-dump":
    case "templates-library":
    case "saved-work":
    case "my-work":
      return "full";
    default:
      return "full";
  }
}
