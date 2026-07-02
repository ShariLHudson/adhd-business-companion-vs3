/**
 * Momentum Builder™ — room experience state from conversation (client-safe).
 */

import type { MomentumBuilderCelebrationKind } from "./estateIntegration";
import { resolveCelebrationKind } from "./celebration";
import { suggestEstateConnection } from "./estateConnections";
import { runMomentumBuilderRoomCycle } from "./roomOrchestrator";
import type { EstateConnectionRoute } from "./estateConnections";
import type { TodaysPath } from "./types";

export type MomentumBuilderRoomExperienceState = {
  todaysPath: TodaysPath | null;
  celebration: MomentumBuilderCelebrationKind | null;
  estateConnection: EstateConnectionRoute | null;
};

export function resolveMomentumBuilderRoomState(input: {
  messages: { role: string; content: string }[];
  previousPathId?: string | null;
}): MomentumBuilderRoomExperienceState {
  const lastUser = [...input.messages]
    .reverse()
    .find((m) => m.role === "user" && m.content.trim());

  if (!lastUser) {
    return { todaysPath: null, celebration: null, estateConnection: null };
  }

  const cycle = runMomentumBuilderRoomCycle({ memberText: lastUser.content });
  const todaysPath = cycle.todaysPath;
  const hadPathBefore = Boolean(input.previousPathId);
  const celebration = resolveCelebrationKind({
    todaysPath,
    hadPathBefore,
  });

  const estateConnection = suggestEstateConnection({
    emotionalState: cycle.discovery.emotionalState,
    rawText: lastUser.content,
  });

  return { todaysPath, celebration, estateConnection };
}
