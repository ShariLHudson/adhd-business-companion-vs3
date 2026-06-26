import type { ConstitutionCheck, ConstitutionPrincipleId } from "./types";

export type ConstitutionPrinciple = {
  id: ConstitutionPrincipleId;
  statement: string;
  /** Libraries and engines must enforce this before render. */
  enforce: (context: ConstitutionContext) => ConstitutionCheck;
};

export type ConstitutionContext = {
  foregroundObjectCount: number;
  maxForegroundObjects: number;
  hasPlaceholderShapes: boolean;
  hasOverlappingCopy: boolean;
  hasImpossibleSceneCombo: boolean;
  motionLoopCount: number;
  decorativeOnlyObjects: number;
};

export const COMPANION_HOSPITALITY_CONSTITUTION: ConstitutionPrinciple[] = [
  {
    id: "room-is-prepared",
    statement: "The room is prepared — never decorated.",
    enforce: (ctx) => ({
      principleId: "room-is-prepared",
      passed: !ctx.hasPlaceholderShapes && ctx.decorativeOnlyObjects <= 2,
      reason: ctx.hasPlaceholderShapes
        ? "Placeholder shapes are decoration, not preparation"
        : undefined,
    }),
  },
  {
    id: "never-decorated",
    statement: "Hospitality is intentional, not ornamental clutter.",
    enforce: (ctx) => ({
      principleId: "never-decorated",
      passed: ctx.foregroundObjectCount <= ctx.maxForegroundObjects,
      reason:
        ctx.foregroundObjectCount > ctx.maxForegroundObjects
          ? `Room holds ${ctx.maxForegroundObjects} meaningful objects, not more`
          : undefined,
    }),
  },
  {
    id: "delight-without-distraction",
    statement: "Delight without distraction.",
    enforce: (ctx) => ({
      principleId: "delight-without-distraction",
      passed: !ctx.hasOverlappingCopy,
      reason: ctx.hasOverlappingCopy
        ? "Copy must not overlap — discovery stays quiet"
        : undefined,
    }),
  },
  {
    id: "warmth-before-productivity",
    statement: "Warmth before productivity.",
    enforce: (ctx) => ({
      principleId: "warmth-before-productivity",
      passed: true,
    }),
  },
  {
    id: "restraint-before-clutter",
    statement: "Restraint before clutter.",
    enforce: (ctx) => ({
      principleId: "restraint-before-clutter",
      passed: ctx.foregroundObjectCount <= ctx.maxForegroundObjects,
    }),
  },
  {
    id: "life-before-animation",
    statement: "Life before animation — motion behaves like nature.",
    enforce: (ctx) => ({
      principleId: "life-before-animation",
      passed: ctx.motionLoopCount === 0,
      reason:
        ctx.motionLoopCount > 0
          ? "Obvious loops break the illusion of a real day"
          : undefined,
    }),
  },
  {
    id: "discovery-before-novelty",
    statement: "Discovery before novelty.",
    enforce: () => ({
      principleId: "discovery-before-novelty",
      passed: true,
    }),
  },
  {
    id: "hospitality-before-technology",
    statement: "Hospitality before technology.",
    enforce: () => ({
      principleId: "hospitality-before-technology",
      passed: true,
    }),
  },
  {
    id: "relationship-before-workflow",
    statement: "Relationship before workflow.",
    enforce: () => ({
      principleId: "relationship-before-workflow",
      passed: true,
    }),
  },
];

export function evaluateConstitution(
  context: ConstitutionContext,
): ConstitutionCheck[] {
  return COMPANION_HOSPITALITY_CONSTITUTION.map((principle) =>
    principle.enforce(context),
  );
}

export function constitutionPassed(checks: ConstitutionCheck[]): boolean {
  return checks.every((check) => check.passed);
}
