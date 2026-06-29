/**
 * Latency budgets, streaming, warm loading, background jobs.
 */

import type { EstateRoomId } from "@/lib/sparkResponseIntelligence/types";

import type {
  BackgroundJob,
  LatencyBudget,
  StreamingPlan,
} from "./types";

export function latencyBudgetForComplexity(level: 1 | 2 | 3 | 4 | 5): LatencyBudget {
  switch (level) {
    case 1:
      return {
        intentDetectionMaxMs: 100,
        firstVisibleMaxMs: 750,
        totalResponseMaxMs: 1000,
        streamRequired: false,
        backgroundAllowed: false,
      };
    case 2:
      return {
        intentDetectionMaxMs: 100,
        firstVisibleMaxMs: 750,
        totalResponseMaxMs: 3000,
        streamRequired: false,
        backgroundAllowed: true,
      };
    case 3:
      return {
        intentDetectionMaxMs: 100,
        firstVisibleMaxMs: 750,
        totalResponseMaxMs: 4000,
        streamRequired: false,
        backgroundAllowed: true,
      };
    case 4:
      return {
        intentDetectionMaxMs: 100,
        firstVisibleMaxMs: 750,
        totalResponseMaxMs: 5000,
        streamRequired: true,
        backgroundAllowed: true,
      };
    case 5:
      return {
        intentDetectionMaxMs: 100,
        firstVisibleMaxMs: 750,
        totalResponseMaxMs: 15000,
        streamRequired: true,
        backgroundAllowed: true,
      };
  }
}

export function streamingPlan(
  level: 1 | 2 | 3 | 4 | 5,
  intentLabel: string,
): StreamingPlan {
  if (level >= 4) {
    return {
      enabled: true,
      immediateAck: true,
      progressMessage: progressForIntent(intentLabel),
      streamTokens: true,
    };
  }

  if (level === 1) {
    return {
      enabled: false,
      immediateAck: intentLabel === "support",
      streamTokens: false,
      progressMessage:
        intentLabel === "support" ? "I'm here with you." : undefined,
    };
  }

  return {
    enabled: false,
    immediateAck: false,
    streamTokens: false,
  };
}

function progressForIntent(intent: string): string {
  switch (intent) {
    case "research":
      return "I'm pulling together what matters for your question…";
    case "strategy":
      return "Thinking through the tradeoffs…";
    case "creative":
      return "Getting our creative bearings…";
    default:
      return "Working on this now…";
  }
}

export const WARM_LOAD_BY_ROOM: Record<EstateRoomId, string[]> = {
  "creative-studio": ["marketing", "wordsmith", "creative-direction", "templates", "brand_voice"],
  "strategy-room": ["business-strategy", "finance", "research", "frameworks"],
  "observatory": ["research", "trends", "founder-systems"],
  "research-lab": ["research", "knowledge-library"],
  "white-gazebo": ["journal", "reflection", "communication_preferences"],
  "celebration-garden": ["wins", "milestones", "momentum"],
  "memory-conservatory": ["timeline", "evidence", "journal", "story-library"],
  library: ["learning", "frameworks", "templates"],
  "operations-office": ["operations", "automation", "projects"],
};

export function warmLoadForRoom(room?: EstateRoomId): EstateRoomId[] {
  if (!room) return [];
  return [room];
}

export function backgroundJobsForLevel(
  level: 1 | 2 | 3 | 4 | 5,
  intentLabel: string,
): BackgroundJob[] {
  if (level < 4) return [];

  if (intentLabel === "research" || level === 5) {
    return [
      {
        id: `bg-research-${Date.now()}`,
        kind: "research",
        description: "Deep research continues in the background",
      },
    ];
  }

  return [
    {
      id: `bg-preload-${Date.now()}`,
      kind: "preload",
      description: "Preloading likely follow-ups",
    },
  ];
}

export function disciplinesForLevel(
  level: 1 | 2 | 3 | 4 | 5,
  intentDisciplines: string[],
): string[] {
  if (level === 1) return [];
  if (level === 2) return intentDisciplines.slice(0, 2);
  if (level === 3) return intentDisciplines.slice(0, 3);
  return intentDisciplines;
}
