import type { GovernorContext } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { composeExecutiveContext } from "@/lib/executiveOS";

export type GovernorOperatingContext = {
  missionId: MissionId;
  mode: string;
  label: string;
  rationale: string;
};

export function composeGovernorContext(context: GovernorContext = {}): GovernorOperatingContext {
  const exec = composeExecutiveContext({ missionId: context.missionId });
  return {
    missionId: exec.missionId,
    mode: exec.mode,
    label: exec.label,
    rationale: exec.rationale,
  };
}
