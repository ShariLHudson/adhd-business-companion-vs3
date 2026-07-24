/**
 * Decision depth by reversibility — uses canonical Reversibility only.
 */

import type { Reversibility } from "../../domainModel";

export type ReversibilityDepth = {
  level: Reversibility;
  preferActionOrTest: boolean;
  avoidOveranalysis: boolean;
  lightweightComparison: boolean;
  checkAssumptions: boolean;
  exploreMultipleOptions: boolean;
  identifySecondOrder: boolean;
  considerBoardOrOtherPerspective: boolean;
  confirmReadinessCarefully: boolean;
  memberGuidance: string;
};

export function reversibilityDepth(level: Reversibility): ReversibilityDepth {
  switch (level) {
    case "easily_reversible":
      return {
        level,
        preferActionOrTest: true,
        avoidOveranalysis: true,
        lightweightComparison: true,
        checkAssumptions: false,
        exploreMultipleOptions: false,
        identifySecondOrder: false,
        considerBoardOrOtherPerspective: false,
        confirmReadinessCarefully: false,
        memberGuidance:
          "This looks easy to reverse — a small test may be enough without overthinking.",
      };
    case "moderately_reversible":
      return {
        level,
        preferActionOrTest: true,
        avoidOveranalysis: false,
        lightweightComparison: false,
        checkAssumptions: true,
        exploreMultipleOptions: true,
        identifySecondOrder: false,
        considerBoardOrOtherPerspective: false,
        confirmReadinessCarefully: false,
        memberGuidance:
          "This can be adjusted later, though recovery may take some care. Check the important assumptions.",
      };
    case "difficult_to_reverse":
      return {
        level,
        preferActionOrTest: false,
        avoidOveranalysis: false,
        lightweightComparison: false,
        checkAssumptions: true,
        exploreMultipleOptions: true,
        identifySecondOrder: true,
        considerBoardOrOtherPerspective: true,
        confirmReadinessCarefully: true,
        memberGuidance:
          "This choice may be difficult to undo — it deserves clearer evidence and more than one realistic path.",
      };
    case "effectively_irreversible":
      return {
        level,
        preferActionOrTest: false,
        avoidOveranalysis: false,
        lightweightComparison: false,
        checkAssumptions: true,
        exploreMultipleOptions: true,
        identifySecondOrder: true,
        considerBoardOrOtherPerspective: true,
        confirmReadinessCarefully: true,
        memberGuidance:
          "This choice may be effectively irreversible — move carefully, and only when you are ready.",
      };
    default:
      return {
        level: "unknown",
        preferActionOrTest: false,
        avoidOveranalysis: false,
        lightweightComparison: true,
        checkAssumptions: true,
        exploreMultipleOptions: true,
        identifySecondOrder: false,
        considerBoardOrOtherPerspective: false,
        confirmReadinessCarefully: false,
        memberGuidance: "It is not yet clear how easy this would be to undo.",
      };
  }
}
