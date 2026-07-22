/**
 * Spec 131 — Create Intelligence & Intent Constitution runtime hooks.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  createIntentAlternativesMessage,
  detectPromotionalDeliverableIntent,
  limitAlsoConsidered,
} from "./createIntentConfirmation";
import {
  confirmCreateBeginToOpen,
  resolveCreateBeginOutcome,
  switchCreateBeginConfirmType,
} from "./resolveCreateBeginOutcome";
import { SPARK_CREATE_MORE_WAYS_MAX_DECISION_LAYERS } from "@/lib/sparkCreateIntentConstitution/types";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("Spec 131 — Create intent intelligence", () => {
  it("Rule 1 — flyer for workshop is promotional deliverable, not Workshop", () => {
    expect(
      detectPromotionalDeliverableIntent(
        "I need a flyer for my ADHD founder workshop",
      ),
    ).toBe("Flyer");

    const outcome = resolveCreateBeginOutcome(
      "I need a flyer for my ADHD founder workshop",
    );
    expect(outcome.kind).toBe("confirm");
    if (outcome.kind !== "confirm") return;
    expect(outcome.artifactType).toBe("Flyer");
    expect(outcome.isEventDomain).toBe(false);
    expect(outcome.message).not.toMatch(/workshop plan/i);
    // Still confirm — never silent create (130)
    expect(confirmCreateBeginToOpen(outcome).kind).toBe("open");
  });

  it("Rule 2 — medium confidence surfaces most likely + also considered", () => {
    const outcome = resolveCreateBeginOutcome(
      "brochure promoting our weekend retreat",
    );
    expect(outcome.kind).toBe("confirm");
    if (outcome.kind !== "confirm") return;
    expect(outcome.artifactType).toBe("Flyer");
    expect(outcome.confidence).toBe("medium");
    expect(outcome.alsoConsidered?.length).toBeGreaterThan(0);
    expect(outcome.message).toMatch(/I think you meant/i);
    expect(outcome.message).toMatch(/also considered/i);
  });

  it("Rule 3 — switch type without rewriting the request", () => {
    const outcome = resolveCreateBeginOutcome(
      "flyer for my workshop next month",
    );
    expect(outcome.kind).toBe("confirm");
    if (outcome.kind !== "confirm") return;
    const switched = switchCreateBeginConfirmType(outcome, "Workshop");
    expect(switched.artifactType).toBe("Workshop");
    expect(switched.text).toBe(outcome.text);
    expect(switched.kind).toBe("confirm");
    expect(confirmCreateBeginToOpen(switched).artifactType).toBe("Workshop");
  });

  it("alternatives message and also-considered cap stay calm", () => {
    expect(
      createIntentAlternativesMessage("Flyer", ["Workshop", "Event Plan"]),
    ).toMatch(/Flyer/);
    expect(
      limitAlsoConsidered("Flyer", ["Flyer", "Workshop", "Event Plan", "Email"]),
    ).toEqual(["Workshop", "Event Plan", "Email"]);
  });

  it("Rule 11 — Continue Working omitted when empty; Rule 7 layers capped", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    expect(panel).toContain("hasWorkspaces ? (");
    expect(panel).toContain('data-testid="create-estate-continue"');
    expect(panel).not.toContain("create-estate-continue-empty");
    expect(panel).toContain("create-estate-also-considered");
    expect(panel).toContain("switchCreateBeginConfirmType");
    expect(panel).toContain("create-estate-template-source");
    expect(panel).toContain("data-max-decision-layers=");
    expect(SPARK_CREATE_MORE_WAYS_MAX_DECISION_LAYERS).toBe(3);
  });

  it("plain workshop still confirms as workshop (no promo noun)", () => {
    const outcome = resolveCreateBeginOutcome(
      "I want to create a workshop for ADHD founders",
    );
    expect(outcome.kind).toBe("confirm");
    if (outcome.kind !== "confirm") return;
    expect(outcome.artifactType.toLowerCase()).toMatch(/workshop/);
  });
});
