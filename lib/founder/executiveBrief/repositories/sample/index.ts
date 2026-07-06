import {
  composeExecutiveBriefFromOvernight,
  getSampleExecutiveBrief,
  SAMPLE_EXECUTIVE_BRIEF,
} from "../../sample";

export const executiveBriefSampleRepository = {
  getBrief: (date?: string) => getSampleExecutiveBrief(date),
  getLatestBrief: () => SAMPLE_EXECUTIVE_BRIEF,
  composeFromOvernight: () => composeExecutiveBriefFromOvernight(),
};

export type ExecutiveBriefSampleRepository = typeof executiveBriefSampleRepository;
