import type { IntegrationGroup } from "@/lib/executiveIntegration/types";
import type { MarketingIntegrationLiveStatus } from "@/lib/executiveIntegration";

import { ExecutivePanel } from "../executive";
import { IntegrationCard } from "./IntegrationCard";

type IntegrationGroupPanelProps = {
  group: IntegrationGroup;
  defaultOpen?: boolean;
  liveStatus?: MarketingIntegrationLiveStatus;
  excludeIntegrationIds?: string[];
};

export function IntegrationGroupPanel({
  group,
  defaultOpen = false,
  liveStatus,
  excludeIntegrationIds = [],
}: IntegrationGroupPanelProps) {
  const integrations = group.integrations.filter(
    (i) => !excludeIntegrationIds.includes(i.id),
  );

  if (integrations.length === 0) return null;

  return (
    <ExecutivePanel title={group.label} subtitle={group.purpose} collapsible defaultOpen={defaultOpen}>
      <ul className="founder-integration__card-grid">
        {integrations.map((integration) => (
          <li key={integration.id}>
            <IntegrationCard integration={integration} liveStatus={liveStatus} />
          </li>
        ))}
      </ul>
    </ExecutivePanel>
  );
}
