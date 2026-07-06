import type {
  ExecutiveBusinessArea,
  ExecutiveCategory,
  ExecutiveQuestionDefinition,
  ExecutiveQuestionFilter,
  ExecutiveTimeHorizon,
} from "../types";

const CATEGORY_BUSINESS_AREA: Record<ExecutiveCategory, ExecutiveBusinessArea> = {
  product: "product",
  customers: "customers",
  content: "content",
  business: "revenue",
  technology: "technology",
  founder: "founder",
  marketing: "marketing",
  team: "team",
};

const TIME_HORIZON_TAGS: Record<ExecutiveTimeHorizon, string[]> = {
  today: ["today", "founder"],
  "this-week": ["roadmap", "mission", "build", "campaign"],
  "this-month": ["course", "webinar", "lead-magnet", "market"],
};

export function businessAreaForCategory(category: ExecutiveCategory): ExecutiveBusinessArea {
  return CATEGORY_BUSINESS_AREA[category];
}

export function filterExecutiveQuestions(
  questions: ExecutiveQuestionDefinition[],
  filter: ExecutiveQuestionFilter = {},
): ExecutiveQuestionDefinition[] {
  return questions.filter((question) => {
    if (filter.category && question.category !== filter.category) return false;
    if (filter.missionId && !question.relatedMissionIds.includes(filter.missionId)) return false;
    if (filter.product && !question.relatedProducts.includes(filter.product)) return false;
    if (filter.businessArea && businessAreaForCategory(question.category) !== filter.businessArea) {
      return false;
    }
    if (filter.priorityLevel && question.priority.level !== filter.priorityLevel) return false;
    if (
      filter.minCustomerImpact !== undefined &&
      question.priority.customerImpact < filter.minCustomerImpact
    ) {
      return false;
    }
    if (
      filter.minRevenuePotential !== undefined &&
      question.priority.revenuePotential < filter.minRevenuePotential
    ) {
      return false;
    }
    if (
      filter.minFounderImportance !== undefined &&
      question.priority.founderImportance < filter.minFounderImportance
    ) {
      return false;
    }
    if (filter.timeHorizon) {
      const tags = TIME_HORIZON_TAGS[filter.timeHorizon];
      const matches = tags.some((tag) => question.tags.includes(tag));
      if (!matches && filter.timeHorizon === "today") {
        return question.category === "founder" || question.tags.includes("today");
      }
      if (!matches && filter.timeHorizon !== "today") return false;
    }
    return true;
  });
}
