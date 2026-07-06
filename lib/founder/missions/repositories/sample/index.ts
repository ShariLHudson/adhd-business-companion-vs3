import type { MissionId } from "../../types";
import {
  DEFAULT_ACTIVE_MISSION_ID,
  getSampleMission,
  listSampleMissions,
} from "../../sample";

let activeMissionId: MissionId = DEFAULT_ACTIVE_MISSION_ID;

export const missionSampleRepository = {
  list: () => listSampleMissions(),
  get: (id: MissionId) => getSampleMission(id),
  getActiveId: () => activeMissionId,
  setActiveId: (id: MissionId) => {
    activeMissionId = id;
  },
};

export type MissionSampleRepository = typeof missionSampleRepository;
