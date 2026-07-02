/**
 * Momentum Builder™ — single room cycle composer.
 * Orchestrates existing intelligence — does NOT implement new strategy engines.
 *
 * @see docs/MOMENTUM_BUILDER_V1_ORCHESTRATION.md
 */

import { evaluateMomentum } from "@/lib/momentum-intelligence";
import { gatherMomentumInput } from "@/lib/momentum-intelligence/momentumSignals";
import type { MomentumSnapshot } from "@/lib/momentum-intelligence/types";
import {
  evaluateRecovery,
  recoveryOverridesProductivity,
} from "@/lib/recovery-intelligence/recoveryEngine";
import type { RecoverySnapshot } from "@/lib/recovery-intelligence/types";
import { runExecutiveFunction } from "@/lib/sparkCoreIntelligence/executiveFunctionEngine/executiveFunctionEngine";
import type { ExecutiveFunctionResult } from "@/lib/sparkCoreIntelligence/executiveFunctionEngine/types";
import { buildConversationDiscovery } from "./conversationEntry";
import { orchestrateHiddenStrategy } from "./hiddenStrategyOrchestrator";
import { readMomentumProfileSignals } from "./momentumProfileBridge";
import { buildTodaysPathDraft } from "./todaysPath";
import type {
  MomentumConversationDiscovery,
  MomentumRoomOrchestration,
  TodaysPath,
} from "./types";

export type MomentumBuilderRoomCycleInput = {
  memberText: string;
  now?: Date;
  activeProjectIds?: string[];
};

export type MomentumBuilderRoomCycleResult = {
  discovery: MomentumConversationDiscovery;
  orchestration: MomentumRoomOrchestration;
  executiveFunction: ExecutiveFunctionResult;
  recovery: RecoverySnapshot;
  momentum: MomentumSnapshot;
  profileSignals: ReturnType<typeof readMomentumProfileSignals>;
  recoveryOverridesProductivity: boolean;
  todaysPath: TodaysPath | null;
};

/** Compose all existing systems for one member turn in Momentum Builder™. */
export function runMomentumBuilderRoomCycle(
  input: MomentumBuilderRoomCycleInput,
): MomentumBuilderRoomCycleResult {
  const now = input.now ?? new Date();

  const discovery = buildConversationDiscovery({
    memberText: input.memberText,
    now,
    activeProjectIds: input.activeProjectIds,
  });

  const orchestration = orchestrateHiddenStrategy({ discovery, now });

  const executiveFunction = runExecutiveFunction({
    turnId: `momentum-builder-${now.getTime()}`,
    threadId: "momentum-builder-room",
    memberMessage: input.memberText,
    emotionalState: discovery.emotionalState,
  });

  const recovery = evaluateRecovery({ now, text: input.memberText });

  const momentumInput = gatherMomentumInput({
    now,
    text: input.memberText,
  });
  const momentum = evaluateMomentum(momentumInput);

  const profileSignals = readMomentumProfileSignals({ now });

  const recoveryBlocks = recoveryOverridesProductivity(recovery);

  const todaysPath =
    recoveryBlocks || orchestration.hiddenStrategy.approach === "recover"
      ? null
      : buildTodaysPathDraft({
          discovery,
          orchestration,
          executiveFunction,
          momentum,
          now,
        });

  return {
    discovery,
    orchestration,
    executiveFunction,
    recovery,
    momentum,
    profileSignals,
    recoveryOverridesProductivity: recoveryBlocks,
    todaysPath,
  };
}
