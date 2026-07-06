import type { ExecutiveOSContext } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import { composeExecutiveState as buildExecutiveState } from "../coordination/executiveComposer";
import { composeCompanyState as buildCompanyState } from "../coordination/companyComposer";
import { composeExecutiveContext as buildExecutiveContext } from "../context/contextComposer";
import { composeAttention as buildAttention } from "../routing/attentionEngine";
import { composeOperatingHealth as buildOperatingHealth } from "../health/companyHealth";
import { composeLeverage as buildLeverage } from "../priorities/leverageComposer";
import { executiveOSSampleRepository } from "../repositories/sample";

export class ExecutiveOSService {
  composeExecutiveState(context: ExecutiveOSContext = {}) {
    const missionId = context.missionId ?? DEFAULT_ACTIVE_MISSION_ID;
    return buildExecutiveState(missionId);
  }

  composeCompanyState(context: ExecutiveOSContext = {}) {
    const missionId = context.missionId ?? DEFAULT_ACTIVE_MISSION_ID;
    return buildCompanyState(missionId);
  }

  composeExecutiveContext(context: ExecutiveOSContext = {}) {
    const missionId = context.missionId ?? DEFAULT_ACTIVE_MISSION_ID;
    return buildExecutiveContext(missionId, context.mode);
  }

  composeAttention(missionId?: MissionId) {
    return buildAttention(missionId ?? DEFAULT_ACTIVE_MISSION_ID);
  }

  composeOperatingHealth(missionId?: MissionId) {
    return buildOperatingHealth(missionId ?? DEFAULT_ACTIVE_MISSION_ID);
  }

  composeLeverage(missionId?: MissionId) {
    return buildLeverage(missionId ?? DEFAULT_ACTIVE_MISSION_ID);
  }

  sampleRepository() {
    return executiveOSSampleRepository;
  }
}

export const executiveOSService = new ExecutiveOSService();

export function composeExecutiveState(context: ExecutiveOSContext = {}) {
  return executiveOSService.composeExecutiveState(context);
}

export function composeCompanyState(context: ExecutiveOSContext = {}) {
  return executiveOSService.composeCompanyState(context);
}

export function composeExecutiveContext(context: ExecutiveOSContext = {}) {
  return executiveOSService.composeExecutiveContext(context);
}

export function composeAttention(missionId?: MissionId) {
  return executiveOSService.composeAttention(missionId);
}

export function composeOperatingHealth(missionId?: MissionId) {
  return executiveOSService.composeOperatingHealth(missionId);
}

export function composeLeverage(missionId?: MissionId) {
  return executiveOSService.composeLeverage(missionId);
}
