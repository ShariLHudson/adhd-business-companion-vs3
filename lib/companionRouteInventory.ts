/**
 * Trust Sprint #1 — Phase A: authoritative inventory of companion routing paths.
 * Each entry documents who may open what and whether governor consent is required (target state).
 */

import type { AppSection } from "./companionUi";

export type RouteGovernorPolicy =
  | "required_chat"
  | "required_pending"
  | "ui_explicit"
  | "active_workflow"
  | "not_wired";

export type RouteInventoryEntry = {
  id: string;
  label: string;
  description: string;
  /** Primary implementation surface today. */
  implementation: string;
  /** What typically opens. */
  opens: string;
  governorPolicy: RouteGovernorPolicy;
  /** Can bypass conversation-first when triggered from chat. */
  canBypassConversationFirst: boolean;
  /** Wired through companionRoutingExecutor in Phase A+. */
  executorRouteId?: string;
  sections?: AppSection[];
};

/** Full route catalog — source of truth for audits and executor routeId union. */
export const COMPANION_ROUTE_INVENTORY: RouteInventoryEntry[] = [
  {
    id: "workspace.beside_chat",
    label: "Open workspace beside chat",
    description: "Split view: patch workspace panel, ack in chat.",
    implementation: "page.tsx → openWorkspaceBesideChat",
    opens: "Any split workspace section",
    governorPolicy: "required_chat",
    canBypassConversationFirst: true,
    executorRouteId: "workspace.beside_chat",
  },
  {
    id: "workspace.section_beside",
    label: "Menu / panel open beside chat",
    description: "Sidebar or in-panel navigation; may bootstrap Create builder.",
    implementation: "page.tsx → openSectionBesideChat",
    opens: "Split workspace sections",
    governorPolicy: "ui_explicit",
    canBypassConversationFirst: false,
    executorRouteId: "workspace.section_beside",
  },
  {
    id: "workspace.nav_direct",
    label: "Full-page section from nav",
    description: "Non-split sections (legacy full-page nav).",
    implementation: "page.tsx → openNavSectionDirect",
    opens: "Full-page AppSection",
    governorPolicy: "ui_explicit",
    canBypassConversationFirst: false,
    executorRouteId: "workspace.nav_direct",
  },
  {
    id: "workspace.activity_full",
    label: "Help Me Right Now activity",
    description: "Full-page activity; clears split workspace.",
    implementation: "page.tsx → openActivityFullPage",
    opens: "activities / guided-exercises / decision-compass",
    governorPolicy: "ui_explicit",
    canBypassConversationFirst: false,
    executorRouteId: "workspace.activity_full",
  },
  {
    id: "workspace.standalone_focus",
    label: "Standalone focus tool",
    description: "Timer, breathe, games, spin wheel — full page.",
    implementation: "page.tsx → openStandaloneFocusSection",
    opens: "STANDALONE_SECTIONS",
    governorPolicy: "ui_explicit",
    canBypassConversationFirst: false,
    executorRouteId: "workspace.standalone_focus",
  },
  {
    id: "workspace.focus_audio",
    label: "Focus audio",
    description: "Opens focus-audio full page with optional category.",
    implementation: "page.tsx → openFocusAudio",
    opens: "focus-audio",
    governorPolicy: "required_chat",
    canBypassConversationFirst: true,
    executorRouteId: "workspace.focus_audio",
  },
  {
    id: "tool.select",
    label: "Focus hub tool",
    description: "Sidebar focus tools menu.",
    implementation: "page.tsx → handleToolSelect",
    opens: "brain-dump, time-block, timer, etc.",
    governorPolicy: "ui_explicit",
    canBypassConversationFirst: false,
    executorRouteId: "tool.select",
  },
  {
    id: "nav.select",
    label: "Primary sidebar nav",
    description: "Chat / Focus / Create / More navigation.",
    implementation: "page.tsx → handleNavSelect",
    opens: "Varies by SidebarNavId",
    governorPolicy: "ui_explicit",
    canBypassConversationFirst: false,
    executorRouteId: "nav.select",
  },
  {
    id: "create.open",
    label: "Open Create workspace",
    description: "Creation workspace with optional silent boot.",
    implementation: "page.tsx → openCreationWorkspace",
    opens: "content-generator",
    governorPolicy: "required_chat",
    canBypassConversationFirst: true,
    executorRouteId: "create.open",
    sections: ["content-generator"],
  },
  {
    id: "pending.execute",
    label: "Pending action accept",
    description: "User tap or auto-launch from chat yes/accept.",
    implementation: "page.tsx → executePendingAction",
    opens: "Pending offer target",
    governorPolicy: "required_pending",
    canBypassConversationFirst: true,
    executorRouteId: "pending.execute",
  },
  {
    id: "workspace.offer_accept",
    label: "Accept workspace offer card",
    description: "Workspace offer chip below chat.",
    implementation: "page.tsx → acceptWorkspaceOffer",
    opens: "Offer section",
    governorPolicy: "required_pending",
    canBypassConversationFirst: true,
    executorRouteId: "workspace.offer_accept",
  },
  {
    id: "chat.governor_workspace",
    label: "Governor workspace_open",
    description: "handleSend after evaluateCompanionTurn outcome.",
    implementation: "page.tsx → handleSend",
    opens: "turnSurface.targetSection",
    governorPolicy: "required_chat",
    canBypassConversationFirst: false,
    executorRouteId: "chat.governor_workspace",
  },
  {
    id: "chat.governor_tool",
    label: "Governor tool_open",
    description: "handleSend games / explicit tool.",
    implementation: "page.tsx → handleSend",
    opens: "games",
    governorPolicy: "required_chat",
    canBypassConversationFirst: false,
    executorRouteId: "chat.governor_tool",
  },
  {
    id: "chat.intent_make",
    label: "Intent stabilizer make/edit",
    description: "Pre-commit openCreateFromIntent / openAssetRoute.",
    implementation: "page.tsx → handleSend",
    opens: "Create / catalog section",
    governorPolicy: "required_chat",
    canBypassConversationFirst: true,
  },
  {
    id: "chat.ensure_live_create",
    label: "Silent live Create",
    description: "ensureLiveCreateBesideChat catalog match.",
    implementation: "page.tsx → ensureLiveCreateBesideChat",
    opens: "content-generator silent",
    governorPolicy: "required_chat",
    canBypassConversationFirst: true,
    sections: ["content-generator"],
  },
  {
    id: "chat.detect_open_section",
    label: "Duplicate detectOpenSectionRequest",
    description: "Second-chance explicit open in handleSend.",
    implementation: "page.tsx → handleSend",
    opens: "Explicit section",
    governorPolicy: "required_chat",
    canBypassConversationFirst: true,
  },
  {
    id: "chat.workspace_action",
    label: "classifyWorkspaceIntent workspaceAction",
    description: "Auto acceptWorkspaceOffer without card.",
    implementation: "page.tsx → handleSend",
    opens: "projects / create",
    governorPolicy: "required_chat",
    canBypassConversationFirst: true,
  },
  {
    id: "chat.bare_yes",
    label: "Broad isActionAcceptance",
    description: "Yes without pending context → doItNow / assisted.",
    implementation: "page.tsx → handleSend",
    opens: "Varies",
    governorPolicy: "required_pending",
    canBypassConversationFirst: true,
  },
  {
    id: "founder.action_open",
    label: "Founder action board",
    description: "executeFounderAction → openSection.",
    implementation: "page.tsx → openFounderActionWorkspace",
    opens: "FounderAction.workspace",
    governorPolicy: "ui_explicit",
    canBypassConversationFirst: false,
  },
];

export function getRouteInventory(): readonly RouteInventoryEntry[] {
  return COMPANION_ROUTE_INVENTORY;
}

export function findRouteInventoryEntry(
  id: string,
): RouteInventoryEntry | undefined {
  return COMPANION_ROUTE_INVENTORY.find((e) => e.id === id);
}

export function executorWiredRouteIds(): string[] {
  return COMPANION_ROUTE_INVENTORY.filter((e) => e.executorRouteId).map(
    (e) => e.executorRouteId!,
  );
}
