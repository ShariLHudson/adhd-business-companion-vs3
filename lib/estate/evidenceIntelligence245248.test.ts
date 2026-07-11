/**
 * Binding tests for Evidence Intelligence docs 245–248.
 */
import { describe, expect, it } from "vitest";
import {
  EVIDENCE_CAPTURE_DESTINATIONS,
  EVIDENCE_CAPTURE_PROMPT,
  EVIDENCE_INTELLIGENCE_GUIDING_PRINCIPLE,
  EVIDENCE_VAULT_EMOTIONAL_ROLE,
  HALL_OF_ACCOMPLISHMENTS_EMOTIONAL_ROLE,
  detectsEvidenceCaptureMoment,
  formatEvidenceCaptureOfferMessage,
  shouldRecommendEvidenceVault,
  suggestsHallOverVault,
} from "./evidenceIntelligence";
import {
  buildWinSaveOffer,
  detectsEncouragementNeed,
} from "./winSaveOffer";
import {
  detectsSoftDiscouragement,
  handleEvidenceCaptureMoment,
} from "./winSavePending";
import { EVIDENCE_CATEGORIES } from "@/lib/evidenceBankStore";
import { HALL_ACHIEVEMENT_TYPES } from "@/lib/growthPortfolioStore";

describe("245 Evidence Intelligence Architecture", () => {
  it("binds guiding principle and emotional roles", () => {
    expect(EVIDENCE_INTELLIGENCE_GUIDING_PRINCIPLE).toMatch(
      /evidence instead of empty encouragement/i,
    );
    expect(EVIDENCE_VAULT_EMOTIONAL_ROLE).toBe("Remember who you are.");
    expect(HALL_OF_ACCOMPLISHMENTS_EMOTIONAL_ROLE).toBe(
      "Look what you've accomplished.",
    );
  });
});

describe("246 Evidence Capture Standard", () => {
  it("uses exact permission prompt and destinations", () => {
    expect(EVIDENCE_CAPTURE_PROMPT).toBe("Would you like to save this?");
    expect(EVIDENCE_CAPTURE_DESTINATIONS.map((d) => d.id)).toEqual([
      "evidence-vault",
      "hall-of-accomplishments",
      "both",
      "not-now",
    ]);
    expect(EVIDENCE_CAPTURE_DESTINATIONS.map((d) => d.label)).toEqual([
      "Evidence Vault",
      "Hall of Accomplishments",
      "Both",
      "Not now",
    ]);
    const offer = buildWinSaveOffer("Client sent a thank-you");
    expect(offer.prompt).toBe(EVIDENCE_CAPTURE_PROMPT);
    expect(offer.options.map((o) => o.label)).toEqual(
      EVIDENCE_CAPTURE_DESTINATIONS.map((d) => d.label),
    );
  });

  it("detects moments worth saving and offers without auto-saving", () => {
    expect(
      detectsEvidenceCaptureMoment(
        "My client sent a thank-you message after the launch.",
      ),
    ).toBe(true);
    expect(
      detectsEvidenceCaptureMoment("I had a personal breakthrough today."),
    ).toBe(true);
    expect(detectsEvidenceCaptureMoment("hello")).toBe(false);

    const result = handleEvidenceCaptureMoment({
      userText: "They wrote a testimonial about the work we did together.",
      offeredAtTurn: 3,
    });
    expect(result?.kind).toBe("offer");
    if (result?.kind === "offer") {
      expect(result.message).toContain(EVIDENCE_CAPTURE_PROMPT);
      expect(result.message).toMatch(/Evidence Vault/);
      expect(result.message).toMatch(/Hall of Accomplishments/);
      expect(result.message).toMatch(/Not now/);
    }
  });

  it("formatEvidenceCaptureOfferMessage matches win-save menu shape", () => {
    const formatted = formatEvidenceCaptureOfferMessage();
    expect(formatted).toContain("Would you like to save this?");
    expect(formatted).toContain("1. Evidence Vault");
    expect(formatted).toContain("4. Not now");
  });
});

describe("247 Hall of Accomplishments Standard", () => {
  it("includes major milestone types from the standard", () => {
    for (const type of [
      "Degree",
      "Certification",
      "Business",
      "Book",
      "Award",
      "Launch",
      "Career Milestone",
      "Personal Victory",
    ]) {
      expect(HALL_ACHIEVEMENT_TYPES).toContain(type);
    }
  });

  it("suggests Hall for major milestone language", () => {
    expect(suggestsHallOverVault("I graduated and earned my degree")).toBe(
      true,
    );
    expect(suggestsHallOverVault("I published a book this year")).toBe(true);
    expect(suggestsHallOverVault("Got a nice thank-you note")).toBe(false);
  });
});

describe("248 Evidence Vault Standard", () => {
  it("includes vault proof categories from the standard", () => {
    for (const cat of [
      "Small Win",
      "Testimonial",
      "Encouraging Message",
      "Gratitude",
      "Progress",
      "Problem Solving",
      "Lives Impacted",
    ]) {
      expect(EVIDENCE_CATEGORIES).toContain(cat);
    }
  });

  it("recommends Vault on discouragement / self-doubt", () => {
    expect(shouldRecommendEvidenceVault("I'm feeling discouraged")).toBe(true);
    expect(shouldRecommendEvidenceVault("I don't believe in myself")).toBe(
      true,
    );
    expect(detectsEncouragementNeed("Remind me who I am")).toBe(true);
    expect(detectsSoftDiscouragement("I'm doubting myself today")).toBe(true);
  });
});
