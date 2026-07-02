/**
 * Build Spark Knowledge Council™ bundle.
 */

import type { KnowledgeCouncil } from "../types";
import { BUSINESS_BRAIN_VERSION } from "../types";
import { RESEARCH_DISCIPLINES } from "./disciplines";
import { KNOWLEDGE_SOURCES } from "./sources";
import { SCHOOLS_OF_THOUGHT } from "./schoolsOfThought";
import { DEPARTMENT_COUNCIL_SEEDS } from "./departmentCouncil";

export function buildKnowledgeCouncil(): KnowledgeCouncil {
  return {
    version: BUSINESS_BRAIN_VERSION,
    title: "Spark Knowledge Council™",
    mission:
      "Synthesize timeless disciplines into one consistent Spark teaching voice — internal reference only.",
    researchDisciplines: RESEARCH_DISCIPLINES,
    knowledgeSources: KNOWLEDGE_SOURCES,
    schoolsOfThought: SCHOOLS_OF_THOUGHT,
    departmentIds: DEPARTMENT_COUNCIL_SEEDS.map((d) => d.id),
  };
}

export { RESEARCH_DISCIPLINES } from "./disciplines";
export {
  KNOWLEDGE_SOURCES,
  buildVerifiedKnowledgeSource,
} from "./sources";
export { SCHOOLS_OF_THOUGHT } from "./schoolsOfThought";
export { DEPARTMENT_COUNCIL_SEEDS } from "./departmentCouncil";
