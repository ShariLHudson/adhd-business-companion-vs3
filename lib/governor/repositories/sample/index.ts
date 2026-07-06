import {
  COORDINATED_INTELLIGENCE_SYSTEMS,
  EXECUTIVE_TRUST_RULES,
  GOVERNOR_PRINCIPLE,
  GOVERNOR_QUESTIONS,
} from "../../sample";

export const governorSampleRepository = {
  principle: () => GOVERNOR_PRINCIPLE,
  questions: () => [...GOVERNOR_QUESTIONS],
  coordinatedSystems: () => [...COORDINATED_INTELLIGENCE_SYSTEMS],
  trustRules: () => [...EXECUTIVE_TRUST_RULES],
};
