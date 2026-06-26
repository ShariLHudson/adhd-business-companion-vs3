import type { HospitalityLayers } from "@/lib/companionUniverse/resolveHospitalityLayers";
import type { ResolvedHospitalityScene } from "./types";

export type SceneValidationCheck = {
  id: string;
  label: string;
  passed: boolean;
  reason?: string;
};

export type SceneValidationScore = {
  checks: SceneValidationCheck[];
  overallPercent: number;
  believabilityQuestion: string;
  passed: boolean;
};

const BELIEVABILITY_QUESTION =
  "If I walked into Shari's home on this day, would I believe this room was naturally prepared for me?";

export function evaluateSceneValidation(input: {
  resolved: ResolvedHospitalityScene;
  constitutionPassed: boolean;
  hospitalityPrinciplePassed: boolean;
  layers: HospitalityLayers;
}): SceneValidationScore {
  const { resolved, constitutionPassed, hospitalityPrinciplePassed } = input;

  const duplicateCopy =
    resolved.greeting.trim().toLowerCase() === resolved.invite.trim().toLowerCase() ||
    resolved.atmosphere.trim().toLowerCase() === resolved.greeting.trim().toLowerCase();

  const impossibleWeather = resolved.corrections.some((c) =>
    ["season", "weather"].includes(c.field),
  );

  const placeholderObjects = resolved.hospitality.some((object) =>
    object.includes("placeholder"),
  );

  const visualConflicts =
    resolved.disabledMotion.length +
      resolved.disabledObjects.length +
      resolved.disabledAudio.length >
    4;

  const sceneIntegrityPassed =
    resolved.corrections.length === 0 &&
    resolved.disabledMotion.length === 0 &&
    resolved.disabledObjects.length === 0;

  const compositionPassed =
    resolved.hospitality.length <= 5 && !duplicateCopy && !placeholderObjects;

  const hospitalityPassed = hospitalityPrinciplePassed;

  const checks: SceneValidationCheck[] = [
    {
      id: "hospitality",
      label: "Hospitality",
      passed: hospitalityPassed,
      reason: hospitalityPassed ? undefined : "Guest preparation needs refinement",
    },
    {
      id: "believability",
      label: "Believability",
      passed: !impossibleWeather && !visualConflicts,
      reason: impossibleWeather
        ? "Weather and season were corrected — review Iowa Reality"
        : visualConflicts
          ? "Too many elements were removed for believability"
          : undefined,
    },
    {
      id: "integrity",
      label: "Scene Integrity",
      passed: sceneIntegrityPassed,
      reason: sceneIntegrityPassed
        ? undefined
        : `${resolved.corrections.length + resolved.disabledMotion.length} auto-corrections applied`,
    },
    {
      id: "composition",
      label: "Composition",
      passed: compositionPassed,
      reason: compositionPassed ? undefined : "Copy or object balance needs attention",
    },
    {
      id: "duplicate-copy",
      label: "No duplicate copy",
      passed: !duplicateCopy,
      reason: duplicateCopy ? "Greeting, invite, or atmosphere repeat each other" : undefined,
    },
    {
      id: "impossible-weather",
      label: "No impossible weather",
      passed: !impossibleWeather,
      reason: impossibleWeather ? "Season and weather were incompatible" : undefined,
    },
    {
      id: "placeholders",
      label: "No placeholder objects",
      passed: !placeholderObjects,
    },
    {
      id: "visual-conflicts",
      label: "No visual conflicts",
      passed: !visualConflicts,
      reason: visualConflicts ? "Several motion/object/audio items conflicted" : undefined,
    },
    {
      id: "constitution",
      label: "Constitution",
      passed: constitutionPassed,
    },
    {
      id: "hospitality-principle",
      label: "Hospitality Principle",
      passed: hospitalityPrinciplePassed,
    },
  ];

  const passedCount = checks.filter((check) => check.passed).length;
  const overallPercent = Math.round((passedCount / checks.length) * 100);

  return {
    checks,
    overallPercent,
    believabilityQuestion: BELIEVABILITY_QUESTION,
    passed: overallPercent >= 85 && hospitalityPrinciplePassed && constitutionPassed,
  };
}
