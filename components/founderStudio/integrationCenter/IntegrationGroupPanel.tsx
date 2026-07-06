"use client";

import type { IntegrationGroup } from "@/lib/executiveIntegration/types";

import { ExecutivePanel } from "../executive";
import { IntegrationCard } from "./IntegrationCard";

type IntegrationGroupPanelProps = {
  group: IntegrationGroup;
  defaultOpen?: boolean;
};

export function IntegrationGroupPanel({ group, defaultOpen = false }: IntegrationGroupPanelProps) {
  return (
    <ExecutivePanel title={group.label} subtitle={group.purpose} collapsible defaultOpen={defaultOpen}>
      <ul className="founder-integration__card-grid">
        {group.integrations.map((integration) => (
          <li key={integration.id}>
            <IntegrationCard integration={integration} />
          </li>
        ))}
      </ul>
    </ExecutivePanel>
  );
}
