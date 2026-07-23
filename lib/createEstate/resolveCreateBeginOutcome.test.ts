import { describe, expect, it } from "vitest";
import {
  CREATE_BEGIN_AMBIGUOUS_MESSAGE,
  CREATE_BEGIN_EMPTY_MESSAGE,
  PRIMARY_ACTION_FEEDBACK_RULE,
} from "@/lib/primaryActionFeedback";
import {
  confirmCreateBeginToOpen,
  createBeginOutcomeIsVisible,
  resolveCatalogCreateConfirm,
  resolveCreateBeginOutcome,
} from "./resolveCreateBeginOutcome";
import {
  createConfirmPrimaryLabel,
  createIntentConfirmMessage,
  createOpenPlanLabel,
  createWorkReadyMessage,
} from "./createIntentConfirmation";
import { progressiveQuickStartSectionIds } from "./quickStartFocusSections";

describe("Create Begin — always one of two outcomes", () => {
  it("declares platform primary-action feedback rule", () => {
    expect(PRIMARY_ACTION_FEEDBACK_RULE).toMatch(/never silent/i);
  });

  it("empty Begin → clarify (never silent)", () => {
    const outcome = resolveCreateBeginOutcome("   ");
    expect(outcome.kind).toBe("clarify");
    if (outcome.kind === "clarify") {
      expect(outcome.message).toBe(CREATE_BEGIN_EMPTY_MESSAGE);
      expect(outcome.reason).toBe("empty");
    }
    expect(createBeginOutcomeIsVisible(outcome)).toBe(true);
  });

  it("ambiguous Begin → canonical clarify message", () => {
    const outcome = resolveCreateBeginOutcome("I want to create something");
    expect(outcome.kind).toBe("clarify");
    if (outcome.kind === "clarify") {
      expect(outcome.message).toBe(CREATE_BEGIN_AMBIGUOUS_MESSAGE);
    }
    expect(createBeginOutcomeIsVisible(outcome)).toBe(true);
  });

  it("clear workshop Begin → confirm (never silent open)", () => {
    const outcome = resolveCreateBeginOutcome(
      "I want to create a workshop for ADHD founders",
    );
    expect(outcome.kind).toBe("confirm");
    if (outcome.kind === "confirm") {
      expect(outcome.artifactType.toLowerCase()).toMatch(/workshop/);
      expect(outcome.text).toMatch(/workshop/i);
      expect(outcome.message).toMatch(/looks like|think a|think an/i);
      expect(["high", "medium"]).toContain(outcome.confidence);
    }
  });

  it("clear email Begin → confirm", () => {
    const outcome = resolveCreateBeginOutcome(
      "Help me write a welcome email for new clients",
    );
    expect(outcome.kind).toBe("confirm");
    if (outcome.kind === "confirm") {
      expect(outcome.artifactType).toBeTruthy();
      expect(outcome.isMarketingPlanDomain).toBe(false);
    }
  });

  it("business plan Begin → confirm with Business Plan domain", () => {
    const outcome = resolveCreateBeginOutcome("Help me create a business plan");
    expect(outcome.kind).toBe("confirm");
    if (outcome.kind === "confirm") {
      expect(outcome.artifactType).toMatch(/business plan/i);
      expect(outcome.isBusinessPlanDomain).toBe(true);
      expect(outcome.isMarketingPlanDomain).toBe(false);
      expect(outcome.isEventDomain).toBe(false);
      expect(outcome.confidence).toBe("high");
    }
  });

  it("marketing plan Begin → confirm with Marketing Plan domain", () => {
    const outcome = resolveCreateBeginOutcome(
      "Help me create a simple marketing plan",
    );
    expect(outcome.kind).toBe("confirm");
    if (outcome.kind === "confirm") {
      expect(outcome.artifactType).toMatch(/marketing plan/i);
      expect(outcome.isMarketingPlanDomain).toBe(true);
      expect(outcome.isBusinessPlanDomain).toBe(false);
      expect(outcome.isEventDomain).toBe(false);
      expect(outcome.confidence).toBe("high");
      expect(outcome.message).toBe(
        createIntentConfirmMessage(outcome.artifactType),
      );
    }
  });

  it("Facebook community Begin → confirm with Facebook Community domain (587–598)", () => {
    const outcome = resolveCreateBeginOutcome(
      "Help me create a Facebook community for my clients",
    );
    expect(outcome.kind).toBe("confirm");
    if (outcome.kind === "confirm") {
      expect(outcome.artifactType).toMatch(/facebook community/i);
      expect(outcome.isFacebookCommunityDomain).toBe(true);
      // Domain is exclusive — never double-counted as Marketing or Event.
      expect(outcome.isMarketingPlanDomain).toBe(false);
      expect(outcome.isEventDomain).toBe(false);
      expect(outcome.confidence).toBe("high");
    }
  });

  it("Facebook Community domain carries through confirm → open", () => {
    const outcome = resolveCreateBeginOutcome(
      "I want to start a Facebook group for my members",
    );
    expect(outcome.kind).toBe("confirm");
    if (outcome.kind !== "confirm") return;
    expect(outcome.isFacebookCommunityDomain).toBe(true);
    const open = confirmCreateBeginToOpen(outcome);
    expect(open.kind).toBe("open");
    expect(open.isFacebookCommunityDomain).toBe(true);
  });

  it("plain Facebook post request is NOT a Facebook Community domain (honest routing)", () => {
    const outcome = resolveCreateBeginOutcome(
      "Write me a Facebook post about our weekend sale",
    );
    if (outcome.kind === "confirm") {
      expect(outcome.isFacebookCommunityDomain).toBe(false);
    }
  });

  it("confirm → open only after explicit conversion (no silent create)", () => {
    const outcome = resolveCreateBeginOutcome(
      "Help me create a simple marketing plan",
    );
    expect(outcome.kind).toBe("confirm");
    if (outcome.kind !== "confirm") return;
    const open = confirmCreateBeginToOpen(outcome);
    expect(open.kind).toBe("open");
    expect(open.artifactType).toBe(outcome.artifactType);
    expect(open.text).toBe(outcome.text);
  });

  it("catalog pick → confirm with Create {Type} primary label", () => {
    const confirm = resolveCatalogCreateConfirm({ label: "Email" });
    expect(confirm.kind).toBe("confirm");
    expect(confirm.confidence).toBe("high");
    expect(createConfirmPrimaryLabel(confirm.artifactType)).toBe("Create Email");
    expect(confirmCreateBeginToOpen(confirm).kind).toBe("open");
  });

  it("member-facing copy never exposes Blueprint / Work Type jargon", () => {
    expect(createWorkReadyMessage("Marketing Plan")).toBe(
      "Your Marketing Plan is ready.",
    );
    expect(createOpenPlanLabel("Marketing Plan")).toBe("Open My Marketing Plan");
    expect(createIntentConfirmMessage("Marketing Plan")).not.toMatch(
      /blueprint|work type|registry|runtime/i,
    );
  });

  it("Quick Start progressive focus never dumps every section", () => {
    const ids = Array.from({ length: 16 }, (_, i) => `section_${i + 1}`);
    const focus = progressiveQuickStartSectionIds({
      visibleSectionIds: ids,
      completedSectionIds: ["section_1", "section_2"],
    });
    expect(focus).toHaveLength(5);
    expect(focus[0]).toBe("section_3");
    expect(focus).not.toContain("section_1");
  });

  it("entrance panel wires Begin feedback + intent confirm + onBeginCreate", async () => {
    const { readFileSync } = await import("fs");
    const { resolve } = await import("path");
    const panel = readFileSync(
      resolve(process.cwd(), "components/companion/CreateEstateEntrancePanel.tsx"),
      "utf8",
    );
    expect(panel).toContain("onBeginCreate");
    expect(panel).toContain("resolveCreateBeginOutcome");
    expect(panel).toContain("create-estate-begin-feedback");
    expect(panel).toContain("create-estate-intent-confirm");
    expect(panel).toContain("confirmCreateBeginToOpen");
    expect(panel).toContain("data-primary-action=\"begin\"");
    // Spec 132 / 135 — intentional Escape + confirm layer before leave
    expect(panel).toContain("useDismissibleWindow");
    expect(panel).toContain("closeOnEscape");
    expect(panel).not.toContain("Start with a Blueprint");
    expect(panel).not.toContain("onConversationalCreate");
  });

  it("CPC Begin open path requires artifactType", async () => {
    const { readFileSync } = await import("fs");
    const { resolve } = await import("path");
    const client = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(client).toContain("onBeginCreate");
    expect(client).toContain("Never call Estate open without artifactType");
  });
});
