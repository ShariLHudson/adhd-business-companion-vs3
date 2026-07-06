import { ALL_EXPERIENCE_IDS, EXPERIENCE_FRAMEWORK_PRINCIPLE, EXPERIENCE_RULES } from "../../sample";

export const experienceSampleRepository = {
  principle: () => EXPERIENCE_FRAMEWORK_PRINCIPLE,
  rules: () => [...EXPERIENCE_RULES],
  experienceIds: () => [...ALL_EXPERIENCE_IDS],
};
