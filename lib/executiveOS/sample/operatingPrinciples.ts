import type { OperatingLoopStage } from "../types";

export const EXECUTIVE_OPERATING_LOOP: OperatingLoopStage[] = [
  "observe",
  "collect",
  "connect",
  "understand",
  "discover",
  "recommend",
  "compare",
  "decide",
  "prepare",
  "approve",
  "orchestrate",
  "monitor",
  "measure",
  "improve",
  "remember",
  "learn",
  "repeat",
];

export const COORDINATED_SYSTEMS = [
  "research",
  "spark",
  "executive_questions",
  "executive_decision",
  "executive_brief",
  "mission_workspace",
  "executive_orchestrator",
  "institutional_memory",
  "continuous_improvement",
  "command_center",
  "founder_profile",
  "opportunity_discovery",
  "overnight_cycle",
] as const;

export const ONE_RECOMMENDATION_PRINCIPLE =
  "One Primary Recommendation · Three Supporting Opportunities · Everything else waits in the Library.";

export const EXECUTIVE_OS_PRINCIPLE =
  "Help Shari build an extraordinary company with extraordinary clarity while expending the least possible mental energy.";
