import { getExecutiveJudgmentBootstrap } from "@/lib/executiveJudgmentEngine";

export {
  composeExecutiveJudgmentView,
  composeJudgmentDetail,
  composeRecommendationPyramid,
} from "@/lib/executiveJudgmentEngine";

export function getJudgmentEngineCenterBootstrap() {
  return getExecutiveJudgmentBootstrap();
}
