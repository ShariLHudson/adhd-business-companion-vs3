import { describe, expect, it } from "vitest";
import {
  CREATE_BEGIN_AMBIGUOUS_MESSAGE,
  CREATE_BEGIN_EMPTY_MESSAGE,
  PRIMARY_ACTION_FEEDBACK_RULE,
} from "@/lib/primaryActionFeedback";
import {
  createBeginOutcomeIsVisible,
  resolveCreateBeginOutcome,
} from "./resolveCreateBeginOutcome";

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

  it("clear workshop Begin → open with artifact type", () => {
    const outcome = resolveCreateBeginOutcome(
      "I want to create a workshop for ADHD founders",
    );
    expect(outcome.kind).toBe("open");
    if (outcome.kind === "open") {
      expect(outcome.artifactType.toLowerCase()).toMatch(/workshop/);
      expect(outcome.text).toMatch(/workshop/i);
    }
  });

  it("clear email Begin → open", () => {
    const outcome = resolveCreateBeginOutcome(
      "Help me write a welcome email for new clients",
    );
    expect(outcome.kind).toBe("open");
    if (outcome.kind === "open") {
      expect(outcome.artifactType).toBeTruthy();
      expect(outcome.isMarketingPlanDomain).toBe(false);
    }
  });

  it("marketing plan Begin → open with Marketing Plan domain", () => {
    const outcome = resolveCreateBeginOutcome(
      "Help me create a simple marketing plan",
    );
    expect(outcome.kind).toBe("open");
    if (outcome.kind === "open") {
      expect(outcome.artifactType).toMatch(/marketing plan/i);
      expect(outcome.isMarketingPlanDomain).toBe(true);
      expect(outcome.isEventDomain).toBe(false);
    }
  });

  it("entrance panel wires Begin feedback + onBeginCreate", async () => {
    const { readFileSync } = await import("fs");
    const { resolve } = await import("path");
    const panel = readFileSync(
      resolve(process.cwd(), "components/companion/CreateEstateEntrancePanel.tsx"),
      "utf8",
    );
    expect(panel).toContain("onBeginCreate");
    expect(panel).toContain("resolveCreateBeginOutcome");
    expect(panel).toContain("create-estate-begin-feedback");
    expect(panel).toContain("data-primary-action=\"begin\"");
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
