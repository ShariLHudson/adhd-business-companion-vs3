import type { MissionId, MissionRelationship } from "../types";
import {
  getSampleMission,
  getSampleRelationshipsForMission,
  SAMPLE_MISSION_RELATIONSHIPS,
} from "../sample";

export function listMissionRelationships(): MissionRelationship[] {
  return [...SAMPLE_MISSION_RELATIONSHIPS];
}

export function relationshipsForMission(missionId: MissionId): MissionRelationship[] {
  return getSampleRelationshipsForMission(missionId);
}

export function describeRelationship(rel: MissionRelationship): string {
  const from = getSampleMission(rel.fromMissionId)?.name ?? rel.fromMissionId;
  const to = getSampleMission(rel.toMissionId)?.name ?? rel.toMissionId;
  const verb = rel.relationship.replace(/_/g, " ");
  return `${from} ${verb} ${to}`;
}
