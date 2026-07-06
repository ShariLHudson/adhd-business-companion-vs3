"use client";

import { useMemo } from "react";

import {
  composeEcosystemSystemsStatus,
  ECOSYSTEM_SYSTEMS_STATUS_HEADLINE,
  type EcosystemSystemStatusKind,
} from "@/lib/executiveIntegration/ecosystemSystemsStatus";

import { useMarketingIntegrationStatus } from "./useMarketingIntegrationStatus";

function statusIcon(kind: EcosystemSystemStatusKind): string {
  if (kind === "connected") return "✅";
  if (kind === "planned") return "⏳";
  return "—";
}

export function EcosystemSystemsStatusTable() {
  const liveStatus = useMarketingIntegrationStatus();
  const rows = useMemo(
    () => composeEcosystemSystemsStatus(liveStatus),
    [liveStatus],
  );

  return (
    <section
      className="founder-integration__systems"
      aria-labelledby="ecosystem-systems-title"
    >
      <h2 className="founder-integration__section-title" id="ecosystem-systems-title">
        Ecosystem systems
      </h2>
      <p className="founder-integration__lead">{ECOSYSTEM_SYSTEMS_STATUS_HEADLINE}</p>

      <div className="founder-integration__systems-table-wrap">
        <table className="founder-integration__systems-table">
          <caption className="sr-only">
            Connected and planned systems across Visual Spark Studios
          </caption>
          <thead>
            <tr>
              <th scope="col">System</th>
              <th scope="col">Status</th>
              <th scope="col">Purpose</th>
              <th scope="col">Last Sync</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} data-status={row.statusKind}>
                <th scope="row">{row.system}</th>
                <td>
                  <span className="founder-integration__systems-status">
                    <span aria-hidden="true">{statusIcon(row.statusKind)}</span>{" "}
                    {row.statusLabel}
                  </span>
                </td>
                <td>{row.purpose}</td>
                <td>{row.lastSync}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
