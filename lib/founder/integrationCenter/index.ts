import { getExecutiveIntegrationBootstrap } from "@/lib/executiveIntegration";

export {
  composeIntegrationCenterView,
  composeIntegrationSearch,
} from "@/lib/executiveIntegration";

export function getIntegrationCenterBootstrap() {
  return getExecutiveIntegrationBootstrap();
}
