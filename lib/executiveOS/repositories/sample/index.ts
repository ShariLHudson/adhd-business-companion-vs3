import { COORDINATED_SYSTEMS, EXECUTIVE_OPERATING_LOOP } from "../../sample";

export function getOperatingLoop() {
  return [...EXECUTIVE_OPERATING_LOOP];
}

export function getCoordinatedSystems() {
  return [...COORDINATED_SYSTEMS];
}

export function currentOperatingStage(missionProgress: number, awaitingApproval: number): (typeof EXECUTIVE_OPERATING_LOOP)[number] {
  if (awaitingApproval > 0) return "approve";
  if (missionProgress < 40) return "prepare";
  if (missionProgress < 70) return "orchestrate";
  return "monitor";
}

export const executiveOSSampleRepository = {
  operatingLoop: getOperatingLoop,
  coordinatedSystems: getCoordinatedSystems,
};
