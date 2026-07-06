import {
  ALL_RECOMMENDATIONS,
  JUDGMENT_ENGINE_PRINCIPLE,
  LEARNING_LOOP,
  NOT_NOW_LIBRARY,
  TODAYS_JUDGMENT_QUESTION,
  WHY_NOT_ENTRIES,
  getJudgmentRecommendation,
} from "../../sample/judgmentEngineData";

export const judgmentSampleRepository = {
  principle: () => JUDGMENT_ENGINE_PRINCIPLE,
  todaysQuestion: () => TODAYS_JUDGMENT_QUESTION,
  recommendations: () => ALL_RECOMMENDATIONS,
  whyNot: () => WHY_NOT_ENTRIES,
  notNow: () => NOT_NOW_LIBRARY,
  learningLoop: () => LEARNING_LOOP,
  getRecommendation: (id: string) => getJudgmentRecommendation(id),
};
