import type { StrategyTypeContract } from "../../types";
import { growthDomainIntelligence } from "./growthDomain";

/** Bridge Phase 4C Growth pack into the shared strategy type registry. */
export function growthDomainAsStrategyType(): StrategyTypeContract {
  const bridge = growthDomainIntelligence.strategyTypeBridge;
  return {
    id: "growth",
    version: 2,
    ...bridge,
  };
}
