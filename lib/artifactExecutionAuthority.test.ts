import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearFrictionlessPending,
  resolveFrictionlessAction,
  saveFrictionlessPending,
} from "./frictionlessActionLayer";
import {
  detectArtifactExecutionKind,
  isArtifactExecutionIntent,
  isArtifactWorkspaceIntent,
  isArtifactExecutionOfferMessage,
  resolveArtifactExecutionTurn,
} from "./artifactExecutionAuthority";
import {
  clearArtifactExecutionSession,
  saveArtifactExecutionSession,
} from "./artifactExecutionSession";
import { executeArtifactGeneration } from "./artifactExecutionEngine";
import { getActiveWorkflowOwner } from "./workflowOwnershipAuthority";
import { patchOutcomeThread, clearOutcomeThread } from "./companionOutcomeThread";

vi.mock("./artifactPdfExport", () => ({
  downloadMarkdownAsPdf: vi.fn(),
}));

const SAMPLE_BODY =
  "Weekly content plan:\n- Monday: blog post on ADHD productivity\n- Wednesday: client newsletter\n- Friday: social recap";

describe("artifactExecutionAuthority", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    vi.stubGlobal("sessionStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    clearArtifactExecutionSession();
    clearFrictionlessPending();
    clearOutcomeThread();
  });

  it("detects execution vs workspace intent for PDF", () => {
    expect(isArtifactExecutionIntent("Make this a PDF")).toBe(true);
    expect(isArtifactWorkspaceIntent("Help me write a PDF")).toBe(true);
    expect(isArtifactExecutionIntent("Help me write a PDF")).toBe(false);
  });

  it("offers PDF creation when content exists in chat", () => {
    const outcome = resolveArtifactExecutionTurn({
      userText: "Make this a PDF",
      messages: [
        { role: "assistant", content: SAMPLE_BODY },
        { role: "user", content: "Make this a PDF" },
      ],
    });
    expect(outcome.kind).toBe("ask");
    if (outcome.kind !== "ask") return;
    expect(outcome.reply).toMatch(/Shall I create the PDF now/i);
    expect(outcome.draft.kind).toBe("pdf");
    expect(outcome.draft.body).toContain("Weekly content plan");
  });

  it("executes PDF on yes after offer — no workspace", () => {
    const draft = {
      kind: "pdf" as const,
      title: "Content plan",
      body: SAMPLE_BODY,
      missing: null as const,
    };
    saveArtifactExecutionSession({
      phase: "ready",
      draft,
      startedAtTurn: 2,
    });
    const outcome = resolveArtifactExecutionTurn({
      userText: "Yes",
      draft,
    });
    expect(outcome.kind).toBe("confirm");
    if (outcome.kind !== "confirm") return;
    expect(outcome.reply).toBe("");

    const decision = resolveFrictionlessAction({
      userText: "Yes",
      currentTurn: 3,
      artifactExecutionDraft: draft,
      messages: [
        { role: "assistant", content: SAMPLE_BODY },
        { role: "user", content: "Make this a PDF" },
        { role: "assistant", content: "Shall I create the PDF now?" },
        { role: "user", content: "Yes" },
      ],
      lastAssistantText: "Shall I create the PDF now?",
    });
    expect(decision.category).toBe("artifact_execution");
    expect(decision.executeArtifactNow).toBe(true);
    expect(decision.workspaceOffer).toBeNull();
  });

  it("routes Google Sheet execution without Create workspace", () => {
    const decision = resolveFrictionlessAction({
      userText: "Create the sheet",
      currentTurn: 2,
      messages: [
        { role: "assistant", content: SAMPLE_BODY },
        { role: "user", content: "Create the sheet" },
      ],
      lastAssistantText: SAMPLE_BODY,
    });
    expect(decision.category).toBe("artifact_execution");
    expect(decision.workspaceOffer).toBeNull();
    expect(decision.localReply).toMatch(/Google Sheet now/i);
  });

  it("routes calendar execution without Documents workspace", () => {
    const decision = resolveFrictionlessAction({
      userText: "Create this calendar",
      currentTurn: 2,
      messages: [
        { role: "assistant", content: SAMPLE_BODY },
        { role: "user", content: "Create this calendar" },
      ],
      lastAssistantText: SAMPLE_BODY,
    });
    expect(decision.category).toBe("artifact_execution");
    expect(decision.workspaceOffer).toBeNull();
  });

  it("yes on artifact offer wins over stale strategy pending", () => {
    saveFrictionlessPending({
      type: "strategy_offer",
      target: "playbook",
      context: "strategies",
      strategyId: "ugly-first-draft",
      strategyTitle: "Start Ugly",
      offeredAtTurn: 1,
      offerSummary: "Use Start Ugly",
    });
    patchOutcomeThread({ pendingDecision: "Strategic direction decision" });

    const decision = resolveFrictionlessAction({
      userText: "Make this a PDF",
      currentTurn: 4,
      messages: [
        { role: "assistant", content: SAMPLE_BODY },
        { role: "user", content: "Make this a PDF" },
      ],
      lastAssistantText: SAMPLE_BODY,
    });
    expect(decision.category).toBe("artifact_execution");
    expect(decision.localReply).toMatch(/PDF now/i);

    const owner = getActiveWorkflowOwner({
      lastAssistantText: "Shall I create the PDF now?",
      artifactExecutionIntakeActive: true,
    });
    expect(owner?.owner).toBe("artifact_execution_workflow");
  });

  it("detects artifact execution offer messages", () => {
    expect(isArtifactExecutionOfferMessage("Shall I create the PDF now?")).toBe(
      true,
    );
    expect(
      isArtifactExecutionOfferMessage("Would you like to learn more?"),
    ).toBe(false);
  });

  it("executes PDF locally without success before generation", async () => {
    const result = await executeArtifactGeneration({
      kind: "pdf",
      title: "Plan",
      body: SAMPLE_BODY,
      missing: null,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.message).toMatch(/Your PDF is ready/i);
    expect(result.message).toMatch(/Created Content/i);
    expect(result.downloadTriggered).toBe(true);
  });

  it("detects sheet and calendar kinds", () => {
    expect(detectArtifactExecutionKind("Create the sheet")).toBe("google-sheet");
    expect(detectArtifactExecutionKind("Create this calendar")).toBe("calendar");
  });
});
