/**
 * Integration: UI Research & Build path for Loom must populate workspace.
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { VisualThinkingRequestPanel } from "./VisualThinkingRequestPanel";
import { clearVisualThinkingRequestDraft } from "@/lib/cartographersStudio/visualThinkingRequest";
import { clearGenerationBundle } from "@/lib/cartographersStudio/visualThinkingGenerationEngine";
import { clearKnowledgeBundle } from "@/lib/cartographersStudio/visualThinkingKnowledgeIntelligence";
import { clearPresentationPlan } from "@/lib/cartographersStudio/visualThinkingPresentationIntelligence";
import { clearThinkingWorkspace } from "@/lib/cartographersStudio/visualThinkingWorkspaceFoundation";
import { clearResearchBundle } from "@/lib/cartographersStudio/visualThinkingResearchAcquisition";
import { clearEditingSession } from "@/lib/cartographersStudio/visualThinkingWorkspaceEditing";

function setTextarea(container: HTMLElement, testId: string, value: string) {
  const input = container.querySelector(
    `[data-testid='${testId}']`,
  ) as HTMLTextAreaElement;
  const setter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value",
  )?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function click(container: HTMLElement, testId: string) {
  (
    container.querySelector(`[data-testid='${testId}']`) as HTMLButtonElement
  ).click();
}

describe("VisualThinkingRequestPanel Loom live path", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    clearVisualThinkingRequestDraft();
    clearKnowledgeBundle();
    clearGenerationBundle();
    clearPresentationPlan();
    clearThinkingWorkspace();
    clearResearchBundle();
    clearEditingSession();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    clearVisualThinkingRequestDraft();
    clearKnowledgeBundle();
    clearGenerationBundle();
    clearPresentationPlan();
    clearThinkingWorkspace();
    clearResearchBundle();
    clearEditingSession();
  });

  it("Research and Build populates workspace for the exact Loom request", () => {
    act(() => {
      root.render(
        <VisualThinkingRequestPanel onOpenPreviousWork={() => undefined} />,
      );
    });
    act(() => {
      setTextarea(
        container,
        "visual-thinking-request-input",
        "Research how Loom works now and create a step-by-step guide for recording a Loom video and uploading it to YouTube.",
      );
      click(container, "visual-thinking-research-build");
    });

    const ws = container.querySelector("[data-testid='thinking-workspace']");
    const objs = container.querySelectorAll("[data-testid^='thinking-object-']");
    const notice =
      container.querySelector(
        "[data-testid='thinking-workspace-incomplete-notice']",
      )?.textContent ?? "";
    const warningHit =
      container.textContent?.includes("have not been verified") ?? false;
    const written = container.querySelector(
      "[data-testid='visual-thinking-review-deliverable']",
    );

    expect(ws).toBeTruthy();
    expect(objs.length).toBeGreaterThanOrEqual(12);
    expect(notice).not.toMatch(/have not been verified/i);
    expect(warningHit).toBe(false);
    expect(written?.textContent ?? "").toMatch(
      /record|microphone|YouTube|upload/i,
    );
    expect(
      container.querySelector(
        "[data-testid='visual-thinking-pipeline-recovery']",
      ),
    ).toBeFalsy();
    expect(
      container.querySelector(
        "[data-testid='visual-thinking-execution-diagnostics']",
      ),
    ).toBeTruthy();
  });

  it("Continue on short Loom how-to also populates via generate-first", () => {
    act(() => {
      root.render(
        <VisualThinkingRequestPanel onOpenPreviousWork={() => undefined} />,
      );
    });
    act(() => {
      setTextarea(
        container,
        "visual-thinking-request-input",
        "How to Create a Loom Video",
      );
      click(container, "visual-thinking-request-continue");
    });

    const objs = container.querySelectorAll("[data-testid^='thinking-object-']");
    expect(
      container.querySelector("[data-testid='thinking-workspace']"),
    ).toBeTruthy();
    expect(objs.length).toBeGreaterThanOrEqual(12);
    expect(container.textContent ?? "").not.toMatch(/have not been verified/i);
  });

  it("research-unavailable recovery auto-continues without Build the Useful Guide", () => {
    // Simulate the screenshot recovery session: knowledge + research, no result.
    window.sessionStorage.setItem(
      "companion-visual-thinking-request-draft-v1",
      JSON.stringify({
        id: "req-recovery",
        rawRequest:
          "Research how Loom works now and create a step-by-step guide for recording a Loom video and uploading it to YouTube.",
        status: "confirmed",
        entryPath: "research_assisted",
        requestedDepth: "guided",
        recommendationConfirmed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    );
    window.sessionStorage.setItem(
      "companion-visual-thinking-knowledge-package-v1",
      JSON.stringify({
        plan: {
          id: "kp-plan",
          status: "awaiting_research",
          missingKnowledgeGaps: [],
          availableSourceRefs: [],
          updatedAt: new Date().toISOString(),
        },
        package: {
          id: "kp",
          items: [],
          knowledgeGaps: [],
          sourceReferences: [],
          readiness: "partial_ready",
          blockedReasons: [],
          conflicts: [],
        },
        handoff: {
          safeGenerationScope: "partial",
          suppliedSteps: [],
          blockedContentAreas: [],
          knowledgePackageId: "kp",
        },
      }),
    );

    act(() => {
      root.render(
        <VisualThinkingRequestPanel onOpenPreviousWork={() => undefined} />,
      );
    });

    // Auto-continue must run — never require the recovery button.
    expect(
      container.querySelector(
        "[data-testid='visual-thinking-recovery-build-guide']",
      ),
    ).toBeFalsy();
    expect(container.textContent ?? "").not.toMatch(
      /No primary result is available to present/i,
    );

    const ws = container.querySelector("[data-testid='thinking-workspace']");
    const objs = container.querySelectorAll("[data-testid^='thinking-object-']");
    expect(ws).toBeTruthy();
    expect(objs.length).toBeGreaterThanOrEqual(12);
    expect(
      container.querySelector(
        "[data-testid='visual-thinking-retry-current-research']",
      ),
    ).toBeTruthy();
    expect(
      container.querySelector(
        "[data-testid='visual-thinking-pipeline-recovery']",
      ),
    ).toBeFalsy();
  });

  it("stale warning-only session workspace is not restored as ready", () => {
    const stale = {
      id: "ws-stale",
      workspacePlanId: "ws-stale",
      title: "Visual Process",
      status: "ready",
      workspaceMode: "process",
      incompleteState: true,
      completenessNotice:
        "Current product, platform, or market details are required and have not been verified.",
      incompleteAreas: [
        "Current product, platform, or market details are required and have not been verified.",
      ],
      objects: [
        {
          id: "wto-1",
          type: "warning",
          title: "Verification required",
          summary:
            "Current product, platform, or market details are required and have not been verified.",
          sourceKind: "knowledge_item",
          sourceBlockId: null,
          sourceKnowledgeItemId: null,
          deliverableId: null,
          groupId: null,
          x: 0,
          y: 0,
          width: 200,
          height: 80,
          collapsed: false,
          userCreated: false,
          immutable: true,
          pinned: false,
          manuallyMoved: false,
          visualRole: "supporting",
          metadata: {},
        },
      ],
      groups: [],
      connectors: [],
      viewport: { panX: 0, panY: 0, zoom: 1 },
      selection: { primaryObjectId: null, objectIds: [] },
      focusMode: false,
      searchQuery: "",
      layoutIntent: "process",
      layoutSuggestions: [],
      pendingLayoutProposal: null,
      layoutProfile: "desktop",
      undoStack: [],
      redoStack: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: "vts-thinking-workspace-1",
    };
    window.sessionStorage.setItem(
      "companion-visual-thinking-workspace-v1",
      JSON.stringify(stale),
    );

    act(() => {
      root.render(
        <VisualThinkingRequestPanel onOpenPreviousWork={() => undefined} />,
      );
    });

    expect(
      container.querySelector("[data-testid='thinking-workspace']"),
    ).toBeFalsy();
    expect(container.textContent ?? "").not.toMatch(
      /Current product, platform, or market details are required and have not been verified/,
    );
  });
});
