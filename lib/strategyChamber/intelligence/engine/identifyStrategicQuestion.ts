import type { StrategyWorkItem } from "../../types";
import {
  matchStrategyTypesFromText,
  resolvePrimaryStrategyType,
} from "../registry";
import type {
  DecisionConfidence,
  StrategicQuestion,
  StrategicQuestionType,
  StrategyTypeId,
} from "../types";

function mapTypeToQuestionType(
  strategyTypeId: StrategyTypeId | null,
  text: string,
): StrategicQuestionType {
  if (strategyTypeId === "pricing") return "pricing_decision";
  if (strategyTypeId === "growth") return "growth_decision";
  if (strategyTypeId === "offer") return "offer_decision";
  if (strategyTypeId === "market_customer") return "market_decision";
  if (strategyTypeId === "capacity_focus") return "capacity_decision";
  if (strategyTypeId === "hiring_delegation") return "hiring_decision";
  if (strategyTypeId === "personal_direction") {
    return "personal_direction_decision";
  }
  if (strategyTypeId === "pivot_rethink") return "pivot_decision";
  if (strategyTypeId === "ninety_day") return "priority_decision";
  if (strategyTypeId === "business_direction") return "direction_decision";

  const t = text.toLowerCase();
  if (/\bmore customers?\b/.test(t)) return "growth_decision";
  if (/\bhire\b/.test(t)) return "hiring_decision";
  if (/\bprice\b/.test(t)) return "pricing_decision";
  if (/\bpivot|rethink\b/.test(t)) return "pivot_decision";
  if (/\bkeep doing|should i continue\b/.test(t)) {
    return "continue_or_stop_decision";
  }
  return "unknown";
}

/**
 * First statement is rarely the final strategic question.
 * Surface alternates when the statement is a symptom (e.g. "more customers").
 */
export function identifyStrategicQuestion(
  item: StrategyWorkItem,
  latestAnswer?: string,
): StrategicQuestion {
  const stated =
    item.decisionStatement?.trim() ||
    latestAnswer?.trim() ||
    item.title?.trim() ||
    "";
  const matched = resolvePrimaryStrategyType(stated);
  const strategyTypeId = matched?.id ?? (item.strategyType as StrategyTypeId | null) ?? null;
  const questionType = mapTypeToQuestionType(strategyTypeId, stated);

  const alternateQuestions: string[] = [];
  const lower = stated.toLowerCase();

  if (/\bmore customers?\b/.test(lower) || /\bneed more customers?\b/.test(lower)) {
    alternateQuestions.push(
      "Are we serving the right market?",
      "Is the offer strong enough?",
      "Is awareness the real problem — or retention, sales, or capacity?",
    );
  }
  if (/\bnot growing\b/.test(lower)) {
    alternateQuestions.push(
      "Is growth the right goal this season, or is stability first?",
      "Which part of the business is actually stuck?",
    );
  }
  if (/\btoo many ideas\b/.test(lower) || /\bscattered\b/.test(lower)) {
    alternateQuestions.push(
      "What deserves focus this season, and what will wait?",
    );
  }
  if (/\brebrand\b/.test(lower)) {
    alternateQuestions.push(
      "Is the brand the problem, or is the offer, market, or message unclear?",
    );
  }

  const needsClarification =
    alternateQuestions.length > 0 &&
    (item.memberStatements?.length ?? 0) < 2 &&
    !item.desiredDirection?.trim();

  let refined = stated;
  if (
    /\bmore customers?\b/.test(lower) &&
    item.currentReality?.trim() &&
    /retention|capacity|offer|position/i.test(item.currentReality)
  ) {
    refined = `Given that ${item.currentReality.trim()}, what is the real growth decision?`;
  }

  let confidence: DecisionConfidence = "emerging";
  if (!stated) confidence = "low";
  else if (needsClarification) confidence = "low";
  else if (item.chosenDirection?.trim()) confidence = "strong";
  else if (item.optionsConsidered?.length) confidence = "moderate";

  return {
    stated,
    refined: refined || stated,
    questionType,
    strategyTypeId,
    confidence,
    alternateQuestions: alternateQuestions.slice(0, 3),
    needsClarification,
  };
}

export function suggestStrategyTypeId(text: string): StrategyTypeId | null {
  return matchStrategyTypesFromText(text)[0]?.type.id ?? null;
}
