import { describe, expect, it } from "vitest";
import {
  STRATEGIC_JUDGMENT_STAGE_ORDER,
  EVIDENCE_STRENGTH_LABEL,
  REVERSIBILITY_LABEL,
  DECISION_READINESS_LABEL,
} from "../../domainModel";
import type { StrategicInputClassification } from "../../domainModel";
import {
  classifyStrategicInput,
  formatStanceAwareCopy,
} from "./classifyStrategicInput";

describe("ClassifiedStrategicInput epistemic stance", () => {
  it("preserves existing domain vocabulary", () => {
    expect(STRATEGIC_JUDGMENT_STAGE_ORDER[0]).toBe("clarify_question");
    expect(EVIDENCE_STRENGTH_LABEL.assumed).toBeTruthy();
    expect(REVERSIBILITY_LABEL.easily_reversible).toBeTruthy();
    expect(DECISION_READINESS_LABEL.decision_complete).toBeTruthy();
  });

  it("assigns observation stance with noticing copy", () => {
    const text = "I have had fewer inquiries this month.";
    const c = classifyStrategicInput(text);
    expect(c.stance).toBe("observation");
    expect(c.originalText).toBe(text);
    expect(c.safeToTreatAsFact).toBe(false);
    expect(formatStanceAwareCopy(c)).toBe(
      "You've noticed fewer inquiries this month.",
    );
  });

  it("assigns interpretation stance and keeps it tentative", () => {
    const text = "People must think I'm too expensive.";
    const c = classifyStrategicInput(text);
    expect(c.stance).toBe("interpretation");
    expect(c.safeToTreatAsFact).toBe(false);
    expect(formatStanceAwareCopy(c)).toBe(
      "One possible interpretation is that price may be affecting interest.",
    );
  });

  it("assigns assumption stance and never treats it as fact", () => {
    const text = "My members would leave if I raised the price.";
    const c = classifyStrategicInput(text);
    expect(c.stance).toBe("assumption");
    expect(c.classifications).toContain("assumption");
    expect(c.safeToTreatAsFact).toBe(false);
    expect(formatStanceAwareCopy(c)).toBe(
      "You're concerned members may leave, but that is still something we would need to test.",
    );
  });

  it("assigns feeling stance and never treats it as fact", () => {
    const text = "I feel like the business is failing.";
    const c = classifyStrategicInput(text);
    expect(c.stance).toBe("feeling");
    expect(c.safeToTreatAsFact).toBe(false);
    expect(formatStanceAwareCopy(c)).toBe(
      "It feels to you as though the business is failing. We should separate that feeling from what the results are showing.",
    );
  });

  it("assigns unknown stance and keeps cause unresolved", () => {
    const text = "I don't know why sales dropped.";
    const c = classifyStrategicInput(text);
    expect(c.stance).toBe("unknown");
    expect(c.safeToTreatAsFact).toBe(false);
    expect(formatStanceAwareCopy(c)).toBe(
      "We know sales dropped, but the cause is still unclear.",
    );
  });

  it("assigns fact stance and requires adequate evidence for safeToTreatAsFact", () => {
    const weak = classifyStrategicInput("Costs rose.");
    // Without measurable confirmation, do not elevate
    if (weak.stance === "fact") {
      expect(weak.safeToTreatAsFact).toBe(false);
    } else {
      expect(weak.safeToTreatAsFact).toBe(false);
    }

    const strong = classifyStrategicInput(
      "Revenue dropped 20% and the data is confirmed.",
    );
    expect(strong.stance).toBe("fact");
    expect(strong.classifications).toContain("fact");
    expect(strong.evidenceStrength).toBe("strong_signal");
    expect(strong.safeToTreatAsFact).toBe(true);
    expect(strong.originalText).toBe(
      "Revenue dropped 20% and the data is confirmed.",
    );
    expect(formatStanceAwareCopy(strong)).toBe(strong.originalText);
  });

  it("observations do not become causal claims in copy", () => {
    const c = classifyStrategicInput(
      "I noticed customers are asking about price.",
    );
    expect(c.stance).toBe("observation");
    const copy = formatStanceAwareCopy(c);
    expect(copy.toLowerCase()).toContain("noticed");
    expect(copy.toLowerCase()).not.toMatch(
      /\b(because|caused|proves|means that)\b/,
    );
  });

  it("preserves original wording on the classified record", () => {
    const text = "I think everyone will leave if I raise the price.";
    const c = classifyStrategicInput(text);
    expect(c.originalText).toBe(text);
  });

  it("keeps primary StrategicInputClassification values unchanged", () => {
    const roles: StrategicInputClassification[] = [
      "question",
      "goal",
      "constraint",
      "assumption",
      "fact",
      "evidence",
      "preference",
      "value",
      "risk",
      "opportunity",
      "idea",
      "option",
      "concern",
      "decision",
      "unknown",
    ];
    const c = classifyStrategicInput(
      "I think everyone will leave if I raise the price.",
    );
    for (const role of c.classifications) {
      expect(roles).toContain(role);
    }
    expect(c.classifications).toContain("assumption");
    // Stance is additive — not a replacement role label
    expect(c.stance).toBe("assumption");
    expect(c.classifications).not.toContain("observation" as never);
  });

  it("covers each stance value", () => {
    const cases: Array<[string, Classified["stance"]]> = [
      ["Revenue is confirmed at 20% growth.", "fact"],
      ["I have had fewer inquiries this month.", "observation"],
      ["People must think I'm too expensive.", "interpretation"],
      ["My members would leave if I raised the price.", "assumption"],
      ["I feel like the business is failing.", "feeling"],
      ["I don't know why sales dropped.", "unknown"],
    ];
    for (const [text, stance] of cases) {
      expect(classifyStrategicInput(text).stance).toBe(stance);
    }
  });
});

type Classified = ReturnType<typeof classifyStrategicInput>;
