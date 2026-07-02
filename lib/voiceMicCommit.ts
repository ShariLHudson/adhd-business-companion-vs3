/**
 * Mic capture UX — turning the mic OFF commits the transcript (sends if non-empty).
 * Partial onresult updates never send until mic stops.
 */

export function micCaptureTextForCommit(inputSnapshot: string): string | null {
  const trimmed = inputSnapshot.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export type MicCommitOnEndParams = {
  /** True only when the member explicitly stopped the mic (toggle off). */
  explicitStopRequested: boolean;
  inputSnapshot: string;
  send: (text: string) => void;
  /** Clear the explicit-stop flag after handling. */
  onConsumedExplicitStop?: () => void;
};

/** Returns true when a message was sent. */
export function tryCommitMicCaptureOnEnd(params: MicCommitOnEndParams): boolean {
  if (!params.explicitStopRequested) return false;
  params.onConsumedExplicitStop?.();
  const text = micCaptureTextForCommit(params.inputSnapshot);
  if (!text) return false;
  params.send(text);
  return true;
}
