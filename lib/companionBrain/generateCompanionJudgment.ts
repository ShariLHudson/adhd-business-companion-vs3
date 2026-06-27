/**
 * Companion Judgment — compose all judgment services.
 * @see constitution.ts — generateCompanionJudgment
 */

import { applyRelationshipProtection } from "./applyRelationshipProtection";
import { buildOrientation } from "./buildOrientation";
import { generateMorningPresence } from "./generateMorningPresence";
import { evaluatePermission } from "./evaluatePermission";
import { generateMomentumAction } from "./generateMomentumAction";
import { generateProposals } from "./generateProposals";
import { applyAuditToJudgment, runCognitiveAudit } from "./runCognitiveAudit";
import { selectConfidenceOpportunity } from "./selectConfidenceOpportunity";
import type {
  AssembledContext,
  CompanionJudgmentResult,
  RegisteredPrediction,
} from "./types";

function registerPredictions(
  ctx: AssembledContext,
  momentumLabel: string | null,
): RegisteredPrediction[] {
  const expires = `${ctx.dayKey}T23:59:59.999Z`;
  const preds: RegisteredPrediction[] = [];
  if (momentumLabel) {
    preds.push({
      id: `pred-momentum-${ctx.dayKey}`,
      kind: "momentum",
      claim: momentumLabel,
      expiresAt: expires,
    });
  }
  preds.push({
    id: `pred-capacity-${ctx.dayKey}`,
    kind: "capacity",
    claim: `${ctx.capacity.energy}/${ctx.capacity.motivation}`,
    expiresAt: expires,
  });
  return preds;
}

export function generateCompanionJudgment(
  ctx: AssembledContext,
): CompanionJudgmentResult {
  const momentum = generateMomentumAction(ctx);
  const confidence = selectConfidenceOpportunity(ctx, momentum);
  const permission = evaluatePermission(ctx);
  const proposals = generateProposals(ctx, momentum);
  const orientation = buildOrientation(ctx, momentum, permission);
  const morningPresence = generateMorningPresence(ctx);
  const predictions = registerPredictions(ctx, momentum.label);

  let judgment: CompanionJudgmentResult = {
    dayMode: ctx.dayMode,
    cycleState: ctx.cycleState,
    orientation,
    morningPresence,
    momentum,
    confidence,
    permission,
    proposals,
    predictions,
    orientationOnly: ctx.orientationOnly,
    permissionDisplay: ctx.permissionDisplay,
    materializeAllowed: true,
    auditPassed: true,
    auditNotes: [],
  };

  const audit = runCognitiveAudit(ctx, proposals, orientation.paragraphs);
  judgment = applyAuditToJudgment(judgment, audit);
  judgment = applyRelationshipProtection(ctx, judgment);

  return judgment;
}
