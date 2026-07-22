/**
 * Spec 135 — Create Experience 12/10 Final Certification (automated coverage).
 */

import { describe, expect, it, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { continueCardFromRegistryEntry } from "@/lib/activeWorkspaceRegistry/continueCardProjection";
import type { ActiveWorkspaceEntry } from "@/lib/activeWorkspaceRegistry/types";
import {
  resolveCreateBeginOutcome,
  switchCreateBeginConfirmType,
} from "./resolveCreateBeginOutcome";
import {
  clearSessionCreateIntentCorrections,
  listSessionCreateIntentCorrections,
  recordCreateIntentCorrection,
} from "./intentCorrectionHooks";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

function stubEntry(
  partial: Partial<ActiveWorkspaceEntry> &
    Pick<ActiveWorkspaceEntry, "workspaceId">,
): ActiveWorkspaceEntry {
  return {
    workspaceId: partial.workspaceId,
    title: partial.title ?? "",
    creationType: partial.creationType ?? "Workshop",
    lastActivityAt: partial.lastActivityAt ?? new Date().toISOString(),
    eventRecordId: partial.eventRecordId ?? partial.workspaceId,
    runtimeCreationRecordId: partial.runtimeCreationRecordId ?? "",
    projectHomeId: partial.projectHomeId ?? null,
    currentFocusTitle: partial.currentFocusTitle ?? null,
    draftState: partial.draftState,
    progressLabel: partial.progressLabel,
    hasDraft: partial.hasDraft,
    status: partial.status,
    lifecycle: partial.lifecycle,
  } as ActiveWorkspaceEntry;
}

describe("Spec 135 — Create 12/10 certification polish", () => {
  beforeEach(() => {
    clearSessionCreateIntentCorrections();
  });

  it("Continue cards prefer New {Type} over Untitled", () => {
    const empty = continueCardFromRegistryEntry(
      stubEntry({ workspaceId: "w1", title: "", creationType: "Newsletter" }),
    );
    expect(empty.title).toBe("New Newsletter");
    expect(empty.title).not.toMatch(/untitled/i);

    const untitled = continueCardFromRegistryEntry(
      stubEntry({
        workspaceId: "w2",
        title: "Untitled Workshop",
        creationType: "Workshop",
      }),
    );
    expect(untitled.title).toBe("New Workshop");
  });

  it("Continue cards do not duplicate status as progress", () => {
    const card = continueCardFromRegistryEntry(
      stubEntry({
        workspaceId: "w3",
        title: "Client Welcome Email",
        creationType: "Email",
        progressLabel: "In progress",
        draftState: "draft",
      }),
    );
    // When progress equals status, progressSummary stays empty (no double line).
    if (card.progressSummary) {
      expect(card.progressSummary.toLowerCase()).not.toBe(
        card.statusLabel.toLowerCase(),
      );
    }
  });

  it("medium promo intent surfaces up to 3 also-considered options", () => {
    // Brochure (promo) without the word "flyer" → medium + also-considered.
    const outcome = resolveCreateBeginOutcome(
      "brochure promoting our weekend retreat workshop",
    );
    expect(outcome.kind).toBe("confirm");
    if (outcome.kind !== "confirm") return;
    expect(outcome.artifactType).toBe("Flyer");
    expect(outcome.confidence).toBe("medium");
    expect(outcome.alsoConsidered?.length).toBeGreaterThanOrEqual(2);
    expect(outcome.alsoConsidered!.length).toBeLessThanOrEqual(3);
    expect(
      outcome.alsoConsidered!.some((t) => /workshop|event/i.test(t)),
    ).toBe(true);
  });

  it("also-considered switch records a session correction hook", () => {
    const outcome = resolveCreateBeginOutcome(
      "flyer for my ADHD founder workshop",
    );
    expect(outcome.kind).toBe("confirm");
    if (outcome.kind !== "confirm") return;
    switchCreateBeginConfirmType(outcome, "Workshop");
    const corrections = listSessionCreateIntentCorrections();
    expect(corrections.length).toBeGreaterThanOrEqual(1);
    expect(corrections[corrections.length - 1]?.toType).toBe("Workshop");
    expect(corrections[corrections.length - 1]?.fromType).toBe("Flyer");
  });

  it("correction hook is session-only and caps quietly", () => {
    for (let i = 0; i < 30; i += 1) {
      recordCreateIntentCorrection({
        requestText: `request ${i}`,
        fromType: "Flyer",
        toType: "Workshop",
      });
    }
    expect(listSessionCreateIntentCorrections().length).toBeLessThanOrEqual(24);
  });

  it("Explore Ideas no longer duplicates Continue Working list", () => {
    const explore = read("components/companion/CreateExploreIdeasPanel.tsx");
    expect(explore).not.toContain("CreateWorkspaceResumeList");
    expect(explore).not.toContain("create-explore-continue-working");
    expect(explore).toContain("create-explore-continue-something");
    expect(explore).toContain("create-estate-previous-work");
  });

  it("entrance Escape cancels confirm before leaving Create", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    expect(panel).toContain('closeOnEscape: beginFeedbackKind !== "confirm"');
    expect(panel).toContain('event.key !== "Escape"');
    expect(panel).toContain("setPendingConfirm(null)");
  });

  it("working panel save acks never expose Blueprint IDs", () => {
    const panel = read("components/companion/CreateEstateWorkingPanel.tsx");
    expect(panel).not.toMatch(/Saved Company Blueprint \$\{blueprintId\}/);
    expect(panel).not.toMatch(/\$\{saved\.blueprintId\} @ \$\{saved\.version\}/);
    expect(panel).toContain("You can open it anytime from your library");
  });
});
