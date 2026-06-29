import { classifyInteraction } from "./classifyInteraction";

export {
  analyzeBeforeCompose,
  decideSend,
  evaluateBeforeSend,
  runSparkResponseIntelligence,
} from "./evaluateSparkResponseIntelligence";
export { selectDisciplines } from "./disciplineRouting";
export { classifyInteraction };
export type {
  CertaintyClass,
  DisciplineId,
  EstateRoomId,
  InteractionClass,
  MemberNeed,
  ObjectiveLock,
  PreComposeAnalysis,
  ResponseDraft,
  SelfEvaluationResult,
  SendDecision,
  SparkResponseIntelligenceInput,
  SparkResponseIntelligenceResult,
} from "./types";
export {
  SPARK_CONSTITUTION_VERSION,
  SPARK_RESPONSE_INTELLIGENCE_VERSION,
} from "./types";
