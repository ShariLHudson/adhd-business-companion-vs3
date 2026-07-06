import type { ComposedMission, Mission, MissionId } from "../types";
import { composeMission, getMissionOverview, getMissionProgress } from "../composer/missionComposer";
import { missionSampleRepository } from "../repositories/sample";

export class MissionService {
  getActiveMission(): Mission {
    const id = missionSampleRepository.getActiveId();
    return missionSampleRepository.get(id)!;
  }

  setActiveMission(id: MissionId): Mission | null {
    const mission = missionSampleRepository.get(id);
    if (!mission) return null;
    missionSampleRepository.setActiveId(id);
    return mission;
  }

  getMission(id: MissionId): Mission | null {
    return missionSampleRepository.get(id) ?? null;
  }

  listMissions(): Mission[] {
    return missionSampleRepository.list();
  }

  composeMission(id: MissionId): ComposedMission | null {
    return composeMission(id);
  }

  getMissionOverview(id: MissionId) {
    return getMissionOverview(id);
  }

  getMissionProgress(id: MissionId) {
    return getMissionProgress(id);
  }
}

export const missionService = new MissionService();

export function getActiveMission(): Mission {
  return missionService.getActiveMission();
}

export function listMissions(): Mission[] {
  return missionService.listMissions();
}
