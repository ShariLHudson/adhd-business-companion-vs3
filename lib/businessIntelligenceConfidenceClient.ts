import { getAvatars, getBusinessProfile } from "./companionStore";
import {
  evaluateBusinessIntelligenceConfidence,
  type BusinessIntelligenceConfidence,
} from "./businessIntelligenceConfidence";

/** Client-side snapshot for gating business advice in chat. */
export function loadBusinessIntelligenceConfidence(): BusinessIntelligenceConfidence {
  return evaluateBusinessIntelligenceConfidence({
    businessProfile: getBusinessProfile(),
    avatars: getAvatars(),
  });
}
