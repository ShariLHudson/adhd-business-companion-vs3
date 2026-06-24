import {
  buildCompanionQaLatencyReport,
  COMPANION_QA_LATENCY_CASES,
  logCompanionQaLatencyReport,
} from "../lib/companionLatencyProfiler";

logCompanionQaLatencyReport();

const rows = buildCompanionQaLatencyReport(COMPANION_QA_LATENCY_CASES);
const fastOrInstant = rows.filter((r) => r.routeClass !== "deep");
const deep = rows.filter((r) => r.routeClass === "deep");

console.info("[companion-latency] summary", {
  fastPathCases: fastOrInstant.length,
  deepPathCases: deep.length,
  allSkipHeavyOnFast: fastOrInstant.every((r) => r.skipHeavyLayers),
});
