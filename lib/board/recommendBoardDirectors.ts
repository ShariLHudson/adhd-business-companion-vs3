/**
 * Shari Director recommendation — focused Board groups.
 * Pure logic over the Board registry. Does not auto-add Devil’s Advocate.
 * Does not open Chamber or update profiles.
 *
 * Recommended Directors are dynamic by decision.
 * Core Board (CORE_BOARD_DIRECTOR_IDS) is a separate stable oversight group.
 */

import { ensureChairIncluded } from "@/lib/board/boardDirectorRegistry";
import {
  BOARD_MAY_AUTO_ADD_DEVILS_ADVOCATE,
  CORE_BOARD_DIRECTOR_IDS,
  type BoardDirectorId,
  type BoardDirectorRecommendation,
} from "@/lib/board/types";

const DEVILS_ADVOCATE_TRIGGERS =
  /\b(launch|new offer|pricing|price change|partnership|hiring|hire|new market|audience|target audience|system investment|technology investment|major feature|direction|financial commitment|invest|budget|ethics|ethical|risk)\b/i;

/**
 * Recommend a small Board group for a decision.
 * Always includes Chair. Never auto-adds Devil’s Advocate.
 * Must differ from CORE_BOARD_DIRECTOR_IDS for typical decisions.
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

  const isHiring =
    /\b(hir(e|ing)|recruit|part[- ]?time|assistant|va\b|employee|headcount|role)\b/.test(
      q,
    );
  const isTech =
    /\b(tech|technology|software|system|automat|platform|ai|tool|app)\b/.test(q);
  const isAudience =
    /\b(audience|market|customer|avatar|people i help|positioning|messaging|brand)\b/.test(
      q,
    );
  const isOffer =
    /\b(offer|launch|product|pilot|pricing|price|package)\b/.test(q);
  const isDirection =
    /\b(direction|pivot|vision|strategy|business model|what (?:kind|type) of business)\b/.test(
      q,
    );
  const isFinancial =
    /\b(invest|investment|cost|budget|afford|cash|revenue|financial|profit|pricing)\b/.test(
      q,
    );
  const isPartnership =
    /\b(partner(ship)?|joint venture|collaborate|co[- ]?found)\b/.test(q);
  const isEthical =
    /\b(ethic|integrity|trust|values|reputation|fair|honest)\b/.test(q);
  const isWorkload =
    /\b(workload|overwhelm|capacity|burnout|too much|bandwidth|operations)\b/.test(
      q,
    );
  const isRisk =
    /\b(risk|resilien|fail|downside|continuity|exposure)\b/.test(q);
  const isCustomerIssue =
    /\b(complaint|churn|support|client issue|customer issue|retention)\b/.test(
      q,
    );

  if (isHiring) {
    selected = [
      "board-chair",
      "operations-capacity",
      "financial-stewardship",
      "founder-advocate",
      "customer-market",
    ];
    rationaleByDirector["operations-capacity"] =
      "Tests role clarity, supervision, and delivery load before headcount grows.";
    rationaleByDirector["financial-stewardship"] =
      "Looks at full cost of the hire, not only wages.";
    rationaleByDirector["founder-advocate"] =
      "Checks whether the founder can sustain the added leadership load.";
    rationaleByDirector["customer-market"] =
      "Asks what customer-facing gap the hire is meant to close.";
  } else if (isPartnership) {
    selected = [
      "board-chair",
      "strategy-director",
      "values-trust",
      "financial-stewardship",
      "risk-resilience",
    ];
    rationaleByDirector["strategy-director"] =
      "Clarifies what the partnership advances — and what it dilutes.";
    rationaleByDirector["values-trust"] =
      "Tests integrity and reputation fit before commitment.";
    rationaleByDirector["financial-stewardship"] =
      "Examines shared economics and downside.";
    rationaleByDirector["risk-resilience"] =
      "Surfaces dependency and exit risk.";
  } else if (isEthical) {
    selected = [
      "board-chair",
      "values-trust",
      "founder-advocate",
      "customer-market",
      "risk-resilience",
    ];
    rationaleByDirector["values-trust"] =
      "Anchors the decision in integrity and earned trust.";
    rationaleByDirector["founder-advocate"] =
      "Protects whether this still feels like your business.";
    rationaleByDirector["customer-market"] =
      "Checks how the choice lands with the people you serve.";
    rationaleByDirector["risk-resilience"] =
      "Names reputational and continuity exposure.";
  } else if (isCustomerIssue) {
    selected = [
      "board-chair",
      "customer-market",
      "operations-capacity",
      "values-trust",
      "growth-opportunity",
    ];
    rationaleByDirector["customer-market"] =
      "Represents the customer experience and demand reality.";
    rationaleByDirector["operations-capacity"] =
      "Checks whether delivery can actually improve.";
    rationaleByDirector["values-trust"] =
      "Protects trust repair over quick optics.";
    rationaleByDirector["growth-opportunity"] =
      "Looks for the upside of fixing this well.";
  } else if (isWorkload) {
    selected = [
      "board-chair",
      "operations-capacity",
      "founder-advocate",
      "financial-stewardship",
      "risk-resilience",
    ];
    rationaleByDirector["operations-capacity"] =
      "Names capacity and process constraints honestly.";
    rationaleByDirector["founder-advocate"] =
      "Protects founder sustainability under load.";
    rationaleByDirector["financial-stewardship"] =
      "Weighs cost of relief versus cost of overload.";
    rationaleByDirector["risk-resilience"] =
      "Surfaces what breaks if nothing changes.";
  } else if (isOffer) {
    selected = [
      "board-chair",
      "customer-market",
      "financial-stewardship",
      "operations-capacity",
      "growth-opportunity",
    ];
    rationaleByDirector["customer-market"] =
      "Tests whether demand and trust support a launch.";
    rationaleByDirector["financial-stewardship"] =
      "Checks affordability and the smallest responsible test.";
    rationaleByDirector["operations-capacity"] =
      "Confirms the business can deliver what is promised.";
    rationaleByDirector["growth-opportunity"] =
      "Looks for upside without reckless expansion.";
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
      "strategy-director",
    ];
    rationaleByDirector["customer-market"] =
      "Represents market reality and evidence of fit.";
    rationaleByDirector["growth-opportunity"] =
      "Looks for upside and optionality in the audience shift.";
    rationaleByDirector["founder-advocate"] =
      "Protects whether this is still the business you want.";
    rationaleByDirector["strategy-director"] =
      "Clarifies strategic focus versus dilution.";
  } else if (isDirection) {
    selected = [
      "board-chair",
      "strategy-director",
      "founder-advocate",
      "financial-stewardship",
      "growth-opportunity",
      "values-trust",
    ];
    rationaleByDirector["strategy-director"] =
      "Clarifies the strategic choice and long-term direction.";
    rationaleByDirector["founder-advocate"] =
      "Anchors the decision in the business and life you want.";
    rationaleByDirector["financial-stewardship"] =
      "Tests whether the direction is financially sound.";
    rationaleByDirector["growth-opportunity"] =
      "Examines long-term possibility without reckless expansion.";
    rationaleByDirector["values-trust"] =
      "Checks alignment with what the business stands for.";
  } else if (isRisk) {
    selected = [
      "board-chair",
      "risk-resilience",
      "financial-stewardship",
      "operations-capacity",
      "strategy-director",
    ];
    rationaleByDirector["risk-resilience"] =
      "Surfaces failure modes and recovery paths.";
    rationaleByDirector["financial-stewardship"] =
      "Quantifies downside and flexibility.";
    rationaleByDirector["operations-capacity"] =
      "Checks what delivery depends on.";
    rationaleByDirector["strategy-director"] =
      "Keeps the risk conversation tied to the real strategic choice.";
  } else if (isFinancial) {
    selected = [
      "board-chair",
      "financial-stewardship",
      "strategy-director",
      "risk-resilience",
      "founder-advocate",
    ];
    rationaleByDirector["financial-stewardship"] =
      "Financial exposure is central to this decision.";
    rationaleByDirector["strategy-director"] =
      "Checks whether the spend advances the real bet.";
    rationaleByDirector["risk-resilience"] =
      "Names recovery if returns lag.";
    rationaleByDirector["founder-advocate"] =
      "Protects founder capacity under financial pressure.";
  } else {
    // Default recommended — focused five, intentionally not the seven-seat Core Board
    selected = [
      "board-chair",
      "founder-advocate",
      "financial-stewardship",
      "customer-market",
      "operations-capacity",
    ];
    rationaleByDirector["founder-advocate"] = "Protects vision and capacity.";
    rationaleByDirector["financial-stewardship"] =
      "Evaluates financial soundness.";
    rationaleByDirector["customer-market"] =
      "Brings customer and market evidence into view.";
    rationaleByDirector["operations-capacity"] =
      "Tests whether delivery is realistic.";
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

/** Stable Core Board — broad general oversight (Customize / More). */
export function coreBoardDirectorIds(): readonly BoardDirectorId[] {
  return CORE_BOARD_DIRECTOR_IDS;
}

/** True when Recommended and Core Board select identical ordered groups. */
export function recommendedMatchesCoreBoard(
  decisionText: string,
): boolean {
  const rec = recommendBoardDirectorsForDecision(decisionText);
  if (rec.directorIds.length !== CORE_BOARD_DIRECTOR_IDS.length) return false;
  return rec.directorIds.every(
    (id, i) => id === CORE_BOARD_DIRECTOR_IDS[i],
  );
}

/** Confirms Slice 1 policy: Devil’s Advocate is never auto-added. */
export function recommendationIncludesDevilsAdvocateAutomatically(
  rec: BoardDirectorRecommendation,
): boolean {
  if (BOARD_MAY_AUTO_ADD_DEVILS_ADVOCATE) return true;
  return rec.directorIds.includes("devils-advocate");
}
