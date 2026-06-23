import { describe, expect, it } from "vitest";
import type { WorkspaceOffer } from "./workspaceMode";
import {
  acceptanceAckForWorkspace,
  createPendingAcceptanceRecord,
  isBareGenericAcceptance,
  isPendingAcceptanceExpired,
  PENDING_ACCEPTANCE_TURN_LIMIT,
  resolvePendingAcceptance,
  topicChangeInvalidatesOffer,
} from "./pendingAcceptanceAuthority";
import { resolvePendingAction } from "./pendingAction";
import { ACCEPTANCE_PATH_AUDIT } from "./pendingAcceptanceAudit";

const workspaceOffer: WorkspaceOffer = {
  section: "content-generator",
  buttonLabel: "Open Create",
  line: "I can open Create for that.",
};

function workspacePending() {
  return resolvePendingAction({
    workspaceOffer,
    artifactExportOffer: null,
    assistedActionOffer: null,
    doItNowOffer: null,
    toolSuggestion: null,
    actionBridge: null,
    bridge: null,
  })!;
}

describe("pendingAcceptanceAuthority", () => {
  it('"yes" with no pending action returns conversation only', () => {
    const result = resolvePendingAcceptance({
      userText: "yes",
      lastAssistantText: "",
      currentTurn: 5,
      workspacePanel: null,
      record: null,
      pendingAction: null,
      createConsent: null,
    });
    expect(result.outcome).toBe("conversation");
    if (result.outcome === "conversation") {
      expect(result.message).not.toMatch(/what would you like help with next/i);
      expect(result.message).toMatch(/still here|next step|next piece/i);
    }
  });

  it('"sure" with no pending action returns conversation only', () => {
    const result = resolvePendingAcceptance({
      userText: "sure",
      lastAssistantText: "Here are some ideas.",
      currentTurn: 3,
      workspacePanel: null,
      record: null,
      pendingAction: null,
      createConsent: null,
    });
    expect(result.outcome).toBe("conversation");
  });

  it("expired offer + yes does nothing actionable", () => {
    const record = createPendingAcceptanceRecord(
      "workspace",
      workspaceOffer.line,
      1,
      null,
    );
    const result = resolvePendingAcceptance({
      userText: "yes",
      lastAssistantText: workspaceOffer.line,
      currentTurn: 1 + PENDING_ACCEPTANCE_TURN_LIMIT + 1,
      workspacePanel: null,
      record,
      pendingAction: workspacePending(),
      createConsent: null,
    });
    expect(result.outcome).toBe("expired");
  });

  it("valid Create consent + yes accepts", () => {
    const record = createPendingAcceptanceRecord(
      "create_consent",
      "I can open Create for that.",
      4,
      null,
    );
    const createConsent = {
      source: "ensure_live_create" as const,
      section: "content-generator" as const,
      input: {
        itemType: "Newsletter",
        title: "Newsletter",
        brief: "",
        stage: "editing draft",
        source: "generated" as const,
      },
    };
    const result = resolvePendingAcceptance({
      userText: "yes",
      lastAssistantText: "I can open Create for that.",
      currentTurn: 5,
      workspacePanel: null,
      record,
      pendingAction: null,
      createConsent,
    });
    expect(result.outcome).toBe("accept");
    if (result.outcome === "accept") {
      expect(result.kind).toBe("create_consent");
      expect(result.ack).toMatch(/opening create/i);
    }
  });

  it("valid draft switch + yes accepts", () => {
    const record = createPendingAcceptanceRecord(
      "draft_switch",
      "Continue your LinkedIn post?",
      2,
      "content-generator",
    );
    const result = resolvePendingAcceptance({
      userText: "yes",
      lastAssistantText: record.offerSummary,
      currentTurn: 3,
      workspacePanel: "content-generator",
      record,
      pendingAction: null,
      createConsent: {
        source: "chat",
        section: "content-generator",
        input: {
          itemType: "LinkedIn Post",
          title: "Post",
          brief: "",
          stage: "editing draft",
          source: "generated",
        },
      },
    });
    expect(result.outcome).toBe("accept");
    if (result.outcome === "accept") {
      expect(result.kind).toBe("draft_switch");
      expect(result.ack).toMatch(/draft/i);
    }
  });

  it("valid workspace offer + yes accepts", () => {
    const record = createPendingAcceptanceRecord(
      "workspace",
      workspaceOffer.line,
      7,
      null,
    );
    const result = resolvePendingAcceptance({
      userText: "yes",
      lastAssistantText: workspaceOffer.line,
      currentTurn: 8,
      workspacePanel: null,
      record,
      pendingAction: workspacePending(),
      createConsent: null,
    });
    expect(result.outcome).toBe("accept");
    if (result.outcome === "accept") {
      expect(result.ack).toBe(acceptanceAckForWorkspace("content-generator"));
    }
  });

  it("topic change invalidates offer", () => {
    const record = createPendingAcceptanceRecord(
      "workspace",
      "I can open Create for that newsletter.",
      1,
      null,
    );
    expect(
      topicChangeInvalidatesOffer(
        "Actually let's talk about my pricing strategy instead",
        record,
      ),
    ).toBe(true);
  });

  it("workspace change invalidates offer", () => {
    const record = createPendingAcceptanceRecord(
      "workspace",
      "Open Projects?",
      3,
      "projects",
    );
    expect(
      isPendingAcceptanceExpired(record, {
        currentTurn: 4,
        workspacePanel: "content-generator",
      }),
    ).toBe(true);
  });

  it("replaced offer invalidates previous via new record turn", () => {
    const old = createPendingAcceptanceRecord("workspace", "Open Create?", 1, null);
    const fresh = createPendingAcceptanceRecord("workspace", "Open Projects?", 4, null);
    expect(old.id).not.toBe(fresh.id);
    expect(old.offeredAtTurn).toBeLessThan(fresh.offeredAtTurn);
  });

  it("acceptance acknowledgement is short plain language", () => {
    expect(acceptanceAckForWorkspace("content-generator")).toBe("Opening Create.");
    expect(isBareGenericAcceptance("sounds good")).toBe(true);
  });

  it("audit inventory covers acceptance sources", () => {
    expect(ACCEPTANCE_PATH_AUDIT.length).toBeGreaterThanOrEqual(10);
  });

  it("accepts action bridge with generic yes when assistant offered breathe", () => {
    const result = resolvePendingAcceptance({
      userText: "sure",
      lastAssistantText:
        "Let's take a moment — I can open a breathing reset for you.",
      currentTurn: 3,
      workspacePanel: null,
      record: null,
      pendingAction: {
        kind: "action-bridge",
        bridge: {
          id: "breathe",
          label: "Start Breathe & Reset",
          emoji: "🌿",
          tool: "breathe",
        },
      },
      createConsent: null,
    });
    expect(result.outcome).toBe("accept");
  });
});
