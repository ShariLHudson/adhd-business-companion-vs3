import { getSimulationBootstrap } from "@/lib/executiveSimulation";

export { composeSimulationSession, composeSimulationById } from "@/lib/executiveSimulation";

export function getSimulationCenterBootstrap() {
  return getSimulationBootstrap();
}
