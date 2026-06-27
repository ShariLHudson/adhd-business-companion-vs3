/**
 * Clear My Mind — five-stage emotional flow.
 *
 * Permission → Release → Received → Understanding → Choice
 *
 * The UI reads `stage` only — no scattered conditionals.
 */

export type ClearMyMindStage =
  | "permission"
  | "release"
  | "received"
  | "understanding"
  | "choice";

export function initialClearMyMindStage(): ClearMyMindStage {
  return "permission";
}

/** User began typing or focused the capture field. */
export function stageOnCaptureBegin(
  current: ClearMyMindStage,
): ClearMyMindStage {
  if (current === "permission") return "release";
  return current;
}

/** User finished emptying their head for now. */
export function stageOnReleaseComplete(
  _current: ClearMyMindStage,
): ClearMyMindStage {
  return "received";
}

/** Shari has acknowledged — patterns may emerge. */
export function stageOnAcknowledgmentContinue(
  _current: ClearMyMindStage,
): ClearMyMindStage {
  return "understanding";
}

/** Clusters viewed — gentle choices surface. */
export function stageOnUnderstandingReady(
  current: ClearMyMindStage,
): ClearMyMindStage {
  if (current === "understanding") return "choice";
  return current;
}

export function clearMyMindShowsCompanionPanel(
  _stage: ClearMyMindStage,
): boolean {
  return true;
}

export function clearMyMindShowsVisualAnalysis(
  stage: ClearMyMindStage,
): boolean {
  return stage === "understanding" || stage === "choice";
}

export function clearMyMindShowsClusters(
  stage: ClearMyMindStage,
): boolean {
  return stage === "understanding" || stage === "choice";
}

export function clearMyMindShowsExportTools(
  stage: ClearMyMindStage,
): boolean {
  return stage === "choice";
}
