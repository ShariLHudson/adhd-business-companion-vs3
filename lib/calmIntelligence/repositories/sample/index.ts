import { ATTENTION_FILTER_QUESTIONS, CALM_INTELLIGENCE_PRINCIPLE } from "../../sample";

export const calmIntelligenceSampleRepository = {
  principle: () => CALM_INTELLIGENCE_PRINCIPLE,
  filterQuestions: () => [...ATTENTION_FILTER_QUESTIONS],
};
