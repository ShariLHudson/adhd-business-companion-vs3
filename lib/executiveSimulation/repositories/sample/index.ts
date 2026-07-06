import {
  SAMPLE_SIMULATIONS,
  SIMULATION_STUDIO_PRINCIPLE,
  SUGGESTED_DECISIONS,
  getSampleSimulation,
} from "../../sample/simulationData";
import type { ExecutiveSimulation, ScenarioComparisonRow } from "../../types";

export const simulationSampleRepository = {
  principle: () => SIMULATION_STUDIO_PRINCIPLE,
  suggestedDecisions: () => SUGGESTED_DECISIONS,
  simulations: () => SAMPLE_SIMULATIONS,
  get: (id: string) => getSampleSimulation(id),
};

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function matchSimulation(query: string): ExecutiveSimulation | undefined {
  const q = normalizeQuery(query);
  if (q.includes("workshop") && (q.includes("membership") || q.includes("tier"))) {
    return getSampleSimulation("sim-workshop-vs-membership");
  }
  if (q.includes("founder") && q.includes("companion")) {
    return getSampleSimulation("sim-founder-vs-companion");
  }
  if (q.includes("launch") && q.includes("listening")) {
    return getSampleSimulation("sim-workshop-vs-membership");
  }
  if (q.includes("pricing") || q.includes("raise")) {
    return getSampleSimulation("sim-workshop-vs-membership");
  }
  if (q.includes("automate")) {
    return getSampleSimulation("sim-founder-vs-companion");
  }
  if (q.includes("partner")) {
    return getSampleSimulation("sim-workshop-vs-membership");
  }
  return SAMPLE_SIMULATIONS[0];
}

export function buildComparisonRows(simulation: ExecutiveSimulation): ScenarioComparisonRow[] {
  const ids = simulation.scenarios.map((s) => s.id);
  const row = (label: string, pick: (s: (typeof simulation.scenarios)[0]) => string): ScenarioComparisonRow => ({
    label,
    values: Object.fromEntries(simulation.scenarios.map((s) => [s.id, pick(s)])),
  });
  return [
    row("Time", (s) => `~${s.estimatedTimeWeeks} weeks`),
    row("Effort", (s) => s.estimatedEffort),
    row("Founder energy", (s) => s.estimatedFounderEnergy),
    row("Customer impact", (s) => s.estimatedCustomerImpact),
    row("Revenue", (s) => s.estimatedRevenueOpportunity),
    row("Confidence", (s) => s.confidence),
  ];
}
