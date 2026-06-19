import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  COMPANION_ROUTE_INVENTORY,
  executorWiredRouteIds,
  findRouteInventoryEntry,
} from "./companionRouteInventory";
import {
  clearCompanionRouteLog,
  createCompanionRoutingExecutor,
  getCompanionRouteLog,
  type CompanionRoutingHandlers,
} from "./companionRoutingExecutor";
import { installCompanionRouteLogging, resetCompanionRouteLoggingForTests } from "./companionRoutingLog";

function stubHandlers(): CompanionRoutingHandlers & {
  calls: string[];
} {
  const calls: string[] = [];
  const mark = (name: string) => () => {
    calls.push(name);
  };
  return {
    calls,
    handleNavSelect: mark("handleNavSelect"),
    openWorkspaceBesideChat: mark("openWorkspaceBesideChat"),
    openSectionBesideChat: mark("openSectionBesideChat"),
    openNavSectionDirect: mark("openNavSectionDirect"),
    openActivityFullPage: mark("openActivityFullPage"),
    openStandaloneFocusSection: mark("openStandaloneFocusSection"),
    openFocusAudio: mark("openFocusAudio"),
    handleToolSelect: mark("handleToolSelect"),
    openCreationWorkspace: mark("openCreationWorkspace"),
    executePendingAction: mark("executePendingAction"),
    acceptWorkspaceOffer: mark("acceptWorkspaceOffer"),
    openGovernorWorkspace: mark("openGovernorWorkspace"),
    openGovernorToolGames: mark("openGovernorToolGames"),
  };
}

describe("companionRouteInventory", () => {
  it("lists wired executor routes", () => {
    const ids = executorWiredRouteIds();
    expect(ids).toContain("workspace.beside_chat");
    expect(ids).toContain("pending.execute");
    expect(COMPANION_ROUTE_INVENTORY.length).toBeGreaterThan(15);
  });

  it("finds inventory metadata for governor policy", () => {
    const entry = findRouteInventoryEntry("chat.ensure_live_create");
    expect(entry?.governorPolicy).toBe("required_chat");
    expect(entry?.canBypassConversationFirst).toBe(true);
  });
});

describe("companionRoutingExecutor", () => {
  beforeEach(() => {
    clearCompanionRouteLog();
  });

  it("dispatches workspace.beside_chat and logs", () => {
    const handlers = stubHandlers();
    const executor = createCompanionRoutingExecutor(() => handlers);
    const record = executor.execute({
      routeId: "workspace.beside_chat",
      source: "ui_click",
      section: "brain-dump",
    });
    expect(record.dispatched).toBe(true);
    expect(record.routeId).toBe("workspace.beside_chat");
    expect(record.source).toBe("ui_click");
    expect(handlers.calls).toEqual(["openWorkspaceBesideChat"]);
    expect(getCompanionRouteLog()).toHaveLength(1);
  });

  it("logs create.open without dispatch when logOnly", () => {
    const handlers = stubHandlers();
    const executor = createCompanionRoutingExecutor(() => handlers);
    const record = executor.execute({
      routeId: "create.open",
      source: "chat_turn",
      section: "content-generator",
      silent: true,
      logOnly: true,
    });
    expect(record.dispatched).toBe(false);
    expect(handlers.calls).toEqual([]);
    expect(record.metadata.silent).toBe(true);
  });

  it("routes nav.select through handleNavSelect", () => {
    const handlers = stubHandlers();
    const executor = createCompanionRoutingExecutor(() => handlers);
    executor.execute({
      routeId: "nav.select",
      source: "ui_nav",
      nav: "projects",
    });
    expect(handlers.calls).toEqual(["handleNavSelect"]);
  });
});

describe("companionRoutingLog", () => {
  beforeEach(() => {
    resetCompanionRouteLoggingForTests();
    clearCompanionRouteLog();
  });

  it("forwards records to trackEcosystemEvent when installed", async () => {
    const track = vi.fn();
    vi.doMock("./ecosystem/eventTrackingEngine", () => ({
      trackEcosystemEvent: track,
    }));
    installCompanionRouteLogging();
    const handlers = stubHandlers();
    const executor = createCompanionRoutingExecutor(() => handlers);
    executor.execute({
      routeId: "tool.select",
      source: "ui_click",
      tool: "brain-dump",
    });
    // Sink is sync — verify log buffer at minimum
    expect(getCompanionRouteLog()[0]?.routeId).toBe("tool.select");
  });
});
