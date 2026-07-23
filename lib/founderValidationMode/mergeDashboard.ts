/**
 * Living Certification Dashboard + Founder Validation overlays.
 */

import {
  buildCertificationDashboard,
  formatCertificationDashboardMarkdown,
  type CapabilityDashboardRow,
} from "@/lib/createCertification/certificationDashboard";
import type { FounderValidationStore } from "./types";

/**
 * Merge approved/recorded overlays into the living dashboard.
 * CERTIFIED only appears if overlay.certification === CERTIFIED (requires approval).
 */
export function buildFounderValidationDashboard(
  store: FounderValidationStore,
): CapabilityDashboardRow[] {
  const base = buildCertificationDashboard();
  return base.map((row) => {
    const overlay = store.overlays.find((o) => o.journeyId === row.capabilityId);
    if (!overlay) return row;
    return {
      ...row,
      browser: overlay.browser,
      ux: overlay.emotional,
      adhd: overlay.emotional,
      trust:
        row.capabilityId === "TRUST" ? overlay.browser : overlay.emotional,
      certification: overlay.certification,
      notes: overlay.notes || row.notes,
    };
  });
}

export function formatFounderValidationDashboardMarkdown(
  store: FounderValidationStore,
): string {
  const rows = buildFounderValidationDashboard(store);
  const header =
    "| Capability | Arch | Impl | Unit | Integration | Browser | UX | ADHD | Trust | Status |\n" +
    "|---|---|---|---|---|---|---|---|---|---|";
  const body = rows
    .map(
      (r) =>
        `| ${r.capabilityId} ${r.capability} | ${r.architecture} | ${r.implementation} | ${r.unit} | ${r.integration} | ${r.browser} | ${r.ux} | ${r.adhd} | ${r.trust} | ${r.certification} |`,
    )
    .join("\n");

  const certifiedCount = rows.filter((r) => r.certification === "CERTIFIED").length;
  return [
    "# Creation Platform — Living Certification Dashboard (Founder Validation)",
    "",
    `_Updated from Founder Validation Mode. CERTIFIED count: ${certifiedCount}. Never auto-CERTIFIED._`,
    "",
    header,
    body,
    "",
    "---",
    "",
    "Baseline (library matrix without overlays):",
    "",
    formatCertificationDashboardMarkdown(),
  ].join("\n");
}
