/**
 * P0.16.3 — trace Create offer registration and yes-continuation resolution.
 */

export function logCreateOfferRegistration(detail: {
  pendingAction: unknown;
  pendingMenuSelection: unknown;
  pendingAcceptance: unknown;
}): void {
  if (typeof console === "undefined") return;
  // eslint-disable-next-line no-console
  console.info("[yes-continuation-trace] offer_rendered", detail);
}

export function logYesContinuationResolution(detail: {
  userText: string;
  pendingAction: unknown;
  frictionlessContinuation: unknown;
  menuContinuation: unknown;
  hardNav: unknown;
}): void {
  if (typeof console === "undefined") return;
  // eslint-disable-next-line no-console
  console.info("[yes-continuation-trace] yes_turn", detail);
}
