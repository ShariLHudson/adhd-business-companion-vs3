import { beforeEach, describe, expect, it, vi } from "vitest";

import { saveProject } from "@/lib/companionStore";
import { createSavedGrowthWin } from "@/lib/growthWinsStore";
import {
  buildSparkEstateKnowledgeCard,
  buildSparkEstateMomentumCard,
  buildSparkEstateProjectCard,
  buildSparkEstateReflectionCard,
  buildSparkEstateSparkCard,
  buildSparkEstateWinCard,
  cardsForPlacement,
  getSparkEstateCardMemoryInsights,
  recordSparkEstateCardInteraction,
  selectPrimarySparkEstateCard,
  selectSparkEstateCards,
  SPARK_ESTATE_CARD_PRIORITY_ORDER,
  SPARK_ESTATE_CARD_SUCCESS_TEST,
  verifySparkEstateCardEcosystem,
} from "./sparkEstateCardEcosystem";

function seedLocalStorage() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, v);
    },
    removeItem: (k: string) => {
      mem.delete(k);
    },
    clear: () => {
      mem.clear();
    },
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("sessionStorage", storage);
  vi.stubGlobal("window", {
    dispatchEvent: vi.fn(),
    localStorage: storage,
    sessionStorage: storage,
  });
}

describe("sparkEstateCardEcosystem", () => {
  beforeEach(() => {
    seedLocalStorage();
    localStorage.clear();
  });

  it("defines six specialized card types and priority order", () => {
    const verification = verifySparkEstateCardEcosystem();
    expect(verification.cardKinds).toHaveLength(6);
    expect(SPARK_ESTATE_CARD_PRIORITY_ORDER[0]).toBe("personal-moment");
    expect(SPARK_ESTATE_CARD_SUCCESS_TEST).toContain("helpful note");
    expect(verification.selectionWorks).toBe(true);
    expect(verification.lifecycleReady).toBe(true);
  });

  it("builds spark, momentum, project, knowledge, reflection, and win cards", () => {
    expect(buildSparkEstateSparkCard().kind).toBe("spark-card");
    expect(buildSparkEstateKnowledgeCard({ topic: "pricing" }).concept).toBe(
      "pricing",
    );
    expect(buildSparkEstateReflectionCard().questions.length).toBeGreaterThan(0);

    saveProject({
      name: "Website Launch",
      goal: "Launch site",
      nextAction: "Review homepage message",
      status: "active-focus",
    });
    const project = buildSparkEstateProjectCard();
    expect(project?.projectName).toBe("Website Launch");
    expect(project?.nextAction).toBe("Review homepage message");

    const momentum = buildSparkEstateMomentumCard();
    expect(momentum?.headline).toContain("Website Launch");

    createSavedGrowthWin({
      whatHappened: "Finished homepage draft",
      icon: "✨",
      attachments: [],
    });
    expect(buildSparkEstateWinCard()?.accomplishment).toContain("homepage");
  });

  it("selects cards by priority, context, and placement", () => {
    saveProject({
      name: "Website Launch",
      goal: "Launch",
      nextAction: "Review homepage message",
      status: "active-focus",
    });

    const chamberCards = selectSparkEstateCards({
      text: "I'm stuck",
      section: "chamber-of-momentum",
    });
    expect(chamberCards[0]?.kind).toBe("momentum-card");

    const learningCards = selectSparkEstateCards({
      text: "Teach me marketing",
      section: "momentum-institute",
    });
    expect(learningCards.some((card) => card.kind === "knowledge-card")).toBe(
      true,
    );

    expect(cardsForPlacement("chamber-of-momentum")).toContain("momentum-card");
    expect(selectPrimarySparkEstateCard({ text: "Teach me SEO" })).toBe(
      "knowledge-card",
    );
  });

  it("records card memory for opens, saves, and dismissals", () => {
    recordSparkEstateCardInteraction({ kind: "momentum-card", action: "open" });
    recordSparkEstateCardInteraction({ kind: "spark-card", action: "save" });
    recordSparkEstateCardInteraction({
      kind: "knowledge-card",
      action: "complete",
    });

    const insights = getSparkEstateCardMemoryInsights();
    expect(insights.opened).toContain("momentum-card");
    expect(insights.saved).toContain("spark-card");
    expect(insights.ignored).toContain("knowledge-card");
  });

  it("keeps cards actionable without too many buttons", () => {
    const reflection = buildSparkEstateReflectionCard();
    expect(reflection.actions.length).toBeLessThanOrEqual(4);
    expect(reflection.actions).toContain("reflect");
  });
});
