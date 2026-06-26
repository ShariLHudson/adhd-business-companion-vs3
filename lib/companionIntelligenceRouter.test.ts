import { describe, expect, it } from "vitest";
import {
  buildCompanionTurnIntelligence,
  resolveCompanionAcceptanceTurn,
  trackConversationOffer,
} from "./companionIntelligenceRouter";
import { resolveCompanionIntelligence } from "./companionConstitution";
import { createPendingAcceptanceRecord } from "./pendingAcceptanceAuthority";
import { resolvePendingAction } from "./pendingAction";
import type { WorkspaceOffer } from "./workspaceMode";

describe("companionIntelligenceRouter", () => {
  it("delegates orchestration to Companion Intelligence conductor", () => {
    const turn = buildCompanionTurnIntelligence({
      messages: [{ role: "user", content: "I feel stuck on my launch" }],
      userText: "I feel stuck on my launch",
      lastAssistantText: "",
      userState: {
        emotionalState: "stuck",
        obstacle: null,
        somatic: false,
      },
      workspaceOpen: false,
      activeSection: "home",
    });

    const expected = resolveCompanionIntelligence({
      conversation: turn.conversation,
      emotionalState: "stuck",
      overwhelmed: false,
      userText: "I feel stuck on my launch",
      activeSection: "home",
      workspaceId: undefined,
    });

    expect(turn.orchestration.activeIntelligences).toEqual(
      expected.activeIntelligences,
    );
    expect(turn.orchestration.dataAttributes["data-companion-intelligence"]).toBe(
      "1",
    );
    expect(turn.conversation.dataAttributes["data-conversation-intelligence"]).toBe(
      "1",
    );
  });

  it("builds intelligence with business gate for revenue advice when profile is thin", () => {
    const turn = buildCompanionTurnIntelligence({
      messages: [
        { role: "user", content: "How can I grow revenue from my coaching offer?" },
      ],
      userText: "How can I grow revenue from my coaching offer?",
      lastAssistantText: "",
      userState: {
        emotionalState: "unclear",
        obstacle: null,
        somatic: false,
      },
      workspaceOpen: false,
      checkBusinessAdvice: true,
    });
    expect(turn.intelligence.problemType).toBe("business_growth");
    expect(turn.businessConfidence).toBeDefined();
  });

  it("includes decision intelligence for product expansion", () => {
    const turn = buildCompanionTurnIntelligence({
      messages: [
        { role: "user", content: "I want to add a new product line to my business" },
      ],
      userText: "I want to add a new product line to my business",
      lastAssistantText: "",
      userState: {
        emotionalState: "unclear",
        obstacle: null,
        somatic: false,
      },
      workspaceOpen: false,
    });
    expect(turn.decisionIntelligence?.situation.decisionType).toBe(
      "business_expansion",
    );
    expect(turn.decisionIntelligence?.experienceMode).toBe("discovery");
    expect(turn.decisionIntelligenceHint).toMatch(/COMPANION DECISION INTELLIGENCE/i);
  });

  it("continues project workflow before generic acceptance reply", () => {
    const assistant =
      "Would you like to list those projects so we can start sorting through them together?";
    const result = resolveCompanionAcceptanceTurn({
      userText: "sure",
      lastAssistantText: assistant,
      currentTurn: 3,
      workflow: null,
      pendingInput: {
        workspacePanel: null,
        record: null,
        pendingAction: null,
        createConsent: null,
      },
    });
    expect(result.kind).toBe("workflow");
    if (result.kind === "workflow") {
      expect(result.continuation.action).toBe("reply");
      expect(result.continuation.message).toMatch(/projects you're considering/i);
    }
  });

  it("opens snippets workspace from companion-first acceptance", () => {
    const offer: WorkspaceOffer = {
      section: "snippets",
      buttonLabel: "Open Snippets",
      line: "Want me to open **Snippets** beside us so we can do it together?",
    };
    const pending = resolvePendingAction({
      workspaceOffer: offer,
      artifactExportOffer: null,
      assistedActionOffer: null,
      doItNowOffer: null,
      toolSuggestion: null,
      actionBridge: null,
      bridge: null,
    });
    const record = createPendingAcceptanceRecord(
      "workspace",
      offer.line,
      2,
      null,
    );
    const result = resolveCompanionAcceptanceTurn({
      userText: "yes",
      lastAssistantText: offer.line,
      currentTurn: 3,
      workflow: null,
      pendingInput: {
        workspacePanel: null,
        record,
        pendingAction: pending,
        createConsent: null,
      },
    });
    expect(result.kind).toBe("workflow");
    if (result.kind === "workflow") {
      expect(result.continuation.action).toBe("open_section");
      if (result.continuation.action === "open_section") {
        expect(result.continuation.section).toBe("snippets");
      }
    }
  });

  it("tracks workflow from companion-first offer lines", () => {
    const line =
      "Want me to open **Snippets** beside us so we can do it together?";
    const { workflow } = trackConversationOffer({
      offerLine: line,
      offeredAtTurn: 2,
      workspaceOffer: {
        section: "snippets",
        buttonLabel: "Open Snippets",
        line,
      },
    });
    expect(workflow?.kind).toBe("open_workspace");
    if (workflow?.kind === "open_workspace") {
      expect(workflow.targetSection).toBe("snippets");
    }
  });
});
