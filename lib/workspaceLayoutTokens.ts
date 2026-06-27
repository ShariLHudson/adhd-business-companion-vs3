// Shared workspace layout tokens — one system for panel width, padding, and gaps.
// Panels inside split view keep the same max-width as standalone panels so content
// stays readable and information-dense (standard = max-w-2xl).

export type WorkspacePanelWidth = "narrow" | "standard" | "wide" | "full";

/** Max content width when a panel is not inside the split workspace pane. */
export const WORKSPACE_MAX_WIDTH_CLASS: Record<
  Exclude<WorkspacePanelWidth, "full">,
  string
> = {
  narrow: "max-w-xl",
  standard: "max-w-2xl",
  wide: "max-w-3xl",
};

export const WORKSPACE_PANEL_PADDING_CLASS = "px-6 py-8";
export const WORKSPACE_PANEL_PADDING_COMPACT_CLASS = "px-4 py-5";
export const WORKSPACE_CARD_GAP_CLASS = "gap-3";
export const WORKSPACE_SECTION_GAP_CLASS = "gap-6";
export const WORKSPACE_HEADER_MIN_HEIGHT_CLASS = "min-h-14";
export const WORKSPACE_SLIDE_PANEL_WIDTH_CLASS = "max-w-xl";
/** Shared frosted surface — prefer CompanionWorkspaceShell for homestead workspaces */
export const WORKSPACE_FULL_PAGE_SURFACE_CLASS =
  "companion-panel-surface mx-auto min-h-full w-full max-w-3xl rounded-3xl bg-white/80 shadow-sm backdrop-blur-sm";

/** Clear My Mind and future homestead workspaces — room stays visible */
export const COMPANION_HOMESTEAD_WORKSPACE_PAGE_CLASS = "companion-workspace-page-outer";

/** CSS class roots for split-pane flex proportions (see companion.css). */
export const SPLIT_LAYOUT_ROOT_CLASS = "companion-split-layout";
export const SPLIT_CHAT_PANE_CLASS = "companion-split-chat-pane";
export const SPLIT_WORKSPACE_PANE_CLASS = "companion-split-workspace-pane";

export function workspacePanelShellClass(options?: {
  width?: WorkspacePanelWidth;
  /** @deprecated Split panes use the same width tokens; kept for call-site compatibility. */
  inSplit?: boolean;
  compact?: boolean;
  extra?: string;
}): string {
  const {
    width = "standard",
    compact = false,
    extra = "",
  } = options ?? {};
  const padding = compact
    ? WORKSPACE_PANEL_PADDING_COMPACT_CLASS
    : WORKSPACE_PANEL_PADDING_CLASS;
  const widthClass =
    width === "full"
      ? "w-full max-w-none"
      : WORKSPACE_MAX_WIDTH_CLASS[width];
  return [
    "companion-fade-in mx-auto flex h-full min-h-0 flex-col",
    widthClass,
    padding,
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}
