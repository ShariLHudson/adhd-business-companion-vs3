/**
 * Trust Sprint #1 — Phase A: single routing executor with inventory + logging.
 * Phase B+ will add governor gates before dispatch; Phase A records every execution.
 */

import type { ActivitySessionState } from "@/components/companion/CompanionActivitiesPanel";
import type { DecisionCompassPrefill } from "./decisionCompass";
import type { WorkspaceOffer } from "@/lib/workspaceMode";
import type { AppSection, SidebarNavId, SidebarToolId } from "./companionUi";
import type { CoachingMode } from "./companionPrompt";
import {
  findRouteInventoryEntry,
  type RouteGovernorPolicy,
} from "./companionRouteInventory";
import type { CreationWorkspaceInput } from "./workspaceCreation";
import type { CreateGenSeed } from "./createSessionStore";
import type { PendingAction } from "./pendingAction";

export type RouteSource =
  | "ui_nav"
  | "ui_click"
  | "chat_turn"
  | "governor"
  | "pending_accept"
  | "active_workflow"
  | "recovery"
  | "founder_action"
  | "internal";

export type RouteRequest =
  | {
      routeId: "workspace.beside_chat";
      source: RouteSource;
      section: AppSection;
      ack?: string;
    }
  | {
      routeId: "workspace.section_beside";
      source: RouteSource;
      section: AppSection;
      nav?: SidebarNavId;
    }
  | {
      routeId: "workspace.nav_direct";
      source: RouteSource;
      section: AppSection;
      nav: SidebarNavId;
    }
  | {
      routeId: "workspace.activity_full";
      source: RouteSource;
      session: ActivitySessionState;
      decisionCompassPrefill?: DecisionCompassPrefill | null;
    }
  | {
      routeId: "workspace.standalone_focus";
      source: RouteSource;
      section: AppSection;
    }
  | {
      routeId: "workspace.focus_audio";
      source: RouteSource;
      categoryId?: string | null;
    }
  | {
      routeId: "tool.select";
      source: RouteSource;
      tool: SidebarToolId;
    }
  | {
      routeId: "nav.select";
      source: RouteSource;
      nav: SidebarNavId;
      coachingMode?: CoachingMode;
    }
  | {
      routeId: "create.open";
      source: RouteSource;
      section: AppSection;
      silent?: boolean;
      itemType?: string;
      /** Phase C: full create payload; Phase A logs only when omitted. */
      logOnly?: boolean;
    }
  | {
      routeId: "pending.execute";
      source: RouteSource;
      pendingKind: PendingAction["kind"];
    }
  | {
      routeId: "workspace.offer_accept";
      source: RouteSource;
      offer: WorkspaceOffer;
    }
  | {
      routeId: "chat.governor_workspace";
      source: RouteSource;
      section: AppSection;
      lane?: string;
    }
  | {
      routeId: "chat.governor_tool";
      source: RouteSource;
      tool: "games";
    };

export type RouteExecutionRecord = {
  id: string;
  ts: string;
  routeId: RouteRequest["routeId"];
  source: RouteSource;
  section?: AppSection;
  metadata: Record<string, string | boolean | null>;
  governorPolicy: RouteGovernorPolicy;
  /** Phase A: always true once dispatched; Phase B: false when governor blocks. */
  dispatched: boolean;
};

export type CompanionRoutingHandlers = {
  handleNavSelect: (nav: SidebarNavId, coachingMode?: CoachingMode) => void;
  openWorkspaceBesideChat: (section: AppSection, ack?: string) => void;
  openSectionBesideChat: (section: AppSection, nav?: SidebarNavId) => void;
  openNavSectionDirect: (section: AppSection, nav: SidebarNavId) => void;
  openActivityFullPage: (
    session: ActivitySessionState,
    options?: { decisionCompassPrefill?: DecisionCompassPrefill | null },
  ) => void;
  openStandaloneFocusSection: (section: AppSection) => void;
  openFocusAudio: (categoryId?: string | null) => void;
  handleToolSelect: (tool: SidebarToolId) => void;
  openCreationWorkspace: (
    section: AppSection,
    input: CreationWorkspaceInput,
    opts?: {
      ackMessage?: string;
      silent?: boolean;
      seedOverride?: CreateGenSeed;
      savedArtifact?: import("./savedArtifact").SavedArtifactRecord | null;
    },
  ) => void;
  executePendingAction: (action: PendingAction) => void;
  acceptWorkspaceOffer: (offer: WorkspaceOffer) => void;
  openGovernorWorkspace: (section: AppSection, lane?: string) => void;
  openGovernorToolGames: () => void;
};

const ROUTE_LOG_MAX = 200;
const routeLog: RouteExecutionRecord[] = [];

let routeSeq = 0;

export type RouteLogSink = (record: RouteExecutionRecord) => void;

let externalLogSink: RouteLogSink | null = null;

/** Test / founder hooks — optional secondary sink (e.g. ecosystem tracker). */
export function setCompanionRouteLogSink(sink: RouteLogSink | null): void {
  externalLogSink = sink;
}

export function getCompanionRouteLog(): readonly RouteExecutionRecord[] {
  return routeLog;
}

export function clearCompanionRouteLog(): void {
  routeLog.length = 0;
}

function pushRouteLog(record: RouteExecutionRecord): void {
  routeLog.push(record);
  if (routeLog.length > ROUTE_LOG_MAX) {
    routeLog.splice(0, routeLog.length - ROUTE_LOG_MAX);
  }
  externalLogSink?.(record);
}

function metadataForRequest(req: RouteRequest): Record<string, string | boolean | null> {
  switch (req.routeId) {
    case "workspace.beside_chat":
      return { section: req.section, ack: req.ack ?? null };
    case "workspace.section_beside":
      return { section: req.section, nav: req.nav ?? null };
    case "workspace.nav_direct":
      return { section: req.section, nav: req.nav };
    case "workspace.activity_full":
      return {
        activityId: req.session.activityId ?? null,
        hasPrefill: req.decisionCompassPrefill != null,
      };
    case "workspace.standalone_focus":
      return { section: req.section };
    case "workspace.focus_audio":
      return { categoryId: req.categoryId ?? null };
    case "tool.select":
      return { tool: req.tool };
    case "nav.select":
      return { nav: req.nav, coachingMode: req.coachingMode ?? null };
    case "create.open":
      return {
        section: req.section,
        silent: req.silent ?? false,
        itemType: req.itemType ?? null,
      };
    case "pending.execute":
      return { pendingKind: req.pendingKind };
    case "workspace.offer_accept":
      return { section: req.offer.section };
    case "chat.governor_workspace":
      return { section: req.section, lane: req.lane ?? null };
    case "chat.governor_tool":
      return { tool: req.tool };
    default:
      return {};
  }
}

function sectionFromRequest(req: RouteRequest): AppSection | undefined {
  switch (req.routeId) {
    case "workspace.beside_chat":
    case "workspace.section_beside":
    case "workspace.nav_direct":
    case "workspace.standalone_focus":
    case "chat.governor_workspace":
    case "create.open":
      return req.section;
    case "workspace.offer_accept":
      return req.offer.section;
    case "workspace.focus_audio":
      return "focus-audio";
    default:
      return undefined;
  }
}

export function buildRouteExecutionRecord(
  req: RouteRequest,
  dispatched: boolean,
): RouteExecutionRecord {
  const inventory = findRouteInventoryEntry(req.routeId);
  return {
    id: `route-${++routeSeq}`,
    ts: new Date().toISOString(),
    routeId: req.routeId,
    source: req.source,
    section: sectionFromRequest(req),
    metadata: metadataForRequest(req),
    governorPolicy: inventory?.governorPolicy ?? "not_wired",
    dispatched,
  };
}

/** Log only — used when inventory entry is not yet dispatched through executor. */
export function recordCompanionRoute(
  req: RouteRequest,
  dispatched = false,
): RouteExecutionRecord {
  const record = buildRouteExecutionRecord(req, dispatched);
  pushRouteLog(record);
  return record;
}

function dispatchRoute(
  req: RouteRequest,
  handlers: CompanionRoutingHandlers,
  pendingAction?: PendingAction,
): void {
  switch (req.routeId) {
    case "workspace.beside_chat":
      handlers.openWorkspaceBesideChat(req.section, req.ack);
      return;
    case "workspace.section_beside":
      handlers.openSectionBesideChat(req.section, req.nav);
      return;
    case "workspace.nav_direct":
      handlers.openNavSectionDirect(req.section, req.nav);
      return;
    case "workspace.activity_full":
      handlers.openActivityFullPage(req.session, {
        decisionCompassPrefill: req.decisionCompassPrefill,
      });
      return;
    case "workspace.standalone_focus":
      handlers.openStandaloneFocusSection(req.section);
      return;
    case "workspace.focus_audio":
      handlers.openFocusAudio(req.categoryId);
      return;
    case "tool.select":
      handlers.handleToolSelect(req.tool);
      return;
    case "nav.select":
      handlers.handleNavSelect(req.nav, req.coachingMode);
      return;
    case "create.open":
      // Phase C: create.open is audited here; panel open runs in requestCreateOpen only.
      return;
    case "pending.execute":
      if (!pendingAction) {
        throw new Error("pending.execute requires pendingAction");
      }
      handlers.executePendingAction(pendingAction);
      return;
    case "workspace.offer_accept":
      handlers.acceptWorkspaceOffer(req.offer);
      return;
    case "chat.governor_workspace":
      handlers.openGovernorWorkspace(req.section, req.lane);
      return;
    case "chat.governor_tool":
      handlers.openGovernorToolGames();
      return;
    default: {
      const _exhaustive: never = req;
      void _exhaustive;
    }
  }
}

export type CompanionRoutingExecutor = {
  execute: (req: RouteRequest, pendingAction?: PendingAction) => RouteExecutionRecord;
  getLog: () => readonly RouteExecutionRecord[];
  clearLog: () => void;
};

export function createCompanionRoutingExecutor(
  getHandlers: () => CompanionRoutingHandlers,
): CompanionRoutingExecutor {
  return {
    execute(req, pendingAction) {
      const logOnly = req.routeId === "create.open" && req.logOnly;
      const record = buildRouteExecutionRecord(req, !logOnly);
      pushRouteLog(record);
      if (!logOnly) {
        dispatchRoute(req, getHandlers(), pendingAction);
      }
      return record;
    },
    getLog: getCompanionRouteLog,
    clearLog: clearCompanionRouteLog,
  };
}
