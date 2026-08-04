import { describe, expect, it } from "vitest";
import { buildRegistryArtifactOfferLine } from "./artifactRegistry";
import { createTitleLabelForType } from "./createTitleLabels";
import { resolveFrictionlessAction } from "./frictionlessActionLayer";
import { resolveIntentRouting } from "./intentRoutingIntelligence";
import {
  applyWorkspaceOpenSuppression,
  buildWorkspaceContinuationLine,
  isTargetWorkspaceOpen,
} from "./workspaceContinuity";
import { tryWorkspaceLocalReply, buildWorkspaceContext } from "./workspaceAwareness";

describe("workspaceContinuity", () => {
  it("detects when target workspace is already open", () => {
    expect(isTargetWorkspaceOpen("content-generator", "content-generator")).toBe(
      true,
    );
    expect(isTargetWorkspaceOpen("projects", "content-generator")).toBe(false);
  });

  it("returns continuation copy instead of open prompts when already in Create", () => {
    const line = buildWorkspaceContinuationLine(
      "content-generator",
      "Help me write an introduction",
    );
    expect(line).toMatch(/already open/i);
    expect(line).not.toMatch(/open Create/i);
  });

  it("suppresses workspace offers in intent routing when panel is open", () => {
    const routing = resolveIntentRouting({
      userText: "Help me draft an email",
      workspace: "content-generator",
    });
    const suppressed = applyWorkspaceOpenSuppression(
      routing,
      "content-generator",
    );
    expect(suppressed.workspaceOffer).toBeNull();
    expect(suppressed.navigationLine).toMatch(/already in Create|already open/i);
  });

  it("artifact offer line is workspace-aware", () => {
    const open = buildRegistryArtifactOfferLine("email", "build", {
      alreadyOpen: true,
    });
    expect(open).toMatch(/already in Create/i);
    expect(open).not.toMatch(/Would you like to open/i);
  });
});

describe("P0.42 spreadsheet routing", () => {
  it("routes content calendar to Create", () => {
    const decision = resolveFrictionlessAction({
      userText: "Help me create a content calendar",
      currentTurn: 1,
    });
    expect(decision.category).toBe("direct_action");
    expect(decision.workspaceOffer?.section).toBe("content-generator");
    expect(decision.localReply).toMatch(/Create/i);
    expect(decision.localReply).not.toMatch(/Settings|Connections/i);
  });

  it("continues in Create when spreadsheet request and Create is open", () => {
    const decision = resolveFrictionlessAction({
      userText: "Help me make a Google spreadsheet",
      currentTurn: 1,
      workspace: "content-generator",
    });
    expect(decision.workspaceOffer).toBeNull();
    expect(decision.localReply).toMatch(/already in Create/i);
  });
});

describe("createTitleLabels", () => {
  it("maps artifact types to title field labels", () => {
    expect(createTitleLabelForType("Workbook")).toBe("Workbook Title");
    expect(createTitleLabelForType("Spreadsheet")).toBe("Spreadsheet Name");
    expect(createTitleLabelForType("SOP")).toBe("Process Name");
  });
});

describe("tryWorkspaceLocalReply in Create", () => {
  it("continues writing help without offering to open Create", () => {
    const ctx = buildWorkspaceContext("content-generator", null)!;
    const reply = tryWorkspaceLocalReply(
      ctx,
      "Help me write an introduction",
      "medium",
    );
    expect(reply).toMatch(/already open/i);
    expect(reply).not.toMatch(/open Create/i);
  });
});
