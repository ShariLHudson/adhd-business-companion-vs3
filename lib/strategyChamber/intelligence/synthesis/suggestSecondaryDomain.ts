/**
 * Suggest at most one secondary Strategy domain when it materially improves judgment.
 * Never load every related domain.
 */

import type { StrategyTypeId } from "../types";
import { suggestGrowthSecondaryDomain } from "../domains/growth";

/**
 * Pricing → secondary when capacity, growth volume, or offer structure is material.
 */
export function suggestPricingSecondaryDomain(
  text: string,
): StrategyTypeId | null {
  const t = text.toLowerCase();
  if (
    /too much.{0,24}for what|doing too much|far too much|cannot keep up|can't keep up|burned out|overwhelmed|delivery (load|burden)|unsustainable delivery/.test(
      t,
    )
  ) {
    return "capacity_focus";
  }
  if (
    /more customers|grow|growth|not buying|not converting|weak demand|awareness|leads|nobody is buying|no one is buying/.test(
      t,
    ) &&
    !/only (about )?price|just (the )?price|new members? only/.test(t)
  ) {
    // Growth is secondary when price language is primary but demand/volume appears
    if (/price|pricing|charge|fee|underpriced|raise|lower/.test(t)) {
      return "growth";
    }
  }
  if (/offer|package|tier|scope|what (i|we) deliver/.test(t)) {
    return "offer";
  }
  if (/audience|who (is|it's|it is) for|positioning|segment/.test(t)) {
    return "market_customer";
  }
  return null;
}

/**
 * Capacity → secondary when the ask is growth or pricing under load.
 */
export function suggestCapacitySecondaryDomain(
  text: string,
): StrategyTypeId | null {
  const t = text.toLowerCase();
  if (/grow|growth|more customers|scale|expand/.test(t)) return "growth";
  if (/price|pricing|charge|underpriced|raise|fee/.test(t)) return "pricing";
  if (/hire|delegate|va|assistant/.test(t)) return "hiring_delegation";
  return null;
}

/**
 * Hiring → secondary growth/capacity check (hiring is not automatically required).
 */
export function suggestHiringSecondaryDomain(
  text: string,
): StrategyTypeId | null {
  const t = text.toLowerCase();
  // Overload → capacity first (hiring is not assumed)
  if (
    /overwhelmed|burned out|too much|capacity|cannot keep|can't keep|keep up/.test(
      t,
    )
  ) {
    return "capacity_focus";
  }
  if (/grow|growth|scale|more customers/.test(t)) return "growth";
  return null;
}

/**
 * Offer → Customer/Market when audience is unclear.
 */
export function suggestOfferSecondaryDomain(text: string): StrategyTypeId | null {
  const t = text.toLowerCase();
  if (
    /who .{0,24}for|audience|segment|market|positioning|do not know who|don't know who/.test(
      t,
    )
  ) {
    return "market_customer";
  }
  if (/price|pricing|charge|what to charge/.test(t)) return "pricing";
  if (/grow|growth|more customers/.test(t)) return "growth";
  return null;
}

/**
 * Dispatch: at most one secondary, never equal to primary.
 */
export function suggestSecondaryDomainForPrimary(
  primaryId: StrategyTypeId,
  text: string,
): { secondaryId: StrategyTypeId; reason: string } | null {
  let secondary: StrategyTypeId | null = null;
  let reason = "";

  switch (primaryId) {
    case "growth": {
      secondary = suggestGrowthSecondaryDomain(text);
      if (
        !secondary &&
        /posting regularly|right customers|wrong customers|not attracting/.test(
          text.toLowerCase(),
        )
      ) {
        secondary = "market_customer";
      }
      if (secondary === "capacity_focus") {
        reason = "Delivery or founder capacity may be the binding constraint.";
      } else if (secondary === "pricing") {
        reason = "Revenue may need price or value-per-customer, not only volume.";
      } else if (secondary === "offer") {
        reason = "Offer design may be limiting growth more than acquisition.";
      } else if (secondary === "market_customer") {
        reason = "Audience or market definition may be the real gap.";
      } else if (secondary === "hiring_delegation") {
        reason = "Hiring may or may not remove the growth constraint.";
      } else if (secondary === "partnership") {
        reason = "Partnership may be one growth path among others.";
      }
      break;
    }
    case "pricing": {
      secondary = suggestPricingSecondaryDomain(text);
      if (secondary === "capacity_focus") {
        reason =
          "Delivery burden and sustainability may matter as much as the number.";
      } else if (secondary === "growth") {
        reason = "Demand, conversion, or retention may be mixed with the price question.";
      } else if (secondary === "offer") {
        reason = "Packaging or scope may need to change with or instead of price.";
      } else if (secondary === "market_customer") {
        reason = "Audience fit may explain price resistance.";
      }
      break;
    }
    case "capacity_focus": {
      secondary = suggestCapacitySecondaryDomain(text);
      if (secondary === "growth") {
        reason = "Growth ambitions must respect capacity limits.";
      } else if (secondary === "pricing") {
        reason = "Price or scope may relieve capacity pressure.";
      } else if (secondary === "hiring_delegation") {
        reason = "Delegation may be one path after simplification.";
      }
      break;
    }
    case "hiring_delegation": {
      secondary = suggestHiringSecondaryDomain(text);
      if (secondary === "growth") {
        reason = "Hiring should only follow if it removes a real growth constraint.";
      } else if (secondary === "capacity_focus") {
        reason = "Workload design may matter before a hire.";
      }
      break;
    }
    case "offer": {
      secondary = suggestOfferSecondaryDomain(text);
      if (secondary === "market_customer") {
        reason = "Who the offer is for may be unclear.";
      } else if (secondary === "pricing") {
        reason = "Price and packaging may need to move with the offer.";
      } else if (secondary === "growth") {
        reason = "Offer changes may be a growth path.";
      }
      break;
    }
    case "market_customer": {
      if (/offer|program|package|launch/.test(text.toLowerCase())) {
        secondary = "offer";
        reason = "Offer design may need to match the audience.";
      } else if (/grow|growth|more customers/.test(text.toLowerCase())) {
        secondary = "growth";
        reason = "Market choice may be serving a growth decision.";
      }
      break;
    }
    default:
      secondary = null;
  }

  if (!secondary || secondary === primaryId) return null;
  return { secondaryId: secondary, reason: reason || "Secondary domain may improve judgment." };
}
