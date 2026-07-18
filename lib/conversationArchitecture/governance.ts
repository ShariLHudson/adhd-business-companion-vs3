/**
 * Package 212 — Conversation Governance & Change Standard.
 */

import { experiencesBypassingGovernance } from "./experienceWiring";
import { findDuplicateOwnershipIds } from "./ownership";
import { checklistReleaseReady, checklistSummary } from "./checklist";

export const CONVERSATION_GOVERNANCE_RULES = [
  "No experience may bypass the Conversation Intelligence Engine for production conversation.",
  "No duplicate response generators for the same responsibility.",
  "No hidden prompt chains.",
  "One owner per responsibility (see CONVERSATION_OWNERSHIP).",
  "All conversation changes require regression testing.",
  "New conversational patterns must be registered in conversationDesignPatterns.",
  "Gold Standard examples must be certified before runtime use.",
  "Legacy conversation code must be removed after migration.",
] as const;

export type ConversationPrReviewCheck = {
  id: string;
  question: string;
};

/** Required verification on every conversation-related PR. */
export const CONVERSATION_PR_REVIEW_CHECKS: readonly ConversationPrReviewCheck[] =
  [
    {
      id: "architecture",
      question: "Does this change preserve CIE runtime order and ownership?",
    },
    {
      id: "validator",
      question: "Is HCV still reached before user-visible delivery?",
    },
    {
      id: "shari-voice",
      question: "Does member-facing copy pass the Shari / friend test?",
    },
    {
      id: "regression",
      question: "Are unit + multi-turn regressions updated or still green?",
    },
    {
      id: "no-bypass",
      question: "Did this avoid adding a new experience-local conversation pipeline?",
    },
    {
      id: "gold-cert",
      question: "If gold examples changed, are they certified before retrieval?",
    },
  ];

export type GovernanceSnapshot = {
  duplicateOwnershipIds: string[];
  bypassingExperiences: string[];
  checklist: ReturnType<typeof checklistSummary>;
  releaseReady: boolean;
  rules: typeof CONVERSATION_GOVERNANCE_RULES;
};

export function getGovernanceSnapshot(): GovernanceSnapshot {
  return {
    duplicateOwnershipIds: findDuplicateOwnershipIds(),
    bypassingExperiences: experiencesBypassingGovernance().map(
      (e) => e.experienceId,
    ),
    checklist: checklistSummary(),
    releaseReady: checklistReleaseReady(),
    rules: CONVERSATION_GOVERNANCE_RULES,
  };
}
