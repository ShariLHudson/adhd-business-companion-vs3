import { SAMPLE_MEMORY_VAULT } from "./data";
import type {
  FounderDecision,
  FounderLesson,
  FounderMemoryVaultOverview,
  FounderMilestone,
  FounderTimelineEvent,
} from "../../types";

export const sampleMemoryRepository = {
  getVaultOverview(): FounderMemoryVaultOverview {
    return SAMPLE_MEMORY_VAULT;
  },

  getDecision(id: string): FounderDecision | undefined {
    return SAMPLE_MEMORY_VAULT.decisions.find((d) => d.id === id);
  },

  listDecisions(): FounderDecision[] {
    return [...SAMPLE_MEMORY_VAULT.decisions].sort(
      (a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime(),
    );
  },

  listTimeline(limit?: number): FounderTimelineEvent[] {
    const sorted = [...SAMPLE_MEMORY_VAULT.timeline].sort(
      (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );
    return limit ? sorted.slice(0, limit) : sorted;
  },

  listLessons(): FounderLesson[] {
    return [...SAMPLE_MEMORY_VAULT.lessons];
  },

  listMilestones(): FounderMilestone[] {
    return [...SAMPLE_MEMORY_VAULT.milestones].sort(
      (a, b) =>
        new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime(),
    );
  },
};
