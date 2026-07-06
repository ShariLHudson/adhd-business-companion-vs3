import { getDiscoveryEngineBootstrap } from "@/lib/executiveDiscoveryEngine";

export {
  composeDailyDiscoveryBrief,
  composeWeeklyDiscoveryReport,
  composeMonthlyExecutiveDiscoveryReport,
  composeDiscoveryFindingDetail,
} from "@/lib/executiveDiscoveryEngine";

export function getDiscoveryEngineCenterBootstrap() {
  return getDiscoveryEngineBootstrap();
}
