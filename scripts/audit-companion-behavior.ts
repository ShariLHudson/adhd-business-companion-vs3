/**
 * CLI: Companion Behavior Audit (P0.11)
 * Run: npm run audit:companion
 */
import {
  formatCompanionBehaviorAuditReport,
  runCompanionBehaviorAudit,
} from "../lib/companionBehaviorAudit";

const report = runCompanionBehaviorAudit();
console.log(formatCompanionBehaviorAuditReport(report));
process.exit(report.failed > 0 ? 1 : 0);
