/**
 * Create draft build — validation, logging, and extra-detail helpers.
 */

import { effectiveSubtypeLabel } from "./createTypePickers";
import { resolveTemplateName } from "./createTemplates";
import {
  answeredDiscoveryCount,
  discoveryComplete,
  resolvedTypeLabel,
  type CreateWorkflowState,
} from "./createWorkflow";

export type CreateBuildValidation = {
  ok: boolean;
  missing: string[];
  itemType: string;
  subtype: string | null;
  templateName: string | null;
  answersCount: number;
  readyToBuild: boolean;
};

export function validateCreateForBuild(
  state: CreateWorkflowState,
): CreateBuildValidation {
  const itemType = resolvedTypeLabel(state);
  const subtype = effectiveSubtypeLabel(
    state.selectedSubtype,
    state.customSubtype,
  );
  const templateName = state.useTemplate ? resolveTemplateName(state) : null;
  const answersCount = answeredDiscoveryCount(state);
  const missing: string[] = [];

  if (!itemType.trim()) missing.push("itemType");
  if (answersCount === 0) missing.push("questionAnswers");

  const readyToBuild =
    state.step === "readiness" ||
    state.step === "add-detail" ||
    state.readinessConfirmed ||
    discoveryComplete(itemType, state);

  if (!readyToBuild) missing.push("readyToBuild");

  return {
    ok: missing.length === 0,
    missing,
    itemType,
    subtype: subtype || null,
    templateName,
    answersCount,
    readyToBuild,
  };
}

export function logCreateBuild(
  message: string,
  detail?: Record<string, unknown>,
): void {
  if (typeof console === "undefined") return;
  if (detail) {
    console.log(`[Create] ${message}`, detail);
  } else {
    console.log(`[Create] ${message}`);
  }
}

export function logCreateError(detail: {
  itemType: string;
  template: string | null;
  answersCount: number;
  step: string;
  message: string;
}): void {
  if (typeof console === "undefined") return;
  console.error("CREATE ERROR:", detail);
}

export function enterAddDetailStep(
  state: CreateWorkflowState,
): CreateWorkflowState {
  return {
    ...state,
    step: "add-detail",
    draftStatus: "idle",
    readinessConfirmed: false,
  };
}

export function appendExtraDetail(
  state: CreateWorkflowState,
  detail: string,
): CreateWorkflowState {
  const trimmed = detail.trim();
  const previous = state.discoveryAnswers["extra-detail"]?.trim() ?? "";
  const combined = previous ? `${previous}\n${trimmed}` : trimmed;
  return {
    ...state,
    step: "readiness",
    draftStatus: "idle",
    readinessConfirmed: false,
    discoveryAnswers: {
      ...state.discoveryAnswers,
      "extra-detail": combined,
    },
  };
}

export type CreateBuildGenerationStep =
  | "validate"
  | "request"
  | "parse"
  | "complete";
