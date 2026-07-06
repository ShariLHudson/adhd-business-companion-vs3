import type { BusinessExperiment, CampaignOutcome, SuccessStory, FailureStory } from "../types";
import { institutionalMemorySampleRepository } from "../repositories/sample";

export function findPastExperiments(filter?: { missionId?: string }): BusinessExperiment[] {
  const list = filter?.missionId
    ? institutionalMemorySampleRepository.forMission(filter.missionId)
    : institutionalMemorySampleRepository.list();
  return list.filter((m): m is BusinessExperiment => m.kind === "experiment");
}

export function listCampaignOutcomes(missionId?: string): CampaignOutcome[] {
  const list = missionId
    ? institutionalMemorySampleRepository.forMission(missionId)
    : institutionalMemorySampleRepository.list();
  return list.filter((m): m is CampaignOutcome => m.kind === "campaign-outcome");
}

export function listSuccessStories(missionId?: string): SuccessStory[] {
  const list = missionId
    ? institutionalMemorySampleRepository.forMission(missionId)
    : institutionalMemorySampleRepository.list();
  return list.filter((m): m is SuccessStory => m.kind === "success");
}

export function listFailureStories(missionId?: string): FailureStory[] {
  const list = missionId
    ? institutionalMemorySampleRepository.forMission(missionId)
    : institutionalMemorySampleRepository.list();
  return list.filter((m): m is FailureStory => m.kind === "failure");
}
