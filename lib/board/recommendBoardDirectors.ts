/**
 * Shari Director recommendation — focused Board groups.
 * Pure logic over the Board registry. Does not auto-add Devil’s Advocate.
 * Does not open Chamber or update profiles.
 */

import { ensureChairIncluded } from "@/lib/board/boardDirectorRegistry";
import {
  BOARD_MAY_AUTO_ADD_DEVILS_ADVOCATE,
  type BoardDirectorId,
  type BoardDirectorRecommendation,
} from "@/lib/board/types";

const DEVILS_ADVOCATE_TRIGGERS =
  /\b(launch|new offer|pricing|price change|partnership|hiring|hire|new market|audience|target audience|system investment|technology investment|major feature|direction|financial commitment|invest|budget)\b/i;

/**
 * Recommend a small Board group for a decision.
 * Always includes Chair. Never auto-adds Devil’s Advocate.
 */
export function recommendBoardDirectorsForDecision(
  decisionText: string,
): BoardDirectorRecommendation {
  const q = decisionText.toLowerCase();
  const rationaleByDirector: Partial<Record<BoardDirectorId, string>> = {
    "board-chair":
      "Leads the meeting and keeps the Board focused on the real decision.",
  };

  let selected: BoardDirectorId[] = ["board-chair"];

  const isTech =
    /\b(tech|technology|software|system|automat|platform|ai)\b/.test(q);
  const isAudience =
    /\b(audience|market|customer|avatar|people i help|positioning)\b/.test(q);
  const isOffer = /\b(offer|launch|product|pilot|pricing|price)\b/.test(q);
  const isDirection =
    /\b(direction|pivot|vision|strategy|business model|what (?:kind|type) of business)\b/.test(
      q,
    );
  const isFinancial =
    /\b(invest|cost|budget|afford|cash|revenue|financial)\b/.test(q);

  if (isOffer) {
    selected = [
      "board-chair",
      "customer-market",
      "financial-stewardship",
      "operations-capacity",
    ];
    rationaleByDirector["customer-market"] =
      "Tests whether demand and trust support a launch.";
    rationaleByDirector["financial-stewardship"] =
      "Checks affordability and the smallest responsible test.";
    rationaleByDirector["operations-capacity"] =
      "Confirms the business can deliver what is promised.";
  } else if (isTech) {
    selected = [
      "board-chair",
      "technology-future",
      "financial-stewardship",
      "operations-capacity",
      "risk-resilience",
    ];
    rationaleByDirector["technology-future"] =
      "Asks whether the investment stays wise as technology changes.";
    rationaleByDirector["financial-stewardship"] =
      "Weighs cost against return and exposure.";
    rationaleByDirector["operations-capacity"] =
      "Checks delivery load and dependencies.";
    rationaleByDirector["risk-resilience"] =
      "Surfaces continuity and recovery concerns.";
  } else if (isAudience) {
    selected = [
      "board-chair",
      "customer-market",
      "growth-opportunity",
      "founder-advocate",
    ];
    rationaleByDirector["customer-market"] =
      "Represents market reality and evidence of fit.";
    rationaleByDirector["growth-opportunity"] =
      "Looks for upside and optionality in the audience shift.";
    rationaleByDirector["founder-advocate"] =
      "Protects whether this is still the business you want.";
  } else if (isDirection) {
    selected = [
      "board-chair",
      "founder-advocate",
      "financial-stewardship",
      "growth-opportunity",
      "values-trust",
    ];
    rationaleByDirector["founder-advocate"] =
      "Anchors the decision in the business and life you want.";
    rationaleByDirector["financial-stewardship"] =
      "Tests whether the direction is financially sound.";
    rationaleByDirector["growth-opportunity"] =
      "Examines long-term possibility without reckless expansion.";
    rationaleByDirector["values-trust"] =
      "Checks alignment with what the business stands for.";
  } else {
    // Default: core board (focused, not entire roster)
    selected = [
      "board-chair",
      "founder-advocate",
      "financial-stewardship",
      "customer-market",
      "operations-capacity",
    ];
    rationaleByDirector["founder-advocate"] =
      "Protects vision and capacity.";
    rationaleByDirector["financial-stewardship"] =
      "Evaluates financial soundness.";
    rationaleByDirector["customer-market"] =
      "Brings customer and market evidence into view.";
    rationaleByDirector["operations-capacity"] =
      "Tests whether delivery is realistic.";
    if (isFinancial) {
      rationaleByDirector["financial-stewardship"] =
        "Financial exposure is central to this decision.";
    }
  }

  const directorIds = ensureChairIncluded(selected);
  const offerDevilsAdvocate = DEVILS_ADVOCATE_TRIGGERS.test(decisionText);

  return {
    directorIds,
    rationaleByDirector,
    offerDevilsAdvocate,
    offerDevilsAdvocateReason: offerDevilsAdvocate
      ? "This decision involves meaningful stakes or limited evidence — the Devil’s Advocate can test it before a recommendation, only if you want that."
      : undefined,
  };
}

/** Confirms Slice 1 policy: Devil’s Advocate is never auto-added. */
export function recommendationIncludesDevilsAdvocateAutomatically(
  rec: BoardDirectorRecommendation,
): boolean {
  if (BOARD_MAY_AUTO_ADD_DEVILS_ADVOCATE) return true;
  return rec.directorIds.includes("devils-advocate");
}
