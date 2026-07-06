import {
  AWARENESS_NOTICES,
  AWARENESS_PRINCIPLE,
  EXECUTIVE_AWARENESS_QUESTIONS,
  SAMPLE_PRIOR_SIGNALS,
} from "../../sample";

export const awarenessSampleRepository = {
  principle: () => AWARENESS_PRINCIPLE,
  questions: () => [...EXECUTIVE_AWARENESS_QUESTIONS],
  notices: () => [...AWARENESS_NOTICES],
  priorSignals: () => [...SAMPLE_PRIOR_SIGNALS],
};
