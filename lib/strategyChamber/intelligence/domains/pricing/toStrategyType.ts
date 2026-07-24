import type { StrategyTypeContract } from "../../types";
import { pricingDomainIntelligence } from "./pricingDomain";

/** Bridge Phase 4B Pricing pack into the shared strategy type registry. */
export function pricingDomainAsStrategyType(): StrategyTypeContract {
  const bridge = pricingDomainIntelligence.strategyTypeBridge;
  return {
    id: "pricing",
    version: 2,
    ...bridge,
  };
}
