import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  evaluateCompanionTurn,
  governorAuthorizedChatTurnOpen,
  governorBlocksChatTurnAutoOpen,
  governorAllowsPreChatWorkspaceOpen,
} from "./companionGovernor";
import { resolveIntent } from "./intentStabilizer";
import { detectDoingIntent } from "./workspaceMode";
import { shouldAutoOpenWorkspaceFromIntent } from "./companionAutoLaunch";
import { detectStandaloneToolRequest } from "./standaloneToolRouting";
import * as createSessionStore from "./createSessionStore";
import type { WorkspaceOpenSnapshot } from "./workspaceExecution";

const SNAP: WorkspaceOpenSnapshot = {
  panel: null,
  activeSection: "home",
  revealSeq: 0,
};

function gov(text: string, lastAssistant = "") {
  return evaluateCompanionTurn({
    userText: text,
    lastAssistantText: lastAssistant,
    workspacePanel: null,
    workspaceSnap: SNAP,
    resolvedIntent: resolveIntent(text),
  });
}

describe("companionGovernorRouting — Phase B", () => {
  beforeEach(() => {
    vi.spyOn(createSessionStore, "hasActiveCreateSession").mockReturnValue(false);
  });

  it("1 — Facebook post ideas → chat_only blocks auto-open", () => {
    const s = gov("I need ideas for a Facebook post");
    expect(s.outcome).toBe("chat_only");
    expect(governorBlocksChatTurnAutoOpen(s)).toBe(true);
    expect(governorAuthorizedChatTurnOpen(s)).toBe(false);
    expect(detectDoingIntent("I need ideas for a Facebook post")).toBeNull();
  });

  it("2 — I like idea 3 → chat_only", () => {
    const s = gov("I like idea #3");
    expect(s.outcome).toBe("chat_only");
    expect(governorBlocksChatTurnAutoOpen(s)).toBe(true);
  });

  it("3 — I am stressed → chat_only; standalone tools blocked", () => {
    const s = gov("I am stressed and can't handle this");
    expect(s.outcome).toBe("chat_only");
    expect(governorBlocksChatTurnAutoOpen(s)).toBe(true);
    expect(detectStandaloneToolRequest("I am stressed")).toBeNull();
  });

  it("4 — I need to make a decision → chat_only, no doing intent", () => {
    const s = gov("I need to make a decision");
    expect(s.outcome).toBe("chat_only");
    expect(governorBlocksChatTurnAutoOpen(s)).toBe(true);
    expect(detectDoingIntent("I need to make a decision")).toBeNull();
  });

  it("5 — open create → chat_only; UI buttons open workspaces", () => {
    const s = gov("open create");
    expect(s.outcome).toBe("chat_only");
    expect(governorAuthorizedChatTurnOpen(s)).toBe(false);
    expect(governorBlocksChatTurnAutoOpen(s)).toBe(true);
    expect(
      governorAllowsPreChatWorkspaceOpen(s, "content-generator"),
    ).toBe(false);
  });

  it("6 — Open Momentum Games → chat_only", () => {
    const s = gov("Open Momentum Games");
    expect(s.outcome).toBe("chat_only");
    expect(governorAuthorizedChatTurnOpen(s)).toBe(false);
    expect(governorBlocksChatTurnAutoOpen(s)).toBe(true);
  });

  it("7 — chat_only blocks shouldAutoOpenWorkspaceFromIntent", () => {
    const s = gov("I need to clear my mind");
    expect(governorBlocksChatTurnAutoOpen(s)).toBe(true);
    expect(
      shouldAutoOpenWorkspaceFromIntent("I need to clear my mind", {
        section: "brain-dump",
        buttonLabel: "Clear My Mind",
        line: "",
      }),
    ).toBe(false);
  });

  it("8 — chat never authorizes workspace_open from text", () => {
    const blocked = gov("I need ideas for a Facebook post");
    const explicit = gov("open create");
    expect(governorBlocksChatTurnAutoOpen(blocked)).toBe(true);
    expect(governorAuthorizedChatTurnOpen(explicit)).toBe(false);
    expect(governorAllowsPreChatWorkspaceOpen(blocked, "content-generator")).toBe(
      false,
    );
  });
});
