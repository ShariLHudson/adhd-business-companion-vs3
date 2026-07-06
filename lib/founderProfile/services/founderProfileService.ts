import type {
  FounderFrictionPattern,
  FounderPattern,
  FounderProfileLearnInput,
  FounderProfileObserveInput,
  FounderProfileRecommendContext,
  FounderProfileView,
  FounderRecommendation,
  FounderStrength,
} from "../types";
import { captureObservation, applyLearn, resetRuntimeObservations } from "../history/observationHistory";
import { listPatterns } from "../patterns/patternEngine";
import { listFrictionPatterns } from "../patterns/frictionPatterns";
import { listStrengths } from "../patterns/strengthPatterns";
import { buildRecommendations, topRecommendation } from "../recommendations/recommendationEngine";
import { composeAdaptationView } from "../adaptation/adaptationEngine";
import { founderProfileSampleRepository } from "../repositories/sample";

export class FounderProfileService {
  observe(input: FounderProfileObserveInput) {
    return captureObservation(input);
  }

  learn(input: FounderProfileLearnInput) {
    return applyLearn(input);
  }

  recommend(context: FounderProfileRecommendContext = {}): FounderRecommendation[] {
    void context;
    return buildRecommendations();
  }

  patterns(): FounderPattern[] {
    return listPatterns();
  }

  friction(): FounderFrictionPattern[] {
    return listFrictionPatterns();
  }

  strengths(): FounderStrength[] {
    return listStrengths();
  }

  profile(context: FounderProfileRecommendContext = {}): FounderProfileView {
    return composeAdaptationView(context);
  }

  topRecommendation(context: FounderProfileRecommendContext = {}) {
    void context;
    return topRecommendation();
  }

  sampleRepository() {
    return founderProfileSampleRepository;
  }

  resetRuntime() {
    resetRuntimeObservations();
  }
}

export const founderProfileService = new FounderProfileService();

export function observe(input: FounderProfileObserveInput) {
  return founderProfileService.observe(input);
}

export function learn(input: FounderProfileLearnInput) {
  return founderProfileService.learn(input);
}

export function recommend(context?: FounderProfileRecommendContext) {
  return founderProfileService.recommend(context);
}

export function patterns() {
  return founderProfileService.patterns();
}

export function friction() {
  return founderProfileService.friction();
}

export function strengths() {
  return founderProfileService.strengths();
}

export function resetRuntimeFounderProfile() {
  founderProfileService.resetRuntime();
}
