import { describe, expect, it } from "vitest";
import {
  isExplicitTemplateCreateOpen,
  isTemplateDiscoveryRequest,
} from "./templateIntent";
import { evaluateCompanionTurn } from "./companionGovernor";
import { resolveIntent } from "./intentStabilizer";
import type { WorkspaceOpenSnapshot } from "./workspaceExecution";

const SNAP: WorkspaceOpenSnapshot = {
  panel: null,
  activeSection: "home",
  revealSeq: 0,
};

describe("templateIntent", () => {
  it("detects template discovery requests", () => {
    expect(isTemplateDiscoveryRequest("I need a template for a sales email")).toBe(
      true,
    );
    expect(isTemplateDiscoveryRequest("open the templates")).toBe(false);
  });

  it("detects explicit open Create for template", () => {
    expect(isExplicitTemplateCreateOpen("Open Create for this template")).toBe(
      true,
    );
  });
});

describe("companionGovernor — template chat-first", () => {
  it("I need a template for a sales email → chat_only", () => {
    const text = "I need a template for a sales email";
    const surface = evaluateCompanionTurn({
      userText: text,
      lastAssistantText: "",
      workspacePanel: null,
      workspaceSnap: SNAP,
      resolvedIntent: resolveIntent(text),
    });
    expect(surface.outcome).toBe("chat_only");
    expect(surface.suppressWorkspaceRouting).toBe(true);
    expect(surface.lane).toBe("templates");
    expect(surface.promptHints.join(" ")).toMatch(/TEMPLATE CONVERSATION FIRST/i);
  });
});
