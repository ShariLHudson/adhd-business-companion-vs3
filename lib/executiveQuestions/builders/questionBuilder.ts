import type { ExecutiveQuestionDefinition } from "../types";
import { relationshipsForQuestion } from "../relationships/questionRelationships";

/** Question Builder — enriches catalog definitions with relationship metadata. */
export function buildExecutiveQuestion(
  definition: ExecutiveQuestionDefinition,
): ExecutiveQuestionDefinition & { relationshipCount: number } {
  const relationships = relationshipsForQuestion(definition.id);
  return {
    ...definition,
    relationshipCount: relationships.length,
  };
}

export function buildExecutiveQuestions(
  definitions: ExecutiveQuestionDefinition[],
): ReturnType<typeof buildExecutiveQuestion>[] {
  return definitions.map(buildExecutiveQuestion);
}
