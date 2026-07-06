import { simulationSampleRepository, matchSimulation, buildComparisonRows } from "../repositories/sample";
import type { ExecutiveSimulation, ScenarioComparisonRow, SimulationSessionView } from "../types";

export function getSimulationBootstrap() {
  return {
    suggestedDecisions: simulationSampleRepository.suggestedDecisions(),
    sampleSimulationId: "sim-workshop-vs-membership",
  };
}

export function composeSimulationSession(query: string): SimulationSessionView | null {
  const trimmed = query.trim();
  if (!trimmed) return null;
  const simulation = matchSimulation(trimmed);
  if (!simulation) return null;
  return {
    product: "founder",
    query: trimmed,
    simulation: { ...simulation, decisionQuestion: trimmed, generatedAt: new Date().toISOString() },
    generatedAt: new Date().toISOString(),
  };
}

export function composeSimulationById(id: string): SimulationSessionView | null {
  const simulation = simulationSampleRepository.get(id);
  if (!simulation) return null;
  return {
    product: "founder",
    query: simulation.decisionQuestion,
    simulation: { ...simulation, generatedAt: new Date().toISOString() },
    generatedAt: new Date().toISOString(),
  };
}

export function getComparisonRows(simulation: ExecutiveSimulation): ScenarioComparisonRow[] {
  return buildComparisonRows(simulation);
}

export class ExecutiveSimulationService {
  compose(query: string) {
    return composeSimulationSession(query);
  }

  composeById(id: string) {
    return composeSimulationById(id);
  }

  bootstrap() {
    return getSimulationBootstrap();
  }

  comparisonRows(simulation: ExecutiveSimulation) {
    return getComparisonRows(simulation);
  }

  sampleRepository() {
    return simulationSampleRepository;
  }
}

export const executiveSimulationService = new ExecutiveSimulationService();
